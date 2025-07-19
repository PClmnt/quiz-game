// Mock KV for local development
const mockStore = new Map<string, unknown>();

export const mockKv = {
  get: async <T = unknown>(key: string): Promise<T | null> => {
    return (mockStore.get(key) as T) || null;
  },
  
  set: async (key: string, value: unknown) => {
    mockStore.set(key, value);
    return 'OK';
  },
  
  expire: async () => {
    // In a real implementation, this would set expiration
    // For mock, we'll just ignore it
    return 1;
  }
};