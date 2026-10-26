import { Router } from 'express';
import { StallController } from '../controllers/stallController.ts';
import { ReviewController } from '../controllers/reviewController.ts';
import { validate } from '../middleware/validate.ts';
import { authenticate } from '../middleware/authenticate.ts';
import { authorize, authorizeStallOwner } from '../middleware/authorize.ts';
import { idParamSchema, stallQuerySchema, createStallSchema, updateStallSchema, reviewBodySchema } from '../schemas/stallSchema.ts';

const stallRouter = Router();
const stallController = new StallController();
const reviewController = new ReviewController();

// Endpoint publik untuk melihat daftar dan detail warung.
stallRouter.get('/', validate('query', stallQuerySchema), stallController.getStalls);
stallRouter.get('/:id', validate('params', idParamSchema), stallController.getStallById);

// Pemilik warung atau admin boleh membuat warung. ownerId berasal dari JWT, bukan body.
stallRouter.post('/', authenticate, authorize('owner', 'admin'), validate('body', createStallSchema), stallController.createStall);
stallRouter.put('/:id', authenticate, authorize('owner', 'admin'), validate('params', idParamSchema), authorizeStallOwner, validate('body', updateStallSchema), stallController.updateStall);
stallRouter.delete('/:id', authenticate, authorize('admin'), validate('params', idParamSchema), stallController.deleteStall);

// Customer, owner, dan admin yang sudah login boleh memberi review. userId dari JWT.
stallRouter.post('/:id/reviews', authenticate, validate('params', idParamSchema), validate('body', reviewBodySchema), reviewController.createReviewForStall);

export { stallRouter };
