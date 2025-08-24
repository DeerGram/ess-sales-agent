import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { AirtableClient } from '@ess/clients';
import { TwilioClient } from '@ess/clients';

export type Clients = {
  airtable: AirtableClient;
  twilio: TwilioClient;
};

declare module 'fastify' {
  interface FastifyInstance {
    clients: Clients;
  }
}

export const clientsPlugin = fp(async function (app: FastifyInstance) {
  const airtable = new AirtableClient({
    apiKey: process.env.AIRTABLE_API_KEY ?? 'stub',
    baseId: process.env.AIRTABLE_BASE_ID ?? 'stub',
    leadsTable: process.env.AIRTABLE_LEADS_TABLE ?? 'Leads',
    interactionsTable: process.env.AIRTABLE_INTERACTIONS_TABLE ?? 'Interactions',
  });

  const twilio = new TwilioClient({
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? 'AC_stub',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? 'stub',
    messagingSid: process.env.TWILIO_MESSAGING_SID,
    voiceCallerId: process.env.TWILIO_VOICE_CALLER_ID,
  });

  app.decorate('clients', { airtable, twilio });
});


