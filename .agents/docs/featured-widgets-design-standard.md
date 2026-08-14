# Padrão de Estilo para Widgets em Destaque (`Featured Widgets`)

Este documento define os princípios visuais, diretrizes de design e padrões de implementação para cards de **Widgets em Destaque** (`[ FEATURED WIDGETS ]`) na barra lateral/biblioteca do GitAscii.

---

## 🎯 1. Propósito e Filosofia

A seção de **Featured Widgets** é a vitrine premium do GitAscii. Diferente dos widgets padrão da listagem (que usam layout utilitário uniforme), os widgets em destaque têm a missão de **chamar atenção imediatamente**, transmitindo qualidade artesanal, identidade visual única e interatividade avançada.

> [!IMPORTANT]
> **Anti-Padrão "IA-Made"**: Evite gradientes escuros genéricos com blur excessivo, luzes pulsantes aleatórias no meio de ícones ou botões que parecem cards de dashboard genérico. Cada widget em destaque deve parecer um **item temático autêntico**, construído sob medida com física tátil e acabamento refinado.

---

## 📐 2. Anatomia Visual de um Featured Widget

Um card de destaque deve ser composto por **6 camadas integradas**:

```
┌──────────────────────────────────────────────────────────────┐
│  1. CHASSI EXTERNO (Gradiente temático + Borda 3D + Sombra)  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 2. TOP BAR / HARDWARE ACCENTS (Status LEDs / Badges)   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 3. TELA / CORPO INTERNO (Matriz de pontos / Scanlines) │  │
│  │  [ Ícone Vetorial Custom ]  [ Título + Info ]   [ + ]  │  │
│  └────────────────────────────────────────────────────────┘  │
│  4. PRISMATIC FOIL SWEEP (Reflexo holográfico no hover)      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧩 3. As 6 Camadas de Construção

### 1. Chassi & Material Temático (Outer Shell)

- **Dimensões e Densidade**: Compacto e denso (`p-2.5 rounded-xl` ou `rounded-lg my-1.5`) para respeitar o ritmo vertical da sidebar e não ocupar espaço excessivo.
- **Borda e Profundidade**: Borda sólida temática (`1.5px` a `2px solid <cor-tematica>`) com realces internos em inset:
  ```css
  boxshadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.4)';
  ```
- **Elevação Tátil**: Efeito de elevação suave no hover (`hover:-translate-y-0.5` ou `hover:-translate-y-1` com `hover:scale-[1.01]`).

### 2. Identidade e Acentos de Hardware (Top Bar / Accents)

- **Indicadores de Status**: Detalhes em escala micro que agregam sofisticação técnica, tais como:
  - Lentes óticas / sensores com reflexo vítreo especular.
  - Mini LEDs de diagnóstico (ex: Cyan, Ruby Red, Amber, Emerald).
  - Códigos seriais ou carimbos seriais em fonte mono (`font-jetbrains-mono text-[8.5px] uppercase`).
  - Ranhuras de ventilação / texturas mecânicas.

### 3. Tela / Display Interno (Inner Screen)

- **Textura de Fundo Subtil**:
  - Matriz de pontos retro (`radial-gradient(<cor> 1px, transparent 1px)` com `backgroundSize: '4px 4px'`).
  - Ou linhas de difração holográfica / CRT scanlines discretas (`opacity-15` a `opacity-25`).
- **Contraste e Legibilidade**: Fundo escuro de alto contraste (`#0b1219` ou `#08080d`), permitindo que a tipografia e o ícone se destaquem com máxima clareza.

### 4. Ícone / Mascote Vetorial sob Medida

- **Construção Vetorial**: Ícone geométrico artesanal (ex: Poké Bola clássica, emblema de festival, selo holográfico) renderizado com proporções exatas.
- **Acabamento Limpo**: Evitar brilhos incandescentes ou glows fortes no centro do ícone; priorizar acabamento limpo, metálico ou fosco.
- **Micro-Interação**: Rotação suave ou escala no hover (`group-hover:rotate-12 group-hover:scale-105 transition-transform duration-300`).

### 5. Tipografia e Informações

- **Título**: Fonte em caixa alta ou peso expressivo (`font-jetbrains-mono font-bold text-xs text-white uppercase`), com transição de cor no hover para a cor de destaque do tema.
- **Subtítulo / Descrição**: Opcional. Se presente, texto conciso em `text-[10px]` com cor complementar e `truncate`.
- **Badges**: Quando aplicável, badges discretos com borda fina e sombra suave.

### 6. Shimmer / Efeito Holográfico no Hover

- **Foil Sweep Diagonal**: Gradiente linear inclinado que cruza o card ao passar o mouse:
  ```tsx
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30">
    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 via-amber-300/20 via-cyan-300/15 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
  </div>
  ```

### 7. Gatilho de Ação Padronizado

