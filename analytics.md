# 📈 GitAscii Analytics System

Este projeto utiliza uma arquitetura de monitoramento desacoplada, tipada e profissional (nível SaaS de produção) para rastreamento de métricas, comportamento de usuários, eventos de funil e análise de performance (Web Vitals).

---

## 🏛️ Arquitetura e Estrutura de Diretórios

O sistema de analytics foi estruturado sob o princípio da **Inversão de Dependências (SOLID)**, garantindo que os componentes da aplicação não conheçam o fornecedor final de analytics (ex: Google Analytics 4, PostHog, Mixpanel).

### Arquivos (`src/lib/analytics/`)

- [types.ts](file:///C:/Repos/GitAscii/src/lib/analytics/types.ts): Contém as definições de tipos para eventos, propriedades e estado de consentimento.
- [interface.ts](file:///C:/Repos/GitAscii/src/lib/analytics/interface.ts): Interface genérica que qualquer provedor (GA4, PostHog, Amplitude, etc.) deve implementar.
- [google-analytics.ts](file:///C:/Repos/GitAscii/src/lib/analytics/google-analytics.ts): Implementação da interface voltada para o Google Analytics 4.
- [index.ts](file:///C:/Repos/GitAscii/src/lib/analytics/index.ts): Exporta o hook `useAnalytics()`, o singleton `analytics` e o componente de escuta automática `<AutoAnalyticsTracker />`.
- [web-vitals.tsx](file:///C:/Repos/GitAscii/src/lib/analytics/web-vitals.tsx): Rastreamento automático e envio de métricas de performance (LCP, FID, CLS, etc.).

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

## 🔒 Consent Mode v2 (LGPD / GDPR)

A arquitetura já suporta o **Consent Mode v2**. Por padrão, os rastreamentos e cookies são definidos como `denied`.
Para atualizar os estados de consentimento a partir de um Banner de Cookies futuro, utilize a função `updateConsent`:

```typescript
import { useAnalytics } from '@/lib/analytics'

const { updateConsent } = useAnalytics()

// Quando o usuário aceitar os cookies
updateConsent({
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
})
```

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

---

## 📹 Microsoft Clarity (Heatmaps & Session Recording)

Além do Google Analytics 4, utilizamos o **Microsoft Clarity** para entender visualmente o comportamento dos usuários através de heatmaps (mapas de calor) e gravações de sessão anonimizadas.

A integração do Clarity segue a mesma filosofia de arquitetura:

1. **Performance**: O script do Clarity só é injetado via `next/script` em produção, utilizando a estratégia `afterInteractive` para não prejudicar o Core Web Vitals.
2. **Abstração**: O módulo localizado em `src/lib/analytics/clarity.ts` isola as chamadas diretas ao objeto `window.clarity`.
3. **Privacidade e PII**: Implementamos verificações para barrar envio de dados sensíveis (PII - _Personally Identifiable Information_). Quaisquer tags cujos nomes contenham `email`, `name`, `password`, `token`, `cpf` ou `phone` serão silenciadas.

### Como Usar

O script inicial já está incluído e ativado globalmente via `layout.tsx`. Para enviar eventos customizados ou adicionar filtros à sessão:

```typescript
import { trackClarityEvent, setClarityTag } from '@/lib/analytics/clarity'

// Enviar evento customizado ao Clarity
trackClarityEvent('download_svg_premium')

// Marcar a sessão atual com um atributo para filtrar heatmaps depois
setClarityTag('theme', 'dracula')
```
