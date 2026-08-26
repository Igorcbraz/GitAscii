'use client'

import { ChevronDown, HelpCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import ShinyText from '@/components/ui/ShinyText'
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
      className="relative z-10 w-full bg-transparent py-24 px-4 sm:px-6 lg:px-8 border-t border-graphite/60"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-signal-lime shadow-[0_0_10px_rgba(197,255,74,0.5)]"></div>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-signal-lime/5 border border-signal-lime/20 text-signal-lime font-jetbrains-mono text-[11px] uppercase tracking-[0.2em]">
            <HelpCircle className="w-3.5 h-3.5" />
            <ShinyText speed={3}>{t('landing.faq.eyebrow', '[ QUESTIONS & ANSWERS ]')}</ShinyText>
          </div>
          <h2 className="text-chalk font-pt-serif font-light text-heading leading-[0.9] tracking-[-0.02em]">
            {t('landing.faq.title_normal', 'Frequently Asked ')}
            <span className="italic text-signal-lime">
              {t('landing.faq.title_italic', 'Questions.')}
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="flex flex-col gap-2.5"
        >
          {translatedFaqs.map((faq, index) => {
            const isOpen = openIndex === index
            const qNumber = `Q ${(index + 1).toString().padStart(2, '0')}`
            return (
              <motion.article
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className={`border transition-all duration-300 ${
                  isOpen
                    ? 'bg-onyx border-signal-lime shadow-[0_0_20px_rgba(197,255,74,0.08)]'
                    : 'bg-carbon/60 border-graphite hover:border-ash/60 hover:bg-onyx/50'
                }`}
              >
                <h3 className="m-0 text-[16px] font-normal">
                  <button
                    onClick={() => toggleOpen(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="w-full py-5 sm:py-6 px-6 flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="font-jetbrains-mono text-label text-ash group-hover:text-signal-lime transition-colors">
                        {qNumber}
                      </span>
                      <span
                        className={`font-inter-tight font-medium text-[15px] sm:text-[16px] transition-colors duration-200 ${
                          isOpen ? 'text-signal-lime' : 'text-chalk group-hover:text-white'
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-signal-lime' : 'text-ash group-hover:text-chalk'
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-answer-${index}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pl-12 sm:pl-14">
                      <p className="font-inter-tight font-normal text-body text-bone leading-body">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
