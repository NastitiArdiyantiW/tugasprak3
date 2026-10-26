import { Router } from 'express';
import { AuthController } from '../controllers/authController.ts';
import { validate } from '../middleware/validate.ts';
import { authenticate } from '../middleware/authenticate.ts';
import { registerSchema, loginSchema } from '../schemas/authSchema.ts';

const router = Router();
const controller = new AuthController();
router.post('/register', validate('body', registerSchema), controller.register);
router.post('/login', validate('body', loginSchema), controller.login);
router.get('/me', authenticate, controller.me);
export { router as authRouter };
