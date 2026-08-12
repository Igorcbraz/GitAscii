'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n'

export function SummarySection() {
  const { language } = useI18n()

  const tc = (key: string, enVal: string, ptVal: string) => {
    return language === 'pt' ? ptVal : enVal
  }

  const features = [
    {
      num: '[ ENGINE-01 ]',
      title: tc('landing.summary.feat1.title', 'Real-Time SVG Engine', 'Motor SVG em Tempo Real'),
      desc: tc(
        'landing.summary.feat1.desc',
        'Generates live statistics, contribution streaks, and language charts directly from public APIs on-the-fly.',
        'Gera estatísticas, racha de commits e gráficos de linguagens dinamicamente via APIs públicas.'
      ),
    },
    {
      num: '[ ENGINE-02 ]',
      title: tc(
        'landing.summary.feat2.title',
        'Image-to-ASCII Converter',
        'Conversor de Imagem para ASCII'
      ),
      desc: tc(
        'landing.summary.feat2.desc',
        'Convert your avatar or custom branding into text-based art grids with adjustable character density and contrast.',
        'Converta seu avatar ou logo em matrizes de caracteres com densidade e contraste ajustáveis.'
      ),
    },
    {
      num: '[ ENGINE-03 ]',
      title: tc('landing.summary.feat3.title', 'Theme Adaptability', 'Adaptabilidade de Temas'),
      desc: tc(
        'landing.summary.feat3.desc',
        'Seamless switching between dark and light themes using standard HTML <picture> tags and media queries.',
        'Alternância automática de temas claro e escuro usando tags HTML <picture> e media queries.'
      ),
    },
    {
      num: '[ ENGINE-04 ]',
      title: tc(
        'landing.summary.feat4.title',
        'Edge Native & Zero Setup',
        'Edge Native e Zero Setup'
      ),
      desc: tc(
        'landing.summary.feat4.desc',
        'Rendered instantly on Serverless Edge functions. Cached efficiently for fast loading on GitHub Camo.',
        'Renderização instantânea em Serverless Edge. Cache otimizado para carregamento ultra-rápido no GitHub Camo.'
      ),
    },
  ]

  const vsMatrix = [
    {
      feature: tc(
        'vs.concept_edge_rendering',
        'Dynamic SVG Edge Rendering',
        'Renderização de SVG na Edge'
      ),
      gitascii: 'included',
      readme: 'no',
      gprm: 'no',
    },
    {
      feature: tc(
        'vs.concept_theme_toggle',
        'Native Light/Dark Auto-Toggle',
        'Alternância Clara/Escura Nativa'
      ),
      gitascii: 'included',
      readme: 'manual',
      gprm: 'manual',
    },
    {
      feature: tc(
        'vs.concept_ascii_engine',
        'Luminance-Based ASCII Engine',
        'Motor ASCII por Luminância'
      ),
      gitascii: 'included',
      readme: 'no',
      gprm: 'no',
    },
    {
      feature: tc(
        'vs.concept_visual_builder',
        'Visual Layout Canvas Builder',
        'Construtor de Layout Visual'
      ),
      gitascii: 'included',
      readme: 'included',
      gprm: 'form',
    },
    {
      feature: tc(
        'vs.concept_zero_db',
        'Zero Database Dependency',
        'Dependência Zero de Banco de Dados'
      ),
      gitascii: 'included',
      readme: 'requires_db',
      gprm: 'included',
    },
    {
      feature: tc(
        'vs.concept_self_host',
        'MIT Open Source & Self-Hostable',
        'Código Aberto MIT / Auto-Hospedável'
      ),
      gitascii: 'mit',
      readme: 'open_source',
      gprm: 'open_source',
    },
  ]

  return (
    <section className="bg-void-black border-t border-graphite py-24 px-6 relative z-10 w-full">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash block">
              {tc('landing.summary.eyebrow', '[ PRODUCT THESIS ]', '[ TESE DO PRODUTO ]')}
            </span>

            <h2 className="font-pt-serif font-light text-4xl md:text-heading leading-[1.05] tracking-[-0.02em] text-chalk">
              {tc('landing.summary.title', 'Where terminals meet ', 'Onde terminais encontram ')}
              <span className="italic text-signal-lime">
                {tc('landing.summary.title_italic', 'editorial design.', 'design editorial.')}
              </span>
            </h2>

            <p className="font-inter-tight text-body text-bone leading-body max-w-md">
              {tc(
                'landing.summary.p1',
                'GitAscii elevates static developer profiles into high-craft visual statements. By combining technical terminal diagnostics with classical broadsheet layouts, we enable developers to serve responsive, live SVGs straight from the edge.',
                'O GitAscii eleva perfis estáticos em declarações de alta qualidade visual. Ao fundir diagnósticos técnicos de terminais com layouts broadsheet clássicos, permitimos que desenvolvedores sirvam SVGs dinâmicos direto da edge.'
              )}
            </p>

            <p className="font-inter-tight text-body text-ash leading-body max-w-md">
              {tc(
                'landing.summary.p2',
                'No manual rebuilds. No stale contributions data. One centralized workspace to design and host your developer identity.',
                'Sem rebuilds manuais. Sem dados de commit desatualizados. Uma central unificada para projetar e hospedar sua identidade dev.'
              )}
            </p>
          </div>

          <div className="lg:col-span-7 divide-y divide-graphite">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start"
              >
                <span className="sm:col-span-3 font-jetbrains-mono text-caption text-ash tracking-wider pt-1">
                  {feat.num}
                </span>
                <div className="sm:col-span-9 space-y-2">
                  <h3 className="font-pt-serif font-light text-xl text-chalk">{feat.title}</h3>
                  <p className="font-inter-tight text-body text-bone/80 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-graphite w-full relative">
          <div className="absolute left-1/2 -translate-x-1/2 w-48 h-px bg-signal-lime shadow-[0_0_10px_rgba(197,255,74,0.5)]"></div>
        </div>

        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash block">
              {tc(
                'landing.summary.compare_eyebrow',
                '[ COMPETITIVE LANDSCAPE ]',
                '[ ANÁLISE COMPARATIVA ]'
              )}
            </span>
            <h2 className="font-pt-serif font-light text-3xl md:text-heading-sm leading-tight text-chalk">
              {tc('landing.summary.compare_title', 'GitAscii vs ', 'GitAscii vs ')}
              <span className="italic text-signal-lime">
                {tc('landing.summary.compare_italic', 'Alternatives', 'Alternativas')}
              </span>
            </h2>
            <p className="font-inter-tight text-body text-bone max-w-lg mx-auto">
              {tc(
                'landing.summary.compare_desc',
                'Discover how GitAscii outperforms traditional form-based README makers and static generators.',
                'Descubra como o GitAscii se compara com construtores estáticos de README baseados em formulários.'
              )}
            </p>
          </div>

          <div className="max-w-4xl mx-auto border-t border-b border-graphite overflow-x-auto">
            <table className="w-full text-left font-inter-tight text-note min-w-[500px]">
              <thead>
                <tr className="border-b border-graphite bg-carbon/40 text-ash uppercase tracking-wider text-caption">
                  <th className="py-4 px-4 font-jetbrains-mono font-medium">
                    {tc('vs.th_feature', 'Feature', 'Recurso')}
                  </th>
                  <th className="py-4 px-4 font-jetbrains-mono font-medium text-signal-lime">
                    GitAscii
                  </th>
                  <th className="py-4 px-4 font-jetbrains-mono font-medium">Readme.so</th>
                  <th className="py-4 px-4 font-jetbrains-mono font-medium">GPRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/40 text-bone">
                {vsMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-onyx/20 transition-colors">
                    <td className="py-4 px-4 font-medium text-chalk">{row.feature}</td>

                    <td className="py-4 px-4 text-signal-lime font-bold font-jetbrains-mono text-[13px] bg-signal-lime/5">
                      {row.gitascii === 'included'
                        ? '✓ ' + tc('vs.td_included', 'Included', 'Incluso')
                        : row.gitascii === 'mit'
                          ? '✓ ' + tc('vs.td_mit', 'MIT License', 'Licença MIT')
                          : row.gitascii}
                    </td>

                    <td className="py-4 px-4 text-ash font-jetbrains-mono text-[13px]">
                      {row.readme === 'included'
                        ? '✓ ' + tc('vs.td_included', 'Included', 'Incluso')
                        : row.readme === 'no'
                          ? '✕ ' + tc('vs.td_no', 'No', 'Não')
                          : row.readme === 'manual'
                            ? '✕ ' + tc('vs.td_manual', 'Manual', 'Manual')
                            : row.readme === 'requires_db'
                              ? '✕ ' + tc('vs.td_requires_db', 'Requires DB', 'Precisa de BD')
                              : row.readme === 'open_source'
                                ? '✓ ' + tc('vs.td_open_source_val', 'Open Source', 'Código Aberto')
                                : '✕ ' + row.readme}
                    </td>

                    <td className="py-4 px-4 text-ash font-jetbrains-mono text-[13px]">
                      {row.gprm === 'included'
                        ? '✓ ' + tc('vs.td_included', 'Included', 'Incluso')
                        : row.gprm === 'no'
                          ? '✕ ' + tc('vs.td_no', 'No', 'Não')
                          : row.gprm === 'manual'
                            ? '✕ ' + tc('vs.td_manual', 'Manual', 'Manual')
                            : row.gprm === 'open_source'
                              ? '✓ ' + tc('vs.td_open_source_val', 'Open Source', 'Código Aberto')
                              : row.gprm === 'form'
                                ? tc('vs.td_form_based', 'Form-based', 'Formulário')
                                : row.gprm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center pt-2">
            <Link
              href="/vs"
              className="inline-flex items-center gap-2 border border-graphite hover:border-signal-lime text-ash hover:text-signal-lime font-inter-tight font-medium text-body px-6 py-3 transition-all rounded-sm uppercase tracking-wide"
            >
              <span>
                {tc(
                  'landing.summary.vs_btn',
                  'Explore Full Comparison Matrix',
                  'Ver Matriz de Comparação Completa'
                )}
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
