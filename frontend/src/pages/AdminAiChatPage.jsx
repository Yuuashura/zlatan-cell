import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useDialog } from '../components/DialogProvider';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Bot, Plus, Trash2, MessageSquare, Send, Loader2, AlertTriangle } from 'lucide-react';

// SKPL-F20 (usulan): AI chat untuk admin. Tata letak mengikuti referensi SnapMart
// (daftar sesi di kiri, percakapan di kanan); data diambil backend lewat menu laporan.
const GREETING =
  'Halo! Aku Asisten Zelatan Cell. Tanyakan apa saja seputar data toko: omset dan laba, produk terlaris, ' +
  'stok menipis, top up, performa voucher dan flash sale, atau rating pelanggan.';

const SUGGESTIONS = [
  'Ringkas penjualan bulan ini dibanding bulan lalu',
  '5 produk terlaris minggu ini',
  'Produk apa yang stoknya perlu diisi?',
  'Bagaimana performa voucher dan flash sale bulan ini?',
  'Apa kata pelanggan di ulasan terbaru?',
];

function Bubble({ role, content }) {
  const isUser = role === 'USER';
  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Bot className="w-3.5 h-3.5" /> Asisten
          </div>
        )}
        {content}
      </div>
    </div>
  );
}

export default function AdminAiChatPage() {
  const { confirm, notify } = useDialog();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const requestedId = useRef(null); // ignore a slow response for a session the admin already left
  const [error, setError] = useState(null);
  const [usage, setUsage] = useState(null);
  const scrollBox = useRef(null); // only the message list scrolls, never the whole page
  const initStarted = useRef(false); // StrictMode runs effects twice in dev; create the first session once

  useEffect(() => {
    if (user && !initStarted.current) {
      initStarted.current = true;
      init();
    }
  }, [user]);

  useEffect(() => {
    const box = scrollBox.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, sending]);

  const errorText = (err, fallback) => err.response?.data?.message || fallback;

  const init = async () => {
    try {
      const [sessRes, usageRes] = await Promise.all([api.get('/admin/ai/sessions'), api.get('/admin/ai/usage')]);
      setUsage(usageRes.data);
      let list = sessRes.data;
      if (list.length === 0) {
        const created = await api.post('/admin/ai/sessions');
        list = [created.data];
      }
      setSessions(list);
      await selectSession(list[0].id);
    } catch (err) {
      setLoadingSession(false);
      setError(errorText(err, 'Gagal memuat sesi chat.'));
    }
  };

  const refreshSessions = async () => {
    try {
      const res = await api.get('/admin/ai/sessions');
      setSessions(res.data);
    } catch {
      /* daftar sesi hanya penunjang, abaikan */
    }
  };

  const selectSession = async (id) => {
    requestedId.current = id;
    setActiveId(id);
    setError(null);
    setLoadingSession(true);
    try {
      const res = await api.get(`/admin/ai/sessions/${id}/messages`);
      if (requestedId.current === id) setMessages(res.data);
    } catch (err) {
      if (requestedId.current === id) {
        setMessages([]);
        setError(errorText(err, 'Gagal memuat pesan.'));
      }
    } finally {
      if (requestedId.current === id) setLoadingSession(false);
    }
  };

  const newSession = async () => {
    try {
      const res = await api.post('/admin/ai/sessions');
      setSessions((prev) => [res.data, ...prev]);
      requestedId.current = res.data.id;
      setActiveId(res.data.id);
      setMessages([]);
      setLoadingSession(false);
      setError(null);
      return res.data.id;
    } catch (err) {
      setError(errorText(err, 'Gagal membuat sesi baru.'));
      return null;
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!(await confirm('Sesi ini beserta seluruh pesannya akan dihapus permanen.', { title: 'Hapus Sesi', confirmText: 'Hapus', danger: true }))) return;
    try {
      await api.delete(`/admin/ai/sessions/${id}`);
      const remaining = sessions.filter((s) => s.id !== id);
      setSessions(remaining);
      if (activeId === id) {
        if (remaining.length > 0) selectSession(remaining[0].id);
        else newSession();
      }
    } catch (err) {
      setError(errorText(err, 'Gagal menghapus sesi.'));
    }
  };

  const deleteAll = async () => {
    if (!(await confirm('Semua sesi dan riwayat chat akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.', { title: 'Hapus Semua Riwayat', confirmText: 'Hapus Semua', danger: true }))) return;
    try {
      await api.delete('/admin/ai/sessions');
      setSessions([]);
      await newSession();
    } catch (err) {
      setError(errorText(err, 'Gagal menghapus semua sesi.'));
    }
  };

  const send = async (text) => {
    const prompt = (text ?? input).trim();
    if (!prompt || sending) return;
    setSending(true);
    setError(null);
    const sessionId = activeId || (await newSession());
    if (!sessionId) {
      setSending(false);
      return;
    }
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'USER', content: prompt }]);
    setInput('');
    try {
      const res = await api.post(`/admin/ai/sessions/${sessionId}/messages`, { prompt });
      setMessages((prev) => [...prev, res.data]);
      refreshSessions();
    } catch (err) {
      setError(errorText(err, 'Gagal mendapatkan jawaban AI.'));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-5">
        <Link to="/admin" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-600" /> Asisten AI Laporan
        </h1>
        <p className="text-xs text-slate-500">
          Tanya jawab seputar data penjualan. Angka dihitung sistem, AI hanya menjelaskan.
          {usage?.model && <span className="ml-1 text-slate-400">Model: {usage.model}</span>}
        </p>
      </div>

      {usage && !usage.configured && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            AI belum dikonfigurasi. Isi <code className="font-mono">OPENROUTER_API_KEY</code> dan{' '}
            <code className="font-mono">OPENROUTER_MODEL</code> di file <code className="font-mono">backend/.env</code>, lalu
            jalankan ulang backend.
          </span>
        </div>
      )}

      <div className="flex gap-4 h-[70vh]">
        {/* Daftar sesi */}
        <aside className="w-60 flex-shrink-0 bg-white rounded-3xl border border-slate-200 shadow-xs flex-col hidden md:flex">
          <div className="p-3 border-b border-slate-100">
            <button
              onClick={newSession}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" /> Sesi Baru
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer text-xs transition ${
                  activeId === s.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{s.title}</span>
                </span>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  title="Hapus sesi"
                  aria-label={`Hapus sesi ${s.title}`}
                  className="p-1 rounded-lg text-slate-300 group-hover:text-slate-400 hover:!text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={deleteAll}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Riwayat
            </button>
          </div>
        </aside>

        {/* Percakapan */}
        <section className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div ref={scrollBox} className="flex-1 overflow-y-auto p-4 bg-slate-50/60">
            {loadingSession && (
              <div role="status" className="h-full flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                Memuat percakapan...
              </div>
            )}
            {!loadingSession && messages.length === 0 && !sending && (
              <>
                <Bubble role="AI" content={GREETING} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] text-slate-600 hover:border-blue-300 hover:text-blue-700 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}
            {!loadingSession && messages.map((m) => (
              <Bubble key={m.id} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> Sedang menganalisis data...
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mb-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">{error}</div>
          )}

          <div className="p-3 border-t border-slate-100 flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={1000}
              disabled={sending || loadingSession}
              placeholder="Tulis pertanyaan, misalnya: berapa omset hari ini?"
              className="flex-1 resize-none border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <button
              onClick={() => send()}
              disabled={sending || loadingSession || !input.trim()}
              title="Kirim"
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white transition"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
