'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { LANDING_FAQS } from '@/constants'
import { useI18n } from '@/i18n'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { t } = useI18n()

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const translatedFaqs = LANDING_FAQS.map((faq, index) => ({
    question: t(`landing.faq.q${index + 1}`, faq.question),
    answer: t(`landing.faq.a${index + 1}`, faq.answer),
  }))

  return (
    <section
      id="faq"
      className="relative w-full bg-carbon py-24 px-4 sm:px-6 lg:px-8 border-t border-graphite"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-signal-lime shadow-[0_0_10px_rgba(197,255,74,0.5)]"></div>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="block text-ash font-inter-tight text-eyebrow uppercase tracking-[0.22em] mb-4">
            {t('landing.faq.eyebrow', '[ QUESTIONS & ANSWERS ]')}
          </span>
          <h2 className="text-chalk font-pt-serif font-light text-heading leading-[0.9] tracking-[-0.02em]">
            {t('landing.faq.title_normal', 'Frequently Asked ')}
            <span className="italic text-signal-lime">
              {t('landing.faq.title_italic', 'Questions.')}
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {translatedFaqs.map((faq, index) => {
            const isOpen = openIndex === index
            const qNumber = `Q ${(index + 1).toString().padStart(2, '0')}`
            return (
              <article
                key={index}
                className={`border border-graphite transition-all duration-300 ${isOpen ? 'bg-onyx' : 'bg-transparent hover:bg-onyx/50'}`}
              >
                <button
                  onClick={() => toggleOpen(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full py-6 px-6 flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-jetbrains-mono text-label text-ash group-hover:text-chalk transition-colors">
                      {qNumber}
                    </span>
                    <h3
                      className={`font-inter-tight font-medium text-[16px] transition-colors duration-200 ${isOpen ? 'text-signal-lime' : 'text-chalk group-hover:text-chalk'}`}
                    >
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-all duration-300 ${isOpen ? 'rotate-180 text-signal-lime' : 'text-ash group-hover:text-chalk'}`}
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pl-14">
                      <p className="font-inter-tight font-normal text-body text-bone leading-body">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
