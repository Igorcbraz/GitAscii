# Resend Email Integration & Rules

Este documento define a arquitetura, as diretrizes operacionais, a criação de templates e os padrões de envio de emails transacionais, de segurança e de engajamento no GitAscii via **Resend**.

---

## 1. Visão Geral e Arquitetura

O GitAscii utiliza o **Resend** em conjunto com **React Email** para disparar comunicações transacionais de alta entrega, consistência visual e conformidade com os padrões modernos de entregabilidade (RFC 8058, CAN-SPAM, GDPR).

### Estrutura de Arquivos

```
src/lib/email/
├── client.ts                 # Instância do cliente Resend e helpers de ambiente
├── types.ts                  # Definições de tipos, payloads e preferências
├── tokens.ts                 # Geração e validação de tokens HMAC (unsubscribe/preferências)
├── ledger.ts                 # Controle de idempotência em memória, supressão e cooldowns
├── service.ts                # EmailService: despachante centralizado de emails
├── index.ts                  # Exportações unificadas
└── templates/
    ├── components/
    │   ├── EmailLayout.tsx       # Shell padrão com identidade dark terminal do GitAscii
    │   └── EmailButton.tsx       # Botão CTA reutilizável (#c5ff4a signal lime)
    ├── WelcomeEmail.tsx          # Email de boas-vindas no primeiro login
    ├── FirstExportEmail.tsx      # Celebração do primeiro export de README para o GitHub
    ├── ReengagementEmail.tsx     # Digest para usuários inativos há 15+ dias
    ├── AppDisconnectedEmail.tsx  # Alerta de segurança: GitHub App desconectada/permissão revogada
    ├── StarThankYouEmail.tsx     # Agradecimento a apoiadores que estrelaram o repositório (+ badge VIP)
    └── RequestStarEmail.tsx      # Pedido amigável de estrela para quem usa o GitAscii no perfil
```

### Endpoints da API

- `GET /api/email/unsubscribe?token=...`: Processa descadastro via link e redireciona para `/unsubscribe?status=success`.
- `POST /api/email/unsubscribe`: Suporte a **RFC 8058 One-Click Unsubscribe** para clientes de email (Gmail, Apple Mail).
- `POST /api/email/reengagement`: Endpoint seguro (protegido por `CRON_SECRET`) para envio agendado em lote de reengajamento.
- `POST /api/email/request-star`: Endpoint seguro (protegido por `CRON_SECRET`) para envio em lote de pedido de star para usuários ativos.
- `/unsubscribe`: Página visual de confirmação de descadastro e preferências.

---

## 2. Variáveis de Ambiente Necessárias

| Variável              | Descrição                               | Exemplo / Padrão                          | Obrigatória?           |
| :-------------------- | :-------------------------------------- | :---------------------------------------- | :--------------------- |
| `RESEND_API_KEY`      | Chave de API do Resend                  | `re_123456789...`                         | Sim (em produção)      |
| `EMAIL_FROM`          | Remetente com domínio verificado        | `GitAscii <team@gitascii.com>`            | Não (tem fallback)     |
| `EMAIL_REPLY_TO`      | Email para respostas do usuário         | `GitAscii Support <support@gitascii.com>` | Não (tem fallback)     |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação                   | `https://gitascii.com`                    | Não (tem fallback)     |
| `SESSION_SECRET`      | Segredo para assinatura dos tokens HMAC | String aleatória (min 32 chars)           | Sim (em produção)      |
| `CRON_SECRET`         | Token Bearer para rotinas agendadas     | String secreta                            | Não (para cron seguro) |

---

## 3. Eventos que Disparam Emails

Para manter a experiência do desenvolvedor respeitosa e livre de ruído, **o GitAscii dispara apenas eventos criteriosamente mapeados**:

### 1. Primeiro Login (Boas-Vindas)

- **Gatilho:** Conclusão bem-sucedida do fluxo GitHub OAuth (`/api/auth/callback`).
- **Objetivo:** Dar as boas-vindas ao desenvolvedor, apresentar os 3 passos de criação e fornecer o link direto para seu editor pessoal.
- **Idempotência:** Chave `welcome-email/${username}` (enviado no máximo **1 vez** na história da conta).
- **Execução:** Assíncrona e não-bloqueante (`void emailService.sendWelcomeEmail(...)`).

### 2. Primeiro Export / Publicação no README

- **Gatilho:** Conclusão com sucesso do commit do widget SVG no repositório `username/username` (`/api/github/commit`).
- **Objetivo:** Celebrar a publicação do README, entregar o link do endpoint dinâmico, explicar o funcionamento do cache do GitHub Camo e sugerir recursos avançados (slugs adicionais, animação da Snake).
- **Idempotência:** Chave `first-export/${username}` (enviado apenas **1 vez** no primeiro commit).
- **Execução:** Assíncrona e não-bloqueante.

