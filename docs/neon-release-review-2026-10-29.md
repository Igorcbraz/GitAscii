# Revisão antes do novo ciclo — 29/10/2026

## Não há garantia de 100 CU-h apenas com as correções de cache

Os commits `6a5140d` e `1e15c6a` já estão no Git; a árvore estava limpa no início
desta revisão. Eles corrigem fontes evitáveis, mas não constituem um limitador
global de compute. O cache público protege dois contadores, não todas as consultas.

O MCP de controle continua reportando 396077 segundos de compute (110,02 CU-h),
com endpoint `idle` e suspensão em 18/10. A falta de consumo adicional com a cota
já esgotada não prova economia das alterações ainda não publicadas.

## Riscos que permanecem

- `recordProfileView` verifica `isProUser` em cada requisição de badge; o cache de
  permissões é local e curto. Instâncias novas voltam ao Postgres. Para Pro, os
  eventos são persistidos no banco. Proxies e bots também fazem esses acessos.
- Leitura de configuração pública, regras dinâmicas, sessões autenticadas e
  operações MCP ainda acessam Postgres. Um cliente consultando ferramentas
  periodicamente pode mantê-lo ativo; apenas o `ping` é isento de SQL.
- A proteção de desenvolvimento não cobre previews compilados em modo production.
  Previews/CI devem receber um banco isolado, sem credenciais do projeto produtivo.
- Processos externos, monitores SQL e agendas fora deste repositório não são
  controlados pelo cache da aplicação.

Para desacoplar badges do Postgres, a próxima mudança estrutural é uma fila
durável com processamento em lotes, idempotência e recuperação após falhas.
Ela precisa preservar autorização e todos os eventos aceitos; simplesmente
estender o cache Pro ou descartar telemetria altera garantias do produto.
Essa arquitetura não foi implementada nesta revisão.

## Correção adicional

As rotas `/api/email/reengagement` e `/api/email/request-star` permitiam execução
sem credencial quando CRON_SECRET/EMAIL_CRON_SECRET não existia. Agora retornam
503 se o segredo estiver ausente/vazio e 401 se a credencial não conferir, antes
de ler o corpo ou chamar o serviço. Chamadas autorizadas continuam funcionando.
Não há evidência de que essas rotas tenham causado o consumo histórico.

Validação local: 50 testes passaram em cinco arquivos, cobrindo as rotas,
autorização antes do serviço, contadores compartilhados e polling inativo.
Credenciais de Postgres e do provedor de e-mail foram removidas do processo de
teste. Nenhum e-mail foi enviado e nenhuma configuração Neon foi alterada.

## Critérios verificáveis para o deploy

1. Configurar Redis compartilhado e testar sua conexão; não compartilhar as
   chaves/cache produtivos com previews. O cache não consulta Postgres quando
   Redis falha, mas os contadores podem mostrar zero ou valores antigos.
2. Publicar os commits. Manter MCP desabilitado até aplicar e validar sua migração
   e OAuth no ambiente apropriado. Não usar banco produtivo em testes/CI.
3. Conferir agendadores e monitores: testar disponibilidade HTTP sem consultar SQL.
4. Observar um período sem chamadas ao banco maior que cinco minutos e confirmar
   `idle` pela API de controle. Não fazer SELECT para verificar suspensão.
5. Medir deltas de compute em períodos de 24h: alvo de 2,7 CU-h/dia, abaixo do teto
   de 3,33 CU-h/dia em novembro. Consumo baixo em um dia não garante os demais.

O mínimo de 0,25 CU ligado o dia inteiro custa 6 CU-h/dia. Mesmo fixar o máximo
em 0,25 CU não resolve: 30 dias continuamente ativo custam 180 CU-h. Uma garantia
absoluta exige restringir atividade ao atingir um orçamento, incluindo qualquer
outro cliente do banco; isso não foi habilitado porque o objetivo é preservar
o uso legítimo do aplicativo.

Reset informado pelo projeto: 01/11/2026 00:00 UTC, 31/10 às 21h em São Paulo.
Fonte: [Neon Scale to Zero](https://neon.com/docs/introduction/scale-to-zero).
