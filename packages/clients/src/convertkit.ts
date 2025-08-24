import { z } from 'zod';
import { retryFetch, type FetchLike } from '@ess/shared';

export const applyTagParams = z.object({
	email: z.string().email(),
	tag: z.string().min(1),
});
export const applyTagResult = z.object({ ok: z.boolean() });

export const startSequenceParams = z.object({
	email: z.string().email(),
	sequenceSlug: z.string().min(1),
});
export const startSequenceResult = z.object({ ok: z.boolean() });

export type ConvertKitClientOptions = {
	apiKey: string;
	apiSecret?: string;
	baseUrl?: string;
	fetchImpl?: typeof fetch;
};

export class ConvertKitClient {
	private readonly apiKey: string;
	private readonly apiSecret: string | undefined;
	private readonly baseUrl: string;
	private readonly fetchImpl: typeof fetch;

	constructor(opts: ConvertKitClientOptions) {
		this.apiKey = opts.apiKey;
		this.apiSecret = opts.apiSecret;
		this.baseUrl = opts.baseUrl ?? 'https://api.convertkit.com';
		this.fetchImpl = opts.fetchImpl ?? fetch;
	}

	async applyTag(input: z.infer<typeof applyTagParams>) {
		applyTagParams.parse(input);
		if (this.fetchImpl) {
			const f = this.fetchImpl as unknown as FetchLike;
			await retryFetch(f, new URL('/apply-tag', this.baseUrl), { method: 'POST' }, { maxRetries: 2, initialDelayMs: 50 });
		}
		return applyTagResult.parse({ ok: true });
	}

	async startSequence(input: z.infer<typeof startSequenceParams>) {
		startSequenceParams.parse(input);
		if (this.fetchImpl) {
			const f = this.fetchImpl as unknown as FetchLike;
			await retryFetch(f, new URL('/start-sequence', this.baseUrl), { method: 'POST' }, { maxRetries: 2, initialDelayMs: 50 });
		}
		return startSequenceResult.parse({ ok: true });
	}
}
