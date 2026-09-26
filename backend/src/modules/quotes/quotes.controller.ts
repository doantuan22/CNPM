import { Request, Response, NextFunction } from 'express';
import { QuotesService } from './quotes.service';
import { sendSuccess } from '../../common/utils/response';
import type { QuoteRequestInput } from './quotes.schemas';

export class QuotesController {
  constructor(private readonly service: QuotesService = new QuotesService()) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const quote = await this.service.createQuote(id, req.body as QuoteRequestInput);
      sendSuccess(res, quote);
    } catch (error) {
      next(error);
    }
  };
}
