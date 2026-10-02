# Medição do site e funil Pro

Atualizado em 2026-09-29. Este plano mede decisões comerciais; a telemetria dos perfis README em `/pro/analytics` é um produto separado e não exibe este funil.

## Configuração

1. Configure `NEXT_PUBLIC_GA_MEASUREMENT_ID` para carregar GA4 em todas as páginas com consentimento `granted` por padrão. Todos os eventos do site para GA4 são mapeados de forma contínua. Microsoft Clarity é a única integração condicionada ao consentimento do usuário.
2. Configure `GA_MEASUREMENT_PROTOCOL_API_SECRET` **apenas no servidor** para receber `purchase`, `checkout_expired` e `checkout_payment_failed` a partir de webhooks Stripe. Crie o segredo em GA4 → Administrador → Fluxos de dados → seu fluxo web → Segredos da API do Measurement Protocol.
3. Confirme que o endpoint `/api/webhooks/stripe` recebe `checkout.session.completed`, `checkout.session.expired` e `payment_intent.payment_failed`. O webhook já exige assinatura. O Stripe é a fonte de verdade da compra; retorno à página `/pro?checkout=success` não cria uma venda no GA4.
4. Em GA4, marque `purchase` como evento principal. Crie dimensões de escopo evento para `checkout_provider`, `entry_point`, `reason`, `failure_reason`, `stage`, `location` e `destination` se quiser usá-las nas explorações. `currency`, `value`, `items` e `transaction_id` são parâmetros de comércio eletrônico.
5. Monte uma exploração de funil com `view_item` → `begin_checkout` → `checkout_opened` → `purchase`; segmente por origem de tráfego, dispositivo e país. Compare `checkout_cancelled`, `checkout_expired`, `checkout_error` e `checkout_feedback` fora do funil de compras.

## Eventos implementados

| Evento                    | Gatilho                                    | Significado                                                                                                                       |
| ------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `page_view`               | entrada e mudança de rota                  | Página visitada; parâmetros sensíveis da URL são removidos, preservando apenas UTM.                                               |
| `cta_clicked`             | CTA instrumentado na landing               | Interesse por origem do CTA e destino.                                                                                            |
| `open_editor`             | envio do formulário do hero                | Início da navegação para o editor.                                                                                                |
| `view_item`               | paywall Pro exibido                        | Oferta vista, identificada pelo item.                                                                                             |
| `begin_checkout`          | clique para adquirir Pro                   | Intenção de compra, antes de login ou requisição, identificada pelo item.                                                         |
| `checkout_opened`         | URL de checkout recebida                   | Redirecionamento iniciado para Stripe ou checkout externo. Não comprova que a página externa carregou.                            |
| `checkout_error`          | falha ao criar a sessão                    | Erro técnico anterior ao checkout.                                                                                                |
| `checkout_cancelled`      | retorno do botão de cancelamento Stripe    | A pessoa voltou voluntariamente ao site; não representa todo abandono.                                                            |
| `checkout_feedback`       | resposta opcional após cancelamento        | Motivo declarado, em categorias fixas; ausência de resposta fica desconhecida.                                                    |
| `checkout_expired`        | webhook assinado Stripe                    | Sessão de checkout expirou sem concluir. Expiração ocorre depois do prazo definido no Stripe, não no instante em que a aba fecha. |
| `checkout_payment_failed` | webhook assinado Stripe                    | Tentativa de pagamento falhou, com `failure_reason` vindo de um código Stripe. A pessoa ainda pode tentar novamente e comprar.    |
| `purchase`                | webhook assinado com `payment_status=paid` | Compra confirmada. `transaction_id` é o ID da sessão Stripe e o valor vem do Stripe.                                              |

## Atribuição e limites

O navegador envia `client_id` e `session_id` do GA4 ao criar a sessão Stripe quando GA4 está ativo. O servidor valida esses identificadores e os associa à sessão Stripe; o webhook usa os mesmos dados para vincular compra e expiração ao tráfego de origem. Não envie email, nome de usuário, detalhes do cartão ou texto livre ao GA4. O segredo do Measurement Protocol nunca vai para o navegador.

`view_item` e `begin_checkout` não enviam valor: o preço exibido pode variar por idioma, enquanto a seleção final de preço ocorre no servidor. Somente `purchase` contabiliza receita com o total e a moeda confirmados pelo Stripe.

Sessões criadas antes da configuração do segredo não geram eventos de webhook no GA4. Checkouts externos configurados por `PRO_CHECKOUT_URL`/`STRIPE_CHECKOUT_URL` não têm sessão Stripe criada por este código e, portanto, não fornecem `purchase` nem `checkout_expired` por este fluxo. A taxa de abandono do Stripe deve ser calculada por coortes de sessões, após aguardar expiração, e comparada com as vendas reais no Stripe. `checkout_opened` indica redirecionamento; não prova que o Stripe carregou. `checkout_feedback` mede apenas quem cancelou, retornou e respondeu, então não representa todos os motivos de perda.

O envio do webhook para GA4 é de melhor esforço: falhas são registradas no servidor sem bloquear a concessão de acesso Pro. Reconcilie periodicamente o número de compras do GA4 com o Stripe; o Stripe permanece a fonte de verdade financeira.

## Validação antes de publicar

Use ambiente de teste Stripe e propriedade GA4 de teste. Com consentimento aceito, verifique uma única `page_view` por rota, uma `view_item` no paywall, `begin_checkout` e `checkout_opened` ao clicar, `checkout_cancelled` no retorno, e `checkout_feedback` após escolher uma opção. Confirme `purchase` pelo webhook de pagamento e `checkout_expired` pelo webhook de expiração, sem duplicação quando o Stripe reenviar o mesmo evento. Compare o total de `purchase` com o Stripe por `transaction_id`. Em localhost, o provedor registra eventos no console e não configura a tag para enviar eventos.
