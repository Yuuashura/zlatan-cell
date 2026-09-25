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
};

// PLN tokens are printed in groups of four: 1234-5678-9012-3456-7890
export const formatCode = (code, target) =>
  target === 'PLN_METER' && code ? code.replace(/(\d{4})(?=\d)/g, '$1-') : code;
