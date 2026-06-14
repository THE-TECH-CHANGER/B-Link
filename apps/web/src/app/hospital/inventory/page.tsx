"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Droplet, Activity, Save } from "lucide-react";

interface InventoryItem {
  blood_group: string;
  units: number;
  last_updated: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch("https://bloodlink-backend-vn4k.onrender.com/api/inventory");
      if (res.ok) {
        const data: InventoryItem[] = await res.json();
        const invMap: Record<string, number> = {};
        // Initialize all with 0 first
        BLOOD_GROUPS.forEach(bg => invMap[bg] = 0);
        // Map fetched data
        data.forEach(item => {
          invMap[item.blood_group] = item.units;
        });
        setInventory(invMap);
      }
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (bg: string, delta: number) => {
    const currentUnits = inventory[bg] || 0;
    const newUnits = Math.max(0, currentUnits + delta);
    
    // Optimistic update
    setInventory(prev => ({ ...prev, [bg]: newUnits }));
    setSaving(bg);

    try {
      await fetch("https://bloodlink-backend-vn4k.onrender.com/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blood_group: bg, units: newUnits })
      });
    } catch (err) {
      console.error("Failed to update inventory", err);
      // Revert on fail
      setInventory(prev => ({ ...prev, [bg]: currentUnits }));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalUnits = Object.values(inventory).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-wide">Blood Bank Inventory</h2>
          <p className="text-foreground/60 mt-1">Manage and monitor live blood stock levels.</p>
        </div>
        <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-4">
          <Activity className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wider">Total Units</p>
            <p className="text-xl font-bold">{totalUnits}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {BLOOD_GROUPS.map((bg) => {
          const units = inventory[bg] || 0;
          let stockColor = "text-green-500";
          if (units < 5) stockColor = "text-primary-red";
          else if (units < 15) stockColor = "text-amber-500";

          return (
            <div key={bg} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              {/* Background Icon */}
              <Droplet className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-5 pointer-events-none ${stockColor}`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-black text-foreground/90">{bg}</h3>
                  {saving === bg && <Save className="w-4 h-4 text-foreground/40 animate-pulse" />}
                </div>
                
                <div className="flex items-end gap-2 mb-6">
                  <span className={`text-4xl font-bold ${stockColor}`}>{units}</span>
                  <span className="text-foreground/60 mb-1 font-medium tracking-wide">Units</span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleUpdate(bg, -1)}
                    disabled={units === 0}
                    className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-white/5"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleUpdate(bg, 1)}
                    className="flex-1 h-12 bg-primary-red hover:bg-primary-red/90 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-red-900/20"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
