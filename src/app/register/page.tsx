"use client";

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle, X } from "lucide-react";
import nestraLogo from "@/images/nestra.jpeg";
import { createClient } from "@/lib/supabase/client";

// ─── Password strength rules ─────────────────────────────────────────────────
const PASSWORD_RULES = [
  { id: "length",    label: "Minimal 8 karakter",          test: (p: string) => p.length >= 8 },
  { id: "upper",    label: "Huruf besar (A–Z)",            test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",    label: "Huruf kecil (a–z)",            test: (p: string) => /[a-z]/.test(p) },
  { id: "number",   label: "Angka (0–9)",                  test: (p: string) => /[0-9]/.test(p) },
  { id: "symbol",   label: "Simbol (!@#$%^&*…)",          test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  // ─── Password strength ───────────────────────────────────────────────────
  const passedRules = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password]
  );
  const strengthScore = passedRules.filter((r) => r.passed).length; // 0–5
  const strengthLabel =
    strengthScore === 0 ? ""
    : strengthScore <= 2 ? "Lemah"
    : strengthScore <= 3 ? "Sedang"
    : strengthScore <= 4 ? "Kuat"
    : "Sangat Kuat";
  const strengthColor =
    strengthScore <= 2 ? "bg-red-500"
    : strengthScore === 3 ? "bg-yellow-400"
    : strengthScore === 4 ? "bg-blue-500"
    : "bg-green-500";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all password rules
    const failed = passedRules.filter((r) => !r.passed);
    if (failed.length > 0) {
      setError(`Password belum memenuhi: ${failed.map((r) => r.label).join(", ")}.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message || "Gagal mendaftar. Silakan coba lagi.");
      setIsLoading(false);
    } else {
      // Jangan auto-login! Arahkan user ke halaman login untuk verifikasi OTP
      setIsRegistered(true);
      setIsLoading(false);
    }
  };

  // ── Tampilan Sukses Registrasi ──────────────────────────
  if (isRegistered) {
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
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Akun Anda dengan email <strong>{email}</strong> telah berhasil didaftarkan.
              Silakan periksa email Anda untuk verifikasi (jika diperlukan), lalu login menggunakan password Anda.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full justify-center rounded-md bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Lanjut ke Halaman Login
            </Link>
            <div className="mt-6 text-center text-xs text-gray-500">
              &copy; 2026 Nestra Dashboard.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Registrasi ─────────────────────────────────────
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
          Buat akun baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Daftar ke Dashboard Monitoring PLTB
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border"
                  placeholder="anda@nestra.id"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strengthScore ? strengthColor : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {strengthLabel && (
                    <p className={`text-xs font-medium ${
                      strengthScore <= 2 ? "text-red-500"
                      : strengthScore === 3 ? "text-yellow-500"
                      : strengthScore === 4 ? "text-blue-500"
                      : "text-green-500"
                    }`}>
                      Kekuatan Password: {strengthLabel}
                    </p>
                  )}

                  {/* Rule checklist */}
                  <ul className="mt-2 space-y-1">
                    {passedRules.map((r) => (
                      <li key={r.id} className={`flex items-center gap-1.5 text-xs ${
                        r.passed ? "text-green-600" : "text-gray-400"
                      }`}>
                        {r.passed
                          ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          : <X className="w-3.5 h-3.5 flex-shrink-0" />}
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className={`block w-full pl-10 pr-10 sm:text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border ${
                    confirmPassword.length > 0
                      ? confirmPassword === password
                        ? "border-green-400 focus:border-green-500 focus:ring-green-500"
                        : "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p className={`mt-1 text-xs flex items-center gap-1 ${
                  confirmPassword === password ? "text-green-600" : "text-red-500"
                }`}>
                  {confirmPassword === password
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Password cocok</>
                    : <><X className="w-3.5 h-3.5" /> Password tidak cocok</>}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <ShieldCheck className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password || !confirmPassword}
              className="flex w-full justify-center rounded-md bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Daftar"
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Sudah punya akun? </span>
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in di sini
              </Link>
            </div>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500">
            &copy; 2026 Nestra Dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
