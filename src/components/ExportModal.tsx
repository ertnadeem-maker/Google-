import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Users,
  CheckCircle2,
  Share2,
  Archive,
  Smartphone,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { storageService } from '../services/storageService';
import {
  exportTransactionsToCSV,
  exportPartiesToCSV,
  exportJSONBackup,
  exportHTMLReport,
} from '../utils/exportUtils';
import { formatCurrency } from '../utils/i18n';
import { downloadApkBlob } from '../assets/apkBase64';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { parties, transactions, businessProfile, getPartyBalance, totalReceivable, totalPayable } =
    useLedger();

  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportTransactionsCSV = () => {
    exportTransactionsToCSV(transactions, parties, businessProfile);
    notifyDownloaded('Transactions CSV (Excel)');
  };

  const handleExportPartiesCSV = () => {
    exportPartiesToCSV(parties, getPartyBalance, businessProfile);
    notifyDownloaded('Parties Balance CSV (Excel)');
  };

  const handleExportJSON = () => {
    const backup = storageService.getCompleteBackupPayload();
    exportJSONBackup(backup, businessProfile);
    notifyDownloaded('Complete JSON Backup');
  };

  const handleExportHTML = () => {
    exportHTMLReport(parties, transactions, businessProfile, getPartyBalance);
    notifyDownloaded('Complete HTML Report');
  };

  const notifyDownloaded = (label: string) => {
    setDownloadedFormat(label);
    setTimeout(() => {
      setDownloadedFormat(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Data Export &amp; Download Center
              </h3>
              <p className="text-xs text-gray-500">
                Apne Vyapar ka hisab Excel (CSV), JSON backup ya HTML report me export karein
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {downloadedFormat && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{downloadedFormat} downloaded successfully!</span>
            </div>
          )}

          {/* Quick Stats overview of what is being exported */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs">
            <div>
              <p className="text-gray-500 font-medium">Khata Summary</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {parties.length} Parties • {transactions.length} Transactions
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 font-medium">Baqaya Rashi</p>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                Lene: {formatCurrency(totalReceivable, businessProfile.currencySymbol)}
              </p>
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="space-y-3">
            {/* 1. All Transactions CSV (Excel) */}
            <button
              onClick={handleExportTransactionsCSV}
              className="w-full p-4 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 text-left transition-all flex items-start justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800">
                    All Transactions (Excel / CSV)
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sabhi transactions ka complete record (Tarikh, Party Name, Diye/Mile, Mode, Bill No, Details). Microsoft Excel ya Google Sheets me open hoga.
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {transactions.length} Entries Ready
                  </span>
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 shrink-0 mt-1" />
            </button>

            {/* 2. Parties Balance Sheet CSV */}
            <button
              onClick={handleExportPartiesCSV}
              className="w-full p-4 rounded-2xl border-2 border-blue-100 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-left transition-all flex items-start justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-800">
                    Party Khata Balances (Excel / CSV)
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sabhi Grahak (Buyers) aur Vikreta (Suppliers) ki list, mobile number, pata aur unka kul baqaya hisab (Lene/Dene).
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {parties.length} Accounts Ready
                  </span>
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0 mt-1" />
            </button>

            {/* 3. Complete App Backup JSON */}
            <button
              onClick={handleExportJSON}
              className="w-full p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-500 bg-white hover:bg-purple-50/40 text-left transition-all flex items-start justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-800">
                    Complete App Backup (JSON File)
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Aapke is app ka pura data format (Settings, Khate, Transactions). Ise kisi dusre device par restore karne ya safe backup rakhne ke liye use karein.
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                    100% Full Data Snapshot
                  </span>
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-purple-600 shrink-0 mt-1" />
            </button>

            {/* 4. Complete HTML Ledger Report */}
            <button
              onClick={handleExportHTML}
              className="w-full p-4 rounded-2xl border-2 border-amber-100 hover:border-amber-500 bg-white hover:bg-amber-50/40 text-left transition-all flex items-start justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-800">
                    Complete Printable Ledger Book (HTML / PDF)
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ek standalone single-file report jise kisi bhi browser me direct open ya print karke PDF banaya ja sakta hai.
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Ready to Print / PDF
                  </span>
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-amber-600 shrink-0 mt-1" />
            </button>

            {/* 5. Complete App Source Code ZIP */}
            <a
              href="/vyapar-khata-app.zip"
              download="vyapar-khata-app.zip"
              onClick={() => notifyDownloaded('Complete Project Source Code (.ZIP)')}
              className="w-full p-4 rounded-2xl border-2 border-teal-200 hover:border-teal-600 bg-teal-50/40 hover:bg-teal-50 text-left transition-all flex items-start justify-between gap-4 group cursor-pointer block"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-teal-600 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-900 flex items-center gap-2">
                    <span>Full Project ZIP (Complete Codebase &amp; Android APK Ready)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-600 text-white font-bold">.ZIP</span>
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Is pure app ka complete source code (React, TypeScript, PWA, Google Drive integration, Manifest, Icons aur README guide). Android Studio me open karke APK build karne ke liye ready hai.
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                    Direct 1-Click ZIP Download
                  </span>
                </div>
              </div>
              <Download className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform shrink-0 mt-1" />
            </a>

            {/* 6. Direct Android APK File */}
            <button
              type="button"
              onClick={() => {
                downloadApkBlob('vyapar-khata.apk');
                notifyDownloaded('Android 14 APK File (.APK)');
              }}
              className="w-full p-4 rounded-2xl border-2 border-emerald-300 hover:border-emerald-600 bg-linear-to-r from-emerald-500 to-teal-600 text-white text-left transition-all flex items-start justify-between gap-4 group cursor-pointer block shadow-sm"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white text-emerald-700 rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Direct Android APK Package (vyapar-khata.apk)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-emerald-800 font-black">.APK</span>
                  </h4>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Tayar Android application package. Apne Android phone me download karein aur direct install karein (534 KB, Signed release).
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold">
                    ⬇️ 1-Click APK Download
                  </span>
                </div>
              </div>
              <Download className="w-5 h-5 text-white group-hover:scale-110 transition-transform shrink-0 mt-1" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Files aapke device ke Downloads folder me save hongi.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
