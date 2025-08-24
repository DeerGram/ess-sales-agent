import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { verifyTwilioSignature } from '../utils/twilioSignature';
import { AuthError, UserInputError } from '@ess/shared';
import { runOrchestration } from '../services/orchestrator';

const incomingSchema = z.object({
  From: z.string().min(1),
  To: z.string().min(1),
  Body: z.string().optional(),
  NumMedia: z.string().regex(/^\d+$/).default('0'),
  MediaUrl0: z.string().url().optional(),
  MediaContentType0: z.string().optional(),
  SmsMessageSid: z.string().optional(),
  AccountSid: z.string().optional(),
});

export async function registerTwilioWhatsappWebhook(app: FastifyInstance) {
  app.post('/webhooks/twilio/whatsapp', async (request, reply) => {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
      request.log.error('TWILIO_AUTH_TOKEN missing');
      return reply.code(500).send();
    }

    // Fastify with formbody plugin will parse x-www-form-urlencoded into request.body
    const rawBody = request.body as Record<string, unknown> | undefined;
    const formParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawBody ?? {})) {
      if (typeof v === 'string') formParams[k] = v;
    }

    // Signature verification
    const headerSig = request.headers['x-twilio-signature'];
    const fullUrl = getFullUrl(request);
    const valid = verifyTwilioSignature({
      authToken,
      url: fullUrl,
      params: formParams,
      headerSignature: Array.isArray(headerSig) ? headerSig[0] : headerSig,
    });
    if (!valid) {
      request.log.warn('Invalid Twilio signature');
      throw new AuthError('Invalid signature');
    }

    // Validate input
    const parsed = incomingSchema.safeParse(formParams);
    if (!parsed.success) {
      request.log.warn({ err: parsed.error.issues.length }, 'Invalid payload');
      throw new UserInputError('Invalid payload');
    }

    const msg = normalizeMessage(parsed.data);
    request.log.info({ from: mask(msg.from) }, 'Received WhatsApp webhook');

    // Use stubbed clients to upsert lead and log interaction (no external calls yet)
    const leadInput = {
      name: undefined,
      company: undefined,
      role: undefined,
      phone: msg.from.replace('whatsapp:', ''),
      email: undefined,
      source: 'whatsapp' as const,
      stage: 'new' as const,
      tags: ['inbound'],
      ownerNotes: undefined,
    };
    const { lead } = await request.server.clients.airtable.upsertLead(leadInput);
    await request.server.clients.airtable.createInteraction({
      leadId: lead.id,
      channel: 'whatsapp',
      direction: 'in',
      text: msg.text,
      mediaUrl: msg.mediaUrl,
      actionTaken: 'created',
    });

    // Orchestrate with time budget; enqueue if offloaded
    const result = await runOrchestration(msg, { deadlineMs: 6000 });
    if (result.offloaded) {
      // Fire-and-forget to stub Pub/Sub endpoint (sync internal call for now)
      request.log.info('Offloading remaining tool calls to Pub/Sub');
      // In real impl, publish to Pub/Sub; here we call our own endpoint
      await request.server.inject({
        method: 'POST',
        url: '/events/pubsub',
        payload: { type: 'retry.toolcall', payload: { from: msg.from } },
      });
    }

    // Respond with empty TwiML to ACK
    reply.header('Content-Type', 'text/xml');
    return reply.send('<Response></Response>');
  });
}

function getFullUrl(request: FastifyRequest): string {
  const protocol = request.headers['x-forwarded-proto'] ?? 'https';
  const host = request.headers['x-forwarded-host'] ?? request.headers.host ?? 'localhost';
  return `${protocol}://${host}${request.url}`;
}

function normalizeMessage(input: z.infer<typeof incomingSchema>) {
  const numMedia = Number(input.NumMedia ?? '0') || 0;
  return {
    from: input.From,
    to: input.To,
    text: input.Body || undefined,
    mediaUrl: numMedia > 0 ? input.MediaUrl0 : undefined,
    mediaContentType: numMedia > 0 ? input.MediaContentType0 : undefined,
    timestamp: new Date().toISOString(),
  };
}

function mask(s: string): string {
  if (s.length <= 4) return '***';
  return `${'*'.repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
}


