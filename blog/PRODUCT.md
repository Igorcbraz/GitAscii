# GitAscii - Contexto do Produto para Blog Posts

Este documento serve como fonte da verdade para a geração de posts sobre o GitAscii utilizando a skill `blog-writer`.

## O Produto

**GitAscii** é uma plataforma que permite desenvolvedores construírem um perfil visual (README) dinâmico e atraente no GitHub através de um editor drag-and-drop (estilo Figma). Ao final, é gerado um único link que, quando incorporado no `README.md`, renderiza um SVG dinâmico gerado on the fly no Edge, mantendo-se sempre atualizado com métricas reais. O lema é: "Where cryptic terminals meet editorial newspaper design."

## Público-Alvo

Desenvolvedores, engenheiros de software, criadores tech e mantenedores de open-source que desejam destacar seu portfólio no GitHub de forma premium sem o esforço de manter um README estático atualizado manualmente.

## Principais Funcionalidades

- **Editor Visual Drag-and-Drop**: Montagem do layout no navegador sem escrever Markdown.
- **Estatísticas em Tempo Real**: Integração automática com a API do GitHub (commits, linguagens, streaks).
- **Engine de ASCII Art**: Conversão no client-side de qualquer imagem de perfil para arte ASCII usando canvas.
- **Renderização Adaptativa de Tema**: O SVG final usa `prefers-color-scheme` para se adaptar automaticamente ao modo dark ou light do leitor no GitHub.
- **URLs Dinâmicas e Edge Generation**: Em vez de arquivos estáticos, o backend Next.js App Router gera o SVG sob demanda no edge, otimizado para o proxy do GitHub (Camo).

## Diferenciais Técnicos e Stack

- Construído com Next.js 15, React 19, Tailwind CSS v4, TypeScript 5.7.
- A arquitetura separa a "camada de edição" (browser) da "engine de renderização" (Next.js server/edge).
- O backend não hospeda imagens estáticas, ele gera markup SVG estruturado otimizado e cacheado via Vercel Edge.
- Não requer GitHub Actions rodando cron jobs. Atualização contínua via requisições HTTP do próprio GitHub.

## Identidade Visual

Tons escuros de carbono (`#060606`), acentos verde limão "signal lime" (`#c5ff4a`), e tipografia elegante (PT Serif e JetBrains Mono) misturando o mundo do terminal com editorial de revista de alto padrão.
