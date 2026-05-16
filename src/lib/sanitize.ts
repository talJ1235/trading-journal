/** Strip HTML tags */
export const stripHtml = (input: string): string =>
  input.replace(/<[^>]*>/g, '').trim()

/** Strip common SQL injection patterns */
export const stripSql = (input: string): string =>
  input.replace(
    /(['";\\]|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b)/gi,
    ''
  )

/** Strip XSS patterns */
export const stripXss = (input: string): string =>
  input
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

/** Master sanitizer — strip HTML, SQL patterns, XSS, then enforce max length */
export const sanitize = (input: string, maxLength = 500): string =>
  stripXss(stripSql(stripHtml(input))).slice(0, maxLength)

/** Sanitize only if non-null */
export const sanitizeMaybe = (
  value: string | null | undefined,
  maxLength = 500
): string | null | undefined => {
  if (value == null) return value
  return sanitize(value, maxLength)
}

/** Sanitize all string values in an object (non-destructive for non-strings) */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === 'string' ? sanitize(v) : v,
    ])
  ) as T

// Kept for backward compat — useTrades.ts imports this
export const sanitizeText = (value: string, maxLength: number): string =>
  sanitize(value, maxLength)
