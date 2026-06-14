import Link from "next/link";
import { Droplet } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-primary-red/30">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#991B1B] flex items-center justify-center">
            <span className="text-xl">🩸</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">BloodLink</span>
        </div>
        
        <Link 
          href="/login" 
          className="px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-semibold text-sm"
        >
          Hospital Login
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-6 max-w-7xl w-full mx-auto relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 w-fit mb-8">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-sm font-semibold">Live Emergency Network</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6">
          Don't lose time finding<br className="hidden md:block" />
          <span className="text-[#EF4444]"> blood in an emergency.</span>
        </h1>
        
        <p className="text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed">
          Connecting hospitals, blood banks, and nearby donors instantly. Accessible anywhere, right from your browser.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/request" 
            className="px-8 py-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-lg text-center transition-colors shadow-lg shadow-red-900/20"
          >
            Request Blood Now
          </Link>
          <Link 
            href="/donor/login" 
            className="px-8 py-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-bold text-lg text-center transition-colors"
          >
            Login as Donor
          </Link>
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03]">
        <Droplet className="w-[800px] h-[800px]" />
      </div>
    </div>
  );
}
