import { z } from 'zod';
// import { retryFetch } from '@ess/shared';

export const leadSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.enum(['whatsapp', 'biz_card', 'referral', 'quiz', 'other']),
  stage: z.enum(['new', 'cold', 'warm', 'qualified', 'escalated']),
  tags: z.array(z.string()).optional(),
  ownerNotes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Lead = z.infer<typeof leadSchema>;

export const interactionSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  channel: z.enum(['whatsapp', 'email', 'voice']),
  direction: z.enum(['in', 'out']),
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  actionTaken: z.enum([
    'created',
    'updated',
    'tagged',
    'sequence_started',
    'message_sent',
    'call_placed',
    'error',
  ]),
  timestamp: z.string(),
});
export type Interaction = z.infer<typeof interactionSchema>;

export type AirtableClientOptions = {
  apiKey: string;
  baseId: string;
  leadsTable: string;
  interactionsTable: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export class AirtableClient {
  private readonly apiKey: string;
  private readonly baseId: string;
  private readonly leadsTable: string;
  private readonly interactionsTable: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly leads = new Map<string, Lead>();

  constructor(options: AirtableClientOptions) {
    this.apiKey = options.apiKey;
    this.baseId = options.baseId;
    this.leadsTable = options.leadsTable;
    this.interactionsTable = options.interactionsTable;
    this.baseUrl = options.baseUrl ?? 'https://api.airtable.com/v0';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  // Idempotent upsert by (email|phone, company)
  async upsertLead(input: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'stage'> & {
    source: Lead['source'];
    stage?: Lead['stage'];
  }): Promise<{ lead: Lead }>
  {
    const id = this.hashKey(`${input.email ?? input.phone ?? ''}|${input.company ?? ''}`);
    const existing = this.leads.get(id);
    const now = new Date().toISOString();
    const base: Lead = existing ?? {
      id,
      source: input.source,
      stage: input.stage ?? 'new',
      createdAt: now,
      updatedAt: now,
    } as Lead;
    const merged: Lead = leadSchema.parse({
      ...base,
      name: input.name ?? base.name,
      company: input.company ?? base.company,
      role: input.role ?? base.role,
      phone: input.phone ?? base.phone,
      email: input.email ?? base.email,
      source: input.source,
      stage: input.stage ?? base.stage,
      tags: input.tags ?? base.tags,
      ownerNotes: input.ownerNotes ?? base.ownerNotes,
      updatedAt: now,
    });
    this.leads.set(id, merged);
    return { lead: merged };
  }

  async createInteraction(input: Omit<Interaction, 'id' | 'timestamp'> & { timestamp?: string }) {
    const interaction: Interaction = interactionSchema.parse({
      id: `int_${Math.random().toString(36).slice(2)}`,
      ...input,
      timestamp: input.timestamp ?? new Date().toISOString(),
    });
    return { interaction };
  }

  async getLeadById(id: string): Promise<Lead | null> {
    return this.leads.get(id) ?? null;
  }

  async updateLead(
    id: string,
    changes: Partial<Pick<Lead, 'stage' | 'tags' | 'ownerNotes' | 'name' | 'company' | 'role' | 'phone' | 'email'>>,
  ): Promise<{ lead: Lead }>
  {
    const existing = this.leads.get(id);
    if (!existing) {
      throw new Error('Lead not found');
    }
    const now = new Date().toISOString();
    const merged: Lead = leadSchema.parse({
      ...existing,
      ...changes,
      updatedAt: now,
    });
    this.leads.set(id, merged);
    return { lead: merged };
  }

  private hashKey(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return `ld_${h.toString(16)}`;
  }
}


