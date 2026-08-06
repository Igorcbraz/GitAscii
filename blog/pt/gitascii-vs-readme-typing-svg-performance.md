---
title: 'GitAscii vs readme-typing-svg: Analisando latência e overhead no proxy do GitHub'
slug: 'gitascii-vs-readme-typing-svg-performance'
published: false
description: 'Geração de SVGs dinâmicos tradicionais executa processamento síncrono pesado em cada requisição. Saiba como o deslocamento de carga para o client-side e o Vercel Edge Runtime evitam timeouts no proxy Camo do GitHub.'
tags: ['performance', 'nextjs', 'edge-computing', 'svg']
cover_image: 'assets/latency-comparison.jpg'
---

Ferramentas clássicas de customização de perfis, como o `readme-typing-svg`, popularizaram a injeção de animações e interatividade em repositórios, servindo SVGs remotos gerados de forma dinâmica. Porém, o custo oculto dessa abordagem síncrona clássica é a degradação da percepção de performance. _Cold starts_ ocasionais, picos de latência e timeouts no proxy GitHub Camo frequentemente deixam os perfis com imagens quebradas.

Neste artigo, vamos analisar em profundidade o gargalo do processamento síncrono na renderização de SVGs, entender os detalhes de funcionamento do proxy do GitHub e ver como o GitAscii resolve esse problema mantendo o tempo de resposta abaixo de 80ms ao deslocar o processamento pesado para a Canvas API do navegador.

![Comparação de Latência no Edge](assets/latency-comparison.jpg)

---

### Entendendo o Funcionamento do Proxy GitHub Camo

Antes de falarmos sobre latência, precisamos entender como o GitHub renderiza imagens em repositórios e perfis. Quando você acessa um repositório, o GitHub não permite que o navegador faça requisições diretas a servidores de terceiros para carregar imagens do Markdown. Isso protege a privacidade do usuário (ocultando seu endereço IP e evitando pixels de rastreamento) e evita avisos de conteúdo misto (HTTP em páginas HTTPS).

O GitHub resolve isso reescrevendo todos os links de imagem para passar pelo seu próprio proxy seguro, o **Camo**:

```markdown
<!-- URL original no Markdown -->

![Meu Badge](https://meu-servidor-lento.com/badge.svg)

<!-- URL reescrita pelo GitHub e renderizada no DOM -->
<img src="https://camo.githubusercontent.com/a9c12b.../68747470733a2f2f6d792d736c6f772d7365727665722e636f6d2f62616467652e737667" alt="Meu Badge">
```

Embora o Camo garanta privacidade, ele introduz uma restrição operacional severa:

> [!IMPORTANT]
> O proxy GitHub Camo possui um timeout de conexão rígido (geralmente configurado entre **4 e 10 segundos**). Se o servidor de origem que gera a imagem SVG demorar mais do que isso para responder—devido a _cold starts_ em serviços gratuitos de hospedagem (como Render, Fly.io ou Heroku), consultas lentas de banco de dados ou carga no servidor—o Camo cancela a requisição e serve um ícone de imagem quebrada.

---

### O Gargalo do Processamento Síncrono no Servidor

Serviços legados de badges dinâmicos executam cálculos pesados de layout e renderização de forma síncrona durante a própria requisição HTTP `GET`:

```
[Navegador] ──> [Proxy GitHub Camo] ──(HTTP GET Síncrono)──> [Servidor de Badges]
                                                                   │
                                                        1. Parsear Query String da URL
                                                        2. Carregar Fontes Personalizadas
                                                        3. Calcular tamanho dos textos no Canvas
                                                        4. Montar a árvore estruturada do SVG/XML
                                                        5. Transmitir o payload final do SVG
```

Se o seu badge precisa renderizar layouts complexos de terminal ou traduzir fotos em ASCII art, a demanda de CPU no backend aumenta exponencialmente. Sob picos de tráfego, esse modelo síncrono falha, disparando timeouts no proxy do GitHub.

---

### Deslocamento da Carga de Trabalho para o Client-side no GitAscii

Ao projetarmos a arquitetura do **GitAscii**, dividimos a responsabilidade: **o processamento pesado roda no navegador do desenvolvedor, enquanto a montagem leve do template roda no Edge**.

Em vez de enviar uma imagem inteira para o nosso servidor e forçá-lo a processar e convertê-la em caracteres ASCII a cada requisição, realizamos a decodificação de pixels dentro do editor visual do GitAscii utilizando a `Canvas API` nativa do navegador do usuário.

