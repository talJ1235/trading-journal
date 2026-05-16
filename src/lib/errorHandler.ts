/**
 * Converts any thrown value into a safe user-facing message.
 * In development the full error is logged; in production it is suppressed.
 */
export const handleError = (
  error: unknown,
  userMessage = 'Something went wrong. Please try again.'
): string => {
  if (import.meta.env.DEV) console.error('[DEV]', error)
  return userMessage
}
