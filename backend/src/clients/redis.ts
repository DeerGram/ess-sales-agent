import { EventEmitter } from 'node:events';
import Redis from 'ioredis';
import { env } from '../config';

class InMemoryRedis extends EventEmitter {
  private store = new Map<string, string>();

  async get(key: string) {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string) {
    this.store.set(key, value);
    return 'OK';
  }

  async del(...keys: string[]) {
    let removed = 0;
    keys.forEach((key) => {
      if (this.store.delete(key)) {
        removed += 1;
      }
    });
    return removed;
  }
}

const redis =
  process.env.NODE_ENV === 'test'
    ? new InMemoryRedis()
    : new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableAutoPipelining: true,
      });

if (redis instanceof Redis) {
  redis.on('error', (error) => {
    console.error('Redis connection error', error);
  });
}

export { redis };
