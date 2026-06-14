"use client";

import { useState } from "react";
import { Building2, MapPin, Phone, Mail, ShieldAlert, Save } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-wide">Hospital Settings</h2>
        <p className="text-foreground/60 mt-1">Manage your hospital profile, location, and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-lg border-b border-white/5 pb-4">
              <Building2 className="w-5 h-5 text-primary-red" />
              Facility Profile
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70">Hospital Name</label>
                <input type="text" defaultValue="Apollo Hospital" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-red" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70">Hospital Type</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-red appearance-none">
                  <option>Multi-Specialty</option>
                  <option>General</option>
                  <option>Blood Bank</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground/70">Full Address</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" defaultValue="154/11, Bannerghatta Road, Opp IIM, Bengaluru" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-red" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-lg border-b border-white/5 pb-4">
              <ShieldAlert className="w-5 h-5 text-primary-red" />
              Emergency Broadcast Settings
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-red" />
                <div>
                  <p className="font-medium">Auto-Broadcast to Registered Donors</p>
                  <p className="text-sm text-foreground/50">Automatically notify donors within 10km when urgency is HIGH.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-red" />
                <div>
                  <p className="font-medium">SMS Fallback Integration</p>
                  <p className="text-sm text-foreground/50">Send traditional SMS if push notification fails to deliver.</p>
                </div>
              </label>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-red hover:bg-primary-red/90 text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="font-bold text-lg border-b border-white/5 pb-3">Contact Information</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">Primary Phone</label>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary-red" />
                  +91 80 2630 4050
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-foreground/50 uppercase tracking-wider font-semibold">Admin Email</label>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary-red" />
                  admin@apollo.com
                </div>
              </div>
            </div>
            <button className="w-full mt-2 py-2 text-sm border border-white/10 hover:bg-white/5 rounded-lg transition-colors">
              Edit Contact Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
