import React, { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { COUNTRIES, FILIERES, PROMO_YEARS } from '../data/demoData';
import { AppSettings, UserProfile } from '../types';
import { compressProfilePhoto } from '../utils/profileImage';
import { AppLogo } from './AppLogo';

interface AuthScreenProps {
  appSettings: AppSettings;
  onLoginSuccess: (user: UserProfile, toastMessage: string, toastType?: 'success' | 'info') => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  appSettings,
  onLoginSuccess,
  onShowToast,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regAvatar, setRegAvatar] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [regUniv, setRegUniv] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regYear, setRegYear] = useState('');
  const [regFiliere, setRegFiliere] = useState('');
  const [regRole, setRegRole] = useState('');
  const [formError, setFormError] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPass) {
      onShowToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    const users: UserProfile[] = JSON.parse(localStorage.getItem('anciens_users') || '[]');
    const found = users.find(
      u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPass
    );
    if (found) {
      onLoginSuccess(found, 'Connexion réussie ! Bienvenue', 'success');
    } else {
      onShowToast('Email ou mot de passe incorrect. Créez un compte si vous êtes nouveau.', 'error');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Veuillez choisir une image valide (JPG, PNG, WebP)', 'error');
      return;
    }
    try {
      const compressed = await compressProfilePhoto(file);
      setRegAvatar(compressed);
      setFormError('');
    } catch {
      onShowToast('Impossible de charger cette photo', 'error');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!regAvatar) {
      const msg = 'La photo de profil est obligatoire pour créer votre compte.';
      setFormError(msg);
      onShowToast(msg, 'error');
      return;
    }

    if (
      !regName.trim() ||
      !regEmail.trim() ||
      !regPass ||
      !regCountry ||
      !regUniv.trim() ||
      !regCity.trim() ||
      !regYear ||
      !regFiliere ||
      !regRole.trim()
    ) {
      const msg = 'Tous les champs marqués * sont obligatoires avant de vous connecter.';
      setFormError(msg);
      onShowToast(msg, 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      const msg = 'Veuillez saisir une adresse email valide.';
      setFormError(msg);
      onShowToast(msg, 'error');
      return;
    }

    if (regPass.length < 6) {
      const msg = 'Le mot de passe doit contenir au moins 6 caractères.';
      setFormError(msg);
      onShowToast(msg, 'error');
      return;
    }

    const users: UserProfile[] = JSON.parse(localStorage.getItem('anciens_users') || '[]');
    if (users.find(u => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      const msg = 'Cet email est déjà utilisé.';
      setFormError(msg);
      onShowToast(msg, 'error');
      return;
    }

    const newUser: UserProfile = {
      id: Date.now(),
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPass,
      country: regCountry,
      univ: regUniv.trim(),
      year: regYear,
      filiere: regFiliere,
      avatar: regAvatar,
      role: regRole.trim(),
      city: regCity.trim(),
      promo: `Promo ${regYear}`,
    };

    users.push(newUser);
    localStorage.setItem('anciens_users', JSON.stringify(users));
    onLoginSuccess(newUser, 'Inscription réussie ! Bienvenue', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e8e0d0] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#9b59b6]/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full ${
          authTab === 'register' ? 'max-w-lg' : 'max-w-md'
        } bg-[#1a1d2e] border border-accent/22 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fadeIn transition-all`}
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-[#9b59b6] text-accent-contrast mb-3 shadow-lg shadow-accent/20 overflow-hidden">
            <AppLogo
              logo={appSettings.logo}
              appName={appSettings.appName}
              sizeClass="w-14 h-14"
              emojiClass="text-3xl"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-accent tracking-tight">{appSettings.appName}</h1>
          <p className="text-sm text-[#a09888] mt-1">Réseau mondial des anciens étudiants</p>
          <p className="mt-3 px-3.5 py-2.5 rounded-2xl bg-[#252840]/65 border border-accent/14 text-xs text-[#e8e0d0]/90 leading-relaxed text-left">
            <strong className="text-accent">{appSettings.appName}</strong> rassemble les anciens étudiants dans un espace dédié à l&apos;entraide et au lien communautaire : retrouvez vos camarades dans l&apos;annuaire, échangez en direct dans les salons de discussion, partagez vos souvenirs en galerie et suivez les cotisations ainsi que les événements du réseau.
          </p>
        </div>

        <div className="flex bg-[#252840] rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthTab('login');
              setFormError('');
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              authTab === 'login' ? 'bg-accent text-accent-contrast shadow' : 'text-[#a09888] hover:text-white'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('register');
              setFormError('');
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              authTab === 'register' ? 'bg-accent text-accent-contrast shadow' : 'text-[#a09888] hover:text-white'
            }`}
          >
            Inscription
          </button>
        </div>

        {authTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#a09888] mb-1.5">
                Adresse email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full px-4 py-3 bg-[#252840] border border-accent/18 rounded-xl text-white placeholder-[#706858] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a09888] mb-1.5">
                Mot de passe <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#252840] border border-accent/18 rounded-xl text-white placeholder-[#706858] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all cursor-pointer"
            >
              Se connecter
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} noValidate className="space-y-3.5">
            <p className="text-xs text-[#a09888]">
              Tous les champs marqués <span className="text-red-400 font-semibold">*</span> sont obligatoires pour créer votre compte et vous connecter.
            </p>

            {/* Required Profile Photo Upload */}
            <div className="flex items-center gap-4 p-3 bg-[#252840]/70 border border-accent/18 rounded-2xl">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Choisir une photo de profil"
                className="w-16 h-16 rounded-full bg-[#1a1d2e] border-2 border-dashed border-accent/45 hover:border-accent flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-colors"
              >
                {regAvatar ? (
                  <img
                    src={regAvatar}
                    alt="Aperçu de la photo de profil"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera size={22} className="text-accent" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white">
                  Photo de profil <span className="text-red-400">*</span>
                </div>
                <p className="text-[11px] text-[#a09888] mt-0.5">
                  {regAvatar ? 'Photo sélectionnée et prête.' : 'Obligatoire · JPG, PNG ou WebP'}
                </p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-2 px-3 py-1.5 bg-[#1a1d2e] hover:bg-[#2d314d] border border-accent/28 text-accent text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload size={13} /> {regAvatar ? 'Changer la photo' : 'Importer une photo'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                  Nom complet <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Ex: Aminata Diallo"
                  className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white placeholder-[#706858] focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                  Adresse email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white placeholder-[#706858] focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                  Mot de passe (6+ car.) <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPass}
                  onChange={e => setRegPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white placeholder-[#706858] focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                  Pays <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={regCountry}
                  onChange={e => setRegCountry(e.target.value)}
                  aria-label="Pays"
                  className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white focus:outline-none focus:border-accent text-sm"
                >
                  <option value="">Sélectionner un pays...</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                  Université / École <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regUniv}
                  onChange={e => setRegUniv(e.target.value)}
                  placeholder="Ex: UCAD Dakar"
                  className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white placeholder-[#706858] focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                  Ville actuelle <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regCity}
                  onChange={e => setRegCity(e.target.value)}
                  placeholder="Ex: Brazzaville, Dakar..."
                  className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white placeholder-[#706858] focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                  Promotion <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={regYear}
                  onChange={e => setRegYear(e.target.value)}
                  aria-label="Année de promotion"
                  className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white focus:outline-none focus:border-accent text-sm"
                >
                  <option value="">Année de promo...</option>
                  {PROMO_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                  Filière <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={regFiliere}
                  onChange={e => setRegFiliere(e.target.value)}
                  aria-label="Filière"
                  className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white focus:outline-none focus:border-accent text-sm"
                >
                  <option value="">Choisir une filière...</option>
                  {FILIERES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#a09888] mb-1">
                Profession / Poste actuel <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={regRole}
                onChange={e => setRegRole(e.target.value)}
                placeholder="Ex: Ingénieur Électronique, Médecin..."
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white placeholder-[#706858] focus:outline-none focus:border-accent text-sm"
              />
            </div>

            {formError && (
              <div
                role="alert"
                className="px-3.5 py-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-xs text-red-300 font-medium"
              >
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all cursor-pointer mt-1"
            >
              Créer mon compte et se connecter
            </button>
          </form>
        )}
      </div>

      <footer className="relative z-10 mt-6 text-center text-xs text-[#807868]">
        © 2026 Empreintes Technologies. Tous droits réservés.
      </footer>
    </div>
  );
};
