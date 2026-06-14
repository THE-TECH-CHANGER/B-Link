"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Droplet, Settings, LogOut, BellRing } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/hospital", icon: LayoutDashboard },
    { name: "Active Emergencies", href: "/hospital/emergencies", icon: BellRing },
    { name: "Blood Inventory", href: "/hospital/inventory", icon: Droplet },
    { name: "Donors", href: "/hospital/donors", icon: Users },
    { name: "Settings", href: "/hospital/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border glass-panel flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary-red">
            <Droplet className="w-6 h-6 fill-current" />
            <span className="text-xl font-bold text-foreground tracking-wide">BloodLink<span className="text-primary-red">.</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary-red/10 text-primary-red"
                    : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-red" : ""}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 text-foreground/70 hover:bg-white/5 hover:text-foreground rounded-lg transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border glass-panel flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-semibold text-foreground/90">Hospital Command Center</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-red/20 border border-primary-red/30 flex items-center justify-center text-primary-red">
              <span className="text-sm font-bold">A</span>
            </div>
            <span className="text-sm font-medium">Apollo Hospital</span>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
