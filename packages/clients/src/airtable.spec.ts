import { describe, it, expect } from 'vitest';
import { AirtableClient, leadSchema } from './airtable';

function client() {
  return new AirtableClient({
    apiKey: 'k',
    baseId: 'base',
    leadsTable: 'Leads',
    interactionsTable: 'Interactions',
  });
}

describe('AirtableClient', () => {
  it('upserts lead idempotently by email/company', async () => {
    const c = client();
    const a = await c.upsertLead({
      name: 'Alice',
      company: 'Acme',
      email: 'a@b.com',
      source: 'whatsapp',
    });
    const b = await c.upsertLead({
      name: 'Alice B',
      company: 'Acme',
      email: 'a@b.com',
      source: 'whatsapp',
    });
    expect(a.lead.id).toBe(b.lead.id);
    expect(leadSchema.safeParse(b.lead).success).toBe(true);
  });

  it('creates interaction with valid shape', async () => {
    const c = client();
    const { interaction } = await c.createInteraction({
      leadId: 'ld_1',
      channel: 'whatsapp',
      direction: 'out',
      actionTaken: 'message_sent',
      text: 'Hello',
    });
    expect(interaction.leadId).toBe('ld_1');
    expect(interaction.id).toMatch(/^int_/);
  });

  it('updates lead fields and preserves idempotent key', async () => {
    const c = client();
    const { lead } = await c.upsertLead({
      company: 'Acme',
      phone: '+1555',
      source: 'referral',
    });
    const updated = await c.updateLead(lead.id, { stage: 'warm', tags: ['warm'] });
    expect(updated.lead.id).toBe(lead.id);
    expect(updated.lead.stage).toBe('warm');
    expect(updated.lead.tags).toEqual(['warm']);
  });
});


