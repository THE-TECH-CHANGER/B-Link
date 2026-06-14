"use client";

import { useState, useEffect } from "react";
import { Users, Phone, Calendar, Droplet, UserCheck, UserX } from "lucide-react";

interface Donor {
  id: number;
  name: string;
  mobile_number: string;
  profile_picture: string | null;
  blood_group: string;
  is_available: boolean;
  last_donation_date: string | null;
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const res = await fetch("https://bloodlink-backend-vn4k.onrender.com/api/users/donors");
      if (res.ok) {
        const data = await res.json();
        setDonors(data);
      }
    } catch (err) {
      console.error("Failed to fetch donors", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.blood_group.toLowerCase().includes(search.toLowerCase()) ||
    d.mobile_number.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Donor Network</h2>
          <p className="text-foreground/60 mt-1">Manage and contact registered donors in your area.</p>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search name, blood, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-red transition-colors placeholder:text-white/30"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center glass-panel rounded-xl">
          <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center glass-panel rounded-xl text-foreground/50 border-dashed">
          <Users className="w-12 h-12 mb-4 opacity-50" />
          <p>No donors found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => (
            <div key={donor.id} className="glass-panel p-6 rounded-xl hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/5 flex items-center justify-center overflow-hidden">
                    {donor.profile_picture ? (
                      <img src={`https://bloodlink-backend-vn4k.onrender.com${donor.profile_picture}`} alt={donor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-white/50" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{donor.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {donor.is_available ? (
                        <span className="flex items-center gap-1 text-xs text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded-md">
                          <UserCheck className="w-3 h-3" /> Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-foreground/50 font-semibold bg-white/5 px-2 py-0.5 rounded-md">
                          <UserX className="w-3 h-3" /> Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-red/10 text-primary-red border border-primary-red/20 flex items-center justify-center font-black">
                  {donor.blood_group}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 text-sm text-foreground/70">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/30" />
                  +91 {donor.mobile_number}
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-white/30" />
                  {donor.last_donation_date ? `Last Donated: ${new Date(donor.last_donation_date).toLocaleDateString()}` : "No prior donations"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
