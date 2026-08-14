# Resolvendo Erros do Sentry e Marcando como Concluídos

Este documento descreve como um agente deve proceder para analisar, corrigir e marcar erros do Sentry como resolvidos utilizando o servidor MCP do Sentry.

## 1. Identificar o Erro

Primeiro, localize o erro no Sentry. Você pode buscar issues usando a ferramenta do MCP:

- `search_issues`: Busque issues de um projeto específico para entender o que está falhando (ex: usando `query` para filtrar por tags, status, etc.).
- `search_events`: Caso precise de detalhes específicos de um evento que causou o erro.

## 2. Analisar o Problema

Ao identificar o issue, leia os detalhes do stack trace e do evento para entender a causa raiz.

- Use `analyze_issue_with_seer` se precisar de uma análise automatizada mais profunda.
- Navegue pelo código do projeto e faça as edições necessárias para corrigir o bug reportado.

## 3. Corrigir o Código

Faça as modificações nos arquivos locais utilizando suas ferramentas normais de edição de código e teste as alterações se possível.

## 4. Atualizar o Status no Sentry

Após aplicar a correção e garantir que o problema foi solucionado, você deve atualizar o status do issue no Sentry.

- Utilize a ferramenta `update_issue` do MCP do Sentry.
- Passe o `issue_id` correto.
- Defina o `status` como `resolved`.

**Exemplo de fluxo:**

1. MCP Tool: `search_issues` -> Retorna `issue_id: 12345` relacionado a um erro de "NullPointerException".
2. Edita e conserta o código.
3. MCP Tool: `update_issue` com argumentos `{ "issue_id": "12345", "status": "resolved" }`.

Lembre-se sempre de documentar o que foi alterado e por que a solução foi aplicada ao atualizar o status.