- **Botão de Adição**: Manter sempre o ícone padrão de `+` (`<Plus size={15} />`) em `text-white/60 group-hover:text-white transition-colors duration-300 p-1 shrink-0` para manter a consistência de interação com todos os outros widgets do sistema.

---

## 📋 4. Exemplo de Referência: Pokédex / Pokémon Card

```tsx
if (item.id === WIDGET_IDS.POKEMON_CARD) {
  return (
    <div
      key={item.id}
      onClick={() => addWidget(item.id)}
      data-testid={`add-widget-${item.id}`}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setHoveredWidget({ item, rect })
      }}
      onMouseLeave={() => setHoveredWidget(null)}
      className="group relative w-full rounded-lg transition-all duration-300 ease-out overflow-hidden cursor-pointer my-1.5 transform hover:-translate-y-0.5 select-none shadow-[0_4px_16px_rgba(197,32,40,0.3)] hover:shadow-[0_8px_24px_rgba(220,38,38,0.5)]"
      style={{
        background: 'linear-gradient(180deg, #d8232a 0%, #a8131b 60%, #850c12 100%)',
        border: '1.5px solid #5a070c',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {/* 1. Holographic Foil Sweep */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 via-amber-300/25 via-cyan-300/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>

      {/* 2. Top Hardware Bar */}
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-black/25 bg-black/15 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="relative w-3.5 h-3.5 rounded-full bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 border border-white/80 shadow-[0_0_6px_rgba(56,189,248,0.7)] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/90 absolute top-0.5 left-0.5 blur-[0.2px]" />
          </div>
          <div className="flex items-center gap-1 pl-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] border border-black/40 shadow-[0_0_3px_rgba(255,59,48,0.7)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] border border-black/40 shadow-[0_0_3px_rgba(255,204,0,0.7)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#34c759] border border-black/40 shadow-[0_0_3px_rgba(52,199,89,0.7)]" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-jetbrains-mono text-[8.5px] font-bold text-white/80 tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            PKMN // TCG-025
          </span>
          <div className="flex gap-0.5 opacity-60">
            <div className="w-0.5 h-2 bg-black/60 rounded-full" />
            <div className="w-0.5 h-2 bg-black/60 rounded-full" />
            <div className="w-0.5 h-2 bg-black/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* 3. Inner Screen */}
      <div className="p-1.5 relative z-10">
        <div className="relative rounded-md p-2 bg-[#0b1219] border border-[#1e2d3d] shadow-[inset_0_1px_6px_rgba(0,0,0,0.8)] overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '4px 4px',
            }}
          />

          <div className="relative z-10 flex items-center justify-between gap-2.5">
            {/* 4. Custom Poké Ball */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#e53e3e] via-[#e53e3e] to-[#ffffff] border-[1.5px] border-[#1a202c] shadow-[0_1px_6px_rgba(0,0,0,0.6)] relative overflow-hidden group-hover:rotate-12 transition-transform duration-300">
                <div className="absolute top-0 left-0 right-0 h-[48%] bg-[#e53e3e]" />
                <div className="absolute bottom-0 left-0 right-0 h-[48%] bg-white" />
                <div className="absolute top-1/2 left-0 right-0 h-[14%] bg-[#1a202c] -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border border-[#1a202c] flex items-center justify-center shadow-xs">
                  <div className="w-1 h-1 rounded-full bg-[#cbd5e1]" />
                </div>
              </div>
            </div>

            {/* 5. Typography */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-jetbrains-mono font-bold text-xs text-white tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {item.name}
                </h4>
              </div>
              {item.desc && (
                <p className="font-jetbrains-mono text-[10px] text-cyan-300/80 group-hover:text-cyan-200 transition-colors truncate mt-0.5 tracking-tight">
                  {item.desc}
                </p>
              )}
            </div>

            {/* 6. Standard Action Icon */}
            <div className="text-white/60 group-hover:text-white transition-colors duration-300 p-1 shrink-0">
              <Plus size={15} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🚫 5. O que NÃO Fazer (Checklist de Qualidade)

- ❌ **Não use gradientes sem estrutura física**: Botões que são apenas um retângulo com gradiente roxo/vermelho parecem gerados genericamente.
- ❌ **Não coloque luzes pulsantes que distraiam**: Glows fortes no centro de ícones ou animações de `ping` desnecessárias poluem a interface.
- ❌ **Não quebre a altura padrão**: Mantenha o card denso (`my-1.5`, `py-1`, `p-1.5`), evitando que ele fique desproporcionalmente maior que os outros widgets em destaque.
- ❌ **Não substitua o botão de ação padrão**: Sempre use o `<Plus size={15} />` como gatilho de adição.
- ❌ **Não esqueça da performance**: Use aceleração de GPU com `transform` e `opacity` para todas as micro-animações, sem recalcular layouts ou pintar propriedades pesadas.
