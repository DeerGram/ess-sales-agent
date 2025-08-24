import crypto from 'node:crypto';

export function computeTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
): string {
  const concatenated =
    url +
    Object.keys(params)
      .sort()
      .map((k) => `${k}${params[k] ?? ''}`)
      .join('');
  const hmac = crypto.createHmac('sha1', authToken);
  hmac.update(Buffer.from(concatenated, 'utf8'));
  return hmac.digest('base64');
}

export function verifyTwilioSignature(options: {
  authToken: string;
  url: string;
  params: Record<string, string>;
  headerSignature: string | undefined;
}): boolean {
  const { authToken, url, params, headerSignature } = options;
  if (!headerSignature) return false;
  const expected = computeTwilioSignature(authToken, url, params);
  // Use constant-time compare
  const a = Buffer.from(expected);
  const b = Buffer.from(headerSignature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}


