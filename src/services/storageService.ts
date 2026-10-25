import { BusinessProfile, Language, LedgerBackupData, Party, Transaction } from '../types';

const STORAGE_KEYS = {
  PARTIES: 'vyapar_parties_v1',
  TRANSACTIONS: 'vyapar_transactions_v1',
  PROFILE: 'vyapar_profile_v1',
  LAST_SYNCED: 'vyapar_last_synced_v1',
  PENDING_CHANGES: 'vyapar_pending_sync_flag_v1',
  LANGUAGE: 'vyapar_language_v1',
};

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: 'Mera Vyapar (General Store)',
  ownerName: 'Tafazzul Nadeem',
  phone: '9876543210',
  address: 'Shop No. 4, Main Bazar',
  currencySymbol: '₹',
};

const SAMPLE_PARTIES: Party[] = [
  {
    id: 'party-buyer-1',
    name: 'Rahul Sharma',
    phone: '9820011223',
    type: 'buyer',
    address: 'H.No 45, Sector 9',
    notes: 'Regular customer for monthly groceries',
    openingBalance: 0,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'party-buyer-2',
    name: 'Pooja Verma',
    phone: '9811223344',
    type: 'buyer',
    address: 'Green Park colony',
    notes: 'Pays via UPI on weekends',
    openingBalance: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'party-seller-1',
    name: 'Gupta Wholesale Distributors',
    phone: '9833445566',
    type: 'seller',
    address: 'Anaj Mandi, Godown 12',
    notes: 'Grains and edible oil supplier',
    openingBalance: 0,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'party-seller-2',
    name: 'Bharat Dairy Products',
    phone: '9844556677',
    type: 'seller',
    address: 'Industrial Area Phase 2',
    notes: 'Fresh dairy and paneer supplier',
    openingBalance: 0,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    partyId: 'party-buyer-1',
    type: 'gave', // Aapne udhar diya (goods sold on credit)
    amount: 1500,
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    description: 'Basmati Rice 10kg + Mustard Oil 2L',
    billNumber: 'INV-101',
    paymentMode: 'other',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'tx-2',
    partyId: 'party-buyer-1',
    type: 'received', // Grahak ne jama kiya
    amount: 500,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    description: 'Part payment received',
    billNumber: '',
    paymentMode: 'upi',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'tx-3',
    partyId: 'party-buyer-2',
    type: 'gave',
    amount: 850,
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    description: 'Shampoo, soaps, detergent packet',
    billNumber: 'INV-102',
    paymentMode: 'other',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'tx-4',
    partyId: 'party-seller-1',
    type: 'received', // Supplier se maal liya (supplier liability increases) -> or supplier balance
    // In small business khata:
    // When buying stock from Seller on credit: Maine liya / Goods Received = supplier ko dene hain.
    // When paying cash to Seller: Maine Diye / Cash Paid = supplier balance decreases.
    amount: 12000,
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    description: 'Flour 20 bags + Sugar 5 bags wholesale stock',
    billNumber: 'GW-5421',
    paymentMode: 'other',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'tx-5',
    partyId: 'party-seller-1',
    type: 'gave', // Aapne supplier ko payment di
    amount: 8000,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    description: 'Bank NEFT transfer advance',
    billNumber: 'TXN-99881',
    paymentMode: 'bank_transfer',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const storageService = {
  getParties(): Party[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(SAMPLE_PARTIES));
      return SAMPLE_PARTIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveParties(parties: Party[]): void {
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
    this.markPendingChanges(true);
  },

  getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SAMPLE_TRANSACTIONS));
      return SAMPLE_TRANSACTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    this.markPendingChanges(true);
  },

  getProfile(): BusinessProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    try {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: BusinessProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    this.markPendingChanges(true);
  },

  getLastSynced(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
  },

  setLastSynced(isoDate: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, isoDate);
    this.markPendingChanges(false);
  },

  hasPendingChanges(): boolean {
    return localStorage.getItem(STORAGE_KEYS.PENDING_CHANGES) === 'true';
  },

  markPendingChanges(pending: boolean): void {
    localStorage.setItem(STORAGE_KEYS.PENDING_CHANGES, pending ? 'true' : 'false');
  },

  getLanguage(): Language {
    const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    return lang || 'hinglish';
  },

  setLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  getCompleteBackupPayload(): LedgerBackupData {
    return {
      version: 1,
      businessProfile: this.getProfile(),
      parties: this.getParties(),
      transactions: this.getTransactions(),
      lastSyncedAt: this.getLastSynced() || new Date().toISOString(),
      exportedAt: new Date().toISOString(),
    };
  },

  restoreBackupPayload(payload: LedgerBackupData): void {
    if (payload.businessProfile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(payload.businessProfile));
    }
    if (Array.isArray(payload.parties)) {
      localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(payload.parties));
    }
    if (Array.isArray(payload.transactions)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(payload.transactions));
    }
    this.setLastSynced(new Date().toISOString());
  },
};
