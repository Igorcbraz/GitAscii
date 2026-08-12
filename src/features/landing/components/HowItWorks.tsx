'use client'

import { Copy } from 'lucide-react'

import { useI18n } from '@/i18n'

export function HowItWorks() {
  const { t, language } = useI18n()

  const tc = (key: string, enVal: string, ptVal: string) => {
    return language === 'pt' ? ptVal : enVal
  }

  const howToLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create a GitHub Profile README with GitAscii',
    description: 'Create a custom GitHub Profile README in three simple steps using GitAscii.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter Your Username',
        text: 'Type your GitHub username on GitAscii to fetch public user profile data automatically.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Customize Everything',
        text: 'Use the visual editor to drag widgets, select theme templates, and customize colors and fonts.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Copy & Paste',
        text: 'Copy the generated markdown or HTML picture snippet directly into your GitHub README.md file.',
      },
    ],
  }

  return (
    <section
      id="how-it-works"
      className="bg-carbon py-24 md:py-32 px-6 md:px-12 w-full relative overflow-hidden"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />

      <div className="max-w-7xl mx-auto space-y-24">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash block">
            {t('landing.how_it_works.eyebrow', '[ THREE STEPS ]')}
          </span>
          <h2 className="font-pt-serif font-light text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.how_it_works.title_normal', 'Simple. ')}
            <em className="italic text-signal-lime">
              {t('landing.how_it_works.title_italic', 'Powerful.')}
            </em>
          </h2>
        </div>

        <div className="space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-4 order-1 lg:order-1">
              <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-widest bg-signal-lime/5 px-2.5 py-1 border border-signal-lime/20 inline-block">
                [ STEP 01 ]
              </span>
              <h3 className="font-pt-serif font-light text-3xl text-chalk">
                {t('landing.how_it_works.step1_title', 'Enter Your Username')}
              </h3>
              <p className="font-inter-tight text-body text-bone leading-relaxed">
                {tc(
                  'landing.how_it_works.step1_long',
                  'Type your GitHub username. Our serverless pipeline automatically gathers public profile data, star counts, repository configurations, and contribution matrices.',
                  'Digite seu nome de usuário do GitHub. Nossa pipeline serverless reúne automaticamente dados públicos de perfil, contagem de estrelas, repositórios e histórico de commits.'
                )}
              </p>
            </div>

            <div className="lg:col-span-7 bg-onyx border border-graphite p-8 flex items-center justify-center relative min-h-56 order-2 lg:order-2">
              <div className="absolute top-4 left-4 font-pt-serif font-light text-7xl text-graphite/30 select-none">
                01
              </div>
              <div className="w-full max-w-xs h-12 border border-graphite bg-carbon flex items-center px-4">
                <span className="font-mono text-body text-bone">
                  Igorcbraz<span className="animate-pulse text-signal-lime">_</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-7 bg-onyx border border-graphite p-8 flex items-center justify-center relative min-h-56 order-2 lg:order-1">
              <div className="absolute top-4 left-4 font-pt-serif font-light text-7xl text-graphite/30 select-none">
                02
              </div>
              <div className="flex gap-2 w-full max-w-md h-28">
                <div className="w-12 h-full border border-graphite bg-carbon" />
                <div className="flex-1 h-full border border-graphite bg-carbon relative overflow-hidden">
                  <div className="absolute inset-3 border border-dashed border-graphite" />
                </div>
                <div className="w-14 h-full border border-graphite bg-carbon" />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
              <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-widest bg-signal-lime/5 px-2.5 py-1 border border-signal-lime/20 inline-block">
                [ STEP 02 ]
              </span>
              <h3 className="font-pt-serif font-light text-3xl text-chalk">
                {t('landing.how_it_works.step2_title', 'Customize Everything')}
              </h3>
              <p className="font-inter-tight text-body text-bone leading-relaxed">
                {tc(
                  'landing.how_it_works.step2_long',
                  'Arrange widgets using a canvas interface inspired by Canva and Figma. Customize colors, fonts, layouts, and image-to-ASCII density rules to match your developer identity.',
                  'Organize widgets através de uma tela de composição inspirada no Canva e Figma. Personalize cores, fontes, layouts e regras de conversão ASCII.'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-4 order-1">
              <span className="font-jetbrains-mono text-caption text-signal-lime uppercase tracking-widest bg-signal-lime/5 px-2.5 py-1 border border-signal-lime/20 inline-block">
                [ STEP 03 ]
              </span>
              <h3 className="font-pt-serif font-light text-3xl text-chalk">
                {t('landing.how_it_works.step3_title', 'Copy & Paste')}
              </h3>
              <p className="font-inter-tight text-body text-bone leading-relaxed">
                {tc(
                  'landing.how_it_works.step3_long',
                  'Copy the generated SVG picture markdown directly and paste it into your profile repository README. Your stats update automatically, served fast straight from our serverless edge endpoints.',
                  'Copie o markdown gerado do SVG e cole diretamente no README do seu repositório de perfil. Suas métricas atualizam de forma totalmente automática via edge.'
                )}
              </p>
            </div>

            <div className="lg:col-span-7 bg-onyx border border-graphite p-8 flex items-center justify-center relative min-h-56 order-2">
              <div className="absolute top-4 left-4 font-pt-serif font-light text-7xl text-graphite/30 select-none">
                03
              </div>
              <div className="w-full max-w-md border border-graphite bg-carbon p-4 relative flex flex-col justify-center">
                <div className="font-mono text-caption text-ash flex flex-col gap-1">
                  <span>&lt;picture&gt;</span>
                  <span className="pl-4 text-graphite">...</span>
                  <span>&lt;/picture&gt;</span>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 border border-graphite flex items-center justify-center bg-onyx text-ash">
                  <Copy className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
