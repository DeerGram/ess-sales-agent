import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

export const createServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.use('/api', chatRoutes);

  app.use(errorHandler);

  return app;
};
