import { PartnersRepository } from './partners.repository';
import { AppError } from '../../common/errors/app-error';
import { PARTNER_APPLICATION_STATUS } from '../../common/constants/account-status';
import { ROLE_NAMES } from '../../common/constants/roles';
import type { ApiPaginationMeta } from '../../common/types/api-response';
import type { ApplyPartnerInput, AdminListPartnerApplicationsQuery, RejectPartnerApplicationInput } from './partners.schemas';
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

  async adminList(query: AdminListPartnerApplicationsQuery) {
    const { items, total } = await this.partnersRepository.listAdmin(query);
    const pagination: ApiPaginationMeta = { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) };
    return { items, pagination };
  }

  async adminGetById(maHoSoDoiTac: number) {
    const application = await this.partnersRepository.findByIdAdmin(maHoSoDoiTac);
    if (!application) throw AppError.notFound('Không tìm thấy hồ sơ đối tác');
    return application;
  }

  private async moderate(
    maHoSoDoiTac: number,
    adminId: number,
    status: typeof PARTNER_APPLICATION_STATUS.APPROVED | typeof PARTNER_APPLICATION_STATUS.REJECTED,
    reason: string | null
  ) {
    return this.partnersRepository.runInTransaction(async (tx) => {
      const application = await this.partnersRepository.findPendingById(tx, maHoSoDoiTac);
      if (!application) throw AppError.notFound('Không tìm thấy hồ sơ đối tác');
      if (application.TrangThaiDuyet !== PARTNER_APPLICATION_STATUS.PENDING) {
        throw AppError.conflict('Hồ sơ đối tác đã được xử lý');
      }
      const now = new Date();
      if (now.getTime() < application.NgayNop.getTime()) {
        throw AppError.badRequest('Thời điểm duyệt không được trước thời điểm nộp hồ sơ');
      }
      const updated = await this.partnersRepository.updatePendingStatus(tx, maHoSoDoiTac, adminId, status, reason, now);
      if (updated.count !== 1) throw AppError.conflict('Hồ sơ đối tác đã được xử lý');

      if (status === PARTNER_APPLICATION_STATUS.APPROVED) {
        const partnerRole = await tx.vAI_TRO.findUnique({ where: { TenVaiTro: ROLE_NAMES.PARTNER } });
        if (!partnerRole) throw AppError.internal('Vai trò Chủ khách sạn chưa được khởi tạo trong hệ thống');
        await this.partnersRepository.updateAccountRole(tx, application.MaTaiKhoan, partnerRole.MaVaiTro, now);
      }
      return tx.hO_SO_DOI_TAC.findUnique({
        where: { MaHoSoDoiTac: maHoSoDoiTac },
        include: {
          TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN: { select: { MaTaiKhoan: true, HoTen: true, Email: true, MaVaiTro: true } },
          TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanDuyetToTAI_KHOAN: { select: { MaTaiKhoan: true, HoTen: true, Email: true } },
        },
      });
    });
  }

  async approve(maHoSoDoiTac: number, adminId: number) {
    return this.moderate(maHoSoDoiTac, adminId, PARTNER_APPLICATION_STATUS.APPROVED, null);
  }

  async reject(maHoSoDoiTac: number, adminId: number, input: RejectPartnerApplicationInput) {
    return this.moderate(maHoSoDoiTac, adminId, PARTNER_APPLICATION_STATUS.REJECTED, input.LyDoTuChoi);
  }
}
