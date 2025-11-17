import { prisma } from '../../db/prisma';

interface AgentPattern {
  name: string;
  description: string;
  cron: string;
  reason: string;
  confidence: number;
}

const patternRules: AgentPattern[] = [
  {
    name: 'Daily Recap',
    description: 'Summarize key updates and outstanding tasks every morning.',
    cron: '0 9 * * *',
    reason: 'Detected intent for daily or every morning updates.',
    confidence: 0.78,
  },
  {
    name: 'Weekly Planner',
    description: 'Prepare a weekly plan every Monday at 8am.',
    cron: '0 8 * * MON',
    reason: 'Detected a weekly planning routine.',
    confidence: 0.74,
  },
];

export class AgentService {
  async detectAndCreate(userId: string, content: string) {
    const pattern = this.detectPattern(content);
    if (!pattern) {
      return null;
    }

    const agent = await prisma.agent.create({
      data: {
        userId,
        name: pattern.name,
        description: pattern.description,
        schedule: { cron: pattern.cron, timezone: 'UTC' },
        task: { instructions: 'Auto-generated from conversation' },
        actions: [],
        status: 'scheduled',
        createdByAgent: true,
      },
    });

    return { agent, confidence: pattern.confidence, reason: pattern.reason };
  }

  private detectPattern(content: string): AgentPattern | null {
    if (/(every day|each morning|daily)/i.test(content)) {
      return patternRules[0];
    }

    if (/(every monday|weekly update|each week)/i.test(content)) {
      return patternRules[1];
    }

    return null;
  }
}
