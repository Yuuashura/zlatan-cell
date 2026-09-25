import React, { useState } from 'react';
import { Star } from 'lucide-react';

// Komponen rating "Nilai Kami" (SKPL-F21) yang dipakai halaman ulasan publik, admin, dan popup.
export const RATING_LABELS = ['', 'Sangat kecewa', 'Kurang puas', 'Cukup', 'Puas', 'Sangat puas'];

export function Stars({ value, size = 'w-3.5 h-3.5' }) {
  return (
    <span className="inline-flex" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, size = 'w-9 h-9' }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div>
      <div className="flex justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i} bintang`}
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            className="p-1 transition hover:scale-110"
          >
            <Star className={`${size} ${i <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      <p className="text-center text-xs font-semibold text-amber-600 h-4 mt-1">{RATING_LABELS[shown]}</p>
    </div>
  );
}

export function RatingSummary({ data }) {
  const maxCount = Math.max(1, ...Object.values(data.distribution));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center">
        <div className="text-5xl font-black text-slate-900">{data.count ? data.average.toFixed(1) : '-'}</div>
        <div className="my-2">
          <Stars value={data.average} size="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-400">{data.count} ulasan</div>
      </div>
      <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        {Object.entries(data.distribution)
          .sort((a, b) => b[0] - a[0])
          .map(([star, count]) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-10 font-semibold text-slate-600">{star} ★</span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-slate-500">{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export const formatReviewDate = (val) => (val ? new Date(val).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-');
