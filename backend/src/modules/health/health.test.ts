import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('GET /api/health', () => {
  it('should return 200 OK with success response', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Hotel Booking API is running');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('status', 'ok');
  });

  it('should return 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/unknown-endpoint-404');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('Route not found');
  });

  it('should serve openapi specification', async () => {
    const res = await request(app).get('/api/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openapi', '3.0.3');
    expect(res.body.info).toHaveProperty('title', 'Hotel Booking Platform API');
  });
});
