"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function DonorLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

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

      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const confResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confResult);
      setMessage("OTP sent successfully.");
    } catch (error: any) {
      console.error(error);
      setMessage("Failed to send OTP. " + error.message);
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!confirmationResult || otp.length < 6) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      const loginRes = await fetch("https://bloodlink-backend-vn4k.onrender.com/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ mobile_number: phone })
      });
      
      if (loginRes.ok) {
        const data = await loginRes.json();
        localStorage.setItem("donor_token", idToken);
        router.push("/donor/dashboard");
      } else if (loginRes.status === 404) {
        // Needs registration
        localStorage.setItem("pending_registration_phone", phone);
        localStorage.setItem("pending_firebase_uid", result.user.uid);
        localStorage.setItem("pending_firebase_id_token", idToken);
        router.push("/donor/register");
      } else {
        setMessage("Server authentication failed.");
      }
    } catch (error: any) {
      console.error(error);
      setMessage("Invalid OTP.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans relative">
      <div id="recaptcha-container"></div>
      
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-sm w-full mx-auto relative z-10 py-12">
        <h1 className="text-3xl font-bold mb-2 w-full text-left">Donor Login</h1>
        <p className="text-gray-400 mb-8 w-full text-left">Enter your mobile number to securely access your BloodLink account.</p>

        <div className="w-full space-y-6">
          {!confirmationResult ? (
            <div className="space-y-4">
              <div className="flex items-center bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-4 focus-within:border-red-500 transition-colors">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Mobile Number (e.g. 9876543210)"
                  className="w-full bg-transparent text-white focus:outline-none text-lg" 
                />
              </div>
              <button 
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 text-lg"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <input 
                type="text" 
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 tracking-[0.5em] text-center text-2xl font-mono" 
                maxLength={6}
              />
              <button 
                onClick={verifyOtp}
                disabled={loading}
                className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-red-900/20"
              >
                {loading ? "Verifying..." : "Verify & Login"}
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
          
          {message && <p className="text-red-400 text-sm text-center">{message}</p>}
        </div>
      </main>
    </div>
  );
}
