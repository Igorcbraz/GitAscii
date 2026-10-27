# Compute Neon: correções e limites verificáveis

## Evidência de produção

Leitura em 26/10 pelo MCP de controle, sem executar SQL: `compute_time_seconds=396077`
(110,02 CU-h), `active_time_seconds=1483852` (412,18 horas). Última atividade
reportada: 18/10 às 07:58 UTC. Esses acumulados não medem o efeito das mudanças
locais, ainda não publicadas. A análise histórica está no
[diagnóstico de 16/10](neon-compute-audit-2026-10-16.md).

O piso de 0,25 CU ligado continuamente consome 6 CU-h/dia e esgota 100 CU-h
em 16 dias e 16 horas. Não é necessário um pico. A suspensão já usa o padrão
de cinco minutos; chamadas periódicas podem reiniciar essa contagem.

## Correções

- Contadores públicos de usuários e clientes Pro compartilham snapshots no Redis
  por uma hora, incluindo zero e listas vazias. Uma reserva `SET NX EX` permite
  somente um carregador por chave por hora, inclusive entre instâncias frias.
- A reserva não é apagada em falhas de Postgres ou da gravação do snapshot.
  Sem Redis acessível não há fallback para consultas ao banco: usa-se o último
  valor válido por até 24 horas ou zero. O fallback em memória do adaptador geral
  não participa dessa decisão. Dados públicos podem ficar temporariamente desatualizados.
- Overview e analytics param o polling em abas ocultas e após dois minutos sem
  interação. Uma aba esquecida em primeiro plano também deixa de consultar.
  Interação/retorno à aba retoma o próximo intervalo. Consultas lentas não se sobrepõem.
- `next dev` recusa conexões Neon implícitas. Use Postgres local; para um projeto
  Neon de desenvolvimento intencional, configure `GITASCII_ALLOW_NEON_IN_DEVELOPMENT=true`.
  Outra branch no mesmo projeto ainda compartilha a franquia. Produção não é bloqueada.

## O que os testes garantem

O contrato do cache foi exercitado com concorrência de 100 leitores/instâncias,
reinícios, expiração, valores vazios, snapshots inválidos, perda de resposta do Redis,
falhas de leitura/reserva/gravação e falha da fonte. Uma simulação de 31 dias com
instância nova a cada minuto executa 744 carregamentos por contador, em vez de 44.640.
O teto depende de todas as instâncias usarem este código e o mesmo Redis, sem remoção
ou eviction das chaves de reserva. Não confundir número de consultas com CU-h.

O teste de integração em Redis real passou com 20 clientes independentes: um único
carregamento, um novo após expiração e nenhum repetido após falha de gravação.
Usou somente quatro chaves aleatórias de teste, removidas ao final, e uma fonte
simulada. Não acessou Postgres de produção.

Testes de polling cobrem pausa oculta, um dia de inatividade visível, retomada,
desmontagem, consulta lenta e rejeição. Testes do cliente comprovam o bloqueio de
Neon em desenvolvimento e as exceções explícitas/local/produção.

Comandos reproduzíveis:

```sh
npm run test:compute-cache
npm run test:compute-cache:browser
# Exige credenciais Redis explícitas no ambiente; nunca consulta Postgres:
npm run test:compute-cache:redis
npm run test:mcp
npm run typecheck
npm run lint
```

No Windows sem Chromium do Playwright, use `CACHE_TEST_BROWSER_CHANNEL=chrome`.
O servidor dos testes de navegador remove as credenciais antes de carregar Next.

Validação em 26/10: suíte completa com 461 testes, dos quais 459 passaram na
sandbox. Os dois testes SSRF impedidos pelo DNS restrito passaram na repetição
com rede (28/28 nesse arquivo). Depois, sete testes MCP passaram, incluindo
dois novos cenários de keepalive; total de 463 casos distintos validados.
Os dois testes Playwright passaram no Chrome com APIs simuladas respondendo 503,
exercitando também o polling quando o backend está indisponível. A visibilidade
e o relógio são controlados pelo teste; não é uma medição de economia em produção.

O build revelou uma incompatibilidade anterior na rota `/api/pro/subscribe`: o
parâmetro `Request` opcional não é aceito pelo validador de rotas do Next 16.3.4.
Foi tornado obrigatório, sem alterar o comportamento HTTP. Typecheck e os 14
testes das APIs Pro passaram após essa correção.
Build de produção Next.js com webpack concluído, incluindo as 66 páginas estáticas,
usando `node scripts/start-cache-verification-server.mjs --build` sem credenciais
de produção. ESLint passou e a auditoria Storybook terminou com zero componentes
sem cobertura por stories diretas ou compostas.

## O que ainda depende da operação

Não existe garantia de 100 CU-h com tráfego arbitrário. Login, permissões Pro,
publicação, edição, autenticação MCP e gravação de telemetria continuam usando o
banco quando solicitados. Badges podem receber proxies/bots sem uma pessoa no site;
monitores, clientes SQL externos e jobs de outros ambientes também podem acordá-lo.
Nenhuma tarefa recorrente de manutenção/keepalive foi adicionada pelo MCP.
O `ping` do protocolo MCP é público, sem dados de conta, e não executa SQL.

Após publicar, conferir snapshots Redis e ausência de avisos `[PublicCounterCache]`.
Em um período sem uso real, fechar painéis, clientes SQL e processos de desenvolvimento
e verificar suspensão pelo painel/API de controle, sem fazer `SELECT 1` para monitorar.
Medir consumo por delta de `compute_time_seconds`, não pelo tempo das queries.
Meta com margem: até 2,7 CU-h/dia; teto médio de 3,23 para 31 dias ou 3,33 para
novembro (30 dias). Se o compute continuar ativo sem uso, correlacionar timestamps
dos requests de produção com as retomadas antes de mexer em permissões ou descartar eventos.

Reset informado: 01/11/2026 00:00 UTC, ou 31/10 às 21h em São Paulo. Commit local
não muda produção: é necessário publicar as correções para economizar no novo ciclo.
O MCP tem migração própria e deve ser habilitado somente após validação em staging,
conforme [guia do MCP](mcp.md). Nenhuma migração de produção foi executada nesta tarefa.
