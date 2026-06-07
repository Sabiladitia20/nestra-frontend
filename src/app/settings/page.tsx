"use client";

import React, { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Settings, User, Camera, Loader2, Save, Phone, AlignLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState<any>(null);
  
  // Profile Form States
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Load theme and user data
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // User data
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Populate form fields from metadata
        const meta = user.user_metadata || {};
        if (meta.avatar_url) setAvatarUrl(meta.avatar_url);
        if (meta.full_name) setFullName(meta.full_name);
        if (meta.phone_number) setPhoneNumber(meta.phone_number);
        if (meta.bio) setBio(meta.bio);
      }
    };
    fetchUser();
  }, [supabase.auth]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Anda harus memilih gambar untuk diunggah.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload ke Supabase Storage (bucket "avatars")
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Dapatkan URL public dari gambar yang diunggah
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Update user_metadata dengan URL avatar baru
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      window.location.reload();
      
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat mengunggah foto profil.');
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          bio: bio
        }
      });

      if (error) throw error;
      
      alert("Profil berhasil diperbarui!");
      // Reload is necessary to refresh the name in the header popup
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat menyimpan profil.");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 max-w-2xl mx-auto stagger-in mt-10">
        <Card className="p-6 glass-card rounded-xl space-y-6 border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-slate-800">Pengaturan & Profil</h2>
          </div>

          {/* User Profile Form Section */}
          <div className="space-y-5 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Biodata Lengkap</label>
            </div>
            
            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="relative group flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 flex items-center justify-center">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  title="Ganti foto profil"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {fullName || (user?.email ? user.email.split('@')[0] : 'Memuat...')}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 text-[10px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 inline-flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-md"
                >
                  {uploading ? 'Mengunggah...' : 'Ubah Foto'}
                </button>
              </div>
            </div>

            {/* Biodata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Nomor Handphone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08123456789"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Deskripsi / Biodata</label>
                <div className="relative">
                  <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
                    <AlignLeft className="h-4 w-4 text-slate-400" />
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ceritakan sedikit tentang Anda..."
                    rows={3}
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="w-4 h-4" /> Simpan Perubahan</>
                )}
              </button>
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tema Dashboard</label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {["light", "dark"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`p-3 border rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      theme === t 
                        ? "border-blue-500 bg-blue-50/50 text-blue-700 font-extrabold shadow-sm" 
                        : "border-slate-200 bg-white/60 hover:bg-white text-slate-600"
                    }`}
                  >
                    {t === "light" ? "Terang (Light)" : "Gelap (Dark)"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

