"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, ShieldCheck, KeyRound, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import nestraLogo from "@/images/nestra.jpeg";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("password");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Email atau password salah. Silakan coba lagi.");
      setIsLoading(false);
    } else {
      router.refresh();
      router.replace("/");
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    });

    if (signInError) {
      setError(signInError.message || "Gagal mengirim OTP. Pastikan Email Provider aktif di Supabase.");
      setIsLoading(false);
    } else {
      setIsOtpSent(true);
      setSuccessMsg("Kode OTP 6-digit telah dikirim ke email Anda.");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      setError("Kode OTP salah atau kedaluwarsa. Silakan coba lagi.");
      setIsLoading(false);
    } else {
      router.refresh();
      router.replace("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src={nestraLogo}
            alt="Nestra Logo"
            width={64}
            height={64}
            className="rounded-lg shadow-sm object-cover"
          />
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Dashboard Monitoring PLTB
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {/* Method Toggle */}
          {!isOtpSent && (
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${loginMethod === "password" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => { setLoginMethod("password"); setError(""); }}
              >
                Password
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${loginMethod === "otp" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => { setLoginMethod("otp"); setError(""); }}
              >
                Email OTP
              </button>
            </div>
          )}

          {loginMethod === "password" && !isOtpSent && (
            <form className="space-y-6" onSubmit={handlePasswordLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email" type="email" required value={email}
                    onChange={(e) => { setEmail(e.target.value); if(error) setError(""); }}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 py-2.5 border"
                    placeholder="anda@nestra.id"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password" type={showPassword ? "text" : "password"} required value={password}
                    onChange={(e) => { setPassword(e.target.value); if(error) setError(""); }}
                    className="block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 py-2.5 border"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex"><ShieldCheck className="h-5 w-5 text-red-400 flex-shrink-0" /><div className="ml-3"><h3 className="text-sm font-medium text-red-800">{error}</h3></div></div>
                </div>
              )}

              <div>
                <button type="submit" disabled={isLoading || !email || !password} className="flex w-full justify-center rounded-md bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign in"}
                </button>
              </div>
            </form>
          )}

          {loginMethod === "otp" && !isOtpSent && (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email" type="email" required value={email}
                    onChange={(e) => { setEmail(e.target.value); if(error) setError(""); }}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 py-2.5 border"
                    placeholder="anda@nestra.id"
                  />
                </div>
                <p className="mt-2 text-[10px] text-gray-500">Kode OTP akan dikirimkan ke email Anda.</p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex"><ShieldCheck className="h-5 w-5 text-red-400 flex-shrink-0" /><div className="ml-3"><h3 className="text-sm font-medium text-red-800">{error}</h3></div></div>
                </div>
              )}

              <div>
                <button type="submit" disabled={isLoading || !email} className="flex w-full justify-center rounded-md bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Kirim Kode OTP"}
                </button>
              </div>
            </form>
          )}

          {isOtpSent && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              {successMsg && (
                <div className="rounded-md bg-green-50 p-4">
                  <h3 className="text-sm font-medium text-green-800 text-center">{successMsg}</h3>
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Masukkan 6-Digit OTP</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); if(error) setError(""); }}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 py-2.5 border text-center tracking-widest font-bold text-lg"
                    placeholder="000000"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Dikirim ke <strong>{email}</strong></p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex"><ShieldCheck className="h-5 w-5 text-red-400 flex-shrink-0" /><div className="ml-3"><h3 className="text-sm font-medium text-red-800">{error}</h3></div></div>
                </div>
              )}

              <div>
                <button type="submit" disabled={isLoading || otp.length < 6} className="flex w-full justify-center rounded-md bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verifikasi & Masuk"}
                </button>
              </div>

              <div className="text-center text-sm">
                <button type="button" onClick={() => setIsOtpSent(false)} className="flex items-center justify-center w-full text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Ganti Email / Mode Login
                </button>
              </div>
            </form>
          )}

          {!isOtpSent && (
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Belum punya akun? </span>
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Daftar di sini
              </Link>
            </div>
          )}

          <div className="mt-8 text-center text-xs text-gray-500">
            &copy; 2026 Nestra Dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}

