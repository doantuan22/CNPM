import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { getPrismaClient } from '../../config/prisma';
import { HOTEL_STATUS } from '../../common/constants/hotel-status';

describe('GET /api/locations', () => {
  it('lists locations publicly, sorted by city', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('reports each location\'s count of publicly listed hotels and a cover image', async () => {
    const prisma = getPrismaClient();
    const res = await request(app).get('/api/locations');
    for (const loc of res.body.data as Array<{ MaDiaPhuong: number; SoKhachSan: number; AnhDaiDien: string | null }>) {
      const active = await prisma.kHACH_SAN.count({ where: { MaDiaPhuong: loc.MaDiaPhuong, TrangThai: HOTEL_STATUS.ACTIVE } });
      expect(loc.SoKhachSan).toBe(active);
      if (active === 0) expect(loc.AnhDaiDien).toBeNull();
    }
  });
});
