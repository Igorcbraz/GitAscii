import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'
import { getInstallationTokenById, getInstallationTokenForUser } from '@/lib/githubApp'
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

      const host = request.headers.get('host') || 'localhost:3000'
      const protocol = request.headers.get('x-forwarded-proto') || 'https'
      const v = Date.now()
      const rawSlug = exportData?.profileSlug || exportData?.templateId || 'default'
      const profileSlug =
        typeof rawSlug === 'string'
          ? rawSlug.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'default'
          : 'default'
      const slugPath = profileSlug === 'default' ? '' : `/${profileSlug}`
      finalEmbedCode = `<a href="${protocol}://${host}">
  <img
    src="${protocol}://${host}/api/${encodeURIComponent(username)}${slugPath}?v=${v}"
    alt="GitAscii Widget"
    width="100%"
  />
</a>`

      if (exportData && typeof exportData === 'object') {
        exportData.username = username
        exportData.profileSlug = profileSlug
      }
    } else {
      const { token, installUrl } = await getInstallationTokenForUser(username)
      if (!token) {
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

    if (repoRes.status === 200) {
    } else if (repoRes.status === 404) {
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
    } else {
      return NextResponse.json(
        { error: 'Failed to access repository', details: await repoRes.text() },
        { status: 500 }
      )
    }

    let jsonSha = undefined
    let hasJsonChanged = true
    let incomingJsonStr = ''

    if (exportData) {
      const jsonRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'gitascii.json'),
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

    if (hasJsonChanged || isWidgetMissing) {
      let newContent = currentContent
      if (!isWidgetMissing) {
        newContent = currentContent.replace(widgetRegex, finalEmbedCode)
      } else {
        newContent = currentContent ? `${currentContent}\n\n${finalEmbedCode}` : finalEmbedCode
      }

      const updateRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'README.md'),
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: 'Update profile README via GitAscii',
            content: Buffer.from(newContent, 'utf8').toString('base64'),
            sha,
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

    if (exportData && hasJsonChanged) {
      const updateJsonRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, repoName, 'gitascii.json'),
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: 'Update GitAscii layout export',
            content: Buffer.from(incomingJsonStr, 'utf8').toString('base64'),
            sha: jsonSha,
          }),
        }
      )

      if (!updateJsonRes.ok) {
        console.error('Failed to upload JSON:', await updateJsonRes.text())
      }

      // Verifica se o layout contém o widget da snake
      const hasSnakeWidget = exportData?.widgets?.some((w: any) => w.id === 'contribution-snake')

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
                message: 'Configura GitHub Action do Contribution Snake',
                content: Buffer.from(snakeYaml, 'utf8').toString('base64'),
                sha: actionSha,
              }),
              signal: AbortSignal.timeout(6000),
            }
          )

          if (!updateActionRes.ok) {
            console.error('Falha ao configurar a Action da Snake:', await updateActionRes.text())
          }
        } catch (err) {
          console.error('Erro ao configurar o workflow da snake:', err)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    Sentry.captureException(error)
    console.error('Commit error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
