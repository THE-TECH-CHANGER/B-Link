"use client";

import { useState, useEffect } from "react";
import { Droplet, MapPin, AlertCircle, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function GuestRequestBlood() {
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "A+",
    units: 1,
    urgency: "High",
  });
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName) {
      setMessage("Please enter the patient's name.");
      return;
    }
    setShowOtpModal(true);
    setMessage("");
  };

  const sendOtp = async () => {
    if (phone.length < 10) {
      setMessage("Enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
        });
      }
      const appVerifier = window.recaptchaVerifier;

      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`; // default to +91
      const confResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confResult);
      setMessage("OTP sent to your phone.");
    } catch (error: any) {
      console.error(error);
      setMessage("Failed to send OTP. " + error.message);
    }
    setLoading(false);
  };

  const verifyOtpAndSubmitRequest = async () => {
    if (!confirmationResult || otp.length < 6) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      // 1. Authenticate / Auto-register as Guest Patient
      const loginRes = await fetch("https://bloodlink-backend-vn4k.onrender.com/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ mobile_number: phone })
      });
      
      let token = idToken; // The Firebase ID token is what our backend uses
      if (loginRes.ok) {
        // login succeeded, user exists
      } else if (loginRes.status === 404) {
        // Needs registration
        await fetch("https://bloodlink-backend-vn4k.onrender.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firebase_uid: result.user.uid,
            mobile_number: phone,
            name: formData.patientName,
            role: "patient",
            blood_group: formData.bloodGroup,
            latitude: 12.9716, // dummy for now or fetch via HTML5
            longitude: 77.5946
          })
        });
      }

      // 2. Submit the emergency request
      const reqRes = await fetch("https://bloodlink-backend-vn4k.onrender.com/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          blood_group: formData.bloodGroup,
          units_required: formData.units,
          urgency_level: formData.urgency,
          target_hospital_id: 1 // Default Apollo Hospital for MVP
        })
      });

      if (reqRes.ok) {
        setSuccess(true);
        setShowOtpModal(false);
      } else {
        setMessage("Failed to submit request.");
      }
    } catch (error: any) {
      console.error(error);
      setMessage("Invalid OTP or error occurred.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1A1A1A] rounded-2xl border border-white/10 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold">Emergency Broadcasted!</h2>
          <p className="text-gray-400 text-lg">
            Nearby donors have been notified via push notifications. The hospital has received your request.
          </p>
          <Link href="/" className="inline-block mt-4 px-6 py-3 bg-[#DC2626] rounded-xl font-bold w-full">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans relative">
      <div id="recaptcha-container"></div>
      
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg w-full mx-auto relative z-10 py-12">
        <div className="w-16 h-16 rounded-full bg-[#991B1B]/20 flex items-center justify-center mb-6 border border-[#991B1B]/50">
          <AlertCircle className="w-8 h-8 text-[#EF4444]" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Request Blood</h1>
        <p className="text-gray-400 text-center mb-8">Broadcast an emergency to nearby donors immediately.</p>

        <form onSubmit={handleRequestSubmit} className="w-full space-y-6 bg-[#1A1A1A] p-6 rounded-2xl border border-white/10">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Patient Name</label>
            <input 
              type="text" 
              value={formData.patientName}
              onChange={e => setFormData({...formData, patientName: e.target.value})}
              className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500" 
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Blood Group</label>
              <select 
                value={formData.bloodGroup}
                onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Units Needed</label>
              <div className="flex items-center bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3">
                <Droplet className="w-5 h-5 text-red-500 mr-2" />
                <input 
                  type="number" 
                  min="1"
                  value={formData.units}
                  onChange={e => setFormData({...formData, units: parseInt(e.target.value) || 1})}
                  className="w-full bg-transparent text-white focus:outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Hospital</label>
            <div className="flex items-center bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 opacity-70 cursor-not-allowed">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                value="Apollo Hospital (Default for MVP)" 
                disabled
                className="w-full bg-transparent text-gray-400 focus:outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-lg py-4 rounded-xl transition-colors shadow-lg shadow-red-900/20"
          >
            Submit Request
          </button>
        </form>

        {message && !showOtpModal && <p className="mt-4 text-red-400">{message}</p>}

      </main>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">Verify Phone Number</h3>
            <p className="text-sm text-gray-400 mb-6">We need to verify your number to prevent fraudulent requests.</p>
            
            {!confirmationResult ? (
              <div className="space-y-4">
                <div className="flex items-center bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3">
                  <Phone className="w-5 h-5 text-gray-400 mr-2" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Mobile Number (e.g. 9876543210)"
                    className="w-full bg-transparent text-white focus:outline-none" 
                  />
                </div>
                <button 
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 text-white focus:outline-none tracking-widest text-center text-xl font-mono" 
                />
                <button 
                  onClick={verifyOtpAndSubmitRequest}
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Broadcast Emergency"}
                </button>
                <button 
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full text-gray-400 font-medium py-2 hover:text-white transition-colors text-center"
                >
                  Resend OTP
                </button>
              </div>
            )}
            
            {message && <p className="mt-4 text-center text-red-400 text-sm">{message}</p>}
            
            <button 
              onClick={() => setShowOtpModal(false)}
              className="mt-6 w-full text-center text-gray-500 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Add to window object for TS
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
