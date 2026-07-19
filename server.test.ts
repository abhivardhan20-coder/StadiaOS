import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import { wayfinderSchema, polyglotSchema } from './server';

vi.mock('@google/genai', () => {
  const mockGenerateContentStream = async function* () {
    yield { text: 'mock response part 1 ' };
    yield { text: 'mock response part 2' };
  };
  
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: { 
        generateContent: vi.fn().mockResolvedValue({ text: JSON.stringify({ translatedText: 'test' }) }),
        generateContentStream: vi.fn().mockReturnValue(mockGenerateContentStream()),
      },
    })),
  };
});

let app: any;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  const serverModule = await import('./server');
  app = serverModule.app;
});

describe('POST /api/ops-copilot', () => {
  it('rejects an empty prompt with 400', async () => {
    const res = await request(app).post('/api/ops-copilot').send({ prompt: '' });
    expect(res.status).toBe(400);
  });

  it('accepts a valid payload and returns 200 (streaming)', async () => {
    const res = await request(app).post('/api/ops-copilot').send({ prompt: 'Show Gate 7 status' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('mock response part 1');
  });

  it('enforces rate limiting after N requests', async () => {
    // We send many requests to hit the limit (set to 30 in server.ts)
    let finalStatus = 200;
    for (let i = 0; i < 35; i++) {
      const res = await request(app).post('/api/ops-copilot').send({ prompt: 'test' });
      if (res.status === 429) {
        finalStatus = 429;
        break;
      }
    }
    expect(finalStatus).toBe(429);
  });
});

describe('Zod Schemas directly', () => {
  it('validates wayfinderSchema directly', () => {
    const valid = { destination: 'Gate A', stepFreeOnly: true, role: 'Staff' };
    expect(() => wayfinderSchema.parse(valid)).not.toThrow();
    
    const invalid = { stepFreeOnly: true }; // missing destination
    expect(() => wayfinderSchema.parse(invalid)).toThrow();
  });

  it('validates polyglotSchema directly', () => {
    const valid = { text: 'Hello', targetLanguage: 'es' };
    expect(() => polyglotSchema.parse(valid)).not.toThrow();

    const invalid = { text: '' }; // empty string fails min(1)
    expect(() => polyglotSchema.parse(invalid)).toThrow();
  });
});
