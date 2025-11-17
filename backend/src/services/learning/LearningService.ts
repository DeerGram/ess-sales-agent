import { prisma } from '../../db/prisma';

export interface LearningSummary {
  key: string;
  value: string;
  confidence: number;
  note: string;
}

export class LearningService {
  async learnFromInteraction(userId: string, content: string): Promise<LearningSummary | null> {
    const summary = this.detectPreference(content);
    if (!summary) {
      return null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        learning: summary,
        preferences: summary.key === 'verbosity' ? { verbosity: summary.value } : undefined,
      },
    });

    return summary;
  }

  private detectPreference(content: string): LearningSummary | null {
    if (content.length > 280) {
      return {
        key: 'verbosity',
        value: 'detailed',
        confidence: 0.8,
        note: 'User tends to provide rich context (>280 chars).',
      };
    }

    if (content.split('?').length - 1 >= 2) {
      return {
        key: 'clarity',
        value: 'question-heavy',
        confidence: 0.74,
        note: 'Multiple questions detected in a single message.',
      };
    }

    if (/keep it short|tl;dr|summary/i.test(content)) {
      return {
        key: 'verbosity',
        value: 'concise',
        confidence: 0.77,
        note: 'User asked for succinct answers.',
      };
    }

    return null;
  }
}
