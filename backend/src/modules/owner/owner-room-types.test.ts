import { describe, it, expect, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';
import {
  createTestAccount,
  deleteTestAccount,
  createTestDiaPhuong,
  deleteTestDiaPhuong,
  createTestHotel,
  deleteTestHotel,
  createTestRoomType,
  createTestAmenity,
  deleteTestAmenity,
} from '../../test/factories';
import { ROLE_NAMES } from '../../common/constants/roles';
import { ROOM_TYPE_STATUS } from '../../common/constants/hotel-status';

vi.mock('../../integrations/cloudinary.integration', () => ({
  CloudinaryIntegration: {
    uploadImage: vi.fn().mockResolvedValue({ url: 'https://res.cloudinary.com/demo/image/upload/v1/hotel-booking/room-types/fake456.jpg', publicId: 'hotel-booking/room-types/fake456' }),
    deleteImage: vi.fn().mockResolvedValue(true),
  },
}));

const accountIds: number[] = [];
const diaPhuongIds: number[] = [];
const hotelIds: number[] = [];
const amenityIds: number[] = [];

afterAll(async () => {
  await Promise.all(hotelIds.map((id) => deleteTestHotel(id)));
  await Promise.all(accountIds.map((id) => deleteTestAccount(id)));
  await Promise.all(diaPhuongIds.map((id) => deleteTestDiaPhuong(id)));
  await Promise.all(amenityIds.map((id) => deleteTestAmenity(id)));
});

const loginAndGetToken = async (email: string, password: string) => {
  const res = await request(app).post('/api/auth/login').send({ identifier: email, MatKhau: password });
  return res.body.data.accessToken as string;
};

const makeOwnerWithHotel = async () => {
  const { account, plainPassword } = await createTestAccount({ role: ROLE_NAMES.PARTNER });
  accountIds.push(account.MaTaiKhoan);
  const token = await loginAndGetToken(account.Email, plainPassword);
  const diaPhuong = await createTestDiaPhuong();
  diaPhuongIds.push(diaPhuong.MaDiaPhuong);
  const hotel = await createTestHotel(account.MaTaiKhoan, diaPhuong.MaDiaPhuong);
  hotelIds.push(hotel.MaKhachSan);
  return { account, token, hotel };
};

describe('POST /api/owner/hotels/:hotelId/room-types (create)', () => {
  it('creates a room type for an owned hotel', async () => {
    const { token, hotel } = await makeOwnerWithHotel();
    const res = await request(app)
      .post(`/api/owner/hotels/${hotel.MaKhachSan}/room-types`)
      .set('Authorization', `Bearer ${token}`)
      .send({ TenLoaiPhong: 'Deluxe', SoGiuong: 1, SucChua: 2, DienTich: 25, LoaiGiuong: 'Giường đôi' });

    expect(res.status).toBe(201);
    expect(res.body.data.TenLoaiPhong).toBe('Deluxe');
    expect(res.body.data.TrangThai).toBe(ROOM_TYPE_STATUS.ACTIVE);
  });

  it('rejects creating a room type under a hotel owned by someone else', async () => {
    const ownerA = await makeOwnerWithHotel();
    const { account: ownerBAcc, plainPassword } = await createTestAccount({ role: ROLE_NAMES.PARTNER });
    accountIds.push(ownerBAcc.MaTaiKhoan);
    const tokenB = await loginAndGetToken(ownerBAcc.Email, plainPassword);

    const res = await request(app)
      .post(`/api/owner/hotels/${ownerA.hotel.MaKhachSan}/room-types`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ TenLoaiPhong: 'Sneaky', SoGiuong: 1, SucChua: 2, DienTich: 20, LoaiGiuong: 'Giường đôi' });
    expect(res.status).toBe(403);
  });
});

describe('GET/PATCH /api/owner/room-types/:id', () => {
  it('reads and updates an owned room type', async () => {
    const { token, hotel } = await makeOwnerWithHotel();
    const roomType = await createTestRoomType(hotel.MaKhachSan);

    const getRes = await request(app)
      .get(`/api/owner/room-types/${roomType.MaLoaiPhong}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);

    const patchRes = await request(app)
      .patch(`/api/owner/room-types/${roomType.MaLoaiPhong}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ TrangThai: ROOM_TYPE_STATUS.DISCONTINUED });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.TrangThai).toBe(ROOM_TYPE_STATUS.DISCONTINUED);
  });

  it('returns 403 for a room type belonging to another owner\'s hotel', async () => {
    const ownerA = await makeOwnerWithHotel();
    const ownerB = await makeOwnerWithHotel();
    const roomType = await createTestRoomType(ownerA.hotel.MaKhachSan);

    const res = await request(app)
      .patch(`/api/owner/room-types/${roomType.MaLoaiPhong}`)
      .set('Authorization', `Bearer ${ownerB.token}`)
      .send({ TenLoaiPhong: 'Hijacked' });
    expect(res.status).toBe(403);
  });

  it('returns 404 for a room type id that does not exist', async () => {
    const { token } = await makeOwnerWithHotel();
    const res = await request(app)
      .get('/api/owner/room-types/999999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('Amenities + images for room types', () => {
  it('replaces room-type amenities', async () => {
    const { token, hotel } = await makeOwnerWithHotel();
    const roomType = await createTestRoomType(hotel.MaKhachSan);
    const amenity = await createTestAmenity();
    amenityIds.push(amenity.MaTienNghi);

    const res = await request(app)
      .put(`/api/owner/room-types/${roomType.MaLoaiPhong}/amenities`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amenityIds: [amenity.MaTienNghi] });

    expect(res.status).toBe(200);
    expect(
      res.body.data.LOAI_PHONG_TIEN_NGHI.map((l: { MaTienNghi: number }) => l.MaTienNghi)
    ).toContain(amenity.MaTienNghi);
  });

  it('uploads and removes a room-type image via the mocked Cloudinary integration', async () => {
    const { token, hotel } = await makeOwnerWithHotel();
    const roomType = await createTestRoomType(hotel.MaKhachSan);

    const uploadRes = await request(app)
      .post(`/api/owner/room-types/${roomType.MaLoaiPhong}/images`)
      .set('Authorization', `Bearer ${token}`)
      .send({ image: 'data:image/png;base64,AAAA' });
    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.data.LaAnhDaiDien).toBe(true);

    const deleteRes = await request(app)
      .delete(`/api/owner/room-types/${roomType.MaLoaiPhong}/images/${uploadRes.body.data.MaHinhAnhLoaiPhong}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
  });
});
