export class AutomationError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400
  ) {
    super(message)
  }
}

export function publicError(error: unknown) {
  if (error instanceof AutomationError) return { code: error.code, message: error.message }
  return {
    code: 'INTERNAL_ERROR',
    message: 'The operation could not be completed. Try again or continue in the browser.',
  }
}
