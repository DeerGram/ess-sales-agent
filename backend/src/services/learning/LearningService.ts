interface LearningSummary {
  preference: string;
  confidence: number;
}

export class LearningService {
  async summarizeInteraction(content: string): Promise<LearningSummary | null> {
    if (content.length > 200) {
      return {
        preference: 'detailed responses',
        confidence: 0.78,
      };
    }
    return null;
  }
}
