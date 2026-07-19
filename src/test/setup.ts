import { vi } from 'vitest';

vi.stubEnv('JWT_SECRET', 'test_secret');
vi.stubEnv('GOOGLE_CLIENT_ID', 'test_client_id');
vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test_client_secret');

// Mock WebSocket globally before any components load (e.g. LiveEventPipeline)
vi.stubGlobal('WebSocket', vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 0,
})));
if (typeof window !== "undefined" && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = function() {};
}
import '@testing-library/jest-dom';
