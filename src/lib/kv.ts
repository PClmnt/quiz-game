// Redis/KV abstraction using Upstash Redis
import { Redis } from '@upstash/redis';
import { mockKv } from './kv-mock';

interface KVInterface {
  get: <T = unknown>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<string>;
  expire: (key: string, seconds: number) => Promise<number>;
}

let kvClient: KVInterface;

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
    kvClient = mockKv;
    console.warn('Upstash Redis not available, using mock:', error);
  }
} else {
  // Fallback: use mock
  kvClient = mockKv;
  console.warn('Using mock KV for local development (no Redis env vars)');
}

export { kvClient as kv };