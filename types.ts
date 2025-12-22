
export interface Income {
  id: string;
  donorName: string;
  amount: number;
  date: string;
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

export type ViewType = 'public' | 'admin';

export interface AppData {
  incomes: Income[];
  expenses: Expense[];
  distributions: Distribution[];
}
