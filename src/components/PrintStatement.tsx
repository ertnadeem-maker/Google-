import React from 'react';
import { X, Printer } from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Party } from '../types';
import { formatCurrency, formatDate, formatDateShort } from '../utils/i18n';

interface PrintStatementProps {
  party: Party | null;
  onClose: () => void;
}

export const PrintStatement: React.FC<PrintStatementProps> = ({ party, onClose }) => {
  const { businessProfile, getPartyBalance, getPartyTransactions, t } = useLedger();

  if (!party) return null;

  const balanceInfo = getPartyBalance(party.id);
  const transactions = getPartyTransactions(party.id);

  // Chronological for statement
  const chronological = [...transactions].reverse();
  let running = Number(party.openingBalance || 0);

  const txRows = chronological.map((tx) => {
    if (party.type === 'buyer') {
      if (tx.type === 'gave') running += Number(tx.amount || 0);
      else running -= Number(tx.amount || 0);
    } else {
      if (tx.type === 'received') running += Number(tx.amount || 0);
      else running -= Number(tx.amount || 0);
    }
    return {
      ...tx,
      runningBalance: running,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 print:p-0 print:bg-white print:fixed">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none"
        role="dialog"
      >
        {/* Top action bar (hidden during print) */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:hidden">
          <span className="text-xs font-bold text-gray-700">Ledger Statement Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-sans text-gray-900 print:overflow-visible">
          {/* Business Header */}
          <div className="border-b-2 border-gray-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                {businessProfile.businessName}
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                {businessProfile.ownerName} • {businessProfile.phone}
              </p>
              {businessProfile.address && (
                <p className="text-xs text-gray-500 mt-0.5">{businessProfile.address}</p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold uppercase rounded-md tracking-wider">
                Hisab Parchi / Statement
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Party Details */}
          <div className="my-5 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="text-gray-500 uppercase font-semibold text-[10px]">
                {party.type === 'buyer' ? 'Grahak (Customer) Details' : 'Vikreta (Supplier) Details'}
              </p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{party.name}</p>
              {party.phone && <p className="text-gray-600 font-mono">Mobile: {party.phone}</p>}
              {party.address && <p className="text-gray-500">{party.address}</p>}
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
              <p className="text-gray-500 uppercase font-semibold text-[10px]">Net Balance</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">
                {formatCurrency(balanceInfo.balance, businessProfile.currencySymbol)}
              </p>
              <p className="font-bold text-xs uppercase text-emerald-700">
                {balanceInfo.statusLabel === 'youWillGet'
                  ? t.youWillGet
                  : balanceInfo.statusLabel === 'youWillGive'
                  ? t.youWillGive
                  : t.settled}
              </p>
            </div>
          </div>

          {/* Statement Table */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-2">Date</th>
                <th className="py-2.5 px-2">Details / Items</th>
                <th className="py-2.5 px-2 text-right">Diye (Debit)</th>
                <th className="py-2.5 px-2 text-right">Mile (Credit)</th>
                <th className="py-2.5 px-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {party.openingBalance !== 0 && (
                <tr className="bg-gray-50/50">
                  <td className="py-2 px-2 text-gray-500">{formatDateShort(party.createdAt)}</td>
                  <td className="py-2 px-2 text-gray-700 font-sans font-medium">Opening Balance</td>
                  <td className="py-2 px-2 text-right text-gray-400">-</td>
                  <td className="py-2 px-2 text-right text-gray-400">-</td>
                  <td className="py-2 px-2 text-right font-bold">
                    {formatCurrency(party.openingBalance, businessProfile.currencySymbol)}
                  </td>
                </tr>
              )}
              {txRows.map((tx) => {
                const isGave = tx.type === 'gave';
                return (
                  <tr key={tx.id}>
                    <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">
                      {formatDateShort(tx.date)}
                    </td>
                    <td className="py-2.5 px-2 font-sans">
                      <div className="font-semibold text-gray-900">
                        {tx.description || (isGave ? 'Maine Diya' : 'Mujhe Mila')}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2">
                        {tx.billNumber && <span>Bill #{tx.billNumber}</span>}
                        <span>Mode: {tx.paymentMode}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-rose-600 font-bold">
                      {isGave ? formatCurrency(tx.amount, businessProfile.currencySymbol) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right text-emerald-600 font-bold">
                      {!isGave ? formatCurrency(tx.amount, businessProfile.currencySymbol) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-gray-900">
                      {formatCurrency(Math.abs(tx.runningBalance), businessProfile.currencySymbol)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-900 font-bold">
                <td colSpan={2} className="py-3 px-2 text-right uppercase text-[11px]">
                  Total
                </td>
                <td className="py-3 px-2 text-right text-rose-600">
                  {formatCurrency(balanceInfo.gaveTotal, businessProfile.currencySymbol)}
                </td>
                <td className="py-3 px-2 text-right text-emerald-600">
                  {formatCurrency(balanceInfo.receivedTotal, businessProfile.currencySymbol)}
                </td>
                <td className="py-3 px-2 text-right text-sm font-black text-gray-900">
                  {formatCurrency(balanceInfo.balance, businessProfile.currencySymbol)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer & Signature */}
          <div className="mt-12 pt-6 border-t border-gray-200 flex items-end justify-between text-xs text-gray-500">
            <div>
              <p>Thank you for doing business with us!</p>
              <p className="text-[10px] text-gray-400 mt-1">
                Generated via Vyapar Khata - Google Drive Synced Bookkeeping
              </p>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-gray-400 pb-1 mb-1" />
              <p className="font-bold text-gray-700">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
