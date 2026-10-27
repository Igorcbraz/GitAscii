# Neon: diagnóstico de consumo de compute

Análise de 16/10/2026, horário de São Paulo. Projeto `GitAscii`
(`royal-sunset-77743254`), branch `production`, endpoint `ep-flat-hall-ac5hrmwt`.
Dados de consumo retornados pelo MCP com atualização em 16/10 às 22:19:01.

Atualização e contrato de testes: [verificação de 26/10](neon-compute-verification-2026-10-26.md).

## Resultado confirmado

| Medida                                              |                    Resultado |
| --------------------------------------------------- | ---------------------------: |
| Plano retornado pela API                            |                    `free_v3` |
| Compute consumido no ciclo de outubro               |                  101,52 CU-h |
| Tempo ativo acumulado                               |                     379,65 h |
| Tempo transcorrido desde o início do ciclo          |                     385,32 h |
| Fração do ciclo com compute ativo                   |                       98,53% |
| Compute mínimo / máximo                             |                  0,25 / 2 CU |
| Consumo explicado pelo mínimo durante o tempo ativo | 94,91 CU-h (93,49% do total) |
| Consumo acima desse piso                            |                    6,61 CU-h |
| Média de CU enquanto ativo                          |                       0,2674 |
| Projeção linear para 31 dias, se mantido o ritmo    |                  196,03 CU-h |

Neon contabiliza capacidade alocada multiplicada pelo tempo ativo, não somente
os segundos executando SQL. Em 0,25 CU, ficar ligado 24 horas custa 6 CU-h/dia:
100 CU-h acabam em aproximadamente 16 dias e 16 horas mesmo sem grandes picos.
Ficar ligado todo o mês de 31 dias custaria pelo menos 186 CU-h.

O gráfico não foi inspecionado visualmente: o 0,25 relatado é compatível com o
tamanho mínimo em CU ou com 0,25 CU-h em cada intervalo de uma hora. Se fosse
literalmente 0,25 CU-h por dia, isso não explicaria o total observado.

## Configuração e evidências

- Há apenas uma branch e um compute atuais; o consumo dessa branch corresponde
  ao total retornado para o projeto.
- `suspend_timeout_seconds = 0` significa usar o padrão de cinco minutos. Não
  significa suspensão desativada: esse caso seria `-1`. No Free, o prazo é fixo.
- Replicação lógica está desativada. Na amostra de extensões de `gitascii`, só
  `plpgsql` está instalada; não há um job de `pg_cron` instalado nesse banco.
  Os processos internos do provedor vistos em `pg_stat_activity` não demonstram
  uma tarefa agendada da aplicação.
- Nas 300 operações recentes, entre 02/10 e 16/10, 148 pares suspensão/retomada
  somaram apenas 1,91 hora de suspensão. O maior intervalo desses pares foi de
  6 minutos e 30 segundos. É uma amostra limitada de operações, não uma série
  completa de cobrança nem prova do motivo de cada suspensão.
- A amostra de conexões não mostrou uma conexão persistente da aplicação além
  das consultas de diagnóstico. Uma amostra pontual não exclui tráfego HTTP
  frequente e de curta duração.
- O cliente do projeto usa `neon()` por HTTP. Trocar um pool ou reduzir o teto
  de 2 CU não elimina o piso de 94,91 CU-h já explicado pelo tempo ativo.
- `.env.local` contém os hosts pooled e direto desse mesmo endpoint de produção;
  `.neon` também seleciona `production`. Desenvolvimento local pode consumir a
  mesma franquia. Não foram alteradas credenciais ou arquivos de ambiente.

## Caminhos do código que podem impedir períodos ociosos

1. `src/features/pro/components/overview/OverviewDashboard.tsx` consulta o
   overview a cada 30 segundos. `AnalyticsDashboard.tsx` consulta analytics a
   cada 15 segundos, com atualização automática habilitada inicialmente.
   Antes da correção, ambos continuavam consultando com a aba oculta.
2. `src/constants/metrics.ts` revalida as métricas públicas a cada 300 segundos
   quando há acessos. `getLoggedInUsersCount()` podia executar `COUNT(*)` no
   Postgres a cada revalidação quando a consulta ao GitHub não fornecia o total.
   `getProSocialProof()` tinha cache de dez minutos, mas não armazenava listas
   vazias. Esses acessos podem manter o banco ativo mesmo com pouco SQL.
3. `src/features/pro/server/entitlements.ts` consulta Postgres para permissões
   com cache em memória de apenas 30–60 segundos. O cache não é compartilhado
   entre instâncias. `recordProfileView()` verifica essas permissões inclusive
   antes de descartar eventos de perfis gratuitos.
