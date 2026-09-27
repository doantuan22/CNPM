import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { createTestAccount, createTestDiaPhuong, createTestHotel, deleteTestAccount, deleteTestDiaPhuong, deleteTestHotel } from '../../test/factories';
import { ROLE_NAMES } from '../../common/constants/roles';
import { HOTEL_STATUS } from '../../common/constants/hotel-status';

const accountIds: number[] = []; const hotelIds: number[] = []; const locationIds: number[] = [];
let adminToken = ''; let customerToken = ''; let ownerToken = ''; let hotelId = 0;
const tokenFor = async (email: string, password: string) => (await request(app).post('/api/auth/login').send({ identifier: email, MatKhau: password })).body.data.accessToken as string;

beforeAll(async () => {
  const [admin, customer, owner] = await Promise.all([createTestAccount({ role: ROLE_NAMES.ADMIN }), createTestAccount({ role: ROLE_NAMES.CUSTOMER }), createTestAccount({ role: ROLE_NAMES.PARTNER })]);
  accountIds.push(admin.account.MaTaiKhoan, customer.account.MaTaiKhoan, owner.account.MaTaiKhoan);
  [adminToken, customerToken, ownerToken] = await Promise.all([tokenFor(admin.account.Email, admin.plainPassword), tokenFor(customer.account.Email, customer.plainPassword), tokenFor(owner.account.Email, owner.plainPassword)]);
  const location = await createTestDiaPhuong(); locationIds.push(location.MaDiaPhuong);
  const hotel = await createTestHotel(owner.account.MaTaiKhoan, location.MaDiaPhuong, { status: HOTEL_STATUS.ACTIVE }); hotelId = hotel.MaKhachSan; hotelIds.push(hotelId);
});
afterAll(async () => { await Promise.all(hotelIds.map(deleteTestHotel)); await Promise.all(accountIds.map(deleteTestAccount)); await Promise.all(locationIds.map(deleteTestDiaPhuong)); });

describe('admin hotel management (UC33/UC34)', () => {
  it('rejects customer and owner access with 403', async () => {
    expect((await request(app).get('/api/admin/hotels').set('Authorization', `Bearer ${customerToken}`)).status).toBe(403);
    expect((await request(app).get('/api/admin/hotels').set('Authorization', `Bearer ${ownerToken}`)).status).toBe(403);
  });

  it('lets an admin list and update only editable hotel fields', async () => {
    const list = await request(app).get('/api/admin/hotels?page=1&limit=20').set('Authorization', `Bearer ${adminToken}`);
    expect(list.status).toBe(200); expect(list.body.data.some((hotel: { MaKhachSan: number }) => hotel.MaKhachSan === hotelId)).toBe(true);
    const updated = await request(app).patch(`/api/admin/hotels/${hotelId}`).set('Authorization', `Bearer ${adminToken}`).send({ TenKhachSan: 'Hotel updated by admin', HangSao: 4 });
    expect(updated.status).toBe(200); expect(updated.body.data).toMatchObject({ MaKhachSan: hotelId, TenKhachSan: 'Hotel updated by admin', HangSao: 4 });
  });

  it('suspends a hotel so it disappears from public sellable discovery, then reactivates it', async () => {
    const suspended = await request(app).post(`/api/admin/hotels/${hotelId}/suspend`).set('Authorization', `Bearer ${adminToken}`);
    expect(suspended.status).toBe(200); expect(suspended.body.data.TrangThai).toBe(HOTEL_STATUS.SUSPENDED);
    expect((await request(app).get(`/api/hotels/${hotelId}`)).status).toBe(404);
    const reactivated = await request(app).post(`/api/admin/hotels/${hotelId}/reactivate`).set('Authorization', `Bearer ${adminToken}`);
    expect(reactivated.status).toBe(200); expect(reactivated.body.data.TrangThai).toBe(HOTEL_STATUS.ACTIVE);
    expect((await request(app).get(`/api/hotels/${hotelId}`)).status).toBe(200);
  });
});
