
export const APP_CONFIG = {
  ADMIN_USERNAME: 'ogahribet',
  ADMIN_PASSWORD: 'jaticempaka16',
  SECRET_CODE: '911',
};

export const INITIAL_DATA = {
  incomes: [
    { id: '1', donorName: 'Hamba Allah', amount: 500000, date: '2025-12-18' },
    { id: '2', donorName: 'Warga RT 01', amount: 250000, date: '2025-12-19' },
  ],
  expenses: [
    { id: '1', itemName: 'Nasi Kotak Ayam Bakar', unitPrice: 20000, qty: 10, date: '2025-12-19' },
  ],
  distributions: [
    { id: '1', count: 10, itemType: 'Paket Nasi', date: '2025-12-19' },
  ],
};
