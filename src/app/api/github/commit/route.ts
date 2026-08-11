import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'
import { getInstallationTokenById, getInstallationTokenForUser } from '@/lib/githubApp'

export async function POST(request: Request) {
  try {
    const { embedCode, exportData, installation_id } = await request.json()
    if (!embedCode && !installation_id) {
      return NextResponse.json({ error: 'Missing embedCode' }, { status: 400 })
    }

    let username = ''
    let appToken = null
    let finalEmbedCode = embedCode

    if (installation_id) {
      const { token, username: instUsername } = await getInstallationTokenById(installation_id)
      if (!token || !instUsername) {
        return NextResponse.json({ error: 'Invalid installation' }, { status: 403 })
      }
      username = instUsername
      appToken = token

      const host = request.headers.get('host') || 'localhost:3000'
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      const v = Date.now()
      const profileSlug = exportData?.templateId || 'default'
      const slugPath = profileSlug === 'default' ? '' : `/${profileSlug}`
      finalEmbedCode = `<a href="${protocol}://${host}">
  <img
    src="${protocol}://${host}/api/${username}${slugPath}?v=${v}"
    alt="GitAscii Widget"
    width="100%"
  />
</a>`

      if (exportData) {
        exportData.username = username
      }
    } else {
      const session = await getSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      username = session.username

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

    const repoRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
      headers,
    })

    if (repoRes.status === 200) {
    } else if (repoRes.status === 404) {
      const createRes = await fetch('https://api.github.com/user/repos', {
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
        `https://api.github.com/repos/${username}/${repoName}/contents/gitascii.json`,
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
      `https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
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
        `https://api.github.com/repos/${username}/${repoName}/contents/README.md`,
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
        `https://api.github.com/repos/${username}/${repoName}/contents/gitascii.json`,
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
          // Busca o workflow dinamicamente do repositório de exemplo do Platane
          const yamlRes = await fetch(
            'https://raw.githubusercontent.com/Platane/Platane/master/.github/workflows/main.yml'
          )
          if (yamlRes.ok) {
            let snakeYaml = await yamlRes.text()

            // Substitui o usuário fixo 'platane' pela variável dinâmica do GitHub, se houver,
            // tomando cuidado para não alterar a action 'Platane/snk'
            snakeYaml = snakeYaml.replace(
              /github_user_name:\s*\w+/g,
              'github_user_name: ${{ github.repository_owner }}'
            )

            const actionRes = await fetch(
              `https://api.github.com/repos/${username}/${repoName}/contents/.github/workflows/snake.yml`,
              { headers }
            )
            let actionSha = undefined
            if (actionRes.status === 200) {
              const actionData = await actionRes.json()
              actionSha = actionData.sha
            }

            const updateActionRes = await fetch(
              `https://api.github.com/repos/${username}/${repoName}/contents/.github/workflows/snake.yml`,
              {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                  message: 'Configura GitHub Action do Contribution Snake',
                  content: Buffer.from(snakeYaml, 'utf8').toString('base64'),
                  sha: actionSha,
                }),
              }
            )

            if (!updateActionRes.ok) {
              console.error('Falha ao configurar a Action da Snake:', await updateActionRes.text())
            }
          }
        } catch (err) {
          console.error('Erro ao configurar o workflow da snake:', err)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Commit error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
