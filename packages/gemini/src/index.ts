import { z } from 'zod';

// Schemas for tool parameters and results
export const leadIdSchema = z.string().min(1);
export const stageSchema = z.enum(['new', 'cold', 'warm', 'qualified', 'escalated']);
export const channelSchema = z.enum(['whatsapp', 'email', 'voice']);

export const createOrUpsertLeadParams = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.enum(['whatsapp', 'biz_card', 'referral', 'quiz', 'other']).optional(),
  notes: z.string().optional(),
  stage: stageSchema.optional(),
  tags: z.array(z.string()).optional(),
});
export type CreateOrUpsertLeadParams = z.infer<typeof createOrUpsertLeadParams>;

export const createOrUpsertLeadResult = z.object({ leadId: leadIdSchema });
export type CreateOrUpsertLeadResult = z.infer<typeof createOrUpsertLeadResult>;

export const findLeadParams = z.object({ email: z.string().email().optional(), phone: z.string().optional() });
export const findLeadResult = z.object({ leadId: leadIdSchema.nullable() });

export const updateLeadParams = z.object({
  leadId: leadIdSchema,
  stage: stageSchema.optional(),
  tags: z.array(z.string()).optional(),
  notesAppend: z.string().optional(),
});
export const updateLeadResult = z.object({ ok: z.boolean() });

export const logInteractionParams = z.object({
  leadId: leadIdSchema,
  channel: channelSchema,
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  outcome: z.enum(['created', 'updated', 'tagged', 'sequence_started', 'message_sent', 'call_placed', 'error']),
});
export const logInteractionResult = z.object({ ok: z.boolean() });

export const startSequenceParams = z.object({
  leadEmailOrId: z.string().min(1),
  sequenceSlug: z.string().min(1),
});
export const startSequenceResult = z.object({ ok: z.boolean() });

export const sendWhatsAppParams = z.object({
  to: z.string().min(5),
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
});
export const sendWhatsAppResult = z.object({ messageSid: z.string().min(1) });

export const synthesizeTTSParams = z.object({ voiceId: z.string().min(1), scriptText: z.string().min(1) });
export const synthesizeTTSResult = z.object({ audioUrl: z.string().url() });

export const placeCallParams = z.object({ to: z.string().min(5), audioUrl: z.string().url(), callerId: z.string().min(5) });
export const placeCallResult = z.object({ callSid: z.string().min(1) });

export const ownerNotifyParams = z.object({ text: z.string().min(1) });
export const ownerNotifyResult = z.object({ ok: z.boolean() });

// Dispatcher types
export type ToolName =
  | 'createOrUpsertLead'
  | 'findLead'
  | 'updateLead'
  | 'logInteraction'
  | 'startSequence'
  | 'sendWhatsApp'
  | 'synthesizeTTS'
  | 'placeCall'
  | 'ownerNotify';

export type ToolSchemas = {
  createOrUpsertLead: { params: typeof createOrUpsertLeadParams; result: typeof createOrUpsertLeadResult };
  findLead: { params: typeof findLeadParams; result: typeof findLeadResult };
  updateLead: { params: typeof updateLeadParams; result: typeof updateLeadResult };
  logInteraction: { params: typeof logInteractionParams; result: typeof logInteractionResult };
  startSequence: { params: typeof startSequenceParams; result: typeof startSequenceResult };
  sendWhatsApp: { params: typeof sendWhatsAppParams; result: typeof sendWhatsAppResult };
  synthesizeTTS: { params: typeof synthesizeTTSParams; result: typeof synthesizeTTSResult };
  placeCall: { params: typeof placeCallParams; result: typeof placeCallResult };
  ownerNotify: { params: typeof ownerNotifyParams; result: typeof ownerNotifyResult };
};

export type DispatcherAuthContext = {
  apiKey?: string;
  actor: 'system' | 'owner' | 'unknown';
};

export type Dispatcher = <N extends ToolName>(
  name: N,
  args: z.infer<ToolSchemas[N]['params']>,
  ctx: DispatcherAuthContext,
) => Promise<z.infer<ToolSchemas[N]['result']>>;

// Simple in-memory rate limiter stub (per key)
const lastCallAtByKey = new Map<string, number>();
function assertRateLimit(key: string, now = Date.now()): void {
  const last = lastCallAtByKey.get(key) ?? 0;
  if (now - last < 50) {
    throw Object.assign(new Error('Rate limit exceeded'), { code: 'RATE_LIMIT' });
  }
  lastCallAtByKey.set(key, now);
}

function assertAuthorized(ctx: DispatcherAuthContext): void {
  if (ctx.actor === 'unknown') {
    throw Object.assign(new Error('Unauthorized'), { code: 'AUTH' });
  }
}

// Exported dispatcher implementation stub: validates args and returns mock results
export const dispatch: Dispatcher = async (name, args, ctx) => {
  assertAuthorized(ctx);
  assertRateLimit(ctx.apiKey ?? ctx.actor);

  switch (name) {
    case 'createOrUpsertLead': {
      const parsed = createOrUpsertLeadParams.parse(args);
      const leadId = `lead_${hashId(parsed.email ?? parsed.phone ?? parsed.company ?? 'unknown')}`;
      return createOrUpsertLeadResult.parse({ leadId });
    }
    case 'findLead': {
      findLeadParams.parse(args);
      return findLeadResult.parse({ leadId: null });
    }
    case 'updateLead': {
      updateLeadParams.parse(args);
      return updateLeadResult.parse({ ok: true });
    }
    case 'logInteraction': {
      logInteractionParams.parse(args);
      return logInteractionResult.parse({ ok: true });
    }
    case 'startSequence': {
      startSequenceParams.parse(args);
      return startSequenceResult.parse({ ok: true });
    }
    case 'sendWhatsApp': {
      sendWhatsAppParams.parse(args);
      return sendWhatsAppResult.parse({ messageSid: `SM_${Math.random().toString(36).slice(2)}` });
    }
    case 'synthesizeTTS': {
      synthesizeTTSParams.parse(args);
      return synthesizeTTSResult.parse({ audioUrl: 'https://example.com/audio.mp3' });
    }
    case 'placeCall': {
      placeCallParams.parse(args);
      return placeCallResult.parse({ callSid: `CA_${Math.random().toString(36).slice(2)}` });
    }
    case 'ownerNotify': {
      ownerNotifyParams.parse(args);
      return ownerNotifyResult.parse({ ok: true });
    }
    default:
      // Exhaustive check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _never: never = name;
      throw new Error(`Unknown tool: ${name}`);
  }
};

function hashId(v: string): string {
  let h = 0;
  for (let i = 0; i < v.length; i++) {
    h = (h * 31 + v.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}


