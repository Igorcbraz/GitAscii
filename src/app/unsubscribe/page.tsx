import React, { Suspense } from 'react'

import { UnsubscribeClient } from './UnsubscribeClient'

interface UnsubscribePageProps {
  searchParams: Promise<{
    status?: string
    email?: string
    username?: string
  }>
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { status, email, username } = await searchParams

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-[#a1a1aa]">
          Loading...
        </div>
      }
    >
      <UnsubscribeClient status={status} email={email} username={username} />
    </Suspense>
  )
}
