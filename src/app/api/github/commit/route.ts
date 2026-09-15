import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { MIGRATION_TEMPLATES } from '@/constants'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'
import { getProEntitlements } from '@/features/pro/server/entitlements'
import { getSession } from '@/lib/auth'
import { getInstallationTokenById, getInstallationTokenForUser } from '@/lib/githubApp'
import { bootstrapGitasciiBranch } from '@/lib/migration/branchBootstrap'
import { generateV2EmbedCode, updateReadmeContent } from '@/lib/migration/markdownGenerator'
import { generateWorkflowYaml } from '@/lib/migration/workflowGenerator'
import { saveProfileConfig } from '@/lib/profileStorage'
import { API_ENDPOINTS } from '@/services/endpoints'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { exportData, installation_id } = await request.json()
    const username = session.username
    let appToken = null

    const rawSlug = typeof exportData?.profileSlug === 'string' ? exportData.profileSlug : 'default'
    const profileSlug = /^[a-zA-Z0-9_-]{1,50}$/.test(rawSlug) ? rawSlug.toLowerCase() : 'default'
    const revision = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    if (exportData && typeof exportData === 'object') {
      exportData.username = username
      exportData.profileSlug = profileSlug
      exportData.metadata = {
        ...exportData.metadata,
        revision,
        updatedAt: new Date().toISOString(),
      }
    }

    if (installation_id) {
      const { token, username: instUsername } = await getInstallationTokenById(installation_id)
      if (
        !token ||
        !instUsername ||
        instUsername.toLowerCase() !== session.username.toLowerCase()
      ) {
        return NextResponse.json(
          { error: 'Forbidden: Installation does not belong to the authenticated user' },
          { status: 403 }
        )
      }
      appToken = token
    } else {
      const { token, installUrl } = await getInstallationTokenForUser(username)
      if (!token) {
        if (session.email) {
          const { emailService } = await import('@/lib/email/service')
          void emailService
            .sendAppDisconnectedEmail({
              username: session.username,
              name: session.name,
              email: session.email,
              installUrl: installUrl || undefined,
              repoName: `${session.username}/${session.username}`,
            })
            .catch((err) => {
              console.error('[Commit Route] Non-blocking app disconnected email error:', err)
            })
        }

        if (installUrl) {
          return NextResponse.json({ error: 'not_installed', installUrl }, { status: 403 })
        }
        return NextResponse.json({ error: 'Failed to get installation token' }, { status: 500 })
      }
      appToken = token
    }

    const repoName = username
    const headers = {
      Authorization: `Bearer ${appToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitAscii-App',
    }

    const authorName = session.name || session.username
    const authorEmail = session.email || `${session.username}@users.noreply.github.com`
    const coAuthorTrailer = `\n\nCo-authored-by: ${authorName} <${authorEmail}>`

    const repoRes = await fetch(API_ENDPOINTS.GITHUB.REPO_INFO(username, repoName), {
      headers,
    })

    if (repoRes.status !== 200 && repoRes.status !== 404) {
      return NextResponse.json(
        { error: 'Failed to access repository', details: await repoRes.text() },
        { status: 500 }
      )
    }

    if (repoRes.status === 404) {
      const createRes = await fetch(API_ENDPOINTS.GITHUB.USER_REPOS, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: repoName,
          description: 'My GitHub Profile Readme generated with GitAscii',
          auto_init: true,
        }),
      })

      if (!createRes.ok) {
        const errorData = await createRes.text()
        return NextResponse.json(
          { error: 'Failed to create repository', details: errorData },
          { status: 500 }
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const [profileData, entitlements] = await Promise.all([
      fetchGitHubProfile(username, { fresh: true }).catch(() => null),
      getProEntitlements(username).catch(() => null),
    ])

    const isPro = entitlements?.tier && entitlements.tier !== 'free'

    if (exportData && profileData) {
      const bootstrapRes = await bootstrapGitasciiBranch(
        username,
        repoName,
        appToken,
        exportData,
        profileData
      )

      if (!bootstrapRes.success) {
        console.error('[Commit Route] Warning: Branch bootstrap failed:', bootstrapRes.error)
      }
    }

    const v2EmbedCode = generateV2EmbedCode({
      username,
      profileSlug,
      includeBadge: Boolean(isPro),
    })

    const readmeRes = await fetch(
      API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'README.md'),
      { headers }
    )

    let readmeSha = undefined
    let currentReadmeContent = ''

    if (readmeRes.status === 200) {
      const readmeData = await readmeRes.json()
      readmeSha = readmeData.sha
      currentReadmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8')
    }

    const updatedReadmeContent = updateReadmeContent(currentReadmeContent, v2EmbedCode, profileSlug)

    if (currentReadmeContent.trim() !== updatedReadmeContent.trim()) {
      const updateReadmeRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'README.md'),
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `${MIGRATION_TEMPLATES.COMMITS.UPDATE_README}${coAuthorTrailer}`,
            content: Buffer.from(updatedReadmeContent, 'utf8').toString('base64'),
            sha: readmeSha,
          }),
        }
      )

      if (!updateReadmeRes.ok) {
        console.warn(
          '[Commit Route] Warning: Failed to update README:',
          await updateReadmeRes.text()
        )
      }
    }

    const workflowYaml = generateWorkflowYaml(username, exportData, {
      isPro: Boolean(isPro),
      profileSlug,
    })

    const workflowRes = await fetch(
      API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, '.github/workflows/gitascii.yml'),
      { headers }
    )

    let workflowSha = undefined
    let currentWorkflowContent = ''

    if (workflowRes.status === 200) {
      const workflowData = await workflowRes.json()
      workflowSha = workflowData.sha
      currentWorkflowContent = Buffer.from(workflowData.content, 'base64').toString('utf8')
    }

    if (currentWorkflowContent.trim() !== workflowYaml.trim()) {
      const updateWorkflowRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, '.github/workflows/gitascii.yml'),
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `${MIGRATION_TEMPLATES.COMMITS.CONFIGURE_WORKFLOW}${coAuthorTrailer}`,
            content: Buffer.from(workflowYaml, 'utf8').toString('base64'),
            sha: workflowSha,
          }),
        }
      )

      if (!updateWorkflowRes.ok) {
        console.warn(
          '[Commit Route] Warning: Could not write workflow file:',
          await updateWorkflowRes.text()
        )
      }
    }

    const legacyFilesToCheck = ['gitascii.json']
    if (profileSlug && profileSlug !== 'default') {
      legacyFilesToCheck.push(`gitascii_${profileSlug.toLowerCase()}.json`)
    }

    for (const legacyPath of legacyFilesToCheck) {
      try {
        const checkRes = await fetch(
          API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, legacyPath),
          { headers }
        )
        if (checkRes.status === 200) {
          const checkData = await checkRes.json()
          if (checkData.sha) {
            await fetch(API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, legacyPath), {
              method: 'DELETE',
              headers,
              body: JSON.stringify({
                message: `${MIGRATION_TEMPLATES.COMMITS.CLEANUP_LEGACY(legacyPath)}${coAuthorTrailer}`,
                sha: checkData.sha,
              }),
            })
          }
        }
      } catch (legacyErr) {
        console.warn(`[Commit Route] Non-blocking cleanup warning for ${legacyPath}:`, legacyErr)
      }
    }

    try {
      await fetch(API_ENDPOINTS.GITHUB.WORKFLOW_DISPATCH(username, repoName, 'gitascii.yml'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: 'main',
        }),
      })
    } catch (dispatchErr) {
      console.warn('[Commit Route] Non-blocking dispatch warning:', dispatchErr)
    }

    if (exportData && typeof exportData === 'object') {
      try {
        await saveProfileConfig(exportData)
      } catch (saveErr) {
        console.error('Failed to cache profile configuration:', saveErr)
      }
    }

    if (session.email) {
      const { emailService } = await import('@/lib/email/service')
      void emailService
        .sendFirstExportEmail({
          username: session.username,
          name: session.name,
          email: session.email,
          profileSlug,
          widgetCount: Array.isArray(exportData?.widgets) ? exportData.widgets.length : undefined,
        })
        .catch((err) => {
          console.error('[Commit Route] Non-blocking first export email error:', err)
        })
    }

    return NextResponse.json({
      success: true,
      revision,
      embedCode: v2EmbedCode,
    })
  } catch (error: unknown) {
    Sentry.captureException(error)
    console.error('Commit error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
