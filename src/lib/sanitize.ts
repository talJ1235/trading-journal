/** Strip HTML tags and enforce a maximum character length. */
export function sanitizeText(value: string, maxLength: number): string {
  return value.replace(/<[^>]*>/g, '').slice(0, maxLength)
}

/** Sanitize only if the value is non-null. */
export function sanitizeMaybe(
  value: string | null | undefined,
  maxLength: number
): string | null | undefined {
  if (value == null) return value
  return sanitizeText(value, maxLength)
}
