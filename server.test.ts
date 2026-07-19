// @vitest-environment node
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { wayfinderSchema, polyglotSchema } from './server';
import jwt from 'jsonwebtoken';

vi.mock('@google/genai', () => {
  const mockGenerateContentStream = async function* () {
    yield { text: 'mock response part 1' };
  };

  class MockGoogleGenAI {
    models = {
      generateContent: vi.fn().mockResolvedValue({ text: JSON.stringify({ translatedText: 'test' }) }),
      generateContentStream: vi.fn().mockReturnValue(mockGenerateContentStream()),
    };
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

let app: import('express').Application;
let validToken: string;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.NODE_ENV = 'test';
  validToken = jwt.sign({ sub: 'user123', name: 'Test User' }, 'test_secret', { expiresIn: '1d' });
  const serverModule = await import('./server');
  app = serverModule.app;
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('POST /api/ops-copilot', () => {
  it('returns 401 without a valid cookie', async () => {
    const res = await request(app).post('/api/ops-copilot').send({ prompt: 'Show Gate 7 status' });
    expect(res.status).toBe(401);
  });

  it('rejects an empty prompt with 400', async () => {
    const res = await request(app)
      .post('/api/ops-copilot')
      .set('Cookie', [`token=${validToken}`, `csrf_token=test_csrf_token`])
      .set('x-csrf-token', 'test_csrf_token')
      .send({ prompt: '' });
    expect(res.status).toBe(400);
  });

  it('accepts a valid payload with token', async () => {
    const res = await request(app)
      .post('/api/ops-copilot')
      .set('Cookie', [`token=${validToken}`, `csrf_token=test_csrf_token`])
      .set('x-csrf-token', 'test_csrf_token')
      .send({ prompt: 'Show Gate 7 status' });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/polyglot', () => {
  it('returns 401 without a valid cookie', async () => {
    const res = await request(app).post('/api/polyglot').send({ text: 'Hello', targetLanguage: 'es' });
    expect(res.status).toBe(401);
  });

  it('rejects an invalid payload with 400', async () => {
    const res = await request(app)
      .post('/api/polyglot')
      .set('Cookie', [`token=${validToken}`, `csrf_token=test_csrf_token`])
      .set('x-csrf-token', 'test_csrf_token')
      .send({ targetLanguage: 'es' });
    expect(res.status).toBe(400);
  });

  it('accepts a valid payload and returns 200', async () => {
    const res = await request(app)
      .post('/api/polyglot')
      .set('Cookie', [`token=${validToken}`, `csrf_token=test_csrf_token`])
      .set('x-csrf-token', 'test_csrf_token')
      .send({ text: 'Hello', targetLanguage: 'es' });
    expect(res.status).toBe(200);
    expect(res.body.translatedText).toBe('test');
  });
});

describe('GET /api/stadium-live', () => {
  it('returns live stadium context', async () => {
    const res = await request(app).get('/api/stadium-live');
    expect(res.status).toBe(200);
    expect(res.body.occupancy).toBeGreaterThan(0);
  });
});

describe('GET /api/green-ops', () => {
  it('returns green ops data', async () => {
    const res = await request(app).get('/api/green-ops');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/wayfinder', () => {
  it('returns 401 without a valid cookie', async () => {
    const res = await request(app).post('/api/wayfinder').send({ destination: 'Gate A' });
    expect(res.status).toBe(401);
  });

  it('rejects an invalid payload with 400', async () => {
    const res = await request(app)
      .post('/api/wayfinder')
      .set('Cookie', [`token=${validToken}`, `csrf_token=test_csrf_token`])
      .set('x-csrf-token', 'test_csrf_token')
      .send({ stepFreeOnly: true });
    expect(res.status).toBe(400);
  });

  it('accepts a valid payload and returns 200', async () => {
    const res = await request(app)
      .post('/api/wayfinder')
      .set('Cookie', [`token=${validToken}`, `csrf_token=test_csrf_token`])
      .set('x-csrf-token', 'test_csrf_token')
      .send({ destination: 'Gate A' });
    expect(res.status).toBe(200);
  });
});

describe('OAuth Routes', () => {
  it('redirects to Google OAuth on /api/auth/google', async () => {
    const res = await request(app).get('/api/auth/google');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('accounts.google.com');
  });

  it('handles missing code on callback', async () => {
    const res = await request(app).get('/api/auth/google/callback');
    expect(res.status).toBe(200);
    expect(res.text).toContain('OAUTH_ERROR');
  });
});

describe('Zod Schemas directly', () => {
  it('validates wayfinderSchema directly (valid + invalid cases)', () => {
    const valid = { destination: 'Gate A', stepFreeOnly: true, role: 'Staff' };
    expect(() => wayfinderSchema.parse(valid)).not.toThrow();

    const invalid = { stepFreeOnly: true };
    expect(() => wayfinderSchema.parse(invalid)).toThrow();
  });

  it('validates polyglotSchema directly (valid + invalid cases)', () => {
    const valid = { text: 'Hello', targetLanguage: 'es' };
    expect(() => polyglotSchema.parse(valid)).not.toThrow();

    const invalid = { text: '' };
    expect(() => polyglotSchema.parse(invalid)).toThrow();
  });
});

describe('Rate Limiting', () => {
  it('enforces rate limiting after N requests', async () => {
    let finalStatus = 200;
    for (let i = 0; i < 15; i++) {
      const res = await request(app)
        .post('/api/ops-copilot')
        .set('Cookie', [`token=${validToken}`, `csrf_token=test_csrf_token`])
        .set('x-csrf-token', 'test_csrf_token')
        .send({ prompt: 'Show Gate 7 status' });
      if (res.status === 429) {
        finalStatus = 429;
        break;
      }
    }
    expect(finalStatus).toBe(429);
  });
});

describe('JWT_SECRET validation', () => {
  it('should exit when NODE_ENV=production and JWT_SECRET is not set', async () => {
    // Save original env
    const originalNodeEnv = process.env.NODE_ENV;
    const originalJwtSecret = process.env.JWT_SECRET;

    // Set NODE_ENV=production and unset JWT_SECRET
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    // Expect that importing the server module exits
    // Since the server calls process.exit(1) on invalid config, we can spy on process.exit
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit called with code ${code}`);
    });

    try {
      // Reset module cache and import the server module to trigger top-level code
      vi.resetModules();
      await import('./server');
      // If we reach here, it means process.exit was not called
      expect(true).toBe(false);
    } catch (e) {
      // Expect the exitSpy to have been called with 1
      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      // Restore env
      process.env.NODE_ENV = originalNodeEnv;
      if (originalJwtSecret !== undefined) {
        process.env.JWT_SECRET = originalJwtSecret;
      } else {
        delete process.env.JWT_SECRET;
      }
      exitSpy.mockRestore();
    }
  });
});