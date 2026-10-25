import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Check,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Party, PaymentMode, Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  party?: Party | null;
  initialTransaction?: Transaction | null; // If provided, modal is in EDIT mode!
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  party: initialParty,
  initialTransaction,
  defaultType = 'gave',
}) => {
  const { parties, addTransaction, updateTransaction, businessProfile, t } = useLedger();

  const [selectedPartyId, setSelectedPartyId] = useState<string>(
    initialParty?.id || initialTransaction?.partyId || parties[0]?.id || ''
  );
  const [type, setType] = useState<TransactionType>(
    initialTransaction?.type || defaultType
  );
  const [amount, setAmount] = useState<string>(
    initialTransaction ? String(initialTransaction.amount) : ''
  );
  const [date, setDate] = useState<string>(() => {
    if (initialTransaction?.date) {
      return initialTransaction.date.slice(0, 16);
    }
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
  });
  const [description, setDescription] = useState<string>(
    initialTransaction?.description || ''
  );
  const [billNumber, setBillNumber] = useState<string>(
    initialTransaction?.billNumber || ''
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    initialTransaction?.paymentMode || 'cash'
  );
  const [error, setError] = useState<string | null>(null);

  // Sync state if initialTransaction or party changes
  useEffect(() => {
    if (initialTransaction) {
      setSelectedPartyId(initialTransaction.partyId);
      setType(initialTransaction.type);
      setAmount(String(initialTransaction.amount));
      setDate(initialTransaction.date.slice(0, 16));
      setDescription(initialTransaction.description || '');
      setBillNumber(initialTransaction.billNumber || '');
      setPaymentMode(initialTransaction.paymentMode || 'cash');
    } else if (initialParty) {
      setSelectedPartyId(initialParty.id);
      setType(defaultType);
      setAmount('');
      setDescription('');
      setBillNumber('');
      setPaymentMode('cash');
      const now = new Date();
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      setDate(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
          now.getHours()
        )}:${pad(now.getMinutes())}`
      );
    }
    setError(null);
  }, [initialTransaction, initialParty, defaultType, isOpen]);

  if (!isOpen) return null;

  const currentParty =
    parties.find((p) => p.id === selectedPartyId) || initialParty || parties[0];

  const handleQuickAdd = (value: number) => {
    const currentNum = parseFloat(amount) || 0;
    setAmount(String(currentNum + value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Kripya sahi rashi (amount) dalein');
      return;
    }
    if (!selectedPartyId) {
      setError('Kripya party chunein');
      return;
    }

    const isoDate = new Date(date).toISOString();

    if (initialTransaction) {
      // EDIT MODE
      updateTransaction(initialTransaction.id, {
        partyId: selectedPartyId,
        type,
        amount: numAmount,
        date: isoDate,
        description: description.trim(),
        billNumber: billNumber.trim(),
        paymentMode,
      });
    } else {
      // ADD MODE
      addTransaction({
        partyId: selectedPartyId,
        type,
        amount: numAmount,
        date: isoDate,
        description: description.trim(),
        billNumber: billNumber.trim(),
        paymentMode,
      });
    }

    onClose();
  };

  const isEditing = !!initialTransaction;
  const isBuyer = currentParty?.type === 'buyer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isEditing ? 'Entry Badlein (Edit Entry)' : t.addTransaction}
            </h3>
            <p className="text-xs text-gray-500">
              {currentParty ? (
                <span>
                  Khata:{' '}
                  <strong className="text-gray-800">{currentParty.name}</strong> (
                  {isBuyer ? 'Grahak' : 'Vikreta'})
                </span>
              ) : (
                'Khata aur rashi chunein'
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Party Selection if not locked */}
          {!initialParty && !initialTransaction && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t.partyName}
              </label>
              <div className="relative">
                <select
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type === 'buyer' ? 'Grahak' : 'Vikreta'}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Transaction Type Buttons */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Entry Ka Prakar
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setType('gave')}
                className={`py-3 px-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  type === 'gave'
                    ? 'border-rose-500 bg-rose-50/70 text-rose-800 shadow-xs ring-2 ring-rose-500/20 font-bold'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  <span>
                    {isBuyer ? 'Maine Diya (Udhar)' : 'Maine Payment Diya'}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {isBuyer ? 'Goods/Cash given to customer' : 'Payment made to supplier'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setType('received')}
                className={`py-3 px-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  type === 'received'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20 font-bold'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isBuyer ? 'Mujhe Mila (Jama)' : 'Maal / Bill Aaya'}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {isBuyer ? 'Payment received from customer' : 'Stock/Invoice received on credit'}
                </span>
              </button>
            </div>
          </div>

          {/* Amount input & Quick Chips */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.amount} ({businessProfile.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-gray-400">
                {businessProfile.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xl sm:text-2xl font-black text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
                +Add:
              </span>
              {[100, 500, 1000, 2000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  +{businessProfile.currencySymbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {t.date}
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Description / Item Details */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              {t.details}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 5kg Cheeni, Desi Ghee, Part Payment"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Bill No. & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t.billNo}
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="e.g. INV-104"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                {t.paymentMode}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="cash">{t.cash}</option>
                <option value="upi">{t.upi}</option>
                <option value="bank_transfer">{t.bankTransfer}</option>
                <option value="cheque">{t.cheque}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 ${
                type === 'gave'
                  ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500'
              }`}
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Update Entry' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
