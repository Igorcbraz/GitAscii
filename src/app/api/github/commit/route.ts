import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'
import { getInstallationTokenById, getInstallationTokenForUser } from '@/lib/githubApp'
import { cacheProfileConfig } from '@/lib/profileStorage'
import { API_ENDPOINTS } from '@/services/endpoints'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { embedCode, exportData, installation_id } = await request.json()
    if (!embedCode && !installation_id) {
      return NextResponse.json({ error: 'Missing embedCode' }, { status: 400 })
    }

    const username = session.username
    let appToken = null
    let finalEmbedCode = embedCode

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const v = Date.now()
    const rawSlug = typeof exportData?.profileSlug === 'string' ? exportData.profileSlug : 'default'
    const profileSlug = /^[a-zA-Z0-9_-]{1,50}$/.test(rawSlug) ? rawSlug : 'default'

    if (exportData && typeof exportData === 'object') {
      exportData.username = username
      exportData.profileSlug = profileSlug
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

      const slugPath = profileSlug === 'default' ? '' : `/${profileSlug}`
      finalEmbedCode = `<a href="${protocol}://${host}">
  <img
    src="${protocol}://${host}/api/${encodeURIComponent(username)}${slugPath}?v=${v}"
    alt="GitAscii Widget"
    width="100%"
  />
</a>`
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

    let jsonSha = undefined
    let hasJsonChanged = true
    let incomingJsonStr = ''

    const isDefaultProfile = profileSlug === 'default'
    const safeProfileSlug = /^[a-zA-Z0-9_-]{1,50}$/.test(profileSlug)
      ? profileSlug.toLowerCase()
      : 'default'
    const jsonFileName =
      isDefaultProfile || safeProfileSlug === 'default'
        ? 'gitascii.json'
        : `gitascii_${safeProfileSlug}.json`

    if (exportData) {
      const jsonRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, jsonFileName),
        { headers }
      )
      if (jsonRes.status === 200) {
        const jsonData = await jsonRes.json()
        jsonSha = jsonData.sha
        const currentJsonStr = Buffer.from(jsonData.content, 'base64').toString('utf8')
        incomingJsonStr = JSON.stringify(exportData, null, 2)

        if (currentJsonStr === incomingJsonStr) {
          hasJsonChanged = false
        }
      } else {
        incomingJsonStr = JSON.stringify(exportData, null, 2)
      }
    }

    const authorName = session.name || session.username
    const authorEmail = session.email || `${session.username}@users.noreply.github.com`
    const coAuthorTrailer = `\n\nCo-authored-by: ${authorName} <${authorEmail}>`
    const commitAuthor = {
      name: authorName,
      email: authorEmail,
    }
    const commitCommitter = {
      name: 'gitascii[bot]',
      email: '169212000+gitascii[bot]@users.noreply.github.com',
    }

    if (isDefaultProfile) {
      const readmeRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'README.md'),
        { headers }
      )

      let sha = undefined
      let currentContent = ''

      if (readmeRes.status === 200) {
        const readmeData = await readmeRes.json()
        sha = readmeData.sha
        currentContent = Buffer.from(readmeData.content, 'base64').toString('utf8')
      }

      const widgetRegex =
        /!\[Widget\]\([^)]+\)|<a href="[^"]+">\s*<img\s+src="[^"]+?\/api\/[^"]+"\s+alt="GitAscii Widget"\s+width="100%"\s*\/?>\s*<\/a>/gi
      const isWidgetMissing = !currentContent.match(widgetRegex)

      if (hasJsonChanged || isWidgetMissing || currentContent.trim() !== finalEmbedCode.trim()) {
        const newContent = finalEmbedCode

        const updateRes = await fetch(
          API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'README.md'),
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: `Update profile README via GitAscii${coAuthorTrailer}`,
              content: Buffer.from(newContent, 'utf8').toString('base64'),
              sha,
              author: commitAuthor,
              committer: commitCommitter,
            }),
          }
        )

        if (!updateRes.ok) {
          return NextResponse.json(
            { error: 'Failed to update README', details: await updateRes.text() },
            { status: 500 }
          )
        }
      }
    } else {
      const readmeRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'README.md'),
        { headers }
      )

      if (readmeRes.status === 200) {
        const readmeData = await readmeRes.json()
        const sha = readmeData.sha
        const currentContent = Buffer.from(readmeData.content, 'base64').toString('utf8')
        const markerStart = `<!-- GITASCII:${profileSlug}:START -->`
        const markerEnd = `<!-- GITASCII:${profileSlug}:END -->`

        if (currentContent.includes(markerStart) && currentContent.includes(markerEnd)) {
          const markerRegex = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`, 'g')
          const updatedContent = currentContent.replace(
            markerRegex,
            `${markerStart}\n${finalEmbedCode}\n${markerEnd}`
          )

          await fetch(API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'README.md'), {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: `Update ${profileSlug} section in README via GitAscii${coAuthorTrailer}`,
              content: Buffer.from(updatedContent, 'utf8').toString('base64'),
              sha,
              author: commitAuthor,
              committer: commitCommitter,
            }),
          })
        }
      }
    }

    if (exportData && hasJsonChanged) {
      const updateJsonRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, jsonFileName),
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `Update GitAscii layout export (${jsonFileName})${coAuthorTrailer}`,
            content: Buffer.from(incomingJsonStr, 'utf8').toString('base64'),
            sha: jsonSha,
            author: commitAuthor,
            committer: commitCommitter,
          }),
        }
      )

      if (!updateJsonRes.ok) {
        const errorText = (await updateJsonRes.text()).replace(/[\r\n]/g, ' ')
        console.error('[Commit Route] Failed to upload JSON config: %s', errorText)
      } else {
        const { invalidateProfileConfig } = await import('@/lib/profileStorage')
        invalidateProfileConfig(username, profileSlug)
      }

      const hasSnakeWidget = exportData?.widgets?.some(
        (w: { id?: string; widgetId?: string }) =>
          w.id === 'contribution-snake' || w.widgetId === 'contribution-snake'
      )

      if (hasSnakeWidget) {
        try {
          const snakeYaml = `name: Generate Snake Animation

on:
  schedule:
    - cron: "0 */12 * * *"
  workflow_dispatch:
  push:
    branches:
      - master
      - main

jobs:
  generate:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: generate-snake-game-from-github-contribution-grid
        uses: Platane/snk/svg-only@v3
        with:
          github_user_name: \${{ github.repository_owner }}
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark

      - name: push github-contribution-grid-snake.svg to the output branch
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`

          const actionRes = await fetch(
            API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, '.github/workflows/snake.yml'),
            { headers, signal: AbortSignal.timeout(6000) }
          )
          let actionSha = undefined
          if (actionRes.status === 200) {
            const actionData = await actionRes.json()
            actionSha = actionData.sha
          }

          const updateActionRes = await fetch(
            API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, '.github/workflows/snake.yml'),
            {
              method: 'PUT',
              headers,
              body: JSON.stringify({
                message: `Configure Contribution Snake GitHub Action${coAuthorTrailer}`,
                content: Buffer.from(snakeYaml, 'utf8').toString('base64'),
                sha: actionSha,
                author: commitAuthor,
                committer: commitCommitter,
              }),
              signal: AbortSignal.timeout(6000),
            }
          )

          if (!updateActionRes.ok) {
            console.error('Failed to configure Snake GitHub Action:', await updateActionRes.text())
          }
        } catch (err) {
          console.error('Error configuring snake workflow:', err)
        }
      }
    }

    if (exportData && typeof exportData === 'object') {
      try {
        cacheProfileConfig(exportData)
      } catch (saveErr) {
        console.error('Failed to cache profile configuration in memory:', saveErr)
      }
    }

    if (session.email) {
      const { emailService } = await import('@/lib/email/service')
      void emailService
        .sendFirstExportEmail({
          username: session.username,
          name: session.name,
          email: session.email,
          profileSlug:
            typeof exportData?.profileSlug === 'string' ? exportData.profileSlug : 'default',
          widgetCount: Array.isArray(exportData?.widgets) ? exportData.widgets.length : undefined,
        })
        .catch((err) => {
          console.error('[Commit Route] Non-blocking first export email error:', err)
        })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    Sentry.captureException(error)
    console.error('Commit error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
