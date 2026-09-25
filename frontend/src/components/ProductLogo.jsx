import React, { useState } from 'react';
import { Smartphone, Wifi, Zap, Gamepad2, Package } from 'lucide-react';

// Icon per category name, used when there is no provider logo (e.g. physical goods).
export function categoryIcon(type = '') {
  const t = type.toUpperCase();
  if (t.includes('PLN') || t.includes('LISTRIK')) return Zap;
  if (t.includes('GAME')) return Gamepad2;
  if (t.includes('DATA') || t.includes('KUOTA')) return Wifi;
  if (t.includes('PULSA') || t.includes('CREDIT')) return Smartphone;
  return Package;
}

// Provider logo (GET /api/providers/{id}/logo); falls back to the category icon.
export default function ProductLogo({ provider, categoryType, size = 'w-11 h-11' }) {
  const [failed, setFailed] = useState(false);
  if (provider?.id && provider.hasLogo !== false && !failed) {
    return (
      <img
        src={`/api/providers/${provider.id}/logo`}
        alt={`Logo ${provider.name}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-xl object-contain bg-white border border-slate-100 p-1`}
      />
    );
  }
  const Icon = categoryIcon(categoryType);
  return (
    <div className={`${size} shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center`} aria-hidden="true">
      <Icon className="w-1/2 h-1/2" />
    </div>
  );
}
