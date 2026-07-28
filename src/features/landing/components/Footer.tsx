import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-void-black border-t border-graphite py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-6 flex flex-col items-start">
            <div className="text-subheading mb-2 flex items-center">
              <span className="font-inter-tight font-medium text-chalk">Git</span>
              <span className="font-pt-serif font-light italic text-signal-lime">Ascii</span>
            </div>
            <p className="font-inter-tight text-note text-ash mb-4">
              Premium GitHub Profile READMEs
            </p>
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-signal-lime bg-transparent">
              <span className="font-inter-tight text-signal-lime text-eyebrow uppercase tracking-[0.22em]">
                ● OPEN SOURCE
              </span>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col">
            <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-6">
              [ PRODUCT ]
            </span>
            <ul className="flex flex-col gap-4">
              {['Features', 'Templates', 'Editor', 'Generate'].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase()}`} className="font-inter-tight font-normal text-body text-pearl transition-colors duration-200 hover:text-signal-lime">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 flex flex-col">
            <span className="font-inter-tight text-eyebrow uppercase tracking-[0.22em] text-ash mb-6">
              [ COMMUNITY ]
            </span>
            <ul className="flex flex-col gap-4">
              {['GitHub', 'Documentation', 'Contributing', 'Discussions'].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase()}`} className="font-inter-tight font-normal text-body text-pearl transition-colors duration-200 hover:text-signal-lime">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-graphite flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-inter-tight text-note text-ash">
            © 2026 GitAscii. MIT License.
          </p>
          <p className="font-inter-tight text-note text-ash">
            Built with <span className="text-signal-lime">♥</span> for developers
          </p>
        </div>
      </div>
    </footer>
  );
}
