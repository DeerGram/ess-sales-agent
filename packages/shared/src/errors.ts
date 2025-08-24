export type ErrorCodes =
  | 'USER_INPUT'
  | 'EXTERNAL_SERVICE'
  | 'RETRYABLE'
  | 'AUTH'
  | 'RATE_LIMIT'
  | 'UNKNOWN';

export class BaseAppError extends Error {
  public readonly code: ErrorCodes;
  public readonly cause?: unknown;
  constructor(message: string, code: ErrorCodes, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
  }
}

export class UserInputError extends BaseAppError {
  constructor(message: string) {
    super(message, 'USER_INPUT');
  }
}

export class ExternalServiceError extends BaseAppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'EXTERNAL_SERVICE', cause);
  }
}

export class RetryableError extends BaseAppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'RETRYABLE', cause);
  }
}

export class AuthError extends BaseAppError {
  constructor(message = 'Unauthorized') {
    super(message, 'AUTH');
  }
}

export class RateLimitError extends BaseAppError {
  constructor(message = 'Too many requests') {
    super(message, 'RATE_LIMIT');
  }
}

export type PublicError = {
  error: {
    type: ErrorCodes;
    message: string;
    correlationId?: string;
  };
};

export function errorToHttpStatus(code: ErrorCodes): number {
  switch (code) {
    case 'USER_INPUT':
      return 400;
    case 'AUTH':
      return 403;
    case 'RATE_LIMIT':
      return 429;
    case 'EXTERNAL_SERVICE':
    case 'RETRYABLE':
      return 503;
    default:
      return 500;
  }
}

export function redactMessage(message: string): string {
  // Minimal PII redaction: emails and phone-like sequences
  const emailRedacted = message.replace(/([A-Z0-9._%+-]+)@([A-Z0-9.-]+)\.[A-Z]{2,}/gi, '***@***');
  const phoneRedacted = emailRedacted.replace(/\+?\d[\d\s\-().]{5,}\d/g, '***');
  return phoneRedacted;
}

export function normalizeError(err: unknown, correlationId?: string): { status: number; body: PublicError } {
  if (err instanceof BaseAppError) {
    const status = errorToHttpStatus(err.code);
    const message = err.code === 'USER_INPUT' ? err.message : 'An error occurred';
    const errorPayload: PublicError['error'] = { type: err.code, message } as PublicError['error'];
    if (typeof correlationId === 'string') {
      (errorPayload as any).correlationId = correlationId;
    }
    return { status, body: { error: errorPayload } };
  }
  // Fallback on shape to avoid instanceOf issues across bundles
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as any).code === 'string'
  ) {
    const code = (err as any).code as ErrorCodes;
    const status = errorToHttpStatus(code);
    const message = code === 'USER_INPUT' ? String((err as any).message ?? 'Invalid input') : 'An error occurred';
    const errorPayload: PublicError['error'] = { type: code, message } as PublicError['error'];
    if (typeof correlationId === 'string') {
      (errorPayload as any).correlationId = correlationId;
    }
    return { status, body: { error: errorPayload } };
  }
  const errorPayload: PublicError['error'] = { type: 'UNKNOWN', message: 'An error occurred' } as PublicError['error'];
  if (typeof correlationId === 'string') {
    (errorPayload as any).correlationId = correlationId;
  }
  return { status: 500, body: { error: errorPayload } };
}


