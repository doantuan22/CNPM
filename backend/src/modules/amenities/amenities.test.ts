import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('GET /api/amenities', () => {
  it('lists amenities sorted by name, publicly', async () => {
    const res = await request(app).get('/api/amenities');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('MaTienNghi');
    expect(res.body.data[0]).toHaveProperty('TenTienNghi');
  });
});
