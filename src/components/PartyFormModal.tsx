import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, FileText, Check, Store } from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Party, PartyType } from '../types';

interface PartyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParty?: Party | null; // If provided, edit mode
  defaultType?: PartyType;
}

export const PartyFormModal: React.FC<PartyFormModalProps> = ({
  isOpen,
  onClose,
  initialParty,
  defaultType = 'buyer',
}) => {
  const { addParty, updateParty, businessProfile, t } = useLedger();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<PartyType>(defaultType);
  const [openingBalance, setOpeningBalance] = useState('0');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialParty) {
      setName(initialParty.name);
      setPhone(initialParty.phone);
      setType(initialParty.type);
      setOpeningBalance(String(initialParty.openingBalance || 0));
      setAddress(initialParty.address || '');
      setNotes(initialParty.notes || '');
    } else {
      setName('');
      setPhone('');
      setType(defaultType);
      setOpeningBalance('0');
      setAddress('');
      setNotes('');
    }
    setError(null);
  }, [initialParty, defaultType, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialParty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Kripya party ka naam dalein');
      return;
    }

    const numBalance = parseFloat(openingBalance) || 0;

    if (isEditing) {
      updateParty(initialParty.id, {
        name: name.trim(),
        phone: phone.trim(),
        type,
        openingBalance: numBalance,
        address: address.trim(),
        notes: notes.trim(),
      });
    } else {
      addParty({
        name: name.trim(),
        phone: phone.trim(),
        type,
        openingBalance: numBalance,
        address: address.trim(),
        notes: notes.trim(),
      });
    }

    onClose();
  };

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
              {isEditing ? 'Khata Details Badlein (Edit Account)' : t.addParty}
            </h3>
            <p className="text-xs text-gray-500">
              Grahak ya Vikreta ki contact aur khata details darj karein
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Account Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.partyType}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setType('buyer')}
                className={`py-2.5 px-3 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'buyer'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm">{t.customers}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('seller')}
                className={`py-2.5 px-3 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'seller'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                }`}
              >
                <Store className="w-4 h-4 text-blue-600" />
                <span className="text-xs sm:text-sm">{t.suppliers}</span>
              </button>
            </div>
          </div>

          {/* Party Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.partyName} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar / Sharma Traders"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.phoneNumber}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Opening Balance */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.openingBalance} ({businessProfile.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                {businessProfile.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Agar pehle se koi purani baki rashi hai toh yahan darj karein.
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {t.address}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop 12, Main Market"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              {t.notes}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anya koi jankari ya shart..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
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
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Update Khata' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
