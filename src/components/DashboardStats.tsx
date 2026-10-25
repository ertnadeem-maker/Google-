import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Calendar,
  CloudAlert,
  ShieldCheck,
  PlusCircle,
  UserPlus,
  Download,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { formatCurrency } from '../utils/i18n';

interface DashboardStatsProps {
  onOpenNewParty: () => void;
  onOpenNewTransaction: () => void;
  onOpenExport?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  onOpenNewParty,
  onOpenNewTransaction,
  onOpenExport,
}) => {
  const {
    totalReceivable,
    totalPayable,
    netBalance,
    todayTransactionsCount,
    businessProfile,
    parties,
    t,
    isOnline,
    currentUser,
    syncStatus,
  } = useLedger();

  const buyersCount = parties.filter((p) => p.type === 'buyer').length;
  const sellersCount = parties.filter((p) => p.type === 'seller').length;

  return (
    <div className="space-y-4">
      {/* Offline / Unsaved Banner */}
      {!isOnline && (
        <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm animate-pulse">
          <div className="flex items-center gap-2.5">
            <CloudAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Offline Mode Active: </span>
              Aap bina internet ke bhi sabhi entries kar sakte hain. Jaise hi internet connect hoga, data Google Drive par sync ho jayega.
            </div>
          </div>
        </div>
      )}

      {isOnline && !currentUser && (
        <div className="p-3.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-blue-950">
                Google Drive Backup Enable Karein
              </p>
              <p className="text-blue-700 text-xs">
                Apne mobile ya computer par data khone se bachayein. Upar diye gaye &quot;Connect Google Drive&quot; par click karein.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main 3 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total to Receive (Grahak se Lene Hain) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative">
            <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {t.totalReceivable}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="relative">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(totalReceivable, businessProfile.currencySymbol)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {buyersCount} {t.customers} se baqaya
            </p>
          </div>
        </div>

        {/* Total to Pay (Supplier ko Dene Hain) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative">
            <span className="text-xs font-semibold text-rose-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {t.totalPayable}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="relative">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
              {formatCurrency(totalPayable, businessProfile.currencySymbol)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {sellersCount} {t.suppliers} ko bhugtan baki
            </p>
          </div>
        </div>

        {/* Net Business Balance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative">
            <span className="text-xs font-semibold text-indigo-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {t.netBalance}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="relative">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                netBalance >= 0 ? 'text-indigo-700' : 'text-amber-700'
              }`}
            >
              {formatCurrency(netBalance, businessProfile.currencySymbol)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {netBalance >= 0 ? 'Fayde me (Positive net)' : 'Deen-dari jyada (Net payable)'}
            </p>
          </div>
        </div>

        {/* Quick Action / Today's count */}
        <div className="bg-linear-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t.todayEntries}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
              {todayTransactionsCount}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <button
              onClick={onOpenNewTransaction}
              className="flex-1 py-2 px-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              {t.addTransaction}
            </button>
            <button
              onClick={onOpenNewParty}
              className="py-2 px-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              title={t.addParty}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.addParty}</span>
            </button>
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="py-2 px-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                title="Export Data"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
