import { z } from 'zod';

export const sessionSchema = z.object({
	key: z.string(),
	version: z.number().int().nonnegative(),
	data: z.record(z.any()),
	expiresAt: z.number().int(),
});
export type Session = z.infer<typeof sessionSchema>;

export interface SessionStore {
	get(key: string): Promise<Session | null>;
	put(session: Omit<Session, 'version'> & { version?: number }): Promise<Session>;
	delete(key: string): Promise<void>;
}

export class InMemorySessionStore implements SessionStore {
	private readonly items = new Map<string, Session>();
	private readonly ttlMs: number;

	constructor(ttlMs: number) {
		this.ttlMs = ttlMs;
	}

	async get(key: string): Promise<Session | null> {
		const current = this.items.get(key) ?? null;
		if (!current) return null;
		if (current.expiresAt <= Date.now()) {
			this.items.delete(key);
			return null;
		}
		return current;
	}

	async put(input: Omit<Session, 'version'> & { version?: number }): Promise<Session> {
		const prev = this.items.get(input.key) ?? null;
		const expectedVersion = input.version ?? (prev ? prev.version : 0);
		if (prev && prev.version !== expectedVersion) {
			throw new Error('Version conflict');
		}
		const next: Session = sessionSchema.parse({
			key: input.key,
			version: expectedVersion + 1,
			data: input.data,
			expiresAt: Date.now() + this.ttlMs,
		});
		this.items.set(input.key, next);
		return next;
	}

	async delete(key: string): Promise<void> {
		this.items.delete(key);
	}
}

// Firestore-backed implementation (adapter injected for testability)
export interface FirestoreAdapter {
	get(key: string): Promise<{ exists: boolean; data?: () => any }>;
	set(key: string, data: any): Promise<void>;
	runTransaction<T>(fn: (tx: FirestoreTransaction) => Promise<T>): Promise<T>;
}

export interface FirestoreTransaction {
	get(key: string): Promise<{ exists: boolean; data?: () => any }>;
	set(key: string, data: any): Promise<void>;
}

export class FirestoreSessionStore implements SessionStore {
	private readonly ttlMs: number;
	private readonly db: FirestoreAdapter;

	constructor(firestore: FirestoreAdapter, ttlMs: number) {
		this.db = firestore;
		this.ttlMs = ttlMs;
	}

	async get(key: string): Promise<Session | null> {
		const snap = await this.db.get(key);
		if (!snap.exists) return null;
		const raw = snap.data ? snap.data() : undefined;
		if (!raw) return null;
		const parsed = sessionSchema.safeParse(raw);
		if (!parsed.success) return null;
		if (parsed.data.expiresAt <= Date.now()) {
			await this.delete(key).catch(() => undefined);
			return null;
		}
		return parsed.data;
	}

	async put(input: Omit<Session, 'version'> & { version?: number }): Promise<Session> {
		return this.db.runTransaction(async (tx) => {
			const snap = await tx.get(input.key);
			const existing = snap.exists && snap.data ? sessionSchema.safeParse(snap.data()) : null;
			const currentVersion = existing && existing.success ? existing.data.version : 0;
			const expectedVersion = input.version ?? currentVersion;
			if (currentVersion !== expectedVersion) {
				throw new Error('Version conflict');
			}
			const next: Session = sessionSchema.parse({
				key: input.key,
				version: expectedVersion + 1,
				data: input.data,
				expiresAt: Date.now() + this.ttlMs,
			});
			await tx.set(input.key, next);
			return next;
		});
	}

	async delete(key: string): Promise<void> {
		await this.db.set(key, { _deleted: true, expiresAt: 0, version: 0, key, data: {} });
	}
}
