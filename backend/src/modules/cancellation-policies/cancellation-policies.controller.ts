import { Request, Response, NextFunction } from 'express';
import { CancellationPoliciesRepository } from './cancellation-policies.repository';
import { sendSuccess } from '../../common/utils/response';
import { AppError } from '../../common/errors/app-error';

export class CancellationPoliciesController {
  constructor(private readonly repository: CancellationPoliciesRepository = new CancellationPoliciesRepository()) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const policies = await this.repository.findAllActive();
      sendSuccess(res, policies);
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const policy = await this.repository.findById(id);
      if (!policy) throw AppError.notFound('Không tìm thấy chính sách hủy');
      sendSuccess(res, policy);
    } catch (error) {
      next(error);
    }
  };
}
