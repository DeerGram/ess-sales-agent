import { randomUUID } from 'node:crypto';
import { prisma } from '../../db/prisma';
import { redis } from '../../clients/redis';
import { env } from '../../config';

export type IntegrationProvider = 'notion' | 'google' | 'slack' | 'gmail';

interface ProviderConfig {
  authorizationUrl: string;
  tokenUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
}

const providerConfig: Record<IntegrationProvider, ProviderConfig> = {
  notion: {
    authorizationUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scope: 'default',
    clientId: env.NOTION_CLIENT_ID,
    clientSecret: env.NOTION_CLIENT_SECRET,
  },
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
  slack: {
    authorizationUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scope: 'channels:history,chat:write',
    clientId: env.SLACK_CLIENT_ID,
    clientSecret: env.SLACK_CLIENT_SECRET,
  },
  gmail: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    clientId: env.MAIL_CLIENT_ID,
    clientSecret: env.MAIL_CLIENT_SECRET,
  },
};

export class IntegrationService {
  constructor(private readonly stateTtlSeconds = 600) {}

  async list(userId: string) {
    return prisma.integration.findMany({ where: { userId } });
  }

  async startOAuth(userId: string, provider: IntegrationProvider, redirectUri: string) {
    const config = this.getProviderConfig(provider);
    const state = randomUUID();
    await redis.set(this.stateKey(state), JSON.stringify({ provider, userId, redirectUri }), 'EX', this.stateTtlSeconds);

    const url = new URL(config.authorizationUrl);
    url.searchParams.set('client_id', config.clientId ?? 'demo-client');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    url.searchParams.set('scope', config.scope);

    return { url: url.toString(), state };
  }

  async completeOAuth(state: string, code: string, redirectUri: string) {
    const cached = await redis.get(this.stateKey(state));
    if (!cached) {
      throw new Error('Oauth state expired or invalid.');
    }

    const { provider, userId } = JSON.parse(cached) as { provider: IntegrationProvider; userId: string };
    await redis.del(this.stateKey(state));

    const tokens = this.mockTokenExchange(provider, code, redirectUri);

    const record = await prisma.integration.upsert({
      where: { id: `${userId}-${provider}` },
      update: {
        auth: tokens,
        status: 'connected',
      },
      create: {
        id: `${userId}-${provider}`,
        userId,
        service: provider,
        auth: tokens,
        status: 'connected',
      },
    });

    return record;
  }

  private getProviderConfig(provider: IntegrationProvider) {
    return providerConfig[provider];
  }

  private stateKey(state: string) {
    return `oauth:state:${state}`;
  }

  private mockTokenExchange(provider: string, code: string, redirectUri: string) {
    return {
      accessToken: `mock-${provider}-${code}`,
      refreshToken: `mock-refresh-${provider}-${code}`,
      expiresIn: 3600,
      redirectUri,
      fetchedAt: new Date().toISOString(),
    };
  }
}
