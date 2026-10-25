import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  MessageCircle,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Store,
  User,
  Filter,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Party, PartyType } from '../types';
import { formatCurrency, formatDateShort } from '../utils/i18n';

interface PartyListProps {
  onSelectParty: (party: Party) => void;
  onOpenNewParty: () => void;
  onQuickAddTransaction: (party: Party) => void;
}

type FilterTab = 'all' | 'buyer' | 'seller' | 'receivable' | 'payable';

export const PartyList: React.FC<PartyListProps> = ({
  onSelectParty,
  onOpenNewParty,
  onQuickAddTransaction,
}) => {
  const { parties, getPartyBalance, getPartyTransactions, businessProfile, t } = useLedger();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredParties = useMemo(() => {
    return parties.filter((party) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        party.name.toLowerCase().includes(query) ||
        party.phone.includes(query) ||
        (party.address && party.address.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      const bal = getPartyBalance(party.id);

      // Tab match
      if (activeTab === 'all') return true;
      if (activeTab === 'buyer') return party.type === 'buyer';
      if (activeTab === 'seller') return party.type === 'seller';
      if (activeTab === 'receivable') {
        return (
          (party.type === 'buyer' && bal.statusLabel === 'youWillGet') ||
          (party.type === 'seller' && bal.statusLabel === 'youWillGet')
        );
      }
      if (activeTab === 'payable') {
        return (
          (party.type === 'buyer' && bal.statusLabel === 'youWillGive') ||
          (party.type === 'seller' && bal.statusLabel === 'youWillGive')
        );
      }

      return true;
    });
  }, [parties, searchQuery, activeTab, getPartyBalance]);

  const buyersCount = parties.filter((p) => p.type === 'buyer').length;
  const sellersCount = parties.filter((p) => p.type === 'seller').length;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
      {/* Search & Header Bar */}
      <div className="p-4 sm:p-6 border-b border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>{t.allParties}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {filteredParties.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Grahak aur Vikretaon ke khate manage karein
            </p>
          </div>

          <button
            onClick={onOpenNewParty}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addParty}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.filterAll} ({parties.length})
          </button>
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'buyer'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {t.customers} ({buyersCount})
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'seller'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            {t.suppliers} ({sellersCount})
          </button>
          <button
            onClick={() => setActiveTab('receivable')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'receivable'
                ? 'bg-emerald-700 text-white'
                : 'bg-gray-100 text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            {t.filterReceivable}
          </button>
          <button
            onClick={() => setActiveTab('payable')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payable'
                ? 'bg-rose-700 text-white'
                : 'bg-gray-100 text-rose-800 hover:bg-rose-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
            {t.filterPayable}
          </button>
        </div>
      </div>

      {/* Party Cards List */}
      <div className="divide-y divide-gray-100">
        {filteredParties.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-700">{t.noPartiesFound}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Aapki khoj se koi khata match nahi hua.'
                : 'Abhi tak koi khata nahi banaya gaya hai. Naya khata jodne ke liye neeche click karein.'}
            </p>
            <button
              onClick={onOpenNewParty}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {t.addParty}
            </button>
          </div>
        ) : (
          filteredParties.map((party) => {
            const bal = getPartyBalance(party.id);
            const partyTx = getPartyTransactions(party.id);
            const lastTx = partyTx[0];

            return (
              <div
                key={party.id}
                onClick={() => onSelectParty(party)}
                className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-extrabold shrink-0 shadow-xs ${
                      party.type === 'buyer'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {party.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                        {party.name}
                      </h4>
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

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      {party.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {party.phone}
                        </span>
                      )}
                      {lastTx && (
                        <span className="text-[11px] text-gray-400 truncate">
                          Aakhri: {formatDateShort(lastTx.date)} (
                          {lastTx.type === 'gave' ? 'Diye' : 'Mile'} {formatCurrency(lastTx.amount)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Balance & Quick Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-14 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <div
                      className={`text-base sm:text-lg font-black tracking-tight ${
                        bal.statusLabel === 'youWillGet'
                          ? 'text-emerald-600'
                          : bal.statusLabel === 'youWillGive'
                          ? 'text-rose-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {formatCurrency(bal.balance, businessProfile.currencySymbol)}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        bal.statusLabel === 'youWillGet'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : bal.statusLabel === 'youWillGive'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {bal.statusLabel === 'youWillGet'
                        ? t.youWillGet
                        : bal.statusLabel === 'youWillGive'
                        ? t.youWillGive
                        : t.settled}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onQuickAddTransaction(party)}
                      className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                      title={t.addTransaction}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectParty(party)}
                      className="p-2 text-gray-400 group-hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                      title="View Khata"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
