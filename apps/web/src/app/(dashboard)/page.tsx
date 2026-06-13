"use client";

import { useState, useEffect } from "react";
import { Activity, Clock, MapPin, Droplet, CheckCircle } from "lucide-react";

interface Request {
  id: number;
  requester_name: string;
  blood_group: string;
  units_required: number;
  urgency_level: string;
  status: string;
  created_at: string;
}

export default function DashboardOverview() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active requests from our Node.js backend
    const fetchRequests = async () => {
      try {
        const res = await fetch("http://192.168.1.7:5000/api/requests/active");
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Emergencies" value={requests.length.toString()} icon={Activity} color="text-primary-red" bg="bg-primary-red/10" border="border-primary-red/20" />
        <StatCard title="Units Needed" value={requests.reduce((acc, r) => acc + r.units_required, 0).toString()} icon={Droplet} color="text-amber-500" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard title="Donors Matched" value="12" icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-500/10" border="border-emerald-500/20" />
      </div>

      {/* Main Content Area */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-wide">Live Emergency Feed</h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-red"></span>
            </span>
            <span className="text-sm text-foreground/60 uppercase tracking-widest font-semibold">Live</span>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center glass-panel rounded-xl">
            <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center glass-panel rounded-xl text-foreground/50 border-dashed">
            <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>No active emergencies. All clear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:border-primary-red/30 transition-colors">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    req.urgency_level === 'High' ? 'bg-primary-red/20 text-primary-red' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {req.urgency_level} URGENCY
                  </span>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-primary-red/30 flex items-center justify-center bg-primary-red/10 text-primary-red text-2xl font-black">
                    {req.blood_group}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground/90">{req.requester_name}</h3>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <Droplet className="w-4 h-4" /> {req.units_required} Units Required
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <MapPin className="w-4 h-4" /> Apollo Hospital
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <Clock className="w-4 h-4" /> {new Date(req.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex gap-3">
                  <button className="flex-1 bg-primary-red hover:bg-primary-red/90 text-white font-semibold py-2.5 rounded-lg transition-colors">
                    Fulfill Request
                  </button>
                  <button className="px-4 py-2.5 rounded-lg border border-border hover:bg-white/5 transition-colors font-semibold">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, border }: any) {
  return (
    <div className={`glass-panel p-6 rounded-xl border ${border} relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 p-6 opacity-20 ${color}`}>
        <Icon className="w-16 h-16" />
      </div>
      <p className="text-sm font-semibold text-foreground/60 tracking-wider uppercase mb-2">{title}</p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
    </div>
  );
}
