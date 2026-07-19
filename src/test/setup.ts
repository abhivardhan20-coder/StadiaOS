import { vi } from 'vitest';

vi.stubEnv('JWT_SECRET', 'test_secret');
vi.stubEnv('GOOGLE_CLIENT_ID', 'test_client_id');
vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test_client_secret');

// Mock WebSocket globally before any components load (e.g. LiveEventPipeline)
class MockWebSocket {
  send = vi.fn();
  close = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  readyState = 0;
}
vi.stubGlobal('WebSocket', MockWebSocket);

const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key: string) {
      delete store[key];
    }
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

if (typeof window !== "undefined" && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = function() {};
}
import '@testing-library/jest-dom';
