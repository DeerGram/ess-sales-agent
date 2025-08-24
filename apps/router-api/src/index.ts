import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import { registerTwilioWhatsappWebhook } from './webhooks/twilioWhatsapp';
import { clientsPlugin } from './plugins/clients';
import { errorHandlerPlugin } from './plugins/errorHandler';
import { registerPubSubRoutes } from './internal/pubsub';

export async function createServer() {
  const app = Fastify({ logger: true });
  app.get('/health', async () => ({ status: 'ok' }));
  await app.register(formbody);
  await app.register(clientsPlugin);
  await app.register(errorHandlerPlugin);
  await registerPubSubRoutes(app);
  await registerTwilioWhatsappWebhook(app);
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 8080);
  createServer()
    .then((app) => app.listen({ port, host: '0.0.0.0' }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}


