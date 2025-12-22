
export interface Income {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  proofImage?: string; // Base64 or URL of the transfer proof
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

export interface LayoutConfig {
  primaryColor: 'emerald' | 'blue' | 'indigo' | 'rose' | 'amber' | 'slate';
  fontFamily: 'Plus Jakarta Sans' | 'Inter' | 'Merriweather' | 'Roboto Mono';
  animationEnabled: boolean;
  heroImageUrl: string;
  borderRadius: 'rounded-none' | 'rounded-xl' | 'rounded-3xl' | 'rounded-[3rem]';
  headerStyle: 'gradient' | 'solid';
  themeMode: 'light' | 'soft';
  // Donation Features
  showDonationSection: boolean;
  qrisImageUrl: string;
  donationTitle: string;
  donationDescription: string;
}

export type ViewType = 'public' | 'admin';

export interface AppData {
  incomes: Income[];
  expenses: Expense[];
  distributions: Distribution[];
  layout: LayoutConfig;
}
