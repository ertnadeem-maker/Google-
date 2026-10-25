import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Wifi,
  WifiOff,
  Settings,
  Languages,
  LogOut,
  Store,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
} from 'lucide-react';
import { useLedger } from '../context/LedgerContext';
import { Language } from '../types';
import { formatDate } from '../utils/i18n';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenNewParty: () => void;
  onOpenNewTransaction: () => void;
  onOpenExport: () => void;
  onOpenApkGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenNewParty,
  onOpenNewTransaction,
  onOpenExport,
  onOpenApkGuide,
}) => {
  const {
    businessProfile,
    language,
    setLanguage,
    t,
    isOnline,
    syncStatus,
    lastSyncedAt,
    currentUser,
    syncWithGoogleDrive,
    signInWithGoogle,
    signOutGoogle,
    syncError,
    clearSyncError,
  } = useLedger();

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await syncWithGoogleDrive();
    setIsManualSyncing(false);
  };

  const languages: { key: Language; label: string; native: string }[] = [
    { key: 'hinglish', label: 'Hinglish', native: 'हिन्दी + Eng' },
    { key: 'english', label: 'English', native: 'English' },
    { key: 'hindi', label: 'हिन्दी', native: 'Hindi' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Left: App Branding & Business Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate tracking-tight">
                  {businessProfile.businessName || t.appName}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t.appName}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate hidden sm:block">
                {businessProfile.ownerName
                  ? `${businessProfile.ownerName} • ${businessProfile.phone}`
                  : t.tagline}
              </p>
            </div>
          </div>

          {/* Right: Actions, Sync, Language, User */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Online/Offline Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isOnline ? t.syncStatusOnline : t.syncStatusOffline}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">{t.syncStatusOnline}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-amber-800">{t.syncStatusOffline}</span>
                </>
              )}
            </div>

            {/* Google Drive Status / Sign-in */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isManualSyncing || !isOnline}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    syncStatus === 'synced'
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : syncStatus === 'syncing' || isManualSyncing
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                  title={
                    lastSyncedAt
                      ? `${t.lastSynced}: ${formatDate(lastSyncedAt)}`
                      : t.syncNow
                  }
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isManualSyncing || syncStatus === 'syncing' ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="hidden md:inline">
                    {syncStatus === 'syncing' || isManualSyncing
                      ? t.syncStatusSyncing
                      : syncStatus === 'synced'
                      ? 'Drive Synced'
                      : t.syncNow}
                  </span>
                </button>

                {/* User Profile / Drive Info Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pl-2 pr-2 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors text-xs text-gray-700 cursor-pointer"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-6 h-6 rounded-full border border-gray-300 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                      </div>
                    )}
                    <span className="hidden lg:inline max-w-[100px] truncate font-medium">
                      {currentUser.displayName || currentUser.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">Google Drive Connected</p>
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {currentUser.displayName || 'Google Account'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        {lastSyncedAt && (
                          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {t.lastSynced}: {formatDate(lastSyncedAt)}
                          </p>
                        )}
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleManualSync();
                          }}
                          disabled={!isOnline}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4 text-blue-600" />
                          {t.syncNow}
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            signOutGoogle();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          {t.disconnect}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Official Google Sign In button pattern per workspace-integration skill */
              <button
                type="button"
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-xs transition-all cursor-pointer"
                title="Connect Google Drive to auto backup your data"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span className="font-semibold text-gray-800 whitespace-nowrap">
                  {t.connectDrive}
                </span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                title="Change Language"
              >
                <Languages className="w-3.5 h-3.5 text-gray-500" />
                <span className="uppercase text-[11px] font-bold text-gray-600">{language}</span>
              </button>

              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.key}
                      onClick={() => {
                        setLanguage(l.key);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        language === l.key
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{l.label}</span>
                      <span className="text-[10px] text-gray-400">{l.native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Install App / APK Guide Button */}
            <PWAInstallButton onOpenApkGuide={onOpenApkGuide} />

            {/* Export Data button */}
            <button
              type="button"
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Export & Download Data (Excel, JSON, PDF)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Settings button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title={t.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Error Notice if any */}
      {syncError && (
        <div className="bg-red-50 border-t border-b border-red-200 px-4 py-2 text-xs text-red-700">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="truncate">{syncError}</span>
            </div>
            <button
              type="button"
              onClick={clearSyncError}
              className="p-1 hover:bg-red-100 rounded-lg text-red-600 transition-colors shrink-0 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
