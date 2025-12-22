
export interface Income {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  proofImage?: string;
}

export interface Expense {
  id: string;
  itemName: string;
  unitPrice: number;
  qty: number;
  date: string;
}

export interface Distribution {
  id: string;
  count: number;
  itemType: string;
  date: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  type: 'image' | 'video';
}

export interface LayoutConfig {
  primaryColor: 'emerald' | 'blue' | 'indigo' | 'rose' | 'amber' | 'slate';
  fontFamily: 'Plus Jakarta Sans' | 'Inter' | 'Merriweather' | 'Roboto Mono';
  animationEnabled: boolean;
  heroImageUrl: string;
  borderRadius: 'rounded-none' | 'rounded-xl' | 'rounded-3xl' | 'rounded-[3rem]';
  headerStyle: 'gradient' | 'solid';
  themeMode: 'light' | 'soft';
  showDonationSection: boolean;
  qrisImageUrl: string;
  donationTitle: string;
  donationDescription: string;
  // Foundation Branding
  foundationName: string;
  foundationDescription: string;
  aboutUs: string;
  vision: string;
  mission: string;
  goals: string;
  instagramUrl: string;
}

export type AppView = 'home' | 'transparency' | 'gallery' | 'articles' | 'admin';

export interface AppData {
  incomes: Income[];
  pendingIncomes: Income[];
  expenses: Expense[];
  distributions: Distribution[];
  articles: Article[];
  gallery: GalleryItem[];
  layout: LayoutConfig;
}
