import React, { useState } from 'react';
import { LedgerProvider, useLedger } from './context/LedgerContext';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { PartyList } from './components/PartyList';
import { PartyDetailModal } from './components/PartyDetailModal';
import { PartyFormModal } from './components/PartyFormModal';
import { TransactionModal } from './components/TransactionModal';
import { BusinessSettingsModal } from './components/BusinessSettingsModal';
import { PrintStatement } from './components/PrintStatement';
import { ExportModal } from './components/ExportModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { Party, PartyType, Transaction, TransactionType } from './types';
import { Plus, UserPlus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

function MainLedgerApp() {
  const { parties, t } = useLedger();

  // Modals state
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [isPartyFormOpen, setIsPartyFormOpen] = useState(false);
  const [partyToEdit, setPartyToEdit] = useState<Party | null>(null);
  const [defaultPartyType, setDefaultPartyType] = useState<PartyType>('buyer');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [txTargetParty, setTxTargetParty] = useState<Party | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('gave');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [partyForPrint, setPartyForPrint] = useState<Party | null>(null);

  // Handlers
  const handleOpenNewParty = (type: PartyType = 'buyer') => {
    setPartyToEdit(null);
    setDefaultPartyType(type);
    setIsPartyFormOpen(true);
  };

  const handleEditParty = (party: Party) => {
    setPartyToEdit(party);
    setIsPartyFormOpen(true);
  };

  const handleOpenNewTransaction = (
    party?: Party | null,
    type: TransactionType = 'gave'
  ) => {
    setTxToEdit(null);
    setTxTargetParty(party || null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTxToEdit(tx);
    const p = parties.find((party) => party.id === tx.partyId) || null;
    setTxTargetParty(p);
    setIsTxModalOpen(true);
  };

  const handlePrintStatement = (party: Party) => {
    setPartyForPrint(party);
  };

  // Keep selectedParty fresh if parties state updates (e.g., after edit or sync)
  const currentSelectedParty = selectedParty
    ? parties.find((p) => p.id === selectedParty.id) || null
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation & Header */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewParty={() => handleOpenNewParty('buyer')}
        onOpenNewTransaction={() => handleOpenNewTransaction(null, 'gave')}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenApkGuide={() => setIsApkGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-12">
        {/* Financial Overview Cards */}
        <DashboardStats
          onOpenNewParty={() => handleOpenNewParty('buyer')}
          onOpenNewTransaction={() => handleOpenNewTransaction(null, 'gave')}
          onOpenExport={() => setIsExportModalOpen(true)}
        />

        {/* Party Accounts List (Grahak & Vikreta) */}
        <PartyList
          onSelectParty={(party) => setSelectedParty(party)}
          onOpenNewParty={() => handleOpenNewParty('buyer')}
          onQuickAddTransaction={(party) => handleOpenNewTransaction(party, 'gave')}
        />
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="sm:hidden fixed bottom-5 right-5 z-20 flex flex-col items-end gap-2">
        <button
          onClick={() => handleOpenNewTransaction(null, 'gave')}
          className="flex items-center gap-2 px-5 py-3.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-full shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{t.addTransaction}</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white py-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>Vyapar Khata</strong> — 100% Secure Offline Ledger with Google Drive Auto-Sync.
          </p>
          <p className="text-[11px] text-gray-400">
            Khatabook &amp; OkCredit style small business accounting.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {currentSelectedParty && (
        <PartyDetailModal
          party={currentSelectedParty}
          onClose={() => setSelectedParty(null)}
          onEditParty={handleEditParty}
          onOpenAddTransaction={(party, defaultType) =>
            handleOpenNewTransaction(party, defaultType)
          }
          onEditTransaction={handleEditTransaction}
          onPrintStatement={handlePrintStatement}
        />
      )}

      {isPartyFormOpen && (
        <PartyFormModal
          isOpen={isPartyFormOpen}
          onClose={() => {
            setIsPartyFormOpen(false);
            setPartyToEdit(null);
          }}
          initialParty={partyToEdit}
          defaultType={defaultPartyType}
        />
      )}

      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => {
            setIsTxModalOpen(false);
            setTxToEdit(null);
            setTxTargetParty(null);
          }}
          party={txTargetParty}
          initialTransaction={txToEdit}
          defaultType={defaultTxType}
        />
      )}

      {isSettingsOpen && (
        <BusinessSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {isApkGuideOpen && (
        <ApkGuideModal
          isOpen={isApkGuideOpen}
          onClose={() => setIsApkGuideOpen(false)}
        />
      )}

      {partyForPrint && (
        <PrintStatement
          party={partyForPrint}
          onClose={() => setPartyForPrint(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LedgerProvider>
      <MainLedgerApp />
    </LedgerProvider>
  );
}
