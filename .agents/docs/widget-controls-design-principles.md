# Widget Controls Design Principles

> Guia conceitual para qualquer modelo que precise melhorar os controles de um widget no editor.
> Não descreve botões específicos — descreve o **raciocínio** por trás de cada categoria de controle.

---

## O que é um widget "profissional" no editor?

Um widget bem configurável não é apenas aquele que tem muitas opções — é aquele cujas opções são organizadas em **camadas de controle progressivo**. O usuário deve conseguir chegar a um resultado satisfatório rapidamente, mas também ter poder para ajuste fino quando quiser.

Um widget profissional oferece controle sobre quatro dimensões fundamentais:

1. **O que é exibido** (seleção de conteúdo)
2. **Como é organizado** (layout)
3. **Como aparece** (estilo visual)
4. **Quanto espaço ocupa** (dimensão/tamanho)

---

## Dimensão 1 — Seleção de Conteúdo (Filtros)

**Conceito:** O widget deve expor seu conteúdo como um conjunto de itens togláveis ou selecionáveis, não como uma caixa preta que exibe tudo ou nada.

### Princípios:

- **Visibilidade granular**: cada elemento relevante do widget (métrica, linguagem, campo de metadado, repositório) deve poder ser ligado/desligado individualmente. Não usar um único campo de texto "ocultar X,Y,Z".

- **Seleção positiva vs negativa**: dependendo do contexto, o controle pode ser de dois tipos:
  - _Exclusão_ — o padrão é mostrar tudo, o usuário marca o que quer esconder (ex: linguagens de programação ruidosas como HTML, CSS).
  - _Inclusão_ — o padrão é mostrar nada, o usuário escolhe o que quer destacar (ex: repositórios específicos do perfil).

- **Ordem importa**: quando o usuário seleciona itens manualmente (seleção inclusiva), a ordem de seleção deve ser preservada e refletida no output. O primeiro selecionado aparece primeiro.

- **Modo automático como fallback**: quando nenhum item for selecionado manualmente, o widget deve cair num comportamento automático sensato (ex: top N por popularidade, por data, por nome). Esse fallback deve ser configurável.

- **Busca/filtro local**: quando a lista de itens possíveis é longa (ex: lista de repositórios, lista de linguagens), oferecer um campo de busca para filtrar por nome antes de selecionar. Não limitar a lista a um número fixo arbitrário — usar scroll.

- **Quick actions**: para listas frequentes (linguagens comuns, métricas padrão), oferecer atalhos de seleção rápida (chips/pills pré-definidos) ao lado da seleção manual. Reduz fricção para o caso mais comum.

---

## Dimensão 2 — Layout

**Conceito:** O mesmo conjunto de dados pode ser apresentado de maneiras radicalmente diferentes. Oferecer variantes de layout é essencial porque cada usuário tem preferências estéticas e o espaço disponível no canvas varia.

### Princípios:

- **Variantes de estrutura**: todo widget com múltiplos itens deve oferecer ao menos duas variantes de organização estrutural. Exemplos de eixos de variação:
  - Horizontal (lado a lado) vs Vertical (empilhado) vs Grid (matriz N×M)
  - Lista corrida vs Cards individuais
  - Gráfico de barras vs Lista com barras vs Compacto sem barras vs Circular (donut/pizza)

- **Layout impacta o conteúdo exibível**: alguns campos de metadado só fazem sentido em certos layouts (ex: uma descrição longa cabe numa lista vertical, mas não num grid compacto). O painel de controles deve mostrar/esconder opções relevantes conforme o layout ativo.

- **Variantes não são só estéticas**: layouts diferentes implicam densidades de informação diferentes. Um modo "compacto" esconde detalhes; um modo "lista" os expõe. O usuário deve poder escolher a troca entre densidade e legibilidade.

- **Botões de layout como seleção exclusiva**: nunca usar um `<select>` para layout — usar botões visuais (picker), preferencialmente com ícone representativo do padrão visual. O estado ativo deve ser imediatamente distinguível.

---

## Dimensão 3 — Estilo Visual

**Conceito:** Layout e estilo são coisas diferentes. Layout é sobre estrutura (onde as coisas ficam). Estilo é sobre aparência (como as coisas parecem). Um widget pode ter o mesmo layout mas estilos completamente distintos.

### Princípios:

- **Estilos são "temas visuais" do widget**: não são paletas de cor globais — são variações na tipografia, decoração, e linguagem visual. Exemplos de eixos de estilo:
  - _Default_ — apresentação padrão, tipicamente números grandes com rótulo abaixo
  - _Terminal/Monospace_ — estilo CLI com brackets, fontes monoespaçadas, letras maiúsculas
  - _Minimalista_ — apenas dados, sem rótulos, sem bordas, sem decoração
  - _Cards_ — cada item em um card com borda, sombra, e estrutura própria
  - _Bold/Destaque_ — valores grandes com contraste alto, tipicamente para hero sections

- **Estilo visual é ortogonal ao layout**: idealmente, qualquer estilo deve funcionar com qualquer layout. Quando isso não for possível (ex: estilo "donut" só faz sentido sem layout horizontal), esconder opções incompatíveis dinamicamente.

- **Estilo afeta o SVG gerado**: cada variante de estilo deve ter uma lógica de renderização própria no engine. Não é só CSS — é SVG/markup diferente.

- **Picker de estilo deve dar preview**: sempre que possível, mostrar uma miniatura ou representação textual ASCII de como ficará o resultado. Isso acelera a decisão do usuário sem precisar selecionar para ver.

