import { describe, it, expect } from 'vitest';
import { InMemorySessionStore, FirestoreSessionStore, type FirestoreAdapter, type FirestoreTransaction } from './sessionStore';

describe('InMemorySessionStore', () => {
  it('puts and gets with version increment', async () => {
    const store = new InMemorySessionStore(1000);
    const s1 = await store.put({ key: 'k1', data: { a: 1 }, expiresAt: 0 });
    expect(s1.version).toBe(1);
    const got = await store.get('k1');
    expect(got?.version).toBe(1);
    const s2 = await store.put({ key: 'k1', data: { a: 2 }, version: s1.version, expiresAt: 0 });
    expect(s2.version).toBe(2);
  });

  it('FirestoreSessionStore respects versioning and TTL', async () => {
    const mem = new Map<string, any>();
    const adapter: FirestoreAdapter = {
      async get(key) {
        const v = mem.get(key);
        return { exists: Boolean(v), data: v ? () => v : undefined };
      },
      async set(key, data) {
        mem.set(key, data);
      },
      async runTransaction(fn) {
        const tx: FirestoreTransaction = {
          get: (key) => adapter.get(key),
          set: (key, data) => adapter.set(key, data),
        };
        return fn(tx);
      },
    };
    const store = new FirestoreSessionStore(adapter, 5);
    const s1 = await store.put({ key: 'k1', data: {}, expiresAt: 0 });
    expect(s1.version).toBe(1);
    const s2 = await store.put({ key: 'k1', data: {}, version: s1.version, expiresAt: 0 });
    expect(s2.version).toBe(2);
    await new Promise((r) => setTimeout(r, 10));
    const got = await store.get('k1');
    expect(got).toBeNull();
  });

  it('enforces optimistic concurrency', async () => {
    const store = new InMemorySessionStore(1000);
    const s1 = await store.put({ key: 'k1', data: {}, expiresAt: 0 });
    await expect(store.put({ key: 'k1', data: {}, version: s1.version + 1, expiresAt: 0 })).rejects.toThrow(
      'Version conflict',
    );
  });

  it('expires entries by TTL', async () => {
    const store = new InMemorySessionStore(1);
    await store.put({ key: 'k1', data: {}, expiresAt: 0 });
    await new Promise((r) => setTimeout(r, 5));
    const got = await store.get('k1');
    expect(got).toBeNull();
  });
});


