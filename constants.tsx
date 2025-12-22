
import { AppData, LayoutConfig } from './types';

export const APP_CONFIG = {
  ADMIN_USERNAME: 'ogahribet',
  ADMIN_PASSWORD: 'jaticempaka16',
  SECRET_CODE: '911',
};

export const DEFAULT_LAYOUT: LayoutConfig = {
  primaryColor: 'emerald',
  fontFamily: 'Plus Jakarta Sans',
  animationEnabled: true,
  heroImageUrl: '',
  borderRadius: 'rounded-[3rem]',
  headerStyle: 'gradient',
  themeMode: 'light',
  showDonationSection: true,
  qrisImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg', // Placeholder
  donationTitle: 'Mari Jadi Bagian dari Kebaikan',
  donationDescription: 'Setiap donasi Anda sangat berarti bagi mereka yang membutuhkan. Mari berbagi kebahagiaan di hari Jum\'at yang penuh berkah.',
};

export const INITIAL_DATA: AppData = {
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
  layout: DEFAULT_LAYOUT,
};
