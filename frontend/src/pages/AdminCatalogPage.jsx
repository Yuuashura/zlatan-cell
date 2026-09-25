import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useDialog } from '../components/DialogProvider';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Tags, Radio, Pencil, Trash2, Plus, X } from 'lucide-react';

// Kelola kategori dan provider (fitur v1 yang dipindah ke React).
// Hapus ditolak server kalau masih ada produk yang memakainya.
function Section({ title, icon: Icon, items, fieldLabel, placeholder, getLabel, onSave, onDelete }) {
  const { confirm } = useDialog();
  const [value, setValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSave(editingId, value.trim());
      setValue('');
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    if (!(await confirm(`${getLabel(item)} akan dihapus.`, { title: `Hapus ${title}`, confirmText: 'Hapus', danger: true }))) return;
    setError(null);
    try {
      await onDelete(item.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600" /> {title}
        <span className="text-xs font-semibold text-slate-400">({items.length})</span>
      </h2>

      <form onSubmit={submit} className="flex gap-2 mb-4">
        <label className="sr-only" htmlFor={`${title}-input`}>{fieldLabel}</label>
        <input
          id={`${title}-input`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 disabled:opacity-60"
        >
          {editingId ? 'Simpan' : <><Plus className="w-4 h-4" /> Tambah</>}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setValue('');
            }}
            title="Batal edit"
            className="px-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}

      <ul className="divide-y divide-slate-100">
        {items.length === 0 && <li className="py-6 text-center text-xs text-slate-400">Belum ada data.</li>}
        {items.map((item) => (
          <li key={item.id} className="py-2.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-800">{getLabel(item)}</span>
            <span className="flex gap-1">
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setValue(getLabel(item));
                }}
                title="Ubah"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => remove(item)}
                title="Hapus"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminCatalogPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    const [cat, prov] = await Promise.all([api.get('/categories'), api.get('/providers')]);
    setCategories(cat.data);
    setProviders(prov.data);
  };

  const saveCategory = async (id, type) => {
    const existing = categories.find((c) => c.id === id);
    await api.post('/admin/categories', { id, code: existing?.code, type });
    await load();
  };

  const saveProvider = async (id, name) => {
    await api.post('/admin/providers', { id, name });
    await load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/admin" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
      </Link>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Kategori &amp; Provider</h1>
      <p className="text-xs text-slate-500 mb-8">Data master untuk pengelompokan produk</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section
          title="Kategori"
          icon={Tags}
          items={categories}
          fieldLabel="Nama kategori"
          placeholder="Contoh: PAKET SMS"
          getLabel={(c) => c.type}
          onSave={saveCategory}
          onDelete={async (id) => {
            await api.delete(`/admin/categories/${id}`);
            await load();
          }}
        />
        <Section
          title="Provider"
          icon={Radio}
          items={providers}
          fieldLabel="Nama provider"
          placeholder="Contoh: by.U"
          getLabel={(p) => p.name}
          onSave={saveProvider}
          onDelete={async (id) => {
            await api.delete(`/admin/providers/${id}`);
            await load();
          }}
        />
      </div>
    </div>
  );
}
