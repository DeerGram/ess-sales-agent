interface SettingChange {
  key: string;
  value: unknown;
  confidence: number;
}

export class SettingsService {
  async learnFromInteraction(userId: string, content: string): Promise<SettingChange | null> {
    if (content.toLowerCase().includes('dark mode')) {
      return {
        key: 'theme',
        value: 'dark',
        confidence: 0.92,
      };
    }

    return null;
  }
}