### 3. Alerta de Segurança: GitHub App Desconectada / Permissão Revogada

- **Gatilho:** Tentativa de commit/export onde o token da GitHub App está ausente ou inválido (`/api/github/commit`).
- **Objetivo:** Avisar o desenvolvedor que o GitAscii não consegue atualizar o repositório `username/username` e fornecer um botão de 1 clique para reinstalar a GitHub App.
- **Idempotência & Cooldown:** Chave `app-disconnected/${username}` com cooldown de **7 dias** para não enviar repetidamente em caso de múltiplos cliques.
- **Execução:** Assíncrona e não-bloqueante.

### 4. Agradecimento por Star no Repositório (Open Source Backer)

- **Gatilho:** Quando o usuário estrela o repositório oficial do GitAscii (`POST /api/github/star`).
- **Objetivo:** Agradecer de forma autêntica o apoio open-source e entregar um badge Markdown exclusivo para o README.
- **Idempotência:** Chave `star-thank-you/${username}` (enviado **1 única vez**).
- **Execução:** Assíncrona e não-bloqueante.

### 5. Pedido Amigável de Star para Usuários com README Ativo

- **Gatilho:** Rotina agendada (`POST /api/email/request-star`) para desenvolvedores que utilizam o GitAscii no perfil e ainda não deram estrela.
- **Objetivo:** Pedido educado e transparente destacando que o projeto é 100% gratuito e open-source.
- **Idempotência:** Chave `request-star/${username}` (enviado no máximo **1 única vez**; se a pessoa já deu estrela ou recebeu o email, não envia).

### 6. Reengajamento (Inatividade >= 15 dias)

- **Gatilho:** Rotina agendada ou API (`POST /api/email/reengagement`) para contas sem edições recentes.
- **Objetivo:** Apresentar novidades relevantes do produto (novos widgets como Contribution Snake, Cartas GitFut, badges de integração) e incentivar a atualização do perfil.
- **Frequência & Cooldown:** No máximo **1 vez a cada 30 dias** para usuários inativos há pelo menos 15 dias.

---

## 4. Como Enviar Emails

Todas as chamadas devem ser feitas exclusivamente através do singleton `emailService`, importado de `@/lib/email`. **Nunca instancie `Resend` diretamente em rotas ou componentes avulsos.**

### Exemplo: Enviar Alerta de Desconexão da App

```typescript
import { emailService } from '@/lib/email'

void emailService.sendAppDisconnectedEmail({
  username: session.username,
  name: session.name,
  email: session.email,
  installUrl: 'https://github.com/apps/gitascii/installations/new',
  repoName: `${session.username}/${session.username}`,
})
```

### Exemplo: Enviar Agradecimento por Star

```typescript
import { emailService } from '@/lib/email'

void emailService.sendStarThankYouEmail({
  username: session.username,
  name: session.name,
  email: session.email,
})
```

---

## 5. Regras Antispam, Idempotência e Segurança

1. **Idempotency Keys Obrigatórias:**
   Todas as chamadas do SDK Resend incluem `{ idempotencyKey: '<tipo>/<id>' }`. Isso impede envios duplicados mesmo em caso de retentativas de rede em até 24h.
2. **Ledger Interno de Eventos:**
   O `ledger.ts` verifica se o evento já ocorreu na vida do usuário antes de realizar requisições externas ao Resend.
3. **Cabeçalhos de Unsubscribe (RFC 8058):**
   Todos os emails incluem `List-Unsubscribe` e `List-Unsubscribe-Post: List-Unsubscribe=One-Click` com URLs assinadas por HMAC.
4. **Proteção de Dados Sensíveis:**
   - Nunca faça log de tokens OAuth, chaves de API ou segredos nos templates ou no console.
   - Mensagens de erro são tratadas com `error.message` genérico no cliente e capturadas no Sentry sem expor PII.
5. **Nunca Bloquear a Experiência do Usuário:**
   Falhas no envio de email nunca devem quebrar a autenticação, a edição ou o commit no GitHub.

---

## 6. Como Testar Emails Localmente

Execute o conjunto de testes automatizados:

```bash
# Executa todos os testes de email (tokens, ledger, renderização React Email e rotas)
npx vitest run src/lib/email
```

_Nota:_ Se `RESEND_API_KEY` não estiver configurada no ambiente de desenvolvimento local, o `emailService` ignora o disparo silenciosamente (`skipped: true`), garantindo que os fluxos funcionem offline sem erros.
