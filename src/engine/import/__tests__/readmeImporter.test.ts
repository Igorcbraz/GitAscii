import assert from 'node:assert/strict'

import type { NormalizedGitHubData } from '@/features/github/types/github'

import { clusterCandidates } from '../cluster/ClusterEngine'
import { ContextStack } from '../context/ContextBuilder'
import { parseReadmeToAST } from '../parser/ASTParser'
import { initProviders } from '../providers'
import { ProviderRegistry } from '../providers/ProviderRegistry'
import { importReadme } from '../readmeImporter'
import { detectSectionCategory, getSemanticStandardTitle } from '../semantics/SemanticAnalyzer'
import { normalizeUrl } from '../url/UrlNormalizer'

const mockGitHubData: NormalizedGitHubData = {
  user: {
    id: 12345,
    login: 'octocat',
    name: 'The Octocat',
    avatar_url: 'https://github.com/images/error/octocat_happy.gif',
    bio: 'GitHub mascot',
    company: null,
    location: null,
    blog: null,
    twitter_username: null,
    public_repos: 10,
    public_gists: 0,
    followers: 100,
    following: 5,
    created_at: '2011-01-25T18:44:36Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  repos: [],
  languages: { TypeScript: 50000, JavaScript: 30000, HTML: 10000 },
  totalStars: 42,
  totalForks: 10,
  contributions: {
    totalContributions: 500,
    weeks: [],
  },
  readmeContent: '',
}

function runTests() {
  console.log('🧪 Starting README Import Engine Unit Tests...')
  initProviders()

  // Test 1: AST Parser
  {
    console.log('  Testing Stage 1: AST Parser...')
    const readme = `
<div align="center">
  <h1>Hi 👋, I'm Octocat</h1>
  <p align="center">A passionate developer</p>
</div>

## Sobre Mim
Engenheiro de Software focado em TypeScript e React.

<hr />

![Stats](https://github-readme-stats.vercel.app/api?username=octocat)
`
    const ast = parseReadmeToAST(readme)
    assert.equal(ast.type, 'document')
    assert.ok(ast.children.length > 0)
    const divNode = ast.children.find((c) => c.tagName === 'div')
    assert.ok(divNode)
    assert.equal(divNode?.attributes.align, 'center')
  }

  // Test 2: Context Stack
  {
    console.log('  Testing Stage 2: Context Stack...')
    const stack = new ContextStack()
    assert.equal(stack.current().align, 'left')
    assert.equal(stack.current().depth, 0)

    const mockDivNode = {
      id: 'node_div',
      type: 'container' as const,
      tagName: 'div',
      attributes: { align: 'center' as const },
      children: [],
      textContent: '',
      indexInParent: 0,
    }

    stack.push(mockDivNode, 'hero', '[ HERO ]')
    assert.equal(stack.current().align, 'center')
    assert.equal(stack.current().sectionCategory, 'hero')
    assert.equal(stack.current().depth, 1)

    stack.pop()
    assert.equal(stack.current().align, 'left')
    assert.equal(stack.current().depth, 0)
  }

  // Test 3: Semantic Analyzer
  {
    console.log('  Testing Stage 3: Semantic Analyzer...')
    assert.equal(detectSectionCategory('About Me'), 'about')
    assert.equal(detectSectionCategory('Sobre Mim'), 'about')
    assert.equal(detectSectionCategory('Quién Soy'), 'about')
    assert.equal(detectSectionCategory('À Propos'), 'about')

    assert.equal(detectSectionCategory('Tech Stack'), 'tech-stack')
    assert.equal(detectSectionCategory('Linguagens & Ferramentas'), 'tech-stack')
    assert.equal(detectSectionCategory('Tecnologias'), 'tech-stack')
    assert.equal(detectSectionCategory('Herramientas'), 'tech-stack')

    assert.equal(detectSectionCategory('Estatísticas'), 'stats')
    assert.equal(detectSectionCategory('GitHub Stats'), 'stats')

    assert.equal(detectSectionCategory('Redes Sociais'), 'contact')
    assert.equal(detectSectionCategory('Connect with me'), 'contact')

    assert.equal(getSemanticStandardTitle('about', 'Sobre Mim'), '[ ABOUT ME ]')
    assert.equal(getSemanticStandardTitle('tech-stack'), '[ SKILLS & TOOLS ]')
  }

  // Test 4: URL Normalizer
  {
    console.log('  Testing Stage 4: URL Normalizer...')
    const rawUrl =
      'https://img.shields.io/badge/linkedin-%230077B5.svg?logo=linkedin&utm_source=readme&v=123&t=999'
    const normalized = normalizeUrl(rawUrl)
    assert.ok(!normalized.includes('utm_source'))
    assert.ok(!normalized.includes('v=123'))
    assert.ok(!normalized.includes('t=999'))
    assert.ok(normalized.includes('linkedin'))

    // Test GitHub Blob URL conversion
    const githubBlobUrl =
      'https://github.com/TheDudeThatCode/TheDudeThatCode/blob/master/Assets/Mario_Hello_Big.gif'
    const convertedGithubUrl = normalizeUrl(githubBlobUrl)
    assert.equal(
      convertedGithubUrl,
      'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Mario_Hello_Big.gif'
    )
  }

  // Test 5: Provider Matcher & Custom Image Fallback
  {
    console.log('  Testing Stage 5: Provider Matcher & Custom Image...')
    const registry = ProviderRegistry.getInstance()
    const context = new ContextStack().current()

    const imgNodeStats = {
      id: 'node_stats',
      type: 'image' as const,
      attributes: { src: 'https://github-readme-stats.vercel.app/api?username=octocat' },
      children: [],
      textContent: '',
      indexInParent: 0,
    }

    const matchStats = registry.matchNode(imgNodeStats, context)
    assert.ok(matchStats)
    assert.equal(matchStats?.widgetId, 'github-readme-stats')
    assert.ok((matchStats?.confidence ?? 0) >= 0.9)

    const imgCustomNode = {
      id: 'node_custom',
      type: 'image' as const,
      attributes: { src: 'https://example.com/banner.png' },
      children: [],
      textContent: 'Banner',
      indexInParent: 0,
    }

    const readmeWithCustomGif = `
![Animated Gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif)
`
    const importedGifConfig = importReadme(
      { ...mockGitHubData, readmeContent: readmeWithCustomGif },
      'terminal'
    )
    const gifWidget = importedGifConfig.widgets.find((w) => w.widgetId === 'custom-image')
    assert.ok(gifWidget)
    assert.ok((gifWidget?.config.imageUrl as string).includes('.gif'))
  }

  // Test 6: Cluster Engine
  {
    console.log('  Testing Stage 6: Cluster Engine...')
    const candidate1 = {
      id: 'c1',
      nodeId: 'n1',
      widgetId: 'tech-stack',
      confidence: 0.9,
      align: 'center' as const,
      sectionCategory: 'tech-stack' as const,
      width: 140,
      height: 40,
      config: { selectedTechs: ['react'] },
      sourceNode: {
        id: 'n1',
        type: 'image' as const,
        attributes: {},
        children: [],
        textContent: '',
        indexInParent: 0,
      },
      isClusterableTech: true,
      techItems: ['react'],
    }

    const candidate2 = {
      id: 'c2',
      nodeId: 'n2',
      widgetId: 'tech-stack',
      confidence: 0.9,
      align: 'center' as const,
      sectionCategory: 'tech-stack' as const,
      width: 140,
      height: 40,
      config: { selectedTechs: ['ts'] },
      sourceNode: {
        id: 'n2',
        type: 'image' as const,
        attributes: {},
        children: [],
        textContent: '',
        indexInParent: 0,
      },
      isClusterableTech: true,
      techItems: ['ts'],
    }

    const groups = clusterCandidates([candidate1, candidate2])
    assert.equal(groups.length, 1)
    assert.equal(groups[0].type, 'tech-stack')
    assert.deepEqual(groups[0].config.selectedTechs, ['react', 'ts'])
  }

  // Test 7 & 8: Full Pipeline End-to-End
  {
    console.log('  Testing Stages 7 & 8: Layout Engine & Full Pipeline...')
    const readme = `
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=header&text=OCTOCAT" />
  <h1>Hi, I'm Octocat</h1>
</div>

## Tecnologias & Ferramentas
![Skill Icons](https://skillicons.dev/icons?i=js,ts,react,nodejs)

## Estatísticas
![GitHub Stats](https://github-readme-stats.vercel.app/api?username=octocat)
![Streak Stats](https://github-readme-streak-stats.herokuapp.com/?user=octocat)

<hr />

## Contato
<a href="https://linkedin.com/in/octocat"><img src="https://img.shields.io/badge/linkedin-%230077B5.svg?logo=linkedin" /></a>
`
    const result = importReadme({ ...mockGitHubData, readmeContent: readme }, 'terminal')

    assert.ok(result)
    assert.ok(result.widgets)
    assert.ok(result.widgets.length > 0)

    const widgetIds = result.widgets.map((w) => w.widgetId)
    console.log('    Generated widget IDs:', widgetIds)
    assert.ok(widgetIds.includes('header'))
    assert.ok(widgetIds.includes('tech-stack'))
    assert.ok(widgetIds.includes('github-readme-stats'))
    assert.ok(widgetIds.includes('streak-stats'))
    assert.ok(widgetIds.includes('social-media'))
  }

  console.log('✅ ALL README IMPORT ENGINE UNIT TESTS PASSED SUCCESSFULLY!')
}

runTests()
