import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { CheckoutFeedback } from './CheckoutFeedback'
import { ProPaywall } from './ProPaywall'

function FeedbackPreview({ showPaywall }: { showPaywall: boolean }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#070707] text-chalk">
      {showPaywall ? (
        <ProPaywall
          username="octocat"
          isUpgrading={false}
          upgradeSuccess={false}
          onUpgrade={() => {}}
          proCustomers={128}
          proUsernames={[]}
        />
      ) : (
        <div className="flex min-h-screen items-center justify-center">
          <span className="font-jetbrains-mono text-xs uppercase tracking-widest text-ash">
            GitAscii Pro · Checkout
          </span>
        </div>
      )}

      {open ? (
        <CheckoutFeedback onClose={() => setOpen(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-9998 border border-signal-lime bg-carbon px-4 py-3 font-inter-tight text-sm text-signal-lime hover:bg-signal-lime hover:text-carbon"
        >
          Reabrir pesquisa
        </button>
      )}
    </div>
  )
}

const meta: Meta<typeof CheckoutFeedback> = {
  title: 'Pro/Checkout/CheckoutFeedback',
  component: CheckoutFeedback,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof CheckoutFeedback>

export const OverPaywall: Story = {
  render: () => <FeedbackPreview showPaywall />,
  parameters: {
    docs: {
      description: {
        story:
          'A pesquisa opcional como aparece após o retorno de um checkout Stripe cancelado. Escolha um motivo ou feche para reabrir.',
      },
    },
  },
}

export const Standalone: Story = {
  render: () => <FeedbackPreview showPaywall={false} />,
  parameters: {
    docs: {
      description: {
        story:
          'Visualização isolada do diálogo para conferir espaçamento, estados de foco e versões mobile no painel de viewport.',
      },
    },
  },
}
