import express, { type Request, type Response, type Application } from 'express';
import { sql } from 'drizzle-orm';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger-output.json' with { type: 'json' };
import { getDb } from './db/index.ts';
import { userRouter } from './routes/userRouter.ts';
import { stallRouter } from './routes/stallRouter.ts';
import { menuItemRouter } from './routes/menuItemRouter.ts';
import { reviewRouter } from './routes/reviewRouter.ts';
import { likeRouter } from './routes/likeRouter.ts';
import { flagRouter } from './routes/flagRouter.ts';
import { auditLogRouter } from './routes/auditLogRouter.ts';
import { authRouter } from './routes/authRouter.ts';
import { authenticate } from './middleware/authenticate.ts';
import { authorize } from './middleware/authorize.ts';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.ts';

const app: Application = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.json({ limit: '1mb' }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', async (_req: Request, res: Response) => {
  try { const db = await getDb(); await db.execute(sql`SELECT 1 AS ok`); res.status(200).json({ status: 'success', message: 'Server dan database terhubung' }); }
  catch { res.status(500).json({ status: 'error', message: 'Gagal terhubung ke database', errors: [] }); }
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', authenticate, authorize('admin'), userRouter);
app.use('/api/v1/stalls', stallRouter);
app.use('/api/v1/menu-items', authenticate, authorize('admin'), menuItemRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/likes', authenticate, authorize('admin'), likeRouter);
app.use('/api/v1/flags', authenticate, authorize('admin'), flagRouter);
app.use('/api/v1/audit-logs', authenticate, authorize('admin'), auditLogRouter);

app.use(notFoundHandler);
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