---

## Dimensão 4 — Redimensionamento Automático

**Conceito:** Quando o usuário muda layout, quantidade de itens, ou campos visíveis, o tamanho do widget no canvas deve se adaptar automaticamente. Não deve existir conteúdo cortado nem espaço vazio excessivo após uma mudança de configuração.

### Princípios:

- **Toda mudança estrutural deve recalcular tamanho**: mudanças que afetam a quantidade ou organização dos elementos visuais do widget (layout, count, campos ativos) devem disparar um recálculo de altura e, eventualmente, largura.

- **Fórmulas de altura são determinísticas**: cada layout deve ter uma fórmula clara baseada nos parâmetros configurados. Exemplos:
  - Layout vertical com N itens: `altura = padding_top + N × altura_item + padding_bottom`
  - Grid 2 colunas com N itens: `altura = padding_top + ceil(N/2) × (altura_item + gap) + padding_bottom`
  - Layout horizontal: `altura = constante` (não varia com N, pois todos ficam na mesma linha)

- **Largura geralmente é preservada**: o usuário pode ter ajustado a largura manualmente. O auto-resize normalmente só altera altura, a menos que o layout mude de forma que a largura mínima não faça sentido.

- **Não registrar resize no histórico de undo**: o redimensionamento automático por mudança de config deve usar `recordHistory = false` para não poluir o histórico de undo/redo com operações de resize que o usuário não fez conscientemente.

- **O engine de renderização deve ser coerente com as fórmulas**: as dimensões calculadas no painel de controle devem corresponder ao espaço efetivamente usado pelo SVG gerado. Se o SVG usa `50 + n * 64` de altura, o widget deve ter exatamente essa altura.

---

## Padrões de UX para Controles

Além das quatro dimensões, há princípios de UX que se aplicam a qualquer painel de controle de widget:

### Progressão de disclosure

Agrupe controles em ordem de impacto. O que o usuário vai querer configurar primeiro deve aparecer primeiro. Configurações avançadas podem vir depois, ou estar colapsadas.

### Controles inline vs modais

Preferir controles inline (sliders, switches, buttons, selects) a abrir modais ou dialogs. O usuário deve ver o resultado em tempo real no canvas enquanto ajusta.

### Nunca usar emojis como ícones funcionais

Emojis são inconsistentes entre plataformas e sistemas operacionais. Sempre usar ícones vetoriais (ex: Lucide React) para representar ações ou categorias. Emojis podem aparecer como conteúdo de dados (ex: nome de repositório), nunca como elemento de UI.

### Altura fixa para containers dinâmicos

Containers que mudam de tamanho (lista de pills, lista de seleções) devem ter altura máxima com overflow scroll. Nunca deixar um container crescer indefinidamente e empurrar o restante do painel — isso causa layout shift que desorientam o usuário.

### Feedback do estado atual

O painel sempre deve refletir o estado atual da config. Se o widget não tem repos selecionados, mostrar "Nenhum selecionado — exibe automaticamente". Se tem 2 de 4 selecionados, mostrar "2/4 selecionados". O usuário deve entender o modo atual sem olhar para o canvas.

### Controles condicionais

Algumas opções só fazem sentido em determinados estados. Exemplo: "Posição da legenda" só é relevante no layout Donut. "Ordenar por" só é relevante quando nenhum repositório está selecionado manualmente. Mostrar/esconder esses controles dinamicamente reduz a carga cognitiva.

---

## Relação entre Painel de Controles e Engine de Renderização

O painel de controles **escreve** valores no objeto de config do widget (`WidgetConfig`). O engine de renderização **lê** esses valores para gerar o SVG.

Para cada nova feature de controle, o ciclo é:

```
1. Definir a nova propriedade de config (ex: statsStyle: 'terminal')
2. Adicionar o controle no painel que escreve essa propriedade
3. Atualizar o case do widget no WidgetRenderer para ler e aplicar a propriedade
4. Garantir que o resize automático considera o efeito dessa propriedade no tamanho final
```

Nenhum dos quatro passos pode ser feito isoladamente. Um controle sem renderização não tem efeito. Uma renderização sem controle não é acessível. Um resize sem fórmula correta gera conteúdo cortado ou espaço vazio.

---

## Checklist para Melhoria de Qualquer Widget

Ao receber a tarefa de "profissionalizar" um widget, verificar:

- [ ] **Filtros**: o usuário pode controlar granularmente o que é exibido?
- [ ] **Seleção**: existe modo automático + modo manual? A ordem de seleção é preservada?
- [ ] **Busca**: se a lista for longa, existe campo de busca?
- [ ] **Layout**: existem ao menos 2 variantes estruturais? Os botões são visuais (não select)?
- [ ] **Estilo**: existem variantes visuais além do default? Há preview?
- [ ] **Campos extras**: o usuário pode ligar/desligar metadados opcionais (ex: forks, data, descrição)?
- [ ] **Resize automático**: mudanças de config recalculam o tamanho do widget no canvas?
- [ ] **Fórmula de altura**: a fórmula usada no painel coincide com o espaço usado no SVG?
- [ ] **Controles condicionais**: opções irrelevantes em certos estados são escondidas?
- [ ] **Sem emojis**: todos os elementos de UI usam ícones vetoriais?
- [ ] **Containers com scroll**: listas dinâmicas têm max-height com overflow scroll?
- [ ] **Sem history pollution**: resizes automáticos usam `recordHistory = false`?
