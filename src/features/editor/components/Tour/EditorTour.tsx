'use client'

import React, { useEffect, useState } from 'react'
import { Joyride, STATUS, Step } from 'react-joyride'

import { useI18n } from '@/i18n'

export function EditorTour() {
  const { t } = useI18n()
  const [run, setRun] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const startTour = () => {
      setRun(true)
      localStorage.setItem('gitascii_has_seen_tour', 'true')
    }

    const timer = setTimeout(() => {
      const hasSeenTour = localStorage.getItem('gitascii_has_seen_tour')
      if (!hasSeenTour) {
        startTour()
      }
    }, 1500)

    const handleStartTourEvent = () => startTour()
    window.addEventListener('gitascii:start-tour', handleStartTourEvent)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('gitascii:start-tour', handleStartTourEvent)
    }
  }, [])

  if (!isClient) return null

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h2 className="text-xl font-inter-tight font-light mb-2 text-chalk">
            {t('tour.welcome.title', 'Bem-vindo ao Editor')}
          </h2>
          <p className="font-inter-tight text-ash text-sm">
            {t(
              'tour.welcome.desc',
              'Vamos fazer um tour rápido para você conhecer a plataforma e criar seu README.'
            )}
          </p>
        </div>
      ),
    },
    {
      target: '#tour-global-search',
      content: (
        <div className="text-left">
          <h3 className="font-inter-tight font-light mb-1 text-chalk">
            {t('tour.search.title', 'Busca Global')}
          </h3>
          <p className="font-inter-tight text-ash text-sm">
            {t(
              'tour.search.desc',
              'Use a busca para encontrar widgets e templates rapidamente (Atalho: Ctrl+K).'
            )}
          </p>
        </div>
      ),

    },
    {
      target: '#tour-featured-widgets',
      content: (
        <div className="text-left">
          <h3 className="font-inter-tight font-light mb-1 text-chalk">
            {t('tour.featured.title', 'Widgets em Destaque')}
          </h3>
          <p className="font-inter-tight text-ash text-sm">
            {t(
              'tour.featured.desc',
              'Widgets incríveis feitos pela comunidade para destacar o seu perfil.'
            )}
          </p>
        </div>
      ),
    },
    {
      target: '#tour-normal-widgets',
      content: (
        <div className="text-left">
          <h3 className="font-inter-tight font-light mb-1 text-chalk">
            {t('tour.native.title', 'Widgets Nativos')}
          </h3>
          <p className="font-inter-tight text-ash text-sm">
            {t('tour.native.desc', 'Componentes padrão para montar as informações do seu README.')}
          </p>
        </div>
      ),
    },
    {
      target: '#tour-properties-sidebar',
      placement: 'left',
      content: (
        <div className="text-left">
          <h3 className="font-inter-tight font-light mb-1 text-chalk">
            {t('tour.properties.title', 'Edição e Propriedades')}
          </h3>
          <p className="font-inter-tight text-ash text-sm">
            {t(
              'tour.properties.desc',
              'Quando você seleciona um widget no canvas, suas propriedades aparecem aqui para você customizar (como cor, fonte, estilos globais).'
            )}
          </p>
        </div>
      ),
    },
    {
      target: '#tour-status-bar',
      placement: 'top',
      content: (
        <div className="text-left">
          <h3 className="font-inter-tight font-light mb-1 text-chalk">
            {t('tour.statusbar.title', 'Barra de Status e Atalhos')}
          </h3>
          <p className="font-inter-tight text-ash text-sm">
            {t(
              'tour.statusbar.desc',
              'Aqui você controla o zoom, desfaz ações e gerencia as camadas. Dica: você pode usar atalhos de teclado como Ctrl+Z (Desfazer), Ctrl+C/V (Copiar/Colar), Delete e as setas para mover os widgets!'
            )}
          </p>
        </div>
      ),
    },
    {
      target: '#tour-export-buttons',
      placement: 'bottom',
      content: (
        <div className="text-left">
          <h3 className="font-inter-tight font-light mb-1 text-chalk">
            {t('tour.export.title', 'Salvar e Exportar')}
          </h3>
          <p className="font-inter-tight text-ash text-sm">
            {t(
              'tour.export.desc',
              'Quando terminar, você pode exportar o layout manualmente (JSON) ou atualizar o README no seu GitHub diretamente por aqui (Update README). Divirta-se!'
            )}
          </p>
        </div>
      ),
    },
  ]

  const handleJoyrideCallback = (data: any) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status as any)) {
      setRun(false)
      localStorage.setItem('gitascii_has_seen_tour', 'true')
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}

      onEvent={handleJoyrideCallback}
      styles={{
        arrow: {
          color: '#1f1f1f',
        },
        tooltip: {
          backgroundColor: '#1f1f1f',
          zIndex: 1000,
        },
        overlay: {
          backgroundColor: 'rgba(6, 6, 6, 0.85)',
          zIndex: 1000,
        },
      }}
      tooltipComponent={CustomTooltip}
      locale={{
        back: t('tour.back', 'Voltar'),
        close: t('tour.close', 'Fechar'),
        last: t('tour.last', 'Finalizar'),
        next: t('tour.next', 'Próximo'),
        skip: t('tour.skip', 'Pular'),
      }}
    />
  )
}

function CustomTooltip({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
}: import('react-joyride').TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="bg-onyx rounded-none max-w-[380px] flex flex-col p-6 font-inter-tight"
    >
      <div className="mb-2">{step.content}</div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-graphite">
        <button
          {...closeProps}
          className="text-caption font-medium uppercase tracking-wider text-ash hover:text-chalk transition-colors cursor-pointer"
        >
          {closeProps.title || 'Pular'}
        </button>

        <div className="flex items-center gap-4">
          <div className="text-caption font-medium text-ash mr-1 tracking-wider">
            {index + 1} / {size}
          </div>

          {index > 0 && (
            <button
              {...backProps}
              className="text-caption font-medium uppercase tracking-wider text-ash hover:text-chalk transition-colors cursor-pointer"
            >
              {backProps.title || 'Voltar'}
            </button>
          )}
          <button
            {...primaryProps}
            className="px-4 py-2 rounded-[4px] font-inter-tight font-semibold text-xs uppercase tracking-wider cursor-pointer bg-signal-lime text-void-black hover:brightness-110 transition-all"
            style={{ boxShadow: 'rgba(197, 255, 74, 0.45) 0px 0px 8px 0px' }}
          >
            {primaryProps.title || (isLastStep ? 'Finalizar' : 'Próximo')}
          </button>
        </div>
      </div>
    </div>
  )
}
