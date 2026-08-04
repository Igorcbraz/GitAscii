'use client'

import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { useI18n } from '@/i18n'

const faqs = [
  {
    question: 'What is GitAscii?',
    answer:
      'GitAscii is a platform for creating premium GitHub Profile READMEs using customizable SVGs and a visual editor. Think of it as Canva for your GitHub profile.',
  },
  {
    question: 'Is GitAscii free?',
    answer:
      'Yes! GitAscii is completely free and open source. We believe every developer deserves a beautiful profile.',
  },
  {
    question: 'How does the live SVG rendering work?',
    answer:
      'Instead of uploading SVG files to GitHub, you embed a URL that points to our servers. We generate your SVG on-the-fly with your latest GitHub data, so your profile is always up to date.',
  },
  {
    question: 'What is ASCII Art conversion?',
    answer:
      'Our ASCII Art Engine converts any image (like your GitHub avatar) into stunning character-based art using configurable character sets, density, and color options.',
  },
  {
    question: 'Can I have multiple profile layouts?',
    answer:
      'Absolutely! Each user can create multiple named profiles (e.g., Portfolio, Terminal, Resume) with different templates and configurations.',
  },
  {
    question: 'Does it support dark and light mode?',
    answer:
      "Yes. GitAscii generates separate SVGs for dark and light themes. Using the HTML picture element, GitHub automatically shows the right version based on the viewer's preference.",
  },
  {
    question: 'What is Generate Best Profile?',
    answer:
      'Our smart generation feature analyzes your GitHub data (repos, languages, contributions, bio) and automatically creates an optimized profile layout tailored to your activity.',
  },
  {
    question: 'Can I customize everything?',
    answer:
      'Yes. While templates give you a great starting point, every single widget property (colors, fonts, sizes, positions) can be customized in the visual editor.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { t } = useI18n()

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const translatedFaqs = faqs.map((faq, index) => ({
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
              <div
                key={index}
                className={`border border-graphite transition-all duration-300 ${isOpen ? 'bg-onyx' : 'bg-transparent hover:bg-onyx/50'}`}
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full py-6 px-6 flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-jetbrains-mono text-label text-ash group-hover:text-chalk transition-colors">
                      {qNumber}
                    </span>
                    <span
                      className={`font-inter-tight font-medium text-[16px] transition-colors duration-200 ${isOpen ? 'text-signal-lime' : 'text-chalk group-hover:text-chalk'}`}
                    >
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-all duration-300 ${isOpen ? 'rotate-180 text-signal-lime' : 'text-ash group-hover:text-chalk'}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="pl-14">
                          <p className="font-inter-tight font-normal text-body text-bone leading-body">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
