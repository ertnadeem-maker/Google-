import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Printer,
  Edit2,
  Trash2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  FileText,
  CreditCard,
  User,
  Store,
  ChevronLeft,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Party, Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate, formatDateShort } from '../utils/i18n';
import { ConfirmModal } from './ConfirmModal';

interface PartyDetailModalProps {
  party: Party | null;
  onClose: () => void;
  onEditParty: (party: Party) => void;
  onOpenAddTransaction: (party: Party, defaultType: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onPrintStatement: (party: Party) => void;
}

export const PartyDetailModal: React.FC<PartyDetailModalProps> = ({
  party,
  onClose,
  onEditParty,
  onOpenAddTransaction,
  onEditTransaction,
  onPrintStatement,
}) => {
  const {
    getPartyBalance,
    getPartyTransactions,
    deleteTransaction,
    deleteParty,
    businessProfile,
    t,
  } = useLedger();

  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [isDeletingParty, setIsDeletingParty] = useState(false);

  if (!party) return null;

  const balanceInfo = getPartyBalance(party.id);
  const transactions = getPartyTransactions(party.id);

  // Compute running balance for each transaction chronologically
  // We sort ascending first to compute running balances, then display in reverse
  const chronological = [...transactions].reverse();
  let currentRunning = Number(party.openingBalance || 0);

  const txWithRunningBalance = chronological.map((tx) => {
    if (party.type === 'buyer') {
      if (tx.type === 'gave') currentRunning += Number(tx.amount || 0);
      else currentRunning -= Number(tx.amount || 0);
    } else {
      if (tx.type === 'received') currentRunning += Number(tx.amount || 0);
      else currentRunning -= Number(tx.amount || 0);
    }
    return {
      ...tx,
      runningBalance: currentRunning,
    };
  });

  const displayList = [...txWithRunningBalance].reverse();

  // Handle WhatsApp Reminder
  const handleWhatsAppReminder = () => {
    const rawPhone = party.phone.replace(/[^0-9]/g, '');
    let cleanPhone = rawPhone;
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const balanceStr = formatCurrency(balanceInfo.balance, businessProfile.currencySymbol);
    let message = '';

    if (party.type === 'buyer') {
      if (balanceInfo.statusLabel === 'youWillGet') {
        message = `Namaste ${party.name} ji, ${businessProfile.businessName} par aapka kul hisab ${balanceStr} baqaya hai. Kripya samay par bhugtan karein. Dhanyawad! (${businessProfile.ownerName} - ${businessProfile.phone})`;
      } else {
        message = `Namaste ${party.name} ji, ${businessProfile.businessName} par aapka balance settle hai. Dhanyawad!`;
      }
    } else {
      message = `Namaste ${party.name} ji, ${businessProfile.businessName} se aapka account statement. Total balance: ${balanceStr}. Dhanyawad! (${businessProfile.ownerName})`;
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmDeleteTx = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setTxToDelete(null);
    }
  };

  const handleConfirmDeleteParty = () => {
    deleteParty(party.id);
    setIsDeletingParty(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div
          className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[95vh] flex flex-col"
          role="dialog"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  party.type === 'buyer'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {party.type === 'buyer' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Store className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                    {party.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                      party.type === 'buyer'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {party.type === 'buyer' ? 'Grahak' : 'Vikreta'}
                  </span>
                </div>
                {party.phone && (
                  <p className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {party.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {party.phone && (
                <button
                  type="button"
                  onClick={handleWhatsAppReminder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="WhatsApp par reminder bhejein"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onPrintStatement(party)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                title={t.downloadPdf}
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onEditParty(party)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                title={t.edit}
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsDeletingParty(true)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Balance Banner & Quick Add Entry Buttons */}
          <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Kul Baki Rashi (Current Net Balance)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      balanceInfo.statusLabel === 'youWillGet'
                        ? 'text-emerald-600'
                        : balanceInfo.statusLabel === 'youWillGive'
                        ? 'text-rose-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {formatCurrency(balanceInfo.balance, businessProfile.currencySymbol)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                      balanceInfo.statusLabel === 'youWillGet'
                        ? 'bg-emerald-100 text-emerald-800'
                        : balanceInfo.statusLabel === 'youWillGive'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {balanceInfo.statusLabel === 'youWillGet'
                      ? t.youWillGet
                      : balanceInfo.statusLabel === 'youWillGive'
                      ? t.youWillGive
                      : t.settled}
                  </span>
                </div>
              </div>

              {/* Two Big Entry Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onOpenAddTransaction(party, 'gave')}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{party.type === 'buyer' ? 'Maine Diye' : 'Payment Diya'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAddTransaction(party, 'received')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{party.type === 'buyer' ? 'Mujhe Mile' : 'Maal Aaya'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              <span>{t.totalEntries} ({transactions.length})</span>
              <span>Running Hisab</span>
            </div>

            {displayList.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500">{t.noTransactionsFound}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() => onOpenAddTransaction(party, 'gave')}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition-colors"
                  >
                    + Diye
                  </button>
                  <button
                    onClick={() => onOpenAddTransaction(party, 'received')}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-colors"
                  >
                    + Mile
                  </button>
                </div>
              </div>
            ) : (
              displayList.map((tx) => {
                const isGave = tx.type === 'gave';
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 sm:p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50/70 transition-colors shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left details */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isGave
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isGave ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-800">
                            {isGave
                              ? party.type === 'buyer'
                                ? 'Aapne Diya (Gave)'
                                : 'Payment Diya'
                              : party.type === 'buyer'
                              ? 'Aapko Mila (Got)'
                              : 'Maal / Purchase Aaya'}
                          </span>
                          {tx.billNumber && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-mono">
                              Bill: {tx.billNumber}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 text-[10px] font-medium border border-gray-200">
                            {tx.paymentMode.toUpperCase()}
                          </span>
                        </div>

                        {tx.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate max-w-md">
                            {tx.description}
                          </p>
                        )}

                        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>

                    {/* Right Amount & Edit/Delete actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <div
                          className={`text-base font-black ${
                            isGave ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {isGave ? '-' : '+'}
                          {formatCurrency(tx.amount, businessProfile.currencySymbol)}
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">
                          Bal: {formatCurrency(Math.abs(tx.runningBalance), businessProfile.currencySymbol)}
                        </span>
                      </div>

                      {/* Edit & Delete Buttons per user request! */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Entry Badlein (Edit)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setTxToDelete(tx)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Entry Hatayein (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Transaction Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!txToDelete}
        title={t.deleteConfirmTitle}
        message={`${t.deleteConfirmTx} (${
          txToDelete
            ? `${formatCurrency(txToDelete.amount, businessProfile.currencySymbol)} - ${formatDateShort(
                txToDelete.date
              )}`
            : ''
        })`}
        warningText={t.deleteWarningDrive}
        confirmLabel={t.confirmDeleteBtn}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={handleConfirmDeleteTx}
        onCancel={() => setTxToDelete(null)}
      />

      {/* Delete Party Confirmation Dialog */}
      <ConfirmModal
        isOpen={isDeletingParty}
        title={t.deleteConfirmTitle}
        message={`${t.deleteConfirmParty} (${party.name})`}
        warningText={t.deleteWarningDrive}
        confirmLabel={t.confirmDeleteBtn}
        cancelLabel={t.cancel}
        isDestructive={true}
        onConfirm={handleConfirmDeleteParty}
        onCancel={() => setIsDeletingParty(false)}
      />
    </>
  );
};