4. `src/features/pro/server/analyticsStore.ts` persiste eventos de perfis Pro
   diretamente no Postgres. Tráfego contínuo de badges pode impedir suspensão.

Os itens acima são mecanismos verificados no código local, não uma atribuição
percentual de tráfego de produção. Não foi comprovado qual versão local está
publicada. `pg_stat_statements` não está instalada; os contadores agregados das
tabelas não identificam rota, cliente ou distribuição diária. Nenhuma extensão
foi instalada e nenhuma configuração ou dado de produção foi modificado.

## Correções locais preparadas

- Contagem pública de usuários: cache Redis de uma hora, inclusive para zero.
- Lista pública de clientes Pro: cache de uma hora, inclusive listas vazias.
- Falhas de consulta Pro propagadas até a camada de cache para não confundir
  indisponibilidade com uma lista realmente vazia. A reserva compartilhada de uma
  hora permanece mesmo se a consulta ou a gravação do snapshot falhar.
- Atualização periódica de overview e analytics pausada quando a página não
  está visível ou após dois minutos sem interação, inclusive em uma aba visível.
  Retoma no próximo intervalo após interação ou retorno à aba.

Os contadores públicos podem demorar aproximadamente uma hora para refletir
mudanças, mais o cache externo já existente. Permissões Pro, cobrança, dados
privados, fontes, estilos, animações e Google Analytics permanecem como antes.
Redis precisa estar configurado e saudável no ambiente publicado: o fallback
em memória do projeto não oferece cache compartilhado entre Workers.

Essas correções reduzem causas evitáveis, mas não garantem 100 CU-h/mês se o
tráfego restante continuar atingindo Postgres durante todo o dia. Uma aba
visível com atualização automática também continua gerando consultas.

## Orçamento e próximos passos

1. Publicar as correções após revisão. Conferir em produção se o cache Redis
   funciona e se há erros `[ProRedis]`. As alterações locais ainda não economizam
   compute no site publicado.
2. Usar banco local para desenvolvimento; alternativamente, um ambiente Neon
   separado com seu próprio orçamento. Outra branch dentro deste projeto não
   resolve o compartilhamento da franquia do projeto.
3. Conferir monitores externos e tarefas agendadas: consultas ao banco a cada
   cinco minutos ou menos podem impedir suspensão. Nenhum workflow com nome ou
   descrição `GitAscii` foi encontrado no n8n acessível; isso não exclui outros
   agendadores nem workflows com outro nome.
4. Se os badges forem a principal fonte de tráfego, projetar agregação durável
   de eventos e gravação em lotes, com idempotência e recuperação de falhas.
   Não simplesmente descartar eventos nem reutilizar o Redis de permissões como
   autorização: o código atual exige Postgres como fonte autoritativa.
5. Medir o delta de `compute_time_seconds / 3600` entre duas leituras diárias do
   MCP/API de controle do Neon. Essa consulta de consumo não precisa executar
   SQL nem acordar o compute. Não foi criada uma automação nesta análise.

| Meta para 31 dias                                  |                                               Limite |
| -------------------------------------------------- | ---------------------------------------------------: |
| Média máxima de consumo diário                     |                                        3,23 CU-h/dia |
| Tempo ativo máximo a 0,25 CU                       |                                          12,90 h/dia |
| Tempo ativo máximo na média observada de 0,2674 CU |                                          12,06 h/dia |
| Meta inicial com margem                            | 10 h ativas/dia (~82,90 CU-h/mês na média observada) |

A franquia já utilizada não é recuperada pelas correções. A API informa o
próximo reset em `2026-11-01T00:00:00Z`, equivalente a 31/10 às 21h de São Paulo.
Embora o consumo reportado já exceda 100 CU-h, o endpoint ainda aceitou as
leituras desta análise; isso não garante disponibilidade até o reset.

## Fontes e validação

- MCP Neon: `describe_project`, `list_branches`, `list_postgres_endpoints`,
  `list_operations`, `list_postgres_databases` e consultas somente de leitura
  a `pg_stat_activity`, `pg_stat_database`, `pg_stat_user_tables`, `pg_extension`.
- [Neon Scale to Zero](https://neon.com/docs/introduction/scale-to-zero)
- [Configuração de Scale to Zero](https://neon.com/docs/guides/scale-to-zero-guide)
- [Especificação da API: SuspendTimeoutSeconds](https://neon.com/api_spec/release/v2.json)
- A validação inicial de seis testes foi ampliada; veja o relatório de 26/10.
- `npm run typecheck` e ESLint nos arquivos de código alterados passaram.
