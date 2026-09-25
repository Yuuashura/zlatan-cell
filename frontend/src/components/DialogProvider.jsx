import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

// Popup konfirmasi/pemberitahuan pengganti window.confirm dan window.alert.
// Pemakaian:
//   const { confirm, notify } = useDialog();
//   if (!(await confirm('Hapus sesi ini?', { title: 'Hapus Sesi', confirmText: 'Hapus', danger: true }))) return;
//   notify('Gagal menyimpan data.');
const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { kind, message, title, confirmText, danger, resolve }
  const confirmButton = useRef(null);

  const open = useCallback(
    (kind, message, options = {}) =>
      new Promise((resolve) => setDialog({ kind, message, ...options, resolve })),
    []
  );
  const confirm = useCallback((message, options) => open('confirm', message, options), [open]);
  const notify = useCallback((message, options) => open('notify', message, options), [open]);

  const close = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  useEffect(() => {
    if (!dialog) return undefined;
    confirmButton.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  const isConfirm = dialog?.kind === 'confirm';
  const Icon = dialog?.danger ? AlertTriangle : Info;

  return (
    <DialogContext.Provider value={{ confirm, notify }}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-message"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6"
          >
            <div className="flex items-start gap-3 mb-5">
              <div
                className={`p-2 rounded-xl flex-shrink-0 ${
                  dialog.danger ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h2 id="dialog-title" className="font-black text-slate-900">
                  {dialog.title || (isConfirm ? 'Konfirmasi' : 'Pemberitahuan')}
                </h2>
                <p id="dialog-message" className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                  {dialog.message}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {isConfirm && (
                <button
                  onClick={() => close(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
              )}
              <button
                ref={confirmButton}
                onClick={() => close(true)}
                className={`px-4 py-2 rounded-xl text-white text-sm font-bold transition ${
                  dialog.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {dialog.confirmText || (isConfirm ? 'Ya, lanjutkan' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}
