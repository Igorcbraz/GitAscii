const SENSITIVE_KEY =
  /(email|e-mail|password|passwd|token|secret|authorization|cookie|cpf|phone|address|ip)/i

/** Removes common personal data and credentials from free-form telemetry. */
export function scrubTelemetry(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[truncated]'
  if (typeof value === 'string') {
    return value
      .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
      .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email redacted]')
      .slice(0, 2000)
  }
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => scrubTelemetry(item, depth + 1))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 100)
      .map(([key, item]) => [
        key,
        SENSITIVE_KEY.test(key) ? '[redacted]' : scrubTelemetry(item, depth + 1),
      ])
  )
}
