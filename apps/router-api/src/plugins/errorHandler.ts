import type { FastifyInstance, FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import { normalizeError, redactMessage } from '@ess/shared';

export const errorHandlerPlugin = fp(async function (app: FastifyInstance) {
  app.setErrorHandler((err: FastifyError, request, reply) => {
    const correlationId = request.id?.toString();
    const redactedMsg = redactMessage(err.message ?? '');
    request.log.error({ err: { message: redactedMsg } }, 'request error');
    const normalized = normalizeError(err as unknown, correlationId);
    reply.code(normalized.status).send(normalized.body);
  });
});


