import express from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';

describe('Rate Limiter', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  test('rate limiter blocks after max requests', async () => {
    const limiter = rateLimit({
      windowMs: 60000,
      max: 3,
      message: { error: 'Too many requests' }
    });

    app.get('/test', limiter, (req, res) => {
      res.json({ success: true });
    });

    // First 3 requests should succeed
    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);

    // 4th request should be blocked
    const response = await request(app).get('/test').expect(429);
    expect(response.body.error).toBeTruthy();
  });

  test('rate limiter allows requests after window expires', async () => {
    const limiter = rateLimit({
      windowMs: 100, // Very short window for testing
      max: 1
    });

    app.get('/test', limiter, (req, res) => {
      res.json({ success: true });
    });

    // First request succeeds
    await request(app).get('/test').expect(200);

    // Second request blocked
    await request(app).get('/test').expect(429);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Third request succeeds after window
    await request(app).get('/test').expect(200);
  });
});
