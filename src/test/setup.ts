import { vi } from 'vitest';

vi.stubEnv('JWT_SECRET', 'test_secret');
vi.stubEnv('GOOGLE_CLIENT_ID', 'test_client_id');
vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test_client_secret');
