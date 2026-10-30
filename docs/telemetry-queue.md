# Telemetria em lotes para reduzir tempo ativo no Neon

Com Postgres configurado, badges passam a enfileirar eventos reduzidos no Redis.
Não consultam permissões nem incrementam Postgres individualmente. Uma requisição
ao badge pode iniciar um lote, no máximo uma janela por hora, compartilhada por
todas as instâncias. Sem eventos, o processamento não faz SQL.

## Antes de publicar

1. Configurar `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` no servidor.
   Use Redis persistente, sem eviction das chaves da fila/reserva, e credenciais
   diferentes em previews. Não há fallback em memória ou gravação direta no banco.
2. Aplicar a migração aditiva `013_telemetry_batch_receipts` no ambiente de staging,
   validar e depois aplicar no banco de produção antes do deploy. A migração foi
   testada com SQL real no PGlite; não foi executada em produção nesta implementação.
   `npm run db:migrate` mostra as pendências; `npm run db:migrate -- --apply` aplica
   todas as pendentes ao banco configurado. Conferir hostname e lista antes de aplicar.
3. Publicar a aplicação. Sem a tabela, a gravação falha e o lote fica no Redis;
   não surge um fallback de consultas por badge. Corrigir a migração antes de esgotar a fila.
4. Opcional: agendar POST `/api/internal/telemetry-flush` a cada hora, enviando
   `Authorization: Bearer <TELEMETRY_CRON_SECRET>` (ou `CRON_SECRET`). O agendador
   usa o mesmo orçamento horário; não o ignora. Segredo ausente retorna 503;
   credencial incorreta, 401. Não foi criado agendador externo nesta tarefa.

Sem agendador, o último lote aguarda outro acesso ao badge. A operação sob demanda
funciona sem configuração extra, mas não promete entrega em uma hora na ausência
de tráfego. Uma fila acumulada também aumenta o atraso do painel.

## Contrato de persistência

- Lua move até 500 eventos da lista pendente para um lote em processamento de modo
  atômico. O ID e conteúdo desse lote são preservados até a confirmação.
- Uma instrução SQL grava o recibo e todos os agregados na mesma transação.
  Repetir o mesmo ID não soma novamente. Falhas SQL revertem recibo e contadores.
- Redis só remove o lote após sucesso SQL. Se a resposta/remoção falhar, o mesmo
  lote é repetido na próxima janela. Eventos novos continuam na lista pendente.
- Há até dez lotes (5.000 eventos) por janela, com prazo cooperativo de 20 segundos
  para iniciar novos lotes. Falhas não liberam a reserva de uma hora. O prazo não
  cancela uma instrução SQL já em andamento e não representa teto de CU-h.
- Limite de 20.000 eventos pendentes mais até 500 em processamento. Ao atingir o
  limite, novos eventos são recusados e há aviso no log; os já aceitos são mantidos.
  Redis indisponível impede aceitar novos eventos. O badge continua sendo servido,
  como antes em falhas de telemetria. Não há promessa de entrega de eventos que
  não chegaram a ser aceitos, nem de recuperação após perda/eviction do Redis.
- Não expirar, limpar ou compartilhar essas chaves com testes: prefixo
  `gitascii:{telemetry-v1}`. Não apagar recibos SQL enquanto puder haver repetição
  de lotes antigos. Recibos guardam somente UUID e data, não detalhes do visitante.

## Privacidade e permissões

A fila temporária guarda nome/slug do perfil público, horário de recebimento,
categoria de origem, tipo de tráfego e status. Não guarda IP, user-agent bruto,
URL/domínio arbitrário de referência, geografia ou identificador de visitante.
São requisições de imagem, não visitantes humanos únicos.

A elegibilidade Pro é verificada no SQL ao processar. Eventos de contas gratuitas,
inexistentes ou recebidos antes da última atualização do entitlement Pro não geram
agregados. Um downgrade antes do processamento descarta também os eventos pendentes
dessa conta. As exceções administrativas `PRO_USERNAMES`/`PRO_ADMIN_USERS` continuam
valendo. A fila de dados reduzidos existe antes dessa decisão; permissões de acesso
aos painéis e operações pagas continuam autoritativas como antes.

## Validação

`npm run test:telemetry-queue` verifica concorrência entre instâncias, orçamento
horário, fila vazia, falhas SQL/Redis, confirmação perdida, retomada, privacidade e
autorização do endpoint. O teste PGlite executa os agregados e o recibo em SQL,
incluindo rollback e repetição concorrente, sem Postgres de produção.

`npm run test:telemetry-queue:redis` exige credenciais Redis e usa três chaves
aleatórias removidas no final. Valida Lua real, 20 concorrentes e repetição do mesmo
ID após falha de confirmação; a gravação Postgres é simulada nesse teste.

Validação em 29/10/2026: a suíte abrangente passou com 100 testes em 17 arquivos.
A revisão adicionou mais dois casos para planos Team/Enterprise; os cinco testes
SQL passaram novamente. Typecheck e lint passaram. O teste com Redis real passou
com 20 chamadas concorrentes e removeu suas três chaves temporárias. Nenhum desses
testes executou consultas no Postgres de produção.

Isso reduz os acessos dos badges. Configurações públicas, regras dinâmicas, login,
operações MCP e clientes externos ainda podem acordar o banco. Medir consumo e
suspensão após o deploy; não é uma garantia global de 100 CU-h por mês.
