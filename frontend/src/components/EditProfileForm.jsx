import React, { useRef, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useDialog } from './DialogProvider';
import { Settings, Loader2, Camera, Trash2 } from 'lucide-react';

// Kelola profil: foto, nama pengguna, nomor HP, dan ganti password. Email tidak bisa diubah di
// sini karena dipakai untuk login Google dan pengiriman OTP.

// Center-crops the chosen file to a 256 px JPEG so the upload stays small; the server re-encodes it again.
function toSquareJpeg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 256, 256);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('File bukan gambar yang bisa dibaca.'));
    };
    img.src = url;
  });
}

export default function EditProfileForm() {
  const { user, refreshUser } = useAuth();
  const { confirm } = useDialog();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInput = useRef(null);

  const isGoogleOnly = user?.authProvider === 'GOOGLE';

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/user/profile', {
        username: username.trim(),
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

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // choosing the same file again must still trigger onChange
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ ok: false, text: 'Ukuran gambar maksimal 5 MB.' });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const image = await toSquareJpeg(file);
      const res = await api.put('/user/avatar', { image });
      setMessage({ ok: true, text: res.data.message });
      refreshUser();
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || err.message || 'Gagal mengunggah foto.' });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    const ok = await confirm('Foto profil akan dihapus dan diganti inisial nama Anda.', {
      title: 'Hapus foto profil?',
      confirmText: 'Hapus',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await api.delete('/user/avatar');
      setMessage({ ok: true, text: res.data.message });
      refreshUser();
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || 'Gagal menghapus foto.' });
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
        <div className="mt-5">
          {/* Profile photo */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Foto profil" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-500">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadPhoto} className="hidden" />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60"
              >
                <Camera className="w-4 h-4" /> {user?.profilePictureUrl ? 'Ganti Foto' : 'Unggah Foto'}
              </button>
              {user?.profilePictureUrl && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Hapus Foto
                </button>
              )}
              <span className="text-[10px] text-slate-400">JPG, PNG, atau WebP, maksimal 5 MB. Dipotong persegi otomatis.</span>
            </div>
          </div>

          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-slate-600">
              Nama pengguna
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={30}
                required
                className={input}
              />
              <span className="block mt-1 text-[10px] font-normal text-slate-400">Dipakai untuk login dan tampil di ulasan.</span>
            </label>
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
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
              <span className="text-[11px] text-slate-400">Email: {user?.email} (tidak dapat diubah)</span>
            </div>
          </form>
          {message && (
            <p role="status" className={`mt-3 text-xs ${message.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{message.text}</p>
          )}
        </div>
      )}
    </div>
  );
}
