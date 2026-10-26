import type { Request, Response, NextFunction } from 'express';
import { StallService } from '../services/stallService.ts';
import { getValidated } from '../middleware/validate.ts';
import type { z } from 'zod';
import { stallQuerySchema, idParamSchema, createStallSchema, updateStallSchema } from '../schemas/stallSchema.ts';

type StallQuery = z.infer<typeof stallQuerySchema>;
type StallBody = z.infer<typeof createStallSchema>;
type UpdateStallBody = z.infer<typeof updateStallSchema>;
type IdParams = z.infer<typeof idParamSchema>;

export class StallController {
  constructor(private stallService: StallService = new StallService()) {}

  getStalls = async (_req: Request, res: Response, next: NextFunction) => {
    try { const query = getValidated<StallQuery>(res, 'query'); const { data, total } = await this.stallService.getAllStalls(query); return res.status(200).json({ status: 'success', meta: { page: query.page, limit: query.limit, total }, data }); }
    catch (error) { next(error); }
  };
  getStallById = async (_req: Request, res: Response, next: NextFunction) => {
    try { const { id } = getValidated<IdParams>(res, 'params'); const stall = await this.stallService.getStallById(id); return res.status(200).json({ status: 'success', data: stall }); }
    catch (error) { next(error); }
  };
  createStall = async (req: Request, res: Response, next: NextFunction) => {
    try { const input = getValidated<StallBody>(res, 'body'); const stall = await this.stallService.createStall({ ...input, ownerId: req.user!.id }); return res.status(201).json({ status: 'success', data: stall }); }
    catch (error) { next(error); }
  };
  updateStall = async (_req: Request, res: Response, next: NextFunction) => {
    try { const { id } = getValidated<IdParams>(res, 'params'); const input = getValidated<UpdateStallBody>(res, 'body'); const stall = await this.stallService.updateStall(id, input); return res.status(200).json({ status: 'success', data: stall }); }
    catch (error) { next(error); }
  };
  deleteStall = async (_req: Request, res: Response, next: NextFunction) => {
    try { const { id } = getValidated<IdParams>(res, 'params'); const stall = await this.stallService.deleteStall(id); return res.status(200).json({ status: 'success', data: stall }); }
    catch (error) { next(error); }
  };
}
