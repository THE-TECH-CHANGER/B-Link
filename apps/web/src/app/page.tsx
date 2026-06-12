import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden selection:bg-red-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">BloodLink</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#hospitals" className="hover:text-white transition-colors">For Hospitals</Link>
            <Link href="#donors" className="hover:text-white transition-colors">For Donors</Link>
          </div>
          <div className="flex gap-4">
            <button className="hidden md:block px-5 py-2.5 text-sm font-medium rounded-full border border-white/20 hover:bg-white/10 transition-colors">
              Sign In
            </button>
            <button className="px-5 py-2.5 text-sm font-medium rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              Emergency Request
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/20 blur-[120px] -z-10 rounded-full" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Live Emergency Response Network
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
          Don't lose time finding <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600">
            blood in an emergency.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12">
          BloodLink connects hospitals, blood banks, and nearby donors instantly. 
          Stop relying on fragmented WhatsApp groups and static directories.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="px-8 py-4 text-base font-semibold rounded-full bg-white text-black hover:bg-neutral-200 transition-colors">
            Request Blood Now
          </button>
          <button className="px-8 py-4 text-base font-semibold rounded-full border border-white/20 hover:bg-white/10 transition-colors">
            Register as Donor
          </button>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Matching",
              desc: "Algorithms instantly geofence hospitals and alert the closest eligible donors."
            },
            {
              title: "SMS Fallback",
              desc: "Critical alerts reach donors via flash SMS even if internet data is disabled."
            },
            {
              title: "Live Tracking",
              desc: "Hospitals track donor ETA in real-time, preventing facility overload."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-neutral-500 text-sm">
        <p>© 2026 BloodLink Network. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
