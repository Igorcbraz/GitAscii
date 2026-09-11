# Auditoria de performance e custo — GitAscii na Cloudflare

Data da análise: 11 de setembro de 2026

## Resumo executivo

## Estado após a implementação

As recomendações de baixo risco e maior retorno desta auditoria foram aplicadas em 11 de setembro de 2026. O cache de SVG usa agora a Cache API nativa do Worker, com chave normalizada, e foi confirmado em produção: a mesma URL passou de `MISS` em 8,63 s para `HIT` em 0,20 s na borda GRU. Não usar `kvDataAdapter()` globalmente foi uma decisão deliberada: ele aumentou subrequests de forma incompatível com o orçamento do Worker; o namespace criado para esse teste não está ligado ao Worker.

Também foram removidos o túnel do Sentry e referências de runtime à Vercel, reduzido o prefetch secundário, deduplicada a sessão do cliente, priorizados Redis/Neon sobre GitHub no caminho de renderização, adicionados TTLs de memória e de fallback GitHub, reduzida a amostragem de telemetria e habilitados Smart Placement e logs amostrados. As seções abaixo preservam o diagnóstico e o plano arquitetural para futuras evoluções; itens marcados como “recomendados” não significam necessariamente pendentes da migração concluída.

A migração já está funcional, e a base escolhida é boa: o projeto usa Vinext sobre Cloudflare Workers, entrega os arquivos compilados como Static Assets e já habilita o `cdnAdapter()` para ISR. O maior risco, porém, não é tráfego de arquivos estáticos. Na Cloudflare, Static Assets são gratuitos e ilimitados; o gargalo do plano Free são as invocações do Worker — 100.000 por dia — e apenas 10 ms de CPU por requisição HTTP. Uma visita atual à landing pode provocar várias invocações adicionais, então a cota pode acabar muito antes de 100.000 page views. ([Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [limites de Workers](https://developers.cloudflare.com/workers/platform/limits/))

As cinco ações de maior retorno são:

1. reduzir as requisições por visita: unificar a consulta de sessão, desligar prefetch de rotas pouco prováveis, corrigir o poster 404 e não tunelar Sentry pelo Worker;
2. adicionar o cache distribuído de dados do Vinext em Workers KV, porque hoje apenas o cache de páginas está configurado;
3. retirar o GitHub do caminho síncrono de geração do SVG: hoje cada cache miss pode tentar até quatro URLs sem cache e ainda escrever no banco/Redis;
4. tratar o SVG como artefato materializado, servindo versões prontas como asset/objeto e regenerando apenas em mudança ou expiração;
5. medir invocações, CPU, subrequests, status do cache e erros antes de aplicar Smart Placement ou Cloudflare Images indiscriminadamente.

## O que já está correto

- `wrangler.jsonc` entrega `dist/client` como Static Assets. Isso coloca JS, CSS, imagens e vídeo no caminho gratuito da plataforma.
- `vite.config.ts` já usa `cdnAdapter()`, portanto o ISR de páginas pode usar a Cache API da Cloudflare.
- Há `revalidate` coerente em páginas públicas: 1 hora na home/perfis e 10 minutos no explore.
- As rotas autenticadas e de escrita estão marcadas como dinâmicas, o que evita servir conteúdo privado do cache compartilhado.
- O vídeo de apresentação usa `preload="none"`, evitando baixar 9 MB automaticamente.
- O cliente de PostgreSQL usa o driver HTTP serverless da Neon; isso é mais adequado a Workers do que conexões TCP persistentes.

## Diagnóstico por prioridade

### P0 — reduzir invocações desperdiçadas

#### 1. Existe consulta duplicada de sessão

`Hero.tsx` e `Navbar.tsx` consultam `/api/auth/session` separadamente. `UserMenuDropdown.tsx` também tem sua própria consulta. Na landing, isso já foi observado como duas chamadas idênticas. Cada chamada dinâmica é outra invocação do Worker, leitura de cookie e possível acesso ao backend.

Refatoração recomendada: carregar a sessão uma vez no layout/server component e distribuí-la por um provider, ou manter um único hook com deduplicação (SWR/React Query) e chave global. Para usuário anônimo, a sessão inicial pode vir no payload RSC, eliminando o round trip do navegador.

Impacto esperado: menos 1–2 invocações por visita, menor hidratação e menos latência visual no botão de login.

#### 2. Prefetch automático abre rotas sem intenção do usuário

O navegador observado carregou `/pro`, `/terms` e `/privacy` durante uma visita à home. Prefetch é útil para navegação provável, mas não compensa em links de rodapé ou páginas dinâmicas no plano Free.

Refatoração recomendada:

- usar `prefetch={false}` em links de rodapé, autenticação, dashboard e páginas de baixa probabilidade;
- preservar prefetch apenas em uma ou duas ações principais;
- confirmar no DevTools que nenhuma rota dinâmica é buscada antes da interação.

#### 3. O túnel do Sentry transforma telemetria em tráfego do Worker

`next.config.ts` define `tunnelRoute: '/monitoring'`. Assim, eventos enviados pelo navegador passam pelo GitAscii antes de chegar ao Sentry. Isso contorna bloqueadores, mas consome invocações, CPU e subrequests — exatamente a cota que precisa ser preservada.

Refatoração recomendada: remover o túnel e enviar diretamente ao endpoint de ingestão do Sentry, salvo se a captura através de ad blockers for um requisito de negócio. Remover também `automaticVercelMonitors`, que é específico da Vercel e não oferece benefício neste build.

#### 4. O poster do vídeo não existe

`InteractiveEditorDemo.tsx` referencia `/presentation.png`, mas esse arquivo não está em `public/`. Cada 404 pode cair no Worker por causa de `not_found_handling: "none"`, além de deixar o vídeo sem poster.

Refatoração recomendada: criar um poster WebP/AVIF leve ou apontar para um asset existente. Meta sugerida: 40–100 KB.

#### 5. A demonstração da landing faz trabalho caro cedo demais

A landing busca `/api/Igorcbraz`; essa rota pode consultar GitHub, configuração e cache do SVG. Carregá-la antes de a demonstração ficar visível converte page views em chamadas caras.

Refatoração recomendada: renderizar um SVG estático da demonstração no build e buscar a versão dinâmica apenas depois de interação explícita. Se precisar de atualização, regenerar esse asset no deploy ou por job agendado.

### P0 — corrigir o caminho crítico do SVG

#### 6. Todo cache miss privilegia o GitHub, sem permitir cache HTTP

`profileSvgService.ts` chama `loadProfileConfig(..., { bypassMemory: true, preferGitHub: true })`. Em seguida, `profileStorage.ts` tenta até quatro URLs `raw.githubusercontent.com`, acrescenta `?t=${Date.now()}` e usa política equivalente a `no-store`. Isso impede qualquer reaproveitamento na borda e pode consumir boa parte do limite de 50 subrequests por invocação.

Além disso, encontrar uma configuração no GitHub dispara gravações no PostgreSQL e no Redis dentro de uma leitura/renderização. Uma requisição pública deixa de ser uma simples leitura e vira sincronização distribuída.

Refatoração recomendada:

1. Redis/DB passa a ser a fonte rápida para renderização;
2. GitHub é sincronizado por webhook, ação do usuário ou refresh em background;
3. fallback ao GitHub usa URL estável, `ETag`/`If-None-Match` e cache negativo curto para 404;
4. persistir somente quando o hash do conteúdo mudar;
5. limitar tentativas: branch/local conhecidos primeiro, sem quatro requests sequenciais em toda expiração.

Esse é provavelmente o maior ganho de latência e confiabilidade do projeto.

#### 7. A estratégia atual tem caches sobrepostos

O SVG passa por cache em memória do isolate, Upstash Redis, Cache API do Vinext e possivelmente cache do navegador/CDN. O cache em memória é oportunista: isolates podem desaparecer e não compartilham estado. O Redis compartilhado é útil, mas cada hit ainda faz operações remotas e compressão/descompressão com `node:zlib`, trabalho significativo diante do teto de 10 ms de CPU do Free.

Modelo recomendado:

- L1: CDN/asset pronto, antes da lógica de geração;
- L2: Workers KV ou R2 para payload SVG já materializado;
- geração: somente no miss real, mudança de configuração ou webhook;
- Redis: metadados transacionais, rate limit e estado Pro, não duplicação geral de payload grande;
- memória do isolate: otimização opcional, nunca requisito de correção.

Para grande volume, a arquitetura mais econômica é publicar `username/slug/version.svg` como objeto estático e apontar uma chave pequena para a versão ativa. Assim, a maioria das visualizações deixa de executar o renderizador. Cache dentro do Worker reduz CPU e upstream, mas continua contando como invocação do Worker. ([preços de Workers](https://developers.cloudflare.com/workers/platform/pricing/))

#### 8. Os headers de stale-while-revalidate não fazem o que sugerem

O SVG envia combinações como `s-maxage=3600, stale-while-revalidate=7200`. Na interpretação documentada pela Cloudflare, `s-maxage` implica `proxy-revalidate` e desabilita o comportamento stale-while-revalidate. ([Cache-Control](https://developers.cloudflare.com/cache/concepts/cache-control/), [revalidação](https://developers.cloudflare.com/cache/concepts/revalidation/))

Refatoração recomendada: separar a política do navegador da política da Cloudflare. Exemplo conceitual:

```http
Cache-Control: public, max-age=300
Cloudflare-CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=7200
ETag: "..."
```

Validar a sintaxe final em staging e conferir `CF-Cache-Status`, `Age` e comportamento após expiração. A Cloudflare recomenda o header específico para controlar a borda sem repassar a mesma política ao navegador. ([CDN-Cache-Control](https://developers.cloudflare.com/cache/concepts/cdn-cache-control/))

#### 9. O ETag é calculado tarde

O código só compara `If-None-Match` depois de recuperar ou gerar o payload. O cliente recebe 304, mas o Worker já fez a parte cara. O ETag deve derivar de uma versão barata — hash da configuração, geração ativa ou chave do objeto — consultada antes do SVG completo.

### P1 — completar o cache nativo do Vinext

#### 10. Falta o adaptador de cache de dados

O projeto configura apenas:

```ts
cache: {
  cdn: cdnAdapter()
}
```

O Vinext oferece `kvDataAdapter()` para `fetch` com revalidação, `unstable_cache` e APIs equivalentes do Next. Sem ele, caches usados em métricas, instalações do GitHub e perfis comunitários não têm persistência global confiável entre isolates. ([integração oficial Vinext/Cloudflare](https://github.com/cloudflare/vinext/blob/main/packages/cloudflare/README.md))

Implementação sugerida:

- criar namespace KV e binding `VINEXT_KV_CACHE`;
- adicionar `data: kvDataAdapter()` ao `vite.config.ts`;
- começar com TTLs maiores para dados globais e baixa cardinalidade;
- não colocar sessão, autorização, dashboard privado ou respostas por cookie nesse cache;
- monitorar writes: KV Free tolera muito mais leituras que gravações, portanto revalidações de alta cardinalidade precisam de TTL longo ou outra estratégia.

Antes de liberar, testar invalidação por tag e impedir que respostas mockadas por falha do GitHub sejam gravadas como dados reais.

#### 11. Fazer warm-up seletivo no deploy

O Vinext suporta aquecer o CDN após o deploy. Usar o recurso apenas para `/`, `/explore`, textos estáticos e um conjunto pequeno de rotas realmente populares; aquecer milhares de usuários gastaria exatamente as requisições que se pretende poupar. ([README do adaptador](https://github.com/cloudflare/vinext/blob/main/packages/cloudflare/README.md))

### P1 — bundle e frontend

O build cliente tem aproximadamente 23,2 MiB em 205 arquivos. Os maiores itens observados foram:

| Item                 | Tamanho aproximado | Ação                                                            |
| -------------------- | -----------------: | --------------------------------------------------------------- |
| `presentation.mp4`   |            9,1 MiB | manter lazy; produzir versão curta/720p eficiente e poster real |
| `og-image-pt-br.png` |            5,0 MiB | recomprimir para 1200×630; alvo abaixo de 400 KB                |
| chunk de i18n        |           1,33 MiB | carregar apenas o locale atual por import dinâmico              |
| chunk `mockProfile`  |           0,81 MiB | mover fixture para servidor/asset ou gerar compactamente        |
| `EditorLayout`       |           0,63 MiB | lazy-load somente ao abrir o editor                             |
| CSS global           |           0,24 MiB | auditar estilos não usados e escopo de bibliotecas              |

Static Assets não aumentam a conta por request, mas afetam LCP, transferência móvel e taxa de saída do usuário. Por isso, a prioridade financeira é reduzir invocações; a prioridade de UX é dividir i18n/editor/mock e otimizar mídia.

Cloudflare Images pode ser integrado ao `next/image` pelo `imagesOptimizer()`. O Free inclui 5.000 transformações únicas por mês; depois disso, novas variantes falham, embora variantes já armazenadas continuem disponíveis. Portanto, use um conjunto fechado de tamanhos e qualidades, nunca dimensões arbitrárias vindas da query string. ([Cloudflare Images](https://developers.cloudflare.com/images/pricing/), [Images binding](https://developers.cloudflare.com/images/optimization/binding/))

Não é necessário inventar uma pipeline própria de Brotli: a Cloudflare já negocia Brotli/Zstandard/Gzip na borda. ([compressão](https://developers.cloudflare.com/speed/optimization/content/compression/))

### P1 — proteção contra abuso e explosão de cardinalidade

Rotas públicas de SVG aceitam combinações de username, tema, template e widgets. Sem normalização, pequenas variações de ordem, caixa, parâmetros inúteis ou timestamps produzem chaves diferentes e forçam regeneração.

Aplicar antes da chave de cache:

- lowercase e limites rígidos para username/slug;
- allowlist de temas, templates e widgets;
- ordenar/deduplicar widgets;
- descartar parâmetros desconhecidos;
- limitar tamanho total da query e quantidade de widgets;
- cache negativo curto para usuário/config inexistente;
- nunca cachear respostas mockadas de upstream como sucesso duradouro.

Criar Rate Limiting Rules para rotas de maior CPU e autenticação. O recurso existe no plano Free, embora com opções mais restritas; proteger primeiro `/api/*`, geração de SVG e callbacks sensíveis. ([Rate Limiting Rules](https://developers.cloudflare.com/waf/rate-limiting-rules/))

Ativar Tiered Cache/Smart Topology para reduzir fetches repetidos ao origin em conteúdo cacheável. Está disponível no Free. Cache Reserve é pago e não é prioridade para este caso. ([Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/), [Cache Reserve](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/))

### P2 — localização, banco e runtime

#### Smart Placement

Smart Placement pode aproximar execução de backends regionais e está disponível em todos os planos, mas deve ser medido. GitAscii mistura GitHub global, Upstash REST e Neon HTTP; não existe uma única região obviamente ideal para todas as operações. Ative primeiro num Worker separado para rotas de backend ou em staging, compare p50/p95 e reverta se a latência ao usuário piorar. A plataforma pode levar tráfego e alguns minutos para aprender a melhor posição. ([Smart Placement](https://developers.cloudflare.com/workers/configuration/placement/))

#### Hyperdrive

Hyperdrive é excelente para drivers PostgreSQL tradicionais e bancos regionais, mas o projeto já usa `@neondatabase/serverless` via HTTP. Não adicionar apenas por existir: primeiro medir tempo/quantidade das consultas. Se migrar para `pg`/conexão direta, aí Hyperdrive passa a ser uma opção real para pooling e cache de consultas. ([bancos externos em Workers](https://developers.cloudflare.com/workers/databases/third-party-integrations/))

#### Separar responsabilidades

Se o tráfego crescer, separar:

- Worker web: páginas, auth e APIs leves;
- Worker/render pipeline: geração e atualização de SVG;
- armazenamento de objetos: SVGs materializados;
- webhook/queue/job: sincronização GitHub e regeneração.

Isso melhora isolamento de falhas e observabilidade. No Free, contudo, Workers continuam compartilhando a cota da conta; a separação por si só não cria mais requisições gratuitas.

### P2 — observabilidade orientada à cota

Ativar Workers Logs com amostragem, não 100%. No Free, Logs e Traces têm 200.000 eventos por dia e retenção de 3 dias; traces começam a ser cobrados em 1º de outubro de 2026 segundo a documentação atual. Uma configuração inicial razoável é 5% de logs e 1% de traces, mantendo erros sempre que possível. ([Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/), [traces](https://developers.cloudflare.com/workers/observability/traces/))

Dashboard mínimo:

- requisições totais/dia e por rota;
- CPU p50/p95/p99 e erros 1102;
- status 429/5xx;
- subrequests por rota;
- hit ratio de CDN, KV e Redis;
- latência e erro de GitHub, Neon e Upstash;
- bytes/tamanho de SVG;
- cardinalidade de chaves por username/query;
- invocações por page view real.

Definir alertas em 50%, 75% e 90% da cota diária. O objetivo principal é “invocações por visita”, não apenas Core Web Vitals.

### P2 — resíduos da migração

- Os OG defaults ainda apontam para `git-ascii.vercel.app`; trocar para `https://gitascii.com/...`.
- Textos de widgets/comparações ainda dizem “Vercel Edge”.
- Política de privacidade e README ainda citam Vercel como hospedagem.
- `automaticVercelMonitors` permanece no Sentry.
- A geolocalização de analytics tenta ler região/cidade/timezone como headers; em Workers, os dados completos ficam em `request.cf`. Adaptar o tipo/entrada para usar esse objeto.
- URLs `*.vercel.app` de serviços externos de widgets não são necessariamente resíduos: são provedores terceiros e só devem ser removidas quando houver substituto.

## Plano de execução sugerido

### Fase 1 — um dia, baixo risco

1. remover Sentry tunnel e configuração Vercel;
2. unificar sessão;
3. desligar prefetch de links secundários/dinâmicos;
4. corrigir `/presentation.png`;
5. trocar URLs/textos próprios da Vercel;
6. ativar logs amostrados e registrar baseline por 24–48 h.

Critério de sucesso: home anônima faz no máximo uma invocação dinâmica além do documento, idealmente nenhuma após o HTML cacheado.

### Fase 2 — dois a quatro dias, maior retorno

1. instalar/configurar `kvDataAdapter()`;
2. classificar cada uso de `unstable_cache` por TTL, cardinalidade e privacidade;
3. remover `Date.now()`/`no-store` da leitura pública do GitHub;
4. tornar Redis/DB a leitura principal e GitHub uma sincronização condicional;
5. corrigir headers e ETag do SVG;
6. normalizar parâmetros e adicionar rate limits.

Critério de sucesso: um SVG quente não chama GitHub, Neon nem Upstash e consome CPU mínima; um miss não faz quatro buscas sequenciais.

### Fase 3 — arquitetura de escala

1. materializar SVGs como objetos versionados;
2. regenerar por webhook/mudança/TTL, não por visualização;
3. lazy-load de i18n/editor/mock;
4. testar Images com variantes fechadas;
5. testar Smart Placement com comparação p95;
6. considerar o plano Workers Paid quando tráfego ou CPU justificar.

## Free versus Paid: decisão objetiva

O plano Free é sustentável se a maior parte do site for estática e as rotas dinâmicas ficarem bem abaixo de 100.000 invocações/dia e 10 ms de CPU. Renderização SSR/SVG com compressão e múltiplos backends pode ultrapassar 10 ms mesmo com pouco tráfego. A própria documentação observa que workloads com SSR/parsers frequentemente usam 10–20 ms. ([limites](https://developers.cloudflare.com/workers/platform/limits/))

O Workers Paid custa a partir de US$ 5/mês e inclui 10 milhões de requisições mensais e 30 milhões de CPU-ms, sem cobrança adicional de egress do Worker. Ele não substitui as otimizações acima, mas remove o risco operacional do corte rígido diário e permite CPU compatível com o renderizador. ([preços](https://developers.cloudflare.com/workers/platform/pricing/))

Recomendação: executar Fases 1 e 2 no Free, medir uma semana e definir um gatilho. Migrar para Paid se qualquer condição ocorrer:

- projeção recorrente acima de 70.000 invocações/dia;
- p95 de CPU acima de 8 ms;
- erros 1102 ou 429;
- crescimento exige enfraquecer rate limits ou cache;
- receita/uso Pro torna indisponibilidade mais cara que US$ 5/mês.

## Resultado esperado

Com as mudanças de Fase 1, uma visita anônima deixa de gerar várias chamadas auxiliares. Com a Fase 2, caches do Next/Vinext passam a sobreviver entre isolates e a geração pública deixa de sincronizar GitHub/DB a cada expiração. Com a materialização da Fase 3, o caminho mais acessado — visualização de SVG — pode ser servido majoritariamente como conteúdo pronto, que é o modelo mais rápido e econômico na Cloudflare.

## Fontes principais

- [Cloudflare Workers — limites](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers — preços](https://developers.cloudflare.com/workers/platform/pricing/)
- [Static Assets — cobrança e limitações](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Vinext — adaptadores Cloudflare](https://github.com/cloudflare/vinext/blob/main/packages/cloudflare/README.md)
- [Cloudflare Cache](https://developers.cloudflare.com/cache/)
- [Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Workers Observability](https://developers.cloudflare.com/workers/observability/)
