'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { SUMMARY_FEATURES_RAW, SUMMARY_VS_MATRIX_RAW } from '@/constants'
import { useI18n } from '@/i18n'

export function SummarySection() {
  const { t } = useI18n()

  const tc = (key: string, enVal: string, _ptVal: string) => {
    return t(key, enVal)
  }

  const features = SUMMARY_FEATURES_RAW.map((f) => ({
    num: f.num,
    title: tc(f.titleKey, f.titleEn, f.titlePt),
    desc: tc(f.descKey, f.descEn, f.descPt),
  }))

  const vsMatrix = SUMMARY_VS_MATRIX_RAW.map((m) => ({
    feature: tc(m.featureKey, m.featureEn, m.featurePt),
    gitascii: m.gitascii,
    readme: m.readme,
    gprm: m.gprm,
  }))

  return (
    <section className="bg-void-black border-t border-graphite py-24 px-6 relative z-10 w-full">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash block">
              {tc('landing.summary.eyebrow', '[ PRODUCT THESIS ]', '[ TESE DO PRODUTO ]')}
            </span>

            <h2 className="font-pt-serif font-light text-4xl md:text-heading leading-heading tracking-[-0.02em] text-chalk">
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

          <div
            className="max-w-4xl mx-auto border-t border-b border-graphite overflow-x-auto"
            role="region"
            aria-label={tc(
              'landing.summary.compare_title',
              'GitAscii vs Alternatives',
              'GitAscii vs Alternativas'
            )}
            tabIndex={0}
          >
            <table className="w-full text-left font-inter-tight text-note min-w-125">
              <thead>
                <tr className="border-b border-graphite bg-carbon/40 text-ash uppercase tracking-wider text-caption">
                  <th scope="col" className="py-4 px-4 font-jetbrains-mono font-medium">
                    {tc('vs.th_feature', 'Feature', 'Recurso')}
                  </th>
                  <th
                    scope="col"
                    className="py-4 px-4 font-jetbrains-mono font-medium text-signal-lime"
                  >
                    GitAscii
                  </th>
                  <th scope="col" className="py-4 px-4 font-jetbrains-mono font-medium">
                    Readme.so
                  </th>
                  <th scope="col" className="py-4 px-4 font-jetbrains-mono font-medium">
                    GPRM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/40 text-bone">
                {vsMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-onyx/20 transition-colors">
                    <th
                      scope="row"
                      className="py-4 px-4 font-medium text-chalk text-left font-normal"
                    >
                      {row.feature}
                    </th>

                    <td className="py-4 px-4 text-signal-lime font-bold font-jetbrains-mono text-label bg-signal-lime/5">
                      {row.gitascii === 'included'
                        ? '✓ ' + tc('vs.td_included', 'Included', 'Incluso')
                        : row.gitascii === 'mit'
                          ? '✓ ' + tc('vs.td_mit', 'MIT License', 'Licença MIT')
                          : row.gitascii}
                    </td>

                    <td className="py-4 px-4 text-ash font-jetbrains-mono text-label">
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

                    <td className="py-4 px-4 text-ash font-jetbrains-mono text-label">
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
