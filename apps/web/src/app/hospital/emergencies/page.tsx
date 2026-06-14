"use client";

import { useState, useEffect } from "react";
import { Activity, Clock, MapPin, Droplet, CheckCircle, ListFilter } from "lucide-react";

interface Request {
  id: number;
  requester_name: string;
  blood_group: string;
  units_required: number;
  urgency_level: string;
  status: string;
  created_at: string;
}

export default function EmergenciesPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "fulfilled">("all");

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("https://bloodlink-backend-vn4k.onrender.com/api/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch all requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (id: number) => {
    try {
      const res = await fetch(`https://bloodlink-backend-vn4k.onrender.com/api/requests/${id}/fulfill`, { method: "PUT" });
      if (res.ok) {
        setRequests(requests.map(req => req.id === id ? { ...req, status: 'fulfilled' } : req));
      }
    } catch (err) {
      console.error("Failed to fulfill request", err);
    }
  };

  const filteredRequests = requests.filter(req => filter === "all" || req.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Emergency Request History</h2>
          <p className="text-foreground/60 mt-1">View and manage all past and active blood requests.</p>
        </div>
        
        <div className="glass-panel flex items-center p-1 rounded-lg">
          {(["all", "pending", "fulfilled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-semibold rounded-md capitalize transition-all ${
                filter === f ? "bg-primary-red text-white" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center glass-panel rounded-xl">
          <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center glass-panel rounded-xl text-foreground/50 border-dashed">
          <ListFilter className="w-12 h-12 mb-4 opacity-50" />
          <p>No emergencies found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <div key={req.id} className={`glass-panel p-6 rounded-xl relative overflow-hidden transition-colors ${
              req.status === 'fulfilled' ? 'opacity-70 border-white/5' : 'hover:border-primary-red/30'
            }`}>
              <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                {req.status === 'fulfilled' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> FULFILLED
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  req.urgency_level === 'High' ? 'bg-primary-red/20 text-primary-red' : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {req.urgency_level} URGENCY
                </span>
              </div>
              
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-black ${
                  req.status === 'fulfilled' ? 'border-white/10 bg-white/5 text-foreground/50' : 'border-primary-red/30 bg-primary-red/10 text-primary-red'
                }`}>
                  {req.blood_group}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground/90">{req.requester_name}</h3>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <Droplet className="w-4 h-4" /> {req.units_required} Units Required
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <Clock className="w-4 h-4" /> {new Date(req.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="mt-6 pt-6 border-t border-border flex gap-3">
                  <button 
                    onClick={() => handleFulfill(req.id)}
                    className="flex-1 bg-primary-red hover:bg-primary-red/90 text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Fulfill Request
                  </button>
                  <button className="px-4 py-2.5 rounded-lg border border-border hover:bg-white/5 transition-colors font-semibold">
                    Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
