// Redis/KV abstraction using Upstash Redis
import { Redis } from '@upstash/redis';
import { mockKv } from './kv-mock';

interface KVInterface {
  get: <T = unknown>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<string>;
  expire: (key: string, seconds: number) => Promise<number>;
}

let kvClient: KVInterface;
const isProductionRuntime = process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_KV !== 'true';

const missingProductionKv: KVInterface = {
  get: async () => {
    throw new Error('KV storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN in production.');
  },
  set: async () => {
    throw new Error('KV storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN in production.');
  },
  expire: async () => {
    throw new Error('KV storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN in production.');
  },
};

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  // Production/Development: use Upstash Redis
  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    kvClient = {
      get: async <T = unknown>(key: string): Promise<T | null> => {
        return await redis.get<T>(key);
      },
      set: async (key: string, value: unknown): Promise<string> => {
        await redis.set(key, value);
        return 'OK';
      },
      expire: async (key: string, seconds: number): Promise<number> => {
        return await redis.expire(key, seconds);
      }
    };
    console.log('Using Upstash Redis for data storage');
  } catch (error) {
    if (isProductionRuntime) {
      kvClient = missingProductionKv;
      console.error('Upstash Redis failed to initialize in production:', error);
    } else {
      kvClient = mockKv;
      console.warn('Upstash Redis not available, using mock:', error);
    }
  }
} else {
  if (isProductionRuntime) {
    kvClient = missingProductionKv;
    console.error('KV env vars are missing in production. Multiplayer sharing will not work until KV is configured.');
  } else {
    kvClient = mockKv;
    console.warn('Using mock KV for local development (no Redis env vars)');
  }
}

export { kvClient as kv };
