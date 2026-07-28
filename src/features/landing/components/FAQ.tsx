'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "What is GitAscii?",
    answer: "GitAscii is a platform for creating premium GitHub Profile READMEs using customizable SVGs and a visual editor. Think of it as Canva for your GitHub profile."
  },
  {
    question: "Is GitAscii free?",
    answer: "Yes! GitAscii is completely free and open source. We believe every developer deserves a beautiful profile."
  },
  {
    question: "How does the live SVG rendering work?",
    answer: "Instead of uploading SVG files to GitHub, you embed a URL that points to our servers. We generate your SVG on-the-fly with your latest GitHub data, so your profile is always up to date."
  },
  {
    question: "What is ASCII Art conversion?",
    answer: "Our ASCII Art Engine converts any image (like your GitHub avatar) into stunning character-based art using configurable character sets, density, and color options."
  },
  {
    question: "Can I have multiple profile layouts?",
    answer: "Absolutely! Each user can create multiple named profiles (e.g., Portfolio, Terminal, Resume) with different templates and configurations."
  },
  {
    question: "Does it support dark and light mode?",
    answer: "Yes. GitAscii generates separate SVGs for dark and light themes. Using the HTML picture element, GitHub automatically shows the right version based on the viewer's preference."
  },
  {
    question: "What is Generate Best Profile?",
    answer: "Our smart generation feature analyzes your GitHub data (repos, languages, contributions, bio) and automatically creates an optimized profile layout tailored to your activity."
  },
  {
    question: "Can I customize everything?",
    answer: "Yes. While templates give you a great starting point, every single widget property (colors, fonts, sizes, positions) can be customized in the visual editor."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full bg-carbon py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-180 mx-auto">
        <div className="text-center mb-16">
          <span className="block text-ash font-inter-tight text-eyebrow uppercase tracking-[0.22em] mb-4">
            [ QUESTIONS & ANSWERS ]
          </span>
          <h2 className="text-chalk font-pt-serif font-light text-heading leading-[0.9] tracking-[-0.02em]">
            Frequently Asked <span className="italic text-signal-lime">Questions.</span>
          </h2>
        </div>

        <div className="flex flex-col">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-graphite">
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full py-6 flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="font-inter-tight font-medium text-[16px] text-chalk transition-colors duration-200 group-hover:text-signal-lime">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-ash transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-inter-tight font-normal text-body text-bone leading-body">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
