import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const eventSchema = z.object({
  type: z.string().min(1),
  payload: z.unknown(),
});

export async function registerPubSubRoutes(app: FastifyInstance) {
  app.post('/events/pubsub', async (request, reply) => {
    const body = eventSchema.safeParse(request.body ?? {});
    if (!body.success) {
      return reply.code(400).send({ error: { type: 'USER_INPUT', message: 'Invalid event' } });
    }
    request.log.info({ type: body.data.type }, 'Received stub Pub/Sub event');
    return reply.code(204).send();
  });
}


