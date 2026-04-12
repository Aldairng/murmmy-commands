import { Router } from 'express';
import { verifyTokenFromQuery, AuthRequest } from '../auth';
import { addClient } from '../sse';

const router = Router();

router.get('/', verifyTokenFromQuery, (req: AuthRequest, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  addClient(res);
});

export default router;
