import { PartnersRepository } from './partners.repository';
import { AppError } from '../../common/errors/app-error';
import { PARTNER_APPLICATION_STATUS } from '../../common/constants/account-status';
import type { ApplyPartnerInput } from './partners.schemas';
import type { HO_SO_DOI_TAC } from '../../generated/prisma/client';

export class PartnersService {
  constructor(private readonly partnersRepository: PartnersRepository = new PartnersRepository()) {}

  async apply(maTaiKhoan: number, input: ApplyPartnerInput): Promise<HO_SO_DOI_TAC> {
    const latest = await this.partnersRepository.findLatestByAccount(maTaiKhoan);
    if (
      latest &&
      (latest.TrangThaiDuyet === PARTNER_APPLICATION_STATUS.PENDING ||
        latest.TrangThaiDuyet === PARTNER_APPLICATION_STATUS.APPROVED)
    ) {
      throw AppError.conflict('Bạn đã có hồ sơ đối tác đang chờ duyệt hoặc đã được duyệt');
    }

    return this.partnersRepository.create({
      SoCCCD: input.SoCCCD,
      SoGiayPhepKinhDoanh: input.SoGiayPhepKinhDoanh,
      MaSoThue: input.MaSoThue,
      TepGiayTo: input.TepGiayTo,
      TrangThaiDuyet: PARTNER_APPLICATION_STATUS.PENDING,
      NgayNop: new Date(),
      TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN: { connect: { MaTaiKhoan: maTaiKhoan } },
    });
  }

  async getMyApplication(maTaiKhoan: number): Promise<HO_SO_DOI_TAC | null> {
    return this.partnersRepository.findLatestByAccount(maTaiKhoan);
  }
}
