"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, MapPin, Droplet, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DonorRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "A+",
    latitude: null as number | null,
    longitude: null as number | null,
    lastDonationDate: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const fetchLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocating(false);
        },
        (error) => {
          console.error(error);
          setMessage("Failed to get location. Please enable GPS permissions.");
          setLocating(false);
        }
      );
    } else {
      setMessage("Geolocation not supported by this browser.");
      setLocating(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.latitude || !formData.longitude) {
      setMessage("Please fill all fields and allow location access.");
      return;
    }

    setLoading(true);
    try {
      const phone = localStorage.getItem("pending_registration_phone");
      const firebaseUid = localStorage.getItem("pending_firebase_uid");

      if (!phone || !firebaseUid) {
        setMessage("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      const regRes = await fetch("https://bloodlink-backend-vn4k.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: firebaseUid,
          mobile_number: phone,
          name: formData.name,
          role: "donor",
          blood_group: formData.bloodGroup,
          latitude: formData.latitude,
          longitude: formData.longitude,
          last_donation_date: formData.lastDonationDate || null
        })
      });

      if (regRes.ok) {
        const regData = await regRes.json();
        localStorage.setItem("donor_token", regData.token);
        localStorage.removeItem("pending_registration_phone");
        localStorage.removeItem("pending_firebase_uid");
        router.push("/donor/dashboard");
      } else {
        setMessage("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during registration.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans relative">
      <header className="p-6">
        <Link href="/donor/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md w-full mx-auto relative z-10 py-12">
        <h1 className="text-3xl font-bold mb-2 w-full text-left">Complete Profile</h1>
        <p className="text-gray-400 mb-8 w-full text-left">Almost there! We just need a few details to register you as a Donor.</p>

        <form onSubmit={handleRegister} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Full Name</label>
            <div className="flex items-center bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus-within:border-red-500 transition-colors">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-transparent text-white focus:outline-none text-lg" 
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Blood Group</label>
            <div className="flex items-center bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus-within:border-red-500 transition-colors">
              <Droplet className="w-5 h-5 text-red-500 mr-3" />
              <select 
                value={formData.bloodGroup}
                onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full bg-transparent text-white focus:outline-none text-lg appearance-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg} className="bg-neutral-900">{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Last Donation Date (Optional)</label>
            <div className="flex items-center bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 focus-within:border-red-500 transition-colors">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="date" 
                value={formData.lastDonationDate}
                onChange={e => setFormData({...formData, lastDonationDate: e.target.value})}
                max={new Date().toISOString().split("T")[0]}
                className="w-full bg-transparent text-white focus:outline-none text-lg [color-scheme:dark]" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Location Status</label>
            <div className={`flex items-center rounded-xl px-4 py-3 border ${formData.latitude ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <MapPin className={`w-5 h-5 mr-3 ${formData.latitude ? 'text-green-500' : 'text-amber-500'}`} />
              <span className={`text-sm ${formData.latitude ? 'text-green-400' : 'text-amber-400'}`}>
                {locating ? "Acquiring GPS coordinates..." : 
                 formData.latitude ? "GPS Coordinates secured." : "Waiting for Location Permission..."}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !formData.latitude}
            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-red-900/20 mt-4"
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
          
          {message && <p className="text-red-400 text-sm text-center">{message}</p>}
        </form>
      </main>
    </div>
  );
}
