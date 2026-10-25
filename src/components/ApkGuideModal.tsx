import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Download,
  Terminal,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadApkBlob } from '../assets/apkBase64';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isInstalled } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'online_apk' | 'capacitor'>('pwa');

  // Shared production URL from Google Cloud Run
  const sharedUrl = 'https://ais-pre-xzwzshrjob7uc3anfjaepz-420782902307.asia-east1.run.app';

  if (!isOpen) return null;

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(sharedUrl)}`;
  const appsGeyserUrl = `https://www.appsgeyser.com/create-url-app/`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Android App &amp; APK Solutions</h3>
              <p className="text-xs text-emerald-100">
                Is app ko Android phone me direct install karein ya APK banayein
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct APK Download Banner */}
        <div className="p-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Download Android APK File (.apk)</p>
              <p className="text-xs text-emerald-100">Ready to install on any Android phone • 534 KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => downloadApkBlob('vyapar-khata.apk')}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download .APK Now</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-semibold px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            1. Direct Mobile Install (Best &amp; 100% Works)
          </button>

          <button
            onClick={() => setActiveTab('online_apk')}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'online_apk'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            2. Online APK Builders
          </button>

          <button
            onClick={() => setActiveTab('capacitor')}
            className={`py-2 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'capacitor'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            3. Android Studio / CLI
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* TAB 1: Direct Chrome Install (Why PWA is best) */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase">
                  100% Guaranteed &amp; Immediate
                </span>
                <h4 className="text-sm font-bold text-emerald-950">
                  Phone par direct &quot;Install App&quot; karein (Kisi builder ki zaroorat nahi)
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  PWABuilder jaise tools external bots hote hain jo cloud servers ke firewall se block ho sakte hain. Lekin <strong>Google Chrome</strong> aapke phone par direct <strong>WebAPK</strong> generate karta hai jo 100% native app banta hai!
                </p>
              </div>

              {/* Install Now Prompt if detected */}
              {isInstallable && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-blue-950">Browser Install Ready:</p>
                    <p className="text-xs text-blue-700">
                      Aapka browser abhi is app ko phone me install karne ke liye ready hai.
                    </p>
                  </div>
                  <button
                    onClick={install}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Install Now
                  </button>
                </div>
              )}

              {/* Step by step */}
              <div className="space-y-3">
                <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                  Android Phone me 10 Seconds me Install karein:
                </h5>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">1. Mobile Chrome me yeh URL kholein:</span>
                    <button
                      onClick={() => handleCopyUrl(sharedUrl)}
                      className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-gray-200 font-mono text-xs text-gray-700 truncate select-all">
                    {sharedUrl}
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <p className="font-bold text-gray-900">
                    2. Chrome ke 3-dots Menu (⋮) par tap karein
                  </p>
                  <p className="text-xs text-gray-600">
                    Chrome browser ke top right kone me 3 dots par click karein.
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <p className="font-bold text-gray-900">
                    3. &quot;Install app&quot; ya &quot;Add to Home screen&quot; par tap karein
                  </p>
                  <p className="text-xs text-gray-600">
                    Aapke Android phone ke home screen par <strong>Vyapar Khata</strong> ka app icon ban jayega.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Fayda:</strong> Yeh bina internet ke offline chalega, fullscreen open hoga, aur Google Drive se real-time sync karega!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Online APK Builders */}
          {activeTab === 'online_apk' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">PWABuilder par error kyu aaya tha?</p>
                  <p className="mt-0.5 text-amber-800">
                    1. Pehle static <code>manifest.json</code> link nahi tha (jo humne ab physically add kar diya hai).
                    <br />
                    2. PWABuilder par sirf <strong>Public Shared URL</strong> chalta hai, <code>ais-dev</code> wala internal link nahi chalta.
                  </p>
                </div>
              </div>

              {/* Option A: AppsGeyser (Instant APK) */}
              <div className="p-4 bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      100% Working Online Tool
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-1">
                      AppsGeyser Web to APK Converter
                    </h4>
                  </div>
                  <Globe className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-600">
                  AppsGeyser kisi bhi URL ko 1 minute me direct downloadable <code>.APK</code> file me convert kar deta hai:
                </p>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <p>1. Neeche se Shared URL copy karein.</p>
                  <p>2. AppsGeyser par jakar Website URL me paste karein.</p>
                  <p>3. App Name &quot;Vyapar Khata&quot; dalein aur <strong>Download APK</strong> par click karein.</p>
                </div>
                <div className="pt-1 flex gap-2">
                  <a
                    href={appsGeyserUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>AppsGeyser Par APK Banayein</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleCopyUrl(sharedUrl)}
                    className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>

              {/* Option B: PWABuilder Retry */}
              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <h4 className="text-sm font-bold text-gray-900">
                  PWABuilder (Dobara Try Karein)
                </h4>
                <p className="text-xs text-gray-600">
                  Ab humne <code>manifest.json</code> aur <code>sw.js</code> deploy kar diya hai. Aap is link ke sath PWABuilder par dobara koshish kar sakte hain:
                </p>
                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-1"
                >
                  <span>PWABuilder par Test Karein</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: Developer / Android Studio */}
          {activeTab === 'capacitor' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
                <h4 className="text-sm font-bold text-purple-950">
                  Android Studio se Native Signed APK build karein
                </h4>
                <p className="text-xs text-purple-800">
                  Aap Capacitor ke through project ko native Android app me convert kar sakte hain:
                </p>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-teal-950">Complete Source Code ZIP Download</h4>
                  <p className="text-xs text-teal-800">
                    Pura project code ZIP file me download karein aur apne computer par open karein:
                  </p>
                </div>
                <a
                  href="/vyapar-khata-app.zip"
                  download="vyapar-khata-app.zip"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </a>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-gray-800 text-xs">Terminal Commands (After unzipping):</p>
                <div className="p-3 bg-gray-900 text-emerald-400 font-mono text-xs rounded-xl space-y-1 overflow-x-auto">
                  <p># 1. Install dependencies</p>
                  <p className="text-white">npm install</p>
                  <p className="mt-2"># 2. Build web assets</p>
                  <p className="text-white">npm run build</p>
                  <p className="mt-2"># 3. Add Android platform &amp; Sync</p>
                  <p className="text-white">npx cap add android &amp;&amp; npx cap sync</p>
                  <p className="mt-2"># 4. Open in Android Studio to create APK</p>
                  <p className="text-white">npx cap open android</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => handleCopyUrl(sharedUrl)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'URL Copied!' : 'Copy Shared App URL'}</span>
          </button>
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