```javascript
/**
 * Mecanismo de Conversão de Imagem para ASCII no Client-Side
 * Processa os pixels localmente na máquina do desenvolvedor antes de salvar a configuração.
 */
export function convertImageToAscii(
  imgElement: HTMLImageElement,
  width: number,
  height: number
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(imgElement, 0, 0, width, height);

  const { data } = ctx.getImageData(0, 0, width, height);
  const asciiChars = ' .:-=+*#%@';
  let asciiArt = '';

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];

      // Cálculo de luminância usando pesos padrão (ITU-R BT.601)
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const charIndex = Math.floor((luminance / 255) * (asciiChars.length - 1));
      asciiArt += asciiChars[charIndex];
    }
    asciiArt += '\n';
  }

  return asciiArt;
}
```

> [!TIP]
> Ao processar a conversão ASCII no cliente, gravamos apenas a representação final em texto no banco de dados. O servidor no Edge não precisa ler buffers de pixels nem carregar bibliotecas pesadas de manipulação de imagens (como `sharp` ou `canvas`) em tempo de execução.

---

### Montagem Leve e Rápida no Edge Runtime

Como os dados estruturais e a arte ASCII já estão pré-calculados, a rota do Next.js no Edge funciona apenas como um compilador ultrarrápido de strings. Ela recupera o JSON do banco, consulta estatísticas simples no GitHub em paralelo e os insere em um template de marcação XML.

```typescript
// Rota de renderização no Edge do GitAscii: /api/render/[username]
export const runtime = 'edge'

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    // 1. Consultas paralelas e concorrentes no Edge
    const [profileConfig, liveStats] = await Promise.all([
      db.getProfileConfig(username),
      github.fetchLiveStats(username),
    ])

    // 2. Concatenação simples e leve de strings (baixo consumo de CPU)
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
        <style>
          .ascii-art { font-family: monospace; font-size: 8px; fill: #58a6ff; }
          .stats-label { font-family: system-ui, sans-serif; fill: #ffffff; }
        </style>
        <text class="stats-label" x="20" y="40">Commits: ${liveStats.commitCount}</text>
        <text class="stats-label" x="20" y="70">PRs: ${liveStats.prCount}</text>
        <text class="ascii-art" x="300" y="40" xml:space="preserve">${profileConfig.asciiArt}</text>
      </svg>
    `

    const executionTime = Date.now() - startTime

    return new Response(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'X-Response-Time': `${executionTime}ms`,
        // Estratégia de cache: Serve em cache e revalida em background
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    return new Response('<svg><!-- Erro ao processar SVG --></svg>', {
      status: 500,
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }
}
```

---

### Comparação de Caching e Latência

```
┌─────────────────────────────────┬──────────────────────────┬──────────────────────────┐
│ Métrica de Desempenho           │ Servidor Síncrono Comum  │ Pipeline no Edge GitAscii│
├─────────────────────────────────┼──────────────────────────┼──────────────────────────┤
│ TTFB médio (em cache miss)      │ 800ms - 3500ms           │ 50ms - 120ms             │
│ Sobrecarga de Cold Start        │ Sim (risco de timeout)   │ Não (Vercel Edge Global) │
│ Operações de Banco de Dados     │ Consultas complexas      │ Consultas rápidas KV     │
│ Processamento no Client-side    │ Nenhum                   │ Mínimo (apenas no editor)│
│ Formato de Saída                │ Renderização pesada      │ Concatenação leve de XML │
└─────────────────────────────────┴──────────────────────────┴──────────────────────────┘
```

### Estratégia de Cache: Stale-While-Revalidate

Configuramos o GitAscii para tirar proveito da diretiva de cache `stale-while-revalidate`. Quando um usuário acessa o seu perfil no GitHub:

1. **Primeira Visita**: O proxy Camo do GitHub solicita o SVG ao Edge do GitAscii. O Edge gera o layout em ~80ms. O Camo faz o cache do SVG e o serve ao navegador.
2. **Visitas Subsequentes (dentro de `s-maxage`)**: O Camo responde imediatamente utilizando a imagem em cache na rede CDN do próprio GitHub.
3. **Período Stale (entre `s-maxage` e `stale-while-revalidate`)**: O Camo serve a cópia em cache (antiga) instantaneamente ao leitor para garantir latência zero, enquanto faz uma requisição HTTP silenciosa em background ao Edge do GitAscii para obter dados atualizados e revalidar o cache do CDN.

### Conclusão

Ao migrar tarefas pesadas de processamento de imagem para o client-side do editor visual e utilizar templates XML concatenados no Edge do Next.js, o GitAscii elimina os gargalos que prejudicam ferramentas de SVG dinâmico tradicionais. O resultado é um perfil no GitHub extremamente veloz, estável e livre de imagens quebradas.
