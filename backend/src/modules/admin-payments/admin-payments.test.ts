import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { createTestAccount, createTestBookingDirect, createTestCancellationPolicy, createTestDiaPhuong, createTestHotel, createTestPayment, createTestRefund, deleteTestAccount, deleteTestCancellationPolicy, deleteTestDiaPhuong, deleteTestHotel } from '../../test/factories';
import { ROLE_NAMES } from '../../common/constants/roles';
import { BOOKING_STATUS } from '../../common/constants/hotel-status';
import { getPrismaClient } from '../../config/prisma';

const accountIds: number[] = []; const locationIds: number[] = []; let hotelId = 0; let policyId = 0; let paymentId = 0; let adminToken = ''; let customerToken = ''; let ownerToken = '';
const tokenFor = async (email: string, password: string) => (await request(app).post('/api/auth/login').send({ identifier: email, MatKhau: password })).body.data.accessToken as string;
beforeAll(async () => {
  const [admin, customer, owner] = await Promise.all([createTestAccount({ role: ROLE_NAMES.ADMIN }), createTestAccount({ role: ROLE_NAMES.CUSTOMER }), createTestAccount({ role: ROLE_NAMES.PARTNER })]);
  accountIds.push(admin.account.MaTaiKhoan, customer.account.MaTaiKhoan, owner.account.MaTaiKhoan);
  [adminToken, customerToken, ownerToken] = await Promise.all([tokenFor(admin.account.Email, admin.plainPassword), tokenFor(customer.account.Email, customer.plainPassword), tokenFor(owner.account.Email, owner.plainPassword)]);
  const location = await createTestDiaPhuong(); locationIds.push(location.MaDiaPhuong); const hotel = await createTestHotel(owner.account.MaTaiKhoan, location.MaDiaPhuong); hotelId = hotel.MaKhachSan;
  const policy = await createTestCancellationPolicy([{ soGioTruocNhanPhong: 24, tyLeHoanTien: 50 }]); policyId = policy.MaChinhSachHuy;
  const booking = await createTestBookingDirect(customer.account.MaTaiKhoan, hotelId, policyId, new Date('2030-01-01'), new Date('2030-01-03'), { trangThai: BOOKING_STATUS.CONFIRMED });
  const payment = await createTestPayment(booking.MaDatPhong, 1_000_000); paymentId = payment.MaThanhToan; await createTestRefund(paymentId, 100_000);
});
afterAll(async () => { const prisma = getPrismaClient(); await prisma.hOAN_TIEN.deleteMany({ where: { MaThanhToan: paymentId } }); await prisma.tHANH_TOAN.deleteMany({ where: { MaDatPhong: { in: (await prisma.dAT_PHONG.findMany({ where: { MaKhachSan: hotelId }, select: { MaDatPhong: true } })).map((booking) => booking.MaDatPhong) } } }); await prisma.dAT_PHONG.deleteMany({ where: { MaKhachSan: hotelId } }); await deleteTestCancellationPolicy(policyId); await deleteTestHotel(hotelId); await Promise.all(accountIds.map(deleteTestAccount)); await Promise.all(locationIds.map(deleteTestDiaPhuong)); });

describe('admin payments (UC35)', () => {
  it('rejects customer and owner access with 403', async () => {
    expect((await request(app).get('/api/admin/payments').set('Authorization', `Bearer ${customerToken}`)).status).toBe(403);
    expect((await request(app).get('/api/admin/payments').set('Authorization', `Bearer ${ownerToken}`)).status).toBe(403);
  });
  it('lists and reads a payment, including booking/refund operations data only', async () => {
    const list = await request(app).get('/api/admin/payments?page=1&limit=20').set('Authorization', `Bearer ${adminToken}`);
    expect(list.status).toBe(200); expect(list.body.data.some((payment: { MaThanhToan: number }) => payment.MaThanhToan === paymentId)).toBe(true);
    const detail = await request(app).get(`/api/admin/payments/${paymentId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(detail.status).toBe(200); expect(detail.body.data.HOAN_TIEN).toHaveLength(1); expect(detail.body.data.DAT_PHONG).toHaveProperty('MaXacNhanDatPhong');
    const serialized = JSON.stringify(detail.body.data); expect(serialized).not.toContain('MatKhau'); expect(serialized).not.toContain('Email'); expect(serialized).not.toContain('vnp_SecureHash');
  });
});
