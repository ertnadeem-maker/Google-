import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { User } from 'firebase/auth';
import {
  BusinessProfile,
  Language,
  LedgerBackupData,
  Party,
  PartyType,
  PaymentMode,
  SyncStatus,
  Transaction,
  TransactionType,
} from '../types';
import { storageService } from '../services/storageService';
import {
  googleSignIn,
  initAuth,
  logout as authLogout,
  getAccessToken,
  setCachedAccessToken,
} from '../services/auth';
import {
  downloadFromDrive,
  findDriveFile,
  mergeLedgerData,
  saveToDrive,
} from '../services/driveService';
import { translations } from '../utils/i18n';

interface PartyBalanceInfo {
  balance: number; // positive = to receive (lene hain) if buyer, to pay (dene hain) if seller
  isPositive: boolean; // whether money is owed
  statusLabel: 'youWillGet' | 'youWillGive' | 'settled';
  gaveTotal: number;
  receivedTotal: number;
}

interface LedgerContextType {
  parties: Party[];
  transactions: Transaction[];
  businessProfile: BusinessProfile;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['hinglish'];
  isOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  currentUser: User | null;
  driveFileId: string | null;
  syncError: string | null;
  clearSyncError: () => void;

  // Actions
  addParty: (data: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => Party;
  updateParty: (id: string, data: Partial<Omit<Party, 'id' | 'createdAt'>>) => void;
  deleteParty: (id: string) => void;

  addTransaction: (data: {
    partyId: string;
    type: TransactionType;
    amount: number;
    date: string;
    description?: string;
    billNumber?: string;
    paymentMode: PaymentMode;
  }) => Transaction;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  updateProfile: (profile: BusinessProfile) => void;

  // Google Drive & Sync
  syncWithGoogleDrive: () => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => Promise<void>;

  // Calculations
  getPartyBalance: (partyId: string) => PartyBalanceInfo;
  getPartyTransactions: (partyId: string) => Transaction[];
  totalReceivable: number;
  totalPayable: number;
  netBalance: number;
  todayTransactionsCount: number;
}

const LedgerContext = createContext<LedgerContextType | null>(null);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parties, setParties] = useState<Party[]>(() => storageService.getParties());
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    storageService.getTransactions()
  );
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() =>
    storageService.getProfile()
  );
  const [language, setLanguageState] = useState<Language>(() => storageService.getLanguage());

  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() =>
    storageService.getLastSynced()
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language] || translations.hinglish;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storageService.setLanguage(lang);
  };

  // Monitor Online/Offline Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (currentUser) {
        setSyncStatus('pending');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setCachedAccessToken(token);
        setSyncStatus('pending');
      },
      () => {
        setCurrentUser(null);
        setCachedAccessToken(null);
        setSyncStatus('disconnected');
      }
    );

    return () => unsubscribe();
  }, []);

  // Primary Sync Implementation
  const performDriveSync = useCallback(
    async (manual = false): Promise<boolean> => {
      const token = await getAccessToken();
      if (!token || !currentUser) {
        setSyncStatus('disconnected');
        return false;
      }
      if (!navigator.onLine) {
        setSyncStatus('offline');
        return false;
      }

      setSyncStatus('syncing');
      setSyncError(null);

      try {
        const localPayload: LedgerBackupData = {
          version: 1,
          businessProfile,
          parties,
          transactions,
          lastSyncedAt: lastSyncedAt || new Date().toISOString(),
          exportedAt: new Date().toISOString(),
        };

        // Check if file already exists in Drive
        const remoteInfo = await findDriveFile();
        let payloadToSave = localPayload;

        if (remoteInfo) {
          setDriveFileId(remoteInfo.id);
          try {
            const remoteData = await downloadFromDrive(remoteInfo.id);
            if (remoteData && remoteData.parties) {
              // Bidirectional merge
              payloadToSave = mergeLedgerData(localPayload, remoteData);
              // Update local state if remote added or changed records
              setParties(payloadToSave.parties);
              setTransactions(payloadToSave.transactions);
              storageService.saveParties(payloadToSave.parties);
              storageService.saveTransactions(payloadToSave.transactions);
            }
          } catch (dlErr: unknown) {
            console.warn('Could not read existing remote file, overwriting with local:', dlErr);
          }
        }

        const saveRes = await saveToDrive(payloadToSave);
        setDriveFileId(saveRes.fileId);

        const now = new Date().toISOString();
        setLastSyncedAt(now);
        storageService.setLastSynced(now);
        setSyncStatus('synced');
        return true;
      } catch (err: unknown) {
        console.error('Drive Sync Error:', err);
        const errMessage = err instanceof Error ? err.message : 'Unknown sync error';
        if (errMessage === 'AUTH_EXPIRED') {
          setSyncError('Google session expired. Please sign in again.');
          setSyncStatus('disconnected');
        } else {
          setSyncError(errMessage);
          setSyncStatus('error');
        }
        return false;
      }
    },
    [currentUser, businessProfile, parties, transactions, lastSyncedAt]
  );

  // Debounced auto-sync trigger
  const scheduleAutoSync = useCallback(() => {
    if (!currentUser || !isOnline) {
      setSyncStatus(isOnline ? 'pending' : 'offline');
      return;
    }
    setSyncStatus('pending');
    if (autoSyncTimerRef.current) {
      clearTimeout(autoSyncTimerRef.current);
    }
    autoSyncTimerRef.current = setTimeout(() => {
      performDriveSync(false);
    }, 2000);
  }, [currentUser, isOnline, performDriveSync]);

  // Sign In
  const signInWithGoogle = async () => {
    try {
      setSyncStatus('syncing');
      setSyncError(null);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        // After initial sign in, immediately try to sync/pull from drive
        setTimeout(() => {
          performDriveSync(true);
        }, 500);
      } else {
        // User closed the popup window or cancelled sign-in
        setSyncStatus('disconnected');
        setSyncError(null);
      }
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };
      if (
        errObj?.code === 'auth/popup-closed-by-user' ||
        errObj?.code === 'auth/cancelled-popup-request' ||
        errObj?.code === 'auth/user-cancelled'
      ) {
        setSyncStatus('disconnected');
        setSyncError(null);
        return;
      }
      if (errObj?.code === 'auth/popup-blocked') {
        setSyncError('Browser ne popup window block kar diya hai. Kripya browser me popups allow karein.');
        setSyncStatus('disconnected');
        return;
      }
      console.warn('Sign-in issue:', err);
      setSyncError(errObj?.message || 'Google Drive se connect nahi ho paya. Dobara koshish karein.');
      setSyncStatus('disconnected');
    }
  };

  // Sign Out
  const signOutGoogle = async () => {
    try {
      await authLogout();
      setCurrentUser(null);
      setDriveFileId(null);
      setSyncStatus('disconnected');
      setSyncError(null);
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    }
  };

  // Party Operations
  const addParty = (data: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>): Party => {
    const now = new Date().toISOString();
    const newParty: Party = {
      ...data,
      id: `party-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newParty, ...parties];
    setParties(updated);
    storageService.saveParties(updated);
    scheduleAutoSync();
    return newParty;
  };

  const updateParty = (id: string, data: Partial<Omit<Party, 'id' | 'createdAt'>>) => {
    const now = new Date().toISOString();
    const updated = parties.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now } : p));
    setParties(updated);
    storageService.saveParties(updated);
    scheduleAutoSync();
  };

  const deleteParty = (id: string) => {
    const updatedParties = parties.filter((p) => p.id !== id);
    const updatedTransactions = transactions.filter((t) => t.partyId !== id);
    setParties(updatedParties);
    setTransactions(updatedTransactions);
    storageService.saveParties(updatedParties);
    storageService.saveTransactions(updatedTransactions);
    scheduleAutoSync();
  };

  // Transaction Operations
  const addTransaction = (data: {
    partyId: string;
    type: TransactionType;
    amount: number;
    date: string;
    description?: string;
    billNumber?: string;
    paymentMode: PaymentMode;
  }): Transaction => {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    storageService.saveTransactions(updated);
    scheduleAutoSync();
    return newTx;
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const now = new Date().toISOString();
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...data, updatedAt: now } : t
    );
    setTransactions(updated);
    storageService.saveTransactions(updated);
    scheduleAutoSync();
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    storageService.saveTransactions(updated);
    scheduleAutoSync();
  };

  const updateProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    storageService.saveProfile(profile);
    scheduleAutoSync();
  };

  // Balance calculation for a party
  const getPartyBalance = useCallback(
    (partyId: string): PartyBalanceInfo => {
      const party = parties.find((p) => p.id === partyId);
      if (!party) {
        return {
          balance: 0,
          isPositive: false,
          statusLabel: 'settled',
          gaveTotal: 0,
          receivedTotal: 0,
        };
      }

      const partyTx = transactions.filter((t) => t.partyId === partyId);
      const gaveTotal = partyTx
        .filter((t) => t.type === 'gave')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const receivedTotal = partyTx
        .filter((t) => t.type === 'received')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const opening = Number(party.openingBalance || 0);

      if (party.type === 'buyer') {
        // Buyer logic:
        // You gave goods/credit (+)
        // You received payment (-)
        // Net balance = opening + gaveTotal - receivedTotal
        // > 0 => Grahak se lene hain (You will get)
        // < 0 => Grahak ko dene hain / Grahak ka advance jama hai (You will give)
        const net = opening + gaveTotal - receivedTotal;
        return {
          balance: Math.abs(net),
          isPositive: net > 0,
          statusLabel: net > 0 ? 'youWillGet' : net < 0 ? 'youWillGive' : 'settled',
          gaveTotal,
          receivedTotal,
        };
      } else {
        // Seller/Supplier logic:
        // Supplier sent goods / invoice (+) -> You owe supplier
        // You paid payment / gave cash (-) -> Decreases debt
        // Net payable = opening + receivedTotal - gaveTotal
        // > 0 => Supplier ko dene hain (You will pay)
        // < 0 => Supplier se lene hain / Advance paid to supplier (You will get)
        const net = opening + receivedTotal - gaveTotal;
        return {
          balance: Math.abs(net),
          isPositive: net > 0,
          statusLabel: net > 0 ? 'youWillGive' : net < 0 ? 'youWillGet' : 'settled',
          gaveTotal,
          receivedTotal,
        };
      }
    },
    [parties, transactions]
  );

  const getPartyTransactions = useCallback(
    (partyId: string): Transaction[] => {
      return transactions
        .filter((t) => t.partyId === partyId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    [transactions]
  );

  // Business summary totals
  let totalReceivable = 0;
  let totalPayable = 0;

  for (const party of parties) {
    const bal = getPartyBalance(party.id);
    if (party.type === 'buyer') {
      if (bal.statusLabel === 'youWillGet') {
        totalReceivable += bal.balance;
      } else if (bal.statusLabel === 'youWillGive') {
        totalPayable += bal.balance;
      }
    } else {
      if (bal.statusLabel === 'youWillGive') {
        totalPayable += bal.balance;
      } else if (bal.statusLabel === 'youWillGet') {
        totalReceivable += bal.balance;
      }
    }
  }

  const netBalance = totalReceivable - totalPayable;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactionsCount = transactions.filter((t) =>
    t.date.startsWith(todayStr)
  ).length;

  return (
    <LedgerContext.Provider
      value={{
        parties,
        transactions,
        businessProfile,
        language,
        setLanguage,
        t,
        isOnline,
        syncStatus,
        lastSyncedAt,
        currentUser,
        driveFileId,
        syncError,
        clearSyncError: () => setSyncError(null),

        addParty,
        updateParty,
        deleteParty,

        addTransaction,
        updateTransaction,
        deleteTransaction,

        updateProfile,

        syncWithGoogleDrive: () => performDriveSync(true),
        signInWithGoogle,
        signOutGoogle,

        getPartyBalance,
        getPartyTransactions,
        totalReceivable,
        totalPayable,
        netBalance,
        todayTransactionsCount,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};
