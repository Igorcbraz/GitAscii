import Image from 'next/image'

interface AsciiHandsProps {
  className?: string
}

export default function AsciiHands({ className = '' }: AsciiHandsProps) {
  return (
    <div
      className={`relative w-full aspect-[2/1] overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <Image
        src="/ascii-hands-hero.webp"
        alt=""
        fill
        sizes="100vw"
        loading="lazy"
        decoding="async"
        unoptimized
        className="object-fill opacity-90"
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,rgba(197,255,74,0.12)_0%,transparent_100%)] opacity-70" />
    </div>
  )
}
