# 📈 GitAscii Analytics System

Este projeto utiliza uma arquitetura de monitoramento desacoplada, tipada e profissional (nível SaaS de produção) para rastreamento de métricas, comportamento de usuários, eventos de funil e análise de performance (Web Vitals).

---

## 🏛️ Arquitetura e Estrutura de Diretórios

O sistema de analytics foi estruturado sob o princípio da **Inversão de Dependências (SOLID)**, garantindo que os componentes da aplicação não conheçam o fornecedor final de analytics (ex: Google Analytics 4, PostHog, Mixpanel).

### Arquivos (`src/lib/analytics/`)

- [types.ts](file:///C:/Repos/GitAscii/src/lib/analytics/types.ts): Contém as definições de tipos para eventos, propriedades e estado de consentimento.
- [interface.ts](file:///C:/Repos/GitAscii/src/lib/analytics/interface.ts): Interface genérica que qualquer provedor (GA4, PostHog, Amplitude, etc.) deve implementar.
- [google-analytics.ts](file:///C:/Repos/GitAscii/src/lib/analytics/google-analytics.ts): Implementação da interface voltada para o Google Analytics 4.
- [clarity.ts](file:///C:/Repos/GitAscii/src/lib/analytics/clarity.ts): Microsoft Clarity — requer `consentGranted: true` para carregar.
- [ConsentControlledScripts.tsx](file:///C:/Repos/GitAscii/src/lib/analytics/ConsentControlledScripts.tsx): Client component que monta GA4 e Clarity condicionalmente com base no consentimento.
- [index.ts](file:///C:/Repos/GitAscii/src/lib/analytics/index.ts): Exporta o hook `useAnalytics()`, o singleton `analytics` e o componente `<AutoAnalyticsTracker />`.
- [web-vitals.tsx](file:///C:/Repos/GitAscii/src/lib/analytics/web-vitals.tsx): Rastreamento automático e envio de métricas de performance (LCP, FID, CLS, etc.).

### Arquivos (`src/lib/consent/`)

- [index.ts](file:///C:/Repos/GitAscii/src/lib/consent/index.ts): Helpers SSR-safe: `getConsentChoice`, `saveConsentChoice`, `clearConsentChoice`.
- [ConsentBanner.tsx](file:///C:/Repos/GitAscii/src/lib/consent/ConsentBanner.tsx): Banner de consentimento acessível + `PrivacySettingsButton` para o footer.

---

## 🔍 Eventos Disponíveis e Parâmetros

A tabela abaixo descreve todos os eventos catalogados e os respectivos parâmetros esperados pelo TypeScript:

| Evento              | Parâmetros Esperados                                                         | Descrição                                             |
| :------------------ | :--------------------------------------------------------------------------- | :---------------------------------------------------- |
| `generate_readme`   | `template`, `theme`, `widgets_count`, `generation_time_ms?`                  | README final gerado e renderizado com sucesso.        |
| `preview_template`  | `template`, `category?`                                                      | Usuário abriu o preview de um template.               |
| `template_selected` | `template`, `category?`                                                      | Usuário selecionou um template no editor.             |
| `widget_added`      | `widget_id`, `category?`, `total_widgets_used?`                              | Adição de widget ao editor.                           |
| `widget_removed`    | `widget_id`, `category?`, `total_widgets_used?`                              | Remoção de widget do editor.                          |
| `copy_markdown`     | `format: "markdown" \| "svg"`, `template`, `widgets_count?`                  | Ação de copiar markdown para a área de transferência. |
| `copy_svg`          | `format: "markdown" \| "svg"`, `template`, `widgets_count?`                  | Ação de copiar SVG.                                   |
| `download_svg`      | `format: "svg" \| "png"`, `template`, `theme?`                               | Download de SVG renderizado.                          |
| `download_png`      | `format: "svg" \| "png"`, `template`, `theme?`                               | Download de imagem PNG.                               |
| `publish_profile`   | `username`, `theme`, `widgetsCount`                                          | Publicação de profile GitAscii na web.                |
| `share_profile`     | `platform: "twitter" \| "linkedin" \| "whatsapp" \| "copy_link"`, `username` | Ação de compartilhar profile gerado nas redes.        |
| `open_editor`       | `entryPoint: "hero" \| "header" \| "templates_gallery" \| "direct"`          | Entrada do usuário no editor.                         |
| `username_checked`  | `username`, `exists`, `responseTimeMs`                                       | Verificação de existência do usuário no GitHub.       |
| `api_request`       | `endpoint`, `method`                                                         | Chamada HTTP iniciada para nossa API.                 |
| `api_success`       | `endpoint`, `method`, `responseTimeMs`                                       | Sucesso no retorno de uma chamada de API.             |
| `api_error`         | `endpoint`, `method`, `statusCode`, `errorMessage`                           | Erro mapeado no retorno da API.                       |
| `login`             | `method: "github" \| "google" \| "email"`, `userId?`                         | Identificação/Autenticação do usuário.                |
| `signup`            | `method: "github" \| "google" \| "email"`, `userId?`                         | Registro de nova conta.                               |

### 🛠️ Eventos de Erro (Automáticos e Manuais)

- `generate_failed`: `{ message, stack?, endpoint?, statusCode?, widget?, template?, context? }`
- `widget_error`: `{ message, stack?, endpoint?, statusCode?, widget?, template?, context? }`
- `markdown_error`: `{ message, stack?, endpoint?, statusCode?, widget?, template?, context? }`
- `render_error`: `{ message, stack?, endpoint?, statusCode?, widget?, template?, context? }`

### 🤖 Eventos Automáticos & Funil

- `first_visit`: Disparado na primeira visita do usuário ao site.
- `first_interaction`: Disparado no primeiro clique/tecla pressionada pelo usuário (`{ action }`).
- `session_start`: Disparado ao iniciar uma nova sessão.
- `editor_time`: Tempo em segundos que o usuário manteve a aba ativa no editor (`{ durationSeconds }`).
- `preview_time`: Tempo ativo em telas de preview/landing (`{ durationSeconds }`).
- `abandoned_generation`: `{ stepReached, reason? }`
- `web_vitals`: `{ id, name, value, delta, rating }`

---

## ⚡ Convenções para Criação de Novos Eventos

Para adicionar um novo evento de forma profissional e segura ao longo da aplicação:

1. **Defina a tipagem do payload** em [types.ts](file:///C:/Repos/GitAscii/src/lib/analytics/types.ts). Crie uma interface específica para os parâmetros do seu novo evento.
2. **Atualize o dicionário `AnalyticsEvents`** em [types.ts](file:///C:/Repos/GitAscii/src/lib/analytics/types.ts), mapeando o nome do evento para sua interface correspondente.
3. **Exponha uma função helper amigável** no hook `useAnalytics()` localizado em [index.ts](file:///C:/Repos/GitAscii/src/lib/analytics/index.ts).
4. **Utilize chaves em snake_case** para os nomes dos eventos e de seus parâmetros, facilitando a criação de dimensões customizadas no painel do GA4.

---

## 🔒 Sistema de Consentimento (LGPD / GDPR)

### Visão Geral

O GitAscii implementa um sistema de consentimento explícito. Nenhum dado de analytics é coletado sem o aceite ativo do usuário.

### Como funciona — fluxo de consentimento

```
Primeiro acesso
      │
      ▼
  analytics.init() chamado em analytics/index.ts
      │  Cria gtag stub (dataLayer)
      │  Consent Mode v2 → analytics_storage: 'denied' (padrão)
      │
      ▼
  AutoAnalyticsTracker lê localStorage via getConsentChoice()
      │
      ├── 'granted' (visita anterior com aceite) ────────────────────────────┐
      │       updateConsent({ analytics_storage: 'granted', ... })            │
      │       setConsentGranted(true) → eventos de sessão disparados          │
      │       ConsentControlledScripts → Clarity carregado                   │
      │       Banner NÃO exibido                                              │
      │                                                                       │
      ├── 'denied' (visita anterior com recusa) ──────────────────────────────┤
      │       Consent permanece 'denied'                                      │
      │       Banner NÃO exibido                                              │
      │       Clarity NÃO carregado                                           │
      │                                                                       │
      └── null (primeira visita) ─────────────────────────────────────────────┤
              ConsentBanner exibido                                            │
              │                                                                │
              ├── [Aceita] → saveConsentChoice('granted')                     │
              │              dispara 'analytics-consent-decision'              │
              │              GA4 consent → 'granted'                          │
              │              Clarity: carregado dinamicamente                 │
              │                                                                │
              └── [Recusa] → saveConsentChoice('denied') ───────────────────┘
                             GA4 consent permanece 'denied'
                             Clarity: script nunca carregado
                             Sentry: continua funcionando normalmente
```

### GA4 vs. Clarity — tratamentos diferentes

|                              | Google Analytics 4                          | Microsoft Clarity                                            |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| **Script carregado**         | Sempre (Consent Mode v2)                    | Somente após consent granted                                 |
| **Dados enviados se negado** | Bloqueado por `analytics_storage: 'denied'` | Script não existe, nada é enviado                            |
| **Por quê a diferença**      | GA4 tem suporte nativo a Consent Mode v2    | Clarity não tem equivalente; não carregar é a única garantia |

### Sentry — separado do consentimento de analytics

O Sentry é um sistema de **monitoramento técnico de erros**, não uma ferramenta de analytics:

- Coleta apenas stack traces, URL da página e versão do browser.
- Não escreve cookies de rastreamento ou dados de comportamento.
- É carregado independentemente do consentimento de analytics porque detectar bugs afeta a qualidade do serviço para todos os usuários.

### Como o usuário altera a escolha

1. Footer → clicar em **Privacy Settings**
2. Isso executa `clearConsentChoice()` e recarrega a página
3. O banner reaparece para nova escolha

---

## 🚀 Como Usar no Código (Exemplos)

### 1. Utilizando o Hook `useAnalytics()` (Client Components)

```tsx
'use client'

import { useAnalytics } from '@/lib/analytics'

export function TemplateCard({ template, category }) {
  const { templateSelected, previewTemplate } = useAnalytics()

  return (
    <div>
      <button onClick={() => previewTemplate({ template, category })}>Visualizar</button>
      <button onClick={() => templateSelected({ template, category })}>Selecionar</button>
    </div>
  )
}
```

### 2. Disparando Ações de Exportação e Copiar com Validação de Payload

O sistema automaticamente **remove campos nulos, undefined ou strings vazias** antes do envio das métricas, evitando poluição no banco do Google Analytics.

```tsx
import { useAnalytics } from '@/lib/analytics'

export function EditorActions() {
  const { copyMarkdown, trackError } = useAnalytics()

  const handleCopy = () => {
    try {
      copyMarkdown({
        format: 'markdown',
        template: 'neon-layout',
        widgets_count: 4,
      })
    } catch (error) {
      trackError('markdown_error', error, { context: 'copy_button' })
    }
  }

  return <button onClick={handleCopy}>Copiar Markdown</button>
}
```

---

## 🔍 Como Depurar e Testar usando o DebugView

1. **Evitando Poluição em Localhost**: Em ambiente de desenvolvimento (`localhost`), o provedor de Google Analytics não envia pacotes para os servidores de produção. Os eventos disparados serão impressos diretamente no console do desenvolvedor para auditoria visual.
2. **Utilizando o DebugView**:
   - Instale a extensão **Google Analytics Debugger** no Google Chrome.
   - Ative a extensão (ícone ON na barra de extensões).
   - Abra a aba de console do navegador para ver os logs locais.
   - Acesse o painel do Google Analytics 4 associado à tag `G-GDBZXFCBLQ`.
   - Vá em **Administrador → DebugView** (sob a coluna de exibição de dados). Os seus eventos em localhost aparecerão em tempo real no fluxo de depuração.
3. **Testando o consentimento**:
   - Limpe o `localStorage` da aplicação para simular o primeiro acesso.
   - O banner deve aparecer; ao aceitar, verifique o DebugView para eventos de `session_start`.
   - Ao recusar e recarregar, nenhum evento deve chegar ao GA4 e o script do Clarity não deve ser carregado (verificar Network tab).

---

## 📹 Microsoft Clarity (Heatmaps & Session Recording)

Além do Google Analytics 4, utilizamos o **Microsoft Clarity** para entender visualmente o comportamento dos usuários através de heatmaps (mapas de calor) e gravações de sessão anonimizadas.

> ⚠️ **Consent-gated**: O script do Clarity **não é carregado** caso o usuário recuse o consentimento de analytics. O Clarity não possui suporte a Consent Mode v2, portanto a única forma de garantir privacidade é não injetar o script.

A integração do Clarity segue a mesma filosofia de arquitetura:

1. **Performance**: O script do Clarity só é injetado via `next/script` em produção, utilizando a estratégia `afterInteractive` para não prejudicar o Core Web Vitals.
2. **Abstração**: O módulo localizado em `src/lib/analytics/clarity.ts` isola as chamadas diretas ao objeto `window.clarity`.
3. **Privacidade e PII**: Implementamos verificações para barrar envio de dados sensíveis (PII - _Personally Identifiable Information_). Quaisquer tags cujos nomes contenham `email`, `name`, `password`, `token`, `cpf` ou `phone` serão silenciadas.

### Como Usar

Para enviar eventos customizados ou adicionar filtros à sessão (somente se consent foi granted):

```typescript
import { trackClarityEvent, setClarityTag } from '@/lib/analytics/clarity'

// Enviar evento customizado ao Clarity
trackClarityEvent('download_svg_premium')

// Marcar a sessão atual com um atributo para filtrar heatmaps depois
setClarityTag('theme', 'dracula')
```

---

## 📄 Páginas de Política

| Página         | URL        | Descrição                                                                                            |
| -------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| Privacy Policy | `/privacy` | Política de privacidade com detalhes de coleta, GA4, Clarity, Sentry, cookies e direitos do usuário  |
| Terms of Use   | `/terms`   | Termos de uso cobrindo serviço, uso aceitável, conteúdo gerado, GitHub, disponibilidade e limitações |

> **Atenção**: As páginas contêm placeholders marcados com `[PLACEHOLDER: ...]` para informações jurídicas que devem ser preenchidas pelo proprietário do projeto (nome legal, e-mail de contato, endereço físico).
