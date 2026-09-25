import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Settings, Loader2 } from 'lucide-react';

// Kelola profil (v1): nomor HP dan ganti password. Email tidak bisa diubah di sini karena
// dipakai untuk login Google dan pengiriman OTP.
export default function EditProfileForm() {
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const isGoogleOnly = user?.authProvider === 'GOOGLE';

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/user/profile', {
        phoneNumber,
        currentPassword: currentPassword || null,
        newPassword: newPassword || null,
      });
      setMessage({ ok: true, text: res.data.message });
      setCurrentPassword('');
      setNewPassword('');
      refreshUser();
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || 'Gagal menyimpan profil.' });
    } finally {
      setSaving(false);
    }
  };

  const input =
    'mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="text-sm font-bold text-slate-900 flex items-center gap-2 hover:text-blue-600 transition"
      >
        <Settings className="w-4 h-4 text-blue-600" /> {open ? 'Tutup Edit Profil' : 'Edit Profil'}
      </button>

      {open && (
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <label className="text-xs font-semibold text-slate-600">
            Nomor HP
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="08xxxxxxxxxx" className={input} required />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Password lama
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isGoogleOnly}
              placeholder={isGoogleOnly ? 'Akun Google' : 'Isi jika ingin ganti password'}
              className={input}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Password baru
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isGoogleOnly}
              minLength={6}
              placeholder="Minimal 6 karakter"
              className={input}
            />
          </label>
          <div className="md:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
            </button>
            <span className="text-[11px] text-slate-400">Email: {user?.email} (tidak dapat diubah)</span>
          </div>
          {message && (
            <p className={`md:col-span-3 text-xs ${message.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{message.text}</p>
          )}
        </form>
      )}
    </div>
  );
}
