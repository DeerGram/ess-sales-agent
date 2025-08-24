import Fastify from 'fastify';

export async function createServer() {
  const app = Fastify({ logger: true });
  app.get('/health', async () => ({ status: 'ok' }));
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 8081);
  createServer()
    .then((app) => app.listen({ port, host: '0.0.0.0' }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}


