"use client";

import { useState, useEffect } from "react";
import { Droplet, Activity, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DonorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("donor_token");
      if (!token) {
        router.push("/donor/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          localStorage.removeItem("donor_token");
          router.push("/donor/login");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("donor_token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const daysSince = profile?.last_donation_date 
    ? Math.floor((new Date().getTime() - new Date(profile.last_donation_date).getTime()) / (1000 * 3600 * 24))
    : 90;
  const isEligible = daysSince >= 90;
  const progressPercent = Math.min((daysSince / 90) * 100, 100);

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <header className="p-6 max-w-lg mx-auto flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">Welcome back,</p>
          <h1 className="text-2xl font-bold">{profile?.name.split(' ')[0] ?? 'Donor'}</h1>
        </div>
        <button onClick={handleLogout} className="p-2 bg-[#1A1A1A] rounded-full border border-white/10 text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="px-6 max-w-lg mx-auto space-y-6">
        
        {/* Eligibility Card */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-gray-400 font-medium mb-1">Blood Group</p>
              <h2 className="text-4xl font-black text-[#EF4444]">{profile?.blood_group ?? 'O+'}</h2>
            </div>
            <div className="text-right">
              <p className="text-gray-400 font-medium mb-1">Total Donations</p>
              <h2 className="text-3xl font-bold">{profile?.donationsCount ?? 0}</h2>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span className="text-gray-300">Donation Eligibility</span>
              <span className={isEligible ? "text-green-400" : "text-amber-400"}>
                {isEligible ? "Ready to Donate" : `${90 - daysSince} days remaining`}
              </span>
            </div>
            <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${isEligible ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Background Decoration */}
          <Droplet className="absolute -right-6 -bottom-6 w-48 h-48 text-[#EF4444] opacity-5 pointer-events-none" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/request" className="bg-[#DC2626] hover:bg-[#B91C1C] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors shadow-lg shadow-red-900/20 group">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold">Request Blood</span>
          </Link>
          
          <button className="bg-[#1A1A1A] border border-white/10 hover:bg-[#2A2A2A] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors group">
            <div className="w-12 h-12 bg-[#3A3A3A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplet className="w-6 h-6 text-[#EF4444]" />
            </div>
            <span className="font-bold text-gray-300">My History</span>
          </button>
        </div>

      </main>
    </div>
  );
}
