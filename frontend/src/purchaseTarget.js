// Destination of a digital product, mirrors backend enums/PurchaseTarget.java
// (the backend validates; these are only labels for the UI).
export const TARGETS = {
  PHONE: {
    label: 'Nomor HP Tujuan',
    placeholder: 'Contoh: 081234567890',
    hint: 'Pulsa / kuota dikirim ke nomor ini. Pastikan operatornya sesuai dengan produk.',
    codeLabel: 'Serial Number (SN)',
  },
  PLN_METER: {
    label: 'Nomor Meter / ID Pelanggan PLN',
    placeholder: '11 atau 12 digit angka',
    hint: 'Tertera di stiker meteran listrik atau di struk token sebelumnya.',
    codeLabel: 'Token Listrik',
  },
  GAME_ID: {
    label: 'ID Game',
    placeholder: 'Contoh: 12345678 (1234)',
    hint: 'Mobile Legends: User ID + Zone ID. Free Fire / PUBG / Genshin: ID pemain. Valorant: Riot ID (Nama#TAG).',
    codeLabel: 'Serial Number (SN)',
  },
};

// Keeps what each target can contain while typing; the backend does the real validation.
export const cleanTargetInput = (value, target) =>
  target === 'GAME_ID' ? value.slice(0, 40) : value.replace(/[^\d+]/g, '').slice(0, 16);

// PLN tokens are printed in groups of four: 1234-5678-9012-3456-7890
export const formatCode = (code, target) =>
  target === 'PLN_METER' && code ? code.replace(/(\d{4})(?=\d)/g, '$1-') : code;
