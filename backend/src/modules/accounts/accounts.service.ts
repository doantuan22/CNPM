import { AccountsRepository } from './accounts.repository';
import { RolesRepository } from '../roles/roles.repository';
import { AppError } from '../../common/errors/app-error';
import { hashPassword } from '../../common/utils/password';
import { toSafeAccount, SafeAccount } from '../../common/utils/account-mapper';
import { ACCOUNT_STATUS } from '../../common/constants/account-status';
import type { ApiPaginationMeta } from '../../common/types/api-response';
import type { CreateAccountInput, ListAccountsQuery, UpdateAccountInput } from './accounts.schemas';

export interface PaginatedAccounts {
  items: SafeAccount[];
  pagination: ApiPaginationMeta;
}

export class AccountsService {
  constructor(
    private readonly accountsRepository: AccountsRepository = new AccountsRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository()
  ) {}

  async list(query: ListAccountsQuery): Promise<PaginatedAccounts> {
    const { items, total } = await this.accountsRepository.list(query);
    return {
      items: items.map(toSafeAccount),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async getById(maTaiKhoan: number): Promise<SafeAccount> {
    const account = await this.accountsRepository.findById(maTaiKhoan);
    if (!account) throw AppError.notFound('Tài khoản không tồn tại');
    return toSafeAccount(account);
  }

  async create(input: CreateAccountInput): Promise<SafeAccount> {
    const [existingEmail, existingUsername, role] = await Promise.all([
      this.accountsRepository.findByEmail(input.Email),
      this.accountsRepository.findByUsername(input.TenDangNhap),
      this.rolesRepository.findById(input.MaVaiTro),
    ]);
    if (existingEmail) throw AppError.conflict('Email đã được sử dụng');
    if (existingUsername) throw AppError.conflict('Tên đăng nhập đã được sử dụng');
    if (!role) throw AppError.badRequest('Vai trò không tồn tại');

    const matKhauHash = await hashPassword(input.MatKhau);
    const now = new Date();
    const account = await this.accountsRepository.create({
      TenDangNhap: input.TenDangNhap,
      Email: input.Email,
      MatKhau: matKhauHash,
      HoTen: input.HoTen,
      SoDienThoai: input.SoDienThoai,
      NgaySinh: input.NgaySinh ?? null,
      GioiTinh: input.GioiTinh ?? null,
      AnhDaiDien: null,
      TrangThai: ACCOUNT_STATUS.ACTIVE,
      NgayTao: now,
      NgayCapNhat: now,
      VAI_TRO: { connect: { MaVaiTro: role.MaVaiTro } },
    });
    return toSafeAccount(account);
  }

  async update(maTaiKhoan: number, input: UpdateAccountInput): Promise<SafeAccount> {
    const existing = await this.accountsRepository.findById(maTaiKhoan);
    if (!existing) throw AppError.notFound('Tài khoản không tồn tại');

    if (input.Email && input.Email !== existing.Email) {
      const dup = await this.accountsRepository.findByEmail(input.Email);
      if (dup) throw AppError.conflict('Email đã được sử dụng');
    }
    if (input.TenDangNhap && input.TenDangNhap !== existing.TenDangNhap) {
      const dup = await this.accountsRepository.findByUsername(input.TenDangNhap);
      if (dup) throw AppError.conflict('Tên đăng nhập đã được sử dụng');
    }
    if (input.MaVaiTro !== undefined) {
      const role = await this.rolesRepository.findById(input.MaVaiTro);
      if (!role) throw AppError.badRequest('Vai trò không tồn tại');
    }

    const updated = await this.accountsRepository.update(maTaiKhoan, {
      ...input,
      NgayCapNhat: new Date(),
    });
    return toSafeAccount(updated);
  }

  async lock(maTaiKhoan: number): Promise<SafeAccount> {
    const existing = await this.accountsRepository.findById(maTaiKhoan);
    if (!existing) throw AppError.notFound('Tài khoản không tồn tại');
    const updated = await this.accountsRepository.setStatus(maTaiKhoan, ACCOUNT_STATUS.LOCKED);
    return toSafeAccount(updated);
  }

  async unlock(maTaiKhoan: number): Promise<SafeAccount> {
    const existing = await this.accountsRepository.findById(maTaiKhoan);
    if (!existing) throw AppError.notFound('Tài khoản không tồn tại');
    const updated = await this.accountsRepository.setStatus(maTaiKhoan, ACCOUNT_STATUS.ACTIVE);
    return toSafeAccount(updated);
  }

  /**
   * G0-10 delete-safe: hard-delete only when the account has no related
   * history (booking, review, support request, hotel ownership, partner
   * application). Otherwise lock it instead of destroying data lineage.
   */
  async safeDelete(maTaiKhoan: number): Promise<{ hardDeleted: boolean }> {
    const existing = await this.accountsRepository.findById(maTaiKhoan);
    if (!existing) throw AppError.notFound('Tài khoản không tồn tại');

    const hasHistory = await this.accountsRepository.hasDependentRecords(maTaiKhoan);
    if (hasHistory) {
      await this.accountsRepository.setStatus(maTaiKhoan, ACCOUNT_STATUS.LOCKED);
      return { hardDeleted: false };
    }

    await this.accountsRepository.hardDelete(maTaiKhoan);
    return { hardDeleted: true };
  }
}
