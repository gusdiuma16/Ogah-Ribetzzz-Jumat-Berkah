
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
  heroImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop',
  borderRadius: 'rounded-[3rem]',
  headerStyle: 'gradient',
  themeMode: 'light',
  showDonationSection: true,
  qrisImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
  donationTitle: 'Mari Jadi Bagian dari Kebaikan',
  donationDescription: 'Setiap donasi Anda sangat berarti bagi kelancaran operasional yayasan.',
  foundationName: 'Ogah Ribet Foundation',
  foundationDescription: 'Bergerak dengan hati, membantu sesama tanpa birokrasi yang rumit.',
  aboutUs: 'Ogah Ribet Foundation adalah komunitas sosial yang berfokus pada penyaluran bantuan langsung kepada masyarakat yang membutuhkan, terutama melalui program rutin Jum\'at Berkah.',
  vision: 'Menjadi wadah berbagi yang paling transparan, efisien, dan berdampak nyata bagi kesejahteraan umat.',
  mission: 'Mempermudah akses bantuan bagi yang membutuhkan dan mempermudah donatur dalam menyalurkan amanahnya secara transparan.',
  goals: 'Menciptakan ekosistem sosial yang jujur, meningkatkan kepedulian antar sesama, dan memastikan bantuan sampai ke tangan yang tepat.',
  instagramUrl: 'https://instagram.com/',
};

export const INITIAL_DATA: AppData = {
  incomes: [
    { id: '1', donorName: 'Hamba Allah', amount: 500000, date: '2025-12-18' },
  ],
  pendingIncomes: [],
  expenses: [
    { id: '1', itemName: 'Nasi Kotak Ayam Bakar', unitPrice: 20000, qty: 10, date: '2025-12-19' },
  ],
  distributions: [
    { id: '1', count: 10, itemType: 'Paket Nasi', date: '2025-12-19' },
  ],
  articles: [
    {
      id: '1',
      title: 'Kebahagiaan di Jum\'at Pagi',
      content: 'Hari ini tim Ogah Ribet Foundation menyambangi daerah pinggiran untuk membagikan paket sarapan bergizi...',
      date: '2025-12-20',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop'
    }
  ],
  gallery: [
    { id: '1', url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop', caption: 'Distribusi Paket Nasi', type: 'image' },
    { id: '2', url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop', caption: 'Senyum Bahagia Penerima', type: 'image' }
  ],
  layout: DEFAULT_LAYOUT,
};
