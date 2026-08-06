---
title: 'Como resolver temas Dark/Light em SVGs no GitHub sem acesso ao DOM (bypass no Camo)'
slug: 'como-resolver-temas-dark-light-svgs-github-sem-dom'
published: false
description: 'O proxy Camo do GitHub remove tags de script e isola imagens. Descubra como criar SVGs responsivos aos temas escuro/claro usando CSS media queries embutidas executadas diretamente no navegador do leitor.'
tags: ['css', 'svg', 'github', 'frontend']
cover_image: 'assets/dynamic-svg-themes.jpg'
---

A limitação mais frustrante do proxy Camo do GitHub não é o seu cache estrito de imagens, mas a esterilização absoluta de qualquer script executado no lado do cliente. Isso cria um clássico desafio de frontend: como entregar um banner ou layout personalizado no `README.md` que responda automaticamente ao tema claro ou escuro do sistema operacional do leitor, se você não tem acesso ao DOM para detectar o estado atual da interface ou injetar classes CSS com JavaScript?

Muitas ferramentas tentam resolver isso passando o tema via parâmetros de query string (ex: `?theme=dark`). O problema óbvio dessa abordagem é que ela é estática: se o leitor inverte o tema de seu sistema operacional ou navegador, a imagem quebra visualmente e perde a harmonia estética com a página.

Neste artigo, veremos como o **GitAscii** explora a técnica **CSS-in-SVG** para contornar essa barreira de segurança, utilizando media queries embutidas nos próprios vetores.

![Temas Dinâmicos em SVGs](assets/dynamic-svg-themes.jpg)

---

### As Restrições do Sandbox do GitHub Camo

Quando você insere um link de imagem em um arquivo markdown, o GitHub renderiza a imagem no navegador apontando para o proxy Camo:

```html
<img src="https://camo.githubusercontent.com/.../img.svg" alt="Canvas Dinâmico" />
```

De acordo com as especificações da W3C para integração de arquivos SVG carregados por meio de tags `<img>` (ou propriedades CSS como `background-image`):

1. **Scripts são desabilitados**: Qualquer tag `<script>` dentro do SVG é ignorada e bloqueada pelo navegador do leitor.
2. **Recursos externos são bloqueados**: O navegador não carrega folhas de estilo externas (`<link rel="stylesheet">`) ou web fonts declaradas dentro do arquivo SVG.
3. **Isolamento de DOM**: O SVG é renderizado em um contexto de documento isolado. Ele não pode consultar o documento pai (a página do repositório) para verificar classes CSS do tema do GitHub, como `.theme-dark`.

---

### Contornando as Restrições com CSS-in-SVG Embutido

Apesar do bloqueio de scripts e carregamentos externos, **o motor de renderização do navegador do usuário final processa regras de estilo internas** declaradas diretamente na tag `<style>` do próprio SVG. Como o SVG é uma especificação XML estruturada, as regras de CSS internas continuam válidas.

Dessa forma, podemos injetar a media query nativa `@media (prefers-color-scheme: dark)` dentro do XML do SVG montado no Edge. Quando o navegador do leitor carrega o arquivo, ele avalia as regras de CSS em tempo de renderização local com base nas preferências do sistema do usuário:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="220" viewBox="0 0 800 220">
  <style>
    /* -------------------------------------------------------------
       Estilos padrão (Configuração para Light Mode)
       ------------------------------------------------------------- */
    .canvas-bg {
      fill: #ffffff;
      stroke: #e1e4e8;
      stroke-width: 1px;
      transition: fill 0.3s ease, stroke 0.3s ease;
    }
    .text-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-weight: 600;
      font-size: 16px;
      fill: #24292e;
    }
    .text-body {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 14px;
      fill: #586069;
    }
    .accent-bar {
      fill: #0366d6; /* Azul Clássico do GitHub Light */
    }

    /* -------------------------------------------------------------
       Sobrescrita de estilos via Media Query (Executada no navegador do leitor)
       ------------------------------------------------------------- */
    @media (prefers-color-scheme: dark) {
      .canvas-bg {
        fill: #0d1117; /* Fundo escuro do GitHub */
        stroke: #30363d;
      }
      .text-title {
        fill: #c9d1d9; /* Cor de texto claro do GitHub */
      }
      .text-body {
        fill: #8b949e;
      }
      .accent-bar {
        fill: #c5ff4a; /* Verde Limão característico do GitAscii */
      }
    }
  </style>

  <!-- Estrutura de Elementos Vetoriais -->
  <rect class="canvas-bg" width="100%" height="100%" rx="8" />
  <rect class="accent-bar" x="0" y="0" width="8" height="100%" rx="4" />

  <text class="text-title" x="30" y="45">GitAscii Layout Engine</text>
  <text class="text-body" x="30" y="90">> Status: Active</text>
  <text class="text-body" x="30" y="120">> Tema: Auto-Detectando Cores do Sistema</text>
  <text class="text-body" x="30" y="150">> Resolução de Cache: Processado no Edge</text>
