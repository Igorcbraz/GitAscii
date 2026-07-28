import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-screen w-screen bg-carbon flex flex-col items-center justify-center text-chalk font-inter-tight p-6">
      <span className="text-label uppercase tracking-[0.22em] text-ash mb-4">[ 404 — NOT FOUND ]</span>
      <h1 className="text-heading font-pt-serif font-light text-chalk mb-2">Page Not Found.</h1>
      <p className="text-body text-bone mb-8 max-w-md text-center">
        The profile or route you requested could not be located.
      </p>
      <Link
        href="/"
        className="bg-signal-lime text-black font-medium text-label px-6 py-3 rounded-sm glow-lime uppercase tracking-wider transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}
