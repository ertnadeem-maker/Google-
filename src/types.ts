export type PartyType = 'buyer' | 'seller';

export type TransactionType = 'gave' | 'received'; // 'gave' = Diye (Udhar/Payment), 'received' = Mile (Jama/Payment received)

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other';

export interface Party {
  id: string;
  name: string;
  phone: string;
  type: PartyType; // 'buyer' (Grahak/Customer) or 'seller' (Vikreta/Supplier)
  address?: string;
  notes?: string;
  openingBalance: number; // Positive = they owe you (Lene hain), Negative = you owe them (Dene hain)
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  partyId: string;
  type: TransactionType; // 'gave' (Maine diye / Grahak ko udhar diya / Supplier ko bhugtan kiya) or 'received' (Mujhe mile / Grahak ne diye / Supplier se wapas mile)
  amount: number;
  date: string; // ISO date string or YYYY-MM-DDTHH:mm
  description?: string;
  billNumber?: string;
  paymentMode: PaymentMode;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  currencySymbol: string;
}

export interface LedgerBackupData {
  version: number;
  businessProfile: BusinessProfile;
  parties: Party[];
  transactions: Transaction[];
  lastSyncedAt: string;
  exportedAt: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'offline' | 'error' | 'disconnected';

export type Language = 'hinglish' | 'english' | 'hindi';
