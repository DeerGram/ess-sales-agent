import OpenAI from 'openai';
import type { ChatCompletionChunk } from 'openai/resources/chat/completions';
import type { StreamChunk } from '../../models/types';
import { createAliveState } from '../../utils/aliveState';
import { prisma } from '../../db/prisma';
import { env } from '../../config';
import { systemPrompt } from './prompt';
import { redis } from '../../clients/redis';
import { SettingsService } from '../settings/SettingsService';
import { LearningService } from '../learning/LearningService';
import { AgentService } from '../agents/AgentService';

interface ProcessMessageInput {
  userId: string;
  conversationId: string;
  content: string;
}

export class ChatService {
  private readonly client: OpenAI;
  private readonly settingsService: SettingsService;
  private readonly learningService: LearningService;
  private readonly agentService: AgentService;

  constructor(
    client: OpenAI = new OpenAI({ apiKey: env.OPENAI_API_KEY }),
    dependencies: {
      settingsService?: SettingsService;
      learningService?: LearningService;
      agentService?: AgentService;
    } = {},
  ) {
    this.client = client;
    this.settingsService = dependencies.settingsService ?? new SettingsService();
    this.learningService = dependencies.learningService ?? new LearningService();
    this.agentService = dependencies.agentService ?? new AgentService();
  }

  async *streamResponse({
    userId,
    conversationId,
    content,
  }: ProcessMessageInput): AsyncGenerator<StreamChunk> {
    await prisma.user.upsert({
      where: { id: userId },
      update: { lastActive: new Date() },
      create: { id: userId, lastActive: new Date() },
    });

    await prisma.conversation.upsert({
      where: { id: conversationId },
      update: { updatedAt: new Date() },
      create: { id: conversationId, userId },
    });

    await prisma.message.create({
      data: {
        conversationId,
        userId,
        sender: 'user',
        content,
      },
    });

    await this.invalidateHistoryCache(conversationId);

    const [history, settingChange, agentCreation] = await Promise.all([
      this.loadHistory(conversationId),
      this.settingsService.analyzeAndApply(userId, content),
      this.agentService.detectAndCreate(userId, content),
    ]);

    if (settingChange) {
      yield {
        eventType: 'setting_change',
        payload: settingChange,
        aliveState: createAliveState('excited', {
          learning: {
            justLearned: true,
            whatLearned: settingChange.reason,
            confidence: settingChange.confidence,
          },
          particles: { intensity: 1, speed: 0.007, color: '#22c55e' },
        }),
        content: settingChange.announcement,
      };
    }

    if (agentCreation) {
      yield {
        eventType: 'agent_created',
        payload: {
          id: agentCreation.agent.id,
          name: agentCreation.agent.name,
          status: agentCreation.agent.status,
          reason: agentCreation.reason,
        },
        aliveState: createAliveState('excited', {
          agentCreation: {
            isCreating: true,
            agentName: agentCreation.agent.name,
            progress: 0.35,
          },
          particles: { intensity: 1, speed: 0.008, color: '#facc15' },
        }),
      };
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((message) => ({
        role: (message.sender === 'user' ? 'user' : 'assistant') as const,
        content: message.content,
      })),
    ];

    yield {
      aliveState: createAliveState('thinking', {
        emotion: 'empathetic',
        particles: { intensity: 0.9, speed: 0.005 },
      }),
    };

    const completion = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages,
      stream: true,
      temperature: 0.6,
    });

    let assistantContent = '';

    for await (const part of completion) {
      const deltaText = this.extractDelta(part);
      if (!deltaText) {
        continue;
      }

      assistantContent += deltaText;

      yield {
        content: deltaText,
        aliveState: createAliveState('speaking', {
          particles: {
            intensity: Math.min(1, 0.6 + Math.random() * 0.3),
            speed: 0.004 + Math.random() * 0.0015,
          },
        }),
      };
    }

    if (assistantContent.trim().length > 0) {
      await prisma.message.create({
        data: {
          conversationId,
          userId,
          sender: 'assistant',
          content: assistantContent.trim(),
        },
      });
      await this.invalidateHistoryCache(conversationId);
    }

    const learningSummary = await this.learningService.learnFromInteraction(userId, content);
    if (learningSummary) {
      yield {
        eventType: 'learning_update',
        payload: learningSummary,
        aliveState: createAliveState('excited', {
          learning: {
            justLearned: true,
            whatLearned: `${learningSummary.key}: ${learningSummary.value}`,
            confidence: learningSummary.confidence,
          },
          particles: { intensity: 0.95, speed: 0.006 },
        }),
        content: learningSummary.note,
      };
    }

    yield { done: true, aliveState: createAliveState('idle') };
  }

  private extractDelta(part: ChatCompletionChunk): string {
    const content = part.choices[0]?.delta?.content;
    if (Array.isArray(content)) {
      return content
        .map((item) => ('text' in item && typeof item.text === 'string' ? item.text : ''))
        .join('');
    }
    if (typeof content === 'string') {
      return content;
    }
    return '';
  }

  private async loadHistory(conversationId: string) {
    const cacheKey = this.historyCacheKey(conversationId);
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as Array<{ sender: string; content: string }>;
      }
    } catch (error) {
      console.warn('Redis read error', error);
    }

    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 30,
      select: {
        sender: true,
        content: true,
      },
    });

    try {
      await redis.set(cacheKey, JSON.stringify(history), 'EX', 60);
    } catch (error) {
      console.warn('Redis write error', error);
    }

    return history;
  }

  private async invalidateHistoryCache(conversationId: string) {
    try {
      await redis.del(this.historyCacheKey(conversationId));
    } catch (error) {
      console.warn('Redis delete error', error);
    }
  }

  private historyCacheKey(conversationId: string) {
    return `conversation:${conversationId}:history`;
  }
}
