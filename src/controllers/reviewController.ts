import type { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService.ts';
import { getValidated } from '../middleware/validate.ts';
import { idParamSchema, reviewBodySchema } from '../schemas/stallSchema.ts';
import type { z } from 'zod';

type IdParams = z.infer<typeof idParamSchema>;
type ReviewBody = z.infer<typeof reviewBodySchema>;

export class ReviewController {
  constructor(private reviewService: ReviewService = new ReviewService()) {}
  getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try { const stallId = req.query.stallId ? Number(req.query.stallId) : undefined; const reviews = await this.reviewService.getAllReviews(stallId); return res.status(200).json({ status: 'success', data: reviews }); }
    catch (error) { next(error); }
  };
  createReviewForStall = async (req: Request, res: Response, next: NextFunction) => {
    try { const { id } = getValidated<IdParams>(res, 'params'); const body = getValidated<ReviewBody>(res, 'body'); const review = await this.reviewService.createReview({ stallId: id, userId: req.user!.id, rating: body.rating, comment: body.comment }); return res.status(201).json({ status: 'success', data: review }); }
    catch (error) { next(error); }
  };
  deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try { const review = await this.reviewService.deleteReview(Number(req.params.id)); return res.status(200).json({ status: 'success', data: review }); }
    catch (error) { next(error); }
  };
}
