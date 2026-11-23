import React, { useEffect, useRef, useState } from 'react';
import { Check, Palette, RotateCcw, Settings, Sparkles, Type, Upload } from 'lucide-react';
import { AppSettings } from '../types';
import {
  ACCENT_COLOR_PRESETS,
  DEFAULT_APP_SETTINGS,
  LOGO_PRESETS,
} from '../utils/appTheme';
import { AppLogo } from './AppLogo';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
  onResetSettings: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const resizeLogoImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture impossible'));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('Format invalide'));
        return;
      }
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onShowToast,
}) => {
  const [nameInput, setNameInput] = useState(settings.appName);
  const [hexInput, setHexInput] = useState(settings.accentColor);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameInput(settings.appName);
    setHexInput(settings.accentColor);
  }, [settings.appName, settings.accentColor]);

  const handleNameChange = (value: string) => {
    setNameInput(value);
    const trimmed = value.trim();
    if (trimmed) {
      onUpdateSettings({ ...settings, appName: trimmed });
    }
  };

  const handleSelectLogoPreset = (emoji: string) => {
    onUpdateSettings({ ...settings, logo: emoji });
    onShowToast('Logo de l’application mis à jour', 'success');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Veuillez sélectionner une image valide (PNG, JPG, WebP ou SVG)', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onShowToast('L’image du logo doit faire moins de 2 Mo', 'error');
      return;
    }
    try {
      const processed = await resizeLogoImage(file);
      onUpdateSettings({ ...settings, logo: processed });
      onShowToast('Logo personnalisé appliqué', 'success');
    } catch {
      onShowToast('Impossible de traiter cette image', 'error');
    }
  };

  const handleColorPick = (hex: string) => {
    const normalized = hex.toLowerCase();
    setHexInput(normalized);
    if (HEX_COLOR_RE.test(normalized)) {
      onUpdateSettings({ ...settings, accentColor: normalized });
    }
  };

  const handleHexTextChange = (raw: string) => {
    setHexInput(raw);
    const candidate = raw.startsWith('#') ? raw : `#${raw}`;
    if (HEX_COLOR_RE.test(candidate)) {
      onUpdateSettings({ ...settings, accentColor: candidate.toLowerCase() });
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      onShowToast('Le nom de l’application ne peut pas être vide', 'error');
      return;
    }
    const finalHex = HEX_COLOR_RE.test(hexInput.trim())
      ? hexInput.trim().toLowerCase()
      : settings.accentColor;

    onUpdateSettings({
      appName: trimmedName,
      logo: settings.logo,
      accentColor: finalHex,
    });
    onShowToast('Paramètres enregistrés et appliqués', 'success');
  };

  const isCustomImageLogo = settings.logo.startsWith('data:image/') || settings.logo.startsWith('http');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-accent flex items-center gap-2.5">
            <Settings size={24} /> Paramètres de l&apos;application
          </h1>
          <p className="text-xs sm:text-sm text-[#a09888] mt-1">
            Personnalisez le nom, le logo et la couleur principale de votre plateforme.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetSettings}
          className="px-4 py-2 bg-[#1a1d2e] border border-accent/25 text-accent hover:bg-accent hover:text-accent-contrast font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <RotateCcw size={14} /> Réinitialiser par défaut
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Configuration Form */}
        <form
          onSubmit={handleSaveSubmit}
          className="lg:col-span-7 bg-[#1a1d2e] border border-accent/18 rounded-3xl p-5 sm:p-6 space-y-6"
        >
          {/* App Name */}
          <section className="space-y-2.5">
            <h2 className="text-sm sm:text-base font-bold text-accent flex items-center gap-2">
              <Type size={17} /> Nom de l&apos;application
            </h2>
            <div>
              <label htmlFor="app-name-input" className="block text-xs text-[#a09888] mb-1.5">
                Nom affiché dans la barre de navigation, l&apos;écran de connexion et le titre du navigateur
              </label>
              <input
                id="app-name-input"
                type="text"
                maxLength={40}
                required
                value={nameInput}
                onChange={e => handleNameChange(e.target.value)}
                placeholder={DEFAULT_APP_SETTINGS.appName}
                className="w-full px-4 py-2.5 bg-[#252840] border border-accent/20 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-accent"
              />
            </div>
          </section>

          <hr className="border-accent/12" />

          {/* App Logo */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-bold text-accent flex items-center gap-2">
                <Sparkles size={17} /> Logo de l&apos;application
              </h2>
              {isCustomImageLogo && (
                <button
                  type="button"
                  onClick={() => handleSelectLogoPreset(DEFAULT_APP_SETTINGS.logo)}
                  className="text-xs text-[#a09888] hover:text-white underline cursor-pointer"
                >
                  Revenir aux icônes
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 bg-[#252840]/60 border border-accent/16 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-[#1a1d2e] border border-accent/28 flex items-center justify-center shrink-0 overflow-hidden">
                <AppLogo
                  logo={settings.logo}
                  appName={settings.appName}
                  sizeClass="w-14 h-14"
                  emojiClass="text-3xl"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">
                  {isCustomImageLogo ? 'Logo personnalisé importé' : 'Emblème actif'}
                </div>
                <p className="text-[11px] text-[#a09888] mt-0.5">
                  Choisissez une icône ci-dessous ou importez votre propre image (PNG, JPG, WebP, SVG).
                </p>
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="mt-2.5 px-3.5 py-1.5 bg-[#1a1d2e] hover:bg-accent text-accent hover:text-accent-contrast border border-accent/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload size={13} /> Importer un logo
                </button>
              </div>
            </div>

            <div>
              <div className="text-xs text-[#a09888] mb-2">Icônes prédéfinies</div>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
                {LOGO_PRESETS.map(preset => {
                  const selected = settings.logo === preset;
                  const isImagePreset =
                    preset.startsWith('/') ||
                    preset.startsWith('data:image/') ||
                    preset.startsWith('http');
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectLogoPreset(preset)}
                      aria-label={
                        isImagePreset
                          ? 'Choisir le logo officiel de l’application'
                          : `Choisir le logo ${preset}`
                      }
                      title={isImagePreset ? 'Logo officiel' : preset}
                      aria-pressed={selected}
                      className={`h-11 rounded-xl text-xl flex items-center justify-center border overflow-hidden transition-all cursor-pointer ${
                        selected
                          ? 'bg-accent/20 border-accent scale-105 shadow-sm ring-1 ring-accent/40'
                          : 'bg-[#252840] border-accent/14 hover:border-accent/50'
                      }`}
                    >
                      {isImagePreset ? (
                        <img
                          src={preset}
                          alt={`Logo ${settings.appName}`}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        preset
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <hr className="border-accent/12" />

          {/* App Accent Color */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-accent flex items-center gap-2">
              <Palette size={17} /> Couleur principale
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ACCENT_COLOR_PRESETS.map(preset => {
                const isSelected = settings.accentColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleColorPick(preset.hex)}
                    aria-pressed={isSelected}
                    className={`px-3 py-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#252840] border-accent ring-2 ring-accent/25'
                        : 'bg-[#252840]/60 border-accent/14 hover:border-accent/45'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 border border-white/20 flex items-center justify-center"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check size={12} className="text-[#111] drop-shadow" />}
                    </span>
                    <span className="text-xs font-semibold text-white truncate">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label
                htmlFor="custom-color-picker"
                className="text-xs font-medium text-[#a09888]"
              >
                Couleur personnalisée :
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="custom-color-picker"
                  type="color"
                  value={HEX_COLOR_RE.test(settings.accentColor) ? settings.accentColor : '#d4a843'}
                  onChange={e => handleColorPick(e.target.value)}
                  className="w-10 h-9 rounded-lg bg-[#252840] border border-accent/25 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  aria-label="Code hexadécimal de la couleur"
                  value={hexInput}
                  onChange={e => handleHexTextChange(e.target.value)}
                  maxLength={7}
                  placeholder="#d4a843"
                  className="w-28 px-3 py-2 bg-[#252840] border border-accent/20 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </section>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              Enregistrer les paramètres
            </button>
          </div>
        </form>

        {/* Live Preview Panel */}
        <aside
          className="lg:col-span-5 bg-[#1a1d2e] border border-accent/18 rounded-3xl p-5 sm:p-6 space-y-4"
          aria-label="Aperçu en direct de l'application"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-accent">Aperçu en direct</h2>
            <span className="text-[11px] font-mono text-[#a09888] uppercase">
              {settings.accentColor}
            </span>
          </div>

          <div className="rounded-2xl bg-[#0f1117] border border-accent/20 overflow-hidden shadow-inner">
            {/* Mock Navbar */}
            <div className="px-4 py-3 bg-[#0f1117] border-b border-accent/16 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-extrabold text-sm min-w-0">
                <AppLogo
                  logo={settings.logo}
                  appName={settings.appName}
                  sizeClass="w-7 h-7"
                  emojiClass="text-lg"
                />
                <span className="bg-gradient-to-r from-accent to-accent-highlight bg-clip-text text-transparent truncate">
                  {nameInput.trim() || DEFAULT_APP_SETTINGS.appName}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="text-accent border-b-2 border-accent pb-0.5">Accueil</span>
                <span className="text-[#a09888]">Anciens</span>
              </div>
            </div>

            {/* Mock Content */}
            <div className="p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#1a1d2e] border border-accent/20 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">Gala des Anciens</span>
                  <span className="text-xs font-mono font-bold text-accent tabular-nums">
                    72%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#252840] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent-highlight rounded-full"
                    style={{ width: '72%' }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-[#a09888]">Collecte active</span>
                  <span className="px-3 py-1 rounded-lg bg-accent text-accent-contrast text-[11px] font-bold">
                    Participer
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#a09888] leading-relaxed">
            Vos modifications sont sauvegardées automatiquement sur cet appareil et s&apos;appliquent à l&apos;ensemble des écrans.
          </p>
        </aside>
      </div>
    </div>
  );
};
