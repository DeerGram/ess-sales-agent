import express from 'express';
import cors from 'cors';
import chatRoutes, { createChatRouter } from './routes/chatRoutes';
import integrationRoutes, { createIntegrationRouter } from './routes/integrationRoutes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { ChatService } from './services/chat/ChatService';
import { IntegrationService } from './services/integrations/IntegrationService';

interface ServerOptions {
  chatService?: ChatService;
  integrationService?: IntegrationService;
}

export const createServer = (options: ServerOptions = {}) => {
  const app = express();
  const chatRouter = options.chatService ? createChatRouter({ chatService: options.chatService }) : chatRoutes;
  const integrationsRouter = options.integrationService
    ? createIntegrationRouter({ integrationService: options.integrationService })
    : integrationRoutes;

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.use('/api', chatRouter);
  app.use('/api', integrationsRouter);

  app.use(errorHandler);

  return app;
};
