import { prisma } from '../../db/prisma';

export interface SettingChange {
  key: string;
  value: unknown;
  confidence: number;
  reason: string;
  announcement: string;
}

const themeRules = [
  {
    regex: /(dark mode|night theme|too bright)/i,
    value: 'dark',
    reason: 'User explicitly referenced dark mode',
  },
  {
    regex: /(light mode|bright theme|too dark)/i,
    value: 'light',
    reason: 'User explicitly referenced light mode',
  },
];

const toneRules = [
  { regex: /(be more formal|professional tone)/i, value: 'formal' },
  { regex: /(keep it casual|be chill|relaxed tone)/i, value: 'casual' },
];

export class SettingsService {
  async analyzeAndApply(userId: string, content: string): Promise<SettingChange | null> {
    const candidate = this.detectChange(content);
    if (!candidate) {
      return null;
    }

    await prisma.setting.upsert({
      where: { userId_key: { userId, key: candidate.key } },
      update: {
        value: candidate.value as object,
        changeSource: { type: 'implicit', reason: candidate.reason },
      },
      create: {
        userId,
        key: candidate.key,
        value: candidate.value as object,
        changeSource: { type: 'implicit', reason: candidate.reason },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        settings: { [candidate.key]: candidate.value },
      },
    });

    return candidate;
  }

  private detectChange(content: string): SettingChange | null {
    for (const rule of themeRules) {
      if (rule.regex.test(content)) {
        return {
          key: 'theme',
          value: rule.value,
          confidence: 0.92,
          reason: rule.reason,
          announcement: `Switching to ${rule.value} mode after noticing your preference.`,
        };
      }
    }

    for (const rule of toneRules) {
      if (rule.regex.test(content)) {
        return {
          key: 'tone',
          value: rule.value,
          confidence: 0.81,
          reason: 'User requested a specific conversation tone',
          announcement: `Adapting to a ${rule.value} tone moving forward.`,
        };
      }
    }

    return null;
  }
}
