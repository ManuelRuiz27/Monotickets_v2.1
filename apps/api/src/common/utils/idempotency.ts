export const IDEMPOTENCY_HEADER = 'idempotency-key';

const IDEMPOTENCY_REGEX = /^[A-Za-z0-9_-]{10,}$/;

export function validateIdempotencyKey(key?: string): asserts key {
  if (!key || !IDEMPOTENCY_REGEX.test(key)) {
    throw new Error('Invalid Idempotency-Key header');
  }
}
