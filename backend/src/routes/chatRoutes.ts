import { Router } from 'express';
import { z } from 'zod';
import { ChatService } from '../services/chat/ChatService';
import { HttpError } from '../middleware/errorHandler';

const router = Router();
const chatService = new ChatService();

const chatSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

router.post('/chat', async (req, res, next) => {
  try {
    const payload = chatSchema.parse(req.body ?? {});
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of chatService.streamResponse({
      content: payload.content,
      conversationId: payload.conversationId,
      userId: 'demo-user',
    })) {
      res.write(`${JSON.stringify(chunk)}\n`);
    }

    res.end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new HttpError(error.message, 400));
      return;
    }
    next(error);
  }
});

export default router;
