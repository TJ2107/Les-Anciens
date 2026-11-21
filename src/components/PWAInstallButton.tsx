import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="px-3 py-1.5 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
      >
        <Download size={14} /> Installer l&apos;app
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 border border-accent/30 text-accent font-semibold rounded-xl text-xs hover:bg-accent/10 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Download size={14} /> Installer sur iOS
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm bg-[#1a1d2e] border border-accent/35 rounded-2xl p-6 shadow-2xl text-left"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-accent">Installer sur iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-lg bg-[#252840] text-[#a09888] hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-[#e8e0d0] leading-relaxed space-y-2">
                1. Touchez le bouton <Share2 size={13} className="inline mx-1 text-accent" /> <strong>Partager</strong> dans la barre de Safari.<br />
                2. Faites défiler et touchez <strong>Sur l&apos;écran d&apos;accueil</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
