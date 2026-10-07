export function reportStrobiStorageFailure(context: string, error: unknown) {
  console.warn('[Strobi] ' + context, {
    errorName: error instanceof Error ? error.name : 'UnknownError',
  })
}