</svg>
```

> [!NOTE]
> Mesmo que a imagem SVG seja servida a partir do CDN de cache do proxy Camo, a avaliação das folhas de estilo e media queries CSS ocorre no navegador do usuário final. Isso garante que a inversão de cores funcione instantaneamente, sem precisar de requisições à rede.

---

### Arquitetura de Requisição e Avaliação Visual

O diagrama a seguir detalha a fronteira entre o cache do servidor CDN e a avaliação no navegador do cliente:

```
                  SERVER-SIDE (Edge & CDN)                    │       CLIENT-SIDE (Browser)
                                                              │
┌──────────────┐         ┌─────────────┐       ┌────────────┐ │ ┌────────────────────────────────┐
│ Banco Dados  ├────────>│ Vercel Edge ├──────>│ GitHub CDN │ │ │ Navegador do Leitor            │
│ Config Layout│         │ Compila XML │       │ Cache Camo │ │ │                                │
└──────────────┘         └─────────────┘       └─────┬──────┘ │ │ 1. Carrega tag: <img src=camo> │
                                                     │        │ │ 2. Faz o parsing do markup XML │
                                                     └───────────> 3. Processa a tag <style>     │
                                                              │ │ 4. Avalia o tema do SO         │
                                                              │ │ 5. Aplica cores dinamicamente  │
                                                              │ └────────────────────────────────┘
```

### Recomendações e Boas Práticas para Temas em SVG

Ao utilizar folhas de estilo CSS-in-SVG em badges de repositório, lembre-se destas diretrizes:

1. **Evite Fontes Externas**: Instruções como `@import url(...)` serão bloqueadas pelo sandbox de segurança do navegador no contexto de imagens. Utilize fontes do sistema (como `-apple-system`, `monospace` ou padrões de plataforma como `Courier New`) para garantir consistência.
2. **Defina Namespaces XML**: Certifique-se de manter o atributo `xmlns="http://www.w3.org/2000/svg"` na tag raiz `<svg>`. Sem esse namespace, o navegador pode tratar o arquivo como XML puro e falhar no parsing do bloco de estilos CSS.
3. **Use Transições Suaves com Cuidado**: Propriedades como `transition: fill 0.3s ease` funcionam, mas consomem processamento de CPU do usuário caso o SVG possua centenas de caminhos vetoriais (`<path>`) complexos. Limite transições a elementos de fundo e textos principais.

> [!TIP]
> Para testar suas regras de mídia CSS localmente, abra o arquivo SVG bruto diretamente no navegador e utilize as ferramentas de desenvolvedor (DevTools) para emular temas claro/escuro e verificar o comportamento das cores.

### Conclusão

Padrões da web como XML, SVG e folhas de estilo CSS oferecem soluções elegantes para restrições de cache e segurança. Projetando assets integrados com estilos responsivos, você contorna a barreira do proxy Camo do GitHub sem comprometer a privacidade do usuário e melhora drasticamente o apelo visual do seu portfólio.
