import { Router } from 'express';
import { z } from 'zod';
import { IntegrationService, type IntegrationProvider } from '../services/integrations/IntegrationService';
import { HttpError } from '../middleware/errorHandler';

const startSchema = z.object({
  redirectUri: z.string().url(),
});

const callbackSchema = z.object({
  state: z.string().min(5),
  code: z.string().min(1),
  redirectUri: z.string().url(),
});

interface IntegrationRouterDependencies {
  integrationService?: IntegrationService;
}

const providerSchema = z.enum(['notion', 'google', 'slack', 'gmail']);

export const createIntegrationRouter = (deps: IntegrationRouterDependencies = {}) => {
  const router = Router();
  const integrationService = deps.integrationService ?? new IntegrationService();

  router.get('/integrations', async (_req, res, next) => {
    try {
      const integrations = await integrationService.list('demo-user');
      res.json({ data: integrations });
    } catch (error) {
      next(error);
    }
  });

  router.post('/integrations/oauth/:provider/start', async (req, res, next) => {
    try {
      const provider = providerSchema.parse(req.params.provider) as IntegrationProvider;
      const body = startSchema.parse(req.body ?? {});
      const payload = await integrationService.startOAuth('demo-user', provider, body.redirectUri);
      res.json(payload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new HttpError(error.message, 400));
        return;
      }
      next(error);
    }
  });

  router.post('/integrations/oauth/:provider/callback', async (req, res, next) => {
    try {
      const provider = providerSchema.parse(req.params.provider) as IntegrationProvider;
      const body = callbackSchema.parse(req.body ?? {});
      const integration = await integrationService.completeOAuth(body.state, body.code, body.redirectUri);
      res.json({ data: integration });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new HttpError(error.message, 400));
        return;
      }
      next(error);
    }
  });

  return router;
};

export default createIntegrationRouter();
