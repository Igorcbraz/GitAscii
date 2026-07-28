import { Paintbrush, Terminal, Layout, Zap, Users, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Paintbrush,
    title: 'Visual Editor',
    description: 'Drag-and-drop editor inspired by Canva and Figma. See every change in real-time.',
    index: 'F 01'
  },
  {
    icon: Terminal,
    title: 'ASCII Art Engine',
    description: 'Convert any image to stunning ASCII art with 6+ character sets, adjustable density and color.',
    index: 'F 02'
  },
  {
    icon: Layout,
    title: 'Premium Templates',
    description: '13+ handcrafted templates. From Terminal to Cyberpunk. One-click apply, fully customizable.',
    index: 'F 03'
  },
  {
    icon: Zap,
    title: 'Live Rendering',
    description: 'Your SVG is served via URL — always up to date. No manual uploads, no stale data.',
    index: 'F 04'
  },
  {
    icon: Users,
    title: 'Multiple Profiles',
    description: 'Create different profiles for different purposes. Portfolio, Resume, Open Source — all from one account.',
    index: 'F 05'
  },
  {
    icon: Sparkles,
    title: 'Smart Generation',
    description: 'Let GitAscii analyze your GitHub and generate the perfect profile automatically.',
    index: 'F 06'
  }
];

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-carbon py-24 px-6 md:px-12 w-full">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="font-sans font-medium text-[11px] uppercase tracking-[0.22em] text-ash mb-4">
            [ WHY GITASCII ]
          </span>
          <h2 className="font-serif font-light text-[49px] leading-[0.95] tracking-[-0.02em] text-chalk">
            Everything You <em className="not-italic italic text-signal-lime">Need.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-onyx p-8 border border-graphite hover:border-iron transition-colors duration-300 relative group flex flex-col rounded-none"
              >
                <div className="absolute top-8 right-8 font-sans font-medium text-[11px] text-[#3d3d3d] uppercase">
                  {feature.index}
                </div>
                <div className="mb-6">
                  <Icon className="w-8 h-8 text-signal-lime stroke-[1.5px]" />
                </div>
                <h3 className="font-sans font-medium text-[16px] text-chalk mb-2">
                  {feature.title}
                </h3>
                <p className="font-sans font-normal text-[14px] text-bone leading-[1.55]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
