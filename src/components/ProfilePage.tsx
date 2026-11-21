import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, LogOut, Pencil, Settings, Trash2, X } from 'lucide-react';
import { COUNTRIES, FILIERES, PROMO_YEARS } from '../data/demoData';
import { UserProfile } from '../types';
import { compressProfilePhoto, PROFILE_EMOJI_PRESETS } from '../utils/profileImage';
import { AvatarDisplay } from './AvatarDisplay';

interface ProfilePageProps {
  user: UserProfile;
  onLogout: () => void;
  onRequestDeleteAccount: () => void;
  onOpenSettings: () => void;
  onUpdateProfile: (updatedUser: UserProfile) => boolean;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onLogout,
  onRequestDeleteAccount,
  onOpenSettings,
  onUpdateProfile,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [country, setCountry] = useState(user.country);
  const [city, setCity] = useState(user.city);
  const [univ, setUniv] = useState(user.univ);
  const [year, setYear] = useState(user.year);
  const [filiere, setFiliere] = useState(user.filiere);
  const [role, setRole] = useState(user.role);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setAvatar(user.avatar);
    setCountry(user.country);
    setCity(user.city);
    setUniv(user.univ);
    setYear(user.year);
    setFiliere(user.filiere);
    setRole(user.role);
    setFormError('');
  }, [user]);

  const handleOpenEdit = () => {
    setName(user.name);
    setEmail(user.email);
    setAvatar(user.avatar);
    setCountry(user.country);
    setCity(user.city);
    setUniv(user.univ);
    setYear(user.year);
    setFiliere(user.filiere);
    setRole(user.role);
    setFormError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormError('');
    setIsEditing(false);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Veuillez choisir une image valide (JPG, PNG, WebP)', 'error');
      return;
    }
    try {
      const compressed = await compressProfilePhoto(file);
      setAvatar(compressed);
      setFormError('');
    } catch {
      onShowToast('Impossible de charger cette photo', 'error');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !name.trim() ||
      !email.trim() ||
      !country ||
      !city.trim() ||
      !univ.trim() ||
      !year ||
      !filiere ||
      !role.trim() ||
      !avatar
    ) {
      const msg = 'Veuillez renseigner tous les champs obligatoires.';
      setFormError(msg);
      onShowToast(msg, 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const msg = 'Veuillez saisir une adresse email valide.';
      setFormError(msg);
      onShowToast(msg, 'error');
      return;
    }

    const updatedUser: UserProfile = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      avatar,
      country,
      city: city.trim(),
      univ: univ.trim(),
      year,
      filiere,
      role: role.trim(),
      promo: `Promo ${year}`,
    };

    const ok = onUpdateProfile(updatedUser);
    if (ok) {
      setIsEditing(false);
    }
  };

  const countryOptions = COUNTRIES.includes(country)
    ? COUNTRIES
    : country
    ? [country, ...COUNTRIES]
    : COUNTRIES;

  const yearOptions = PROMO_YEARS.includes(year)
    ? PROMO_YEARS
    : year
    ? [year, ...PROMO_YEARS]
    : PROMO_YEARS;

  const filiereOptions = FILIERES.includes(filiere)
    ? FILIERES
    : filiere
    ? [filiere, ...FILIERES]
    : FILIERES;

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      {/* Header Card */}
      <section className="bg-[#1a1d2e] border border-accent/20 rounded-3xl p-6 sm:p-8 text-center">
        <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-accent to-[#9b59b6] mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg overflow-hidden">
          <AvatarDisplay avatar={isEditing ? avatar : user.avatar} alt={user.name} />
        </div>
        <h1 className="text-2xl font-extrabold text-accent">{user.name}</h1>
        <p className="text-sm text-[#a09888] mt-1">
          {user.univ} · {user.country} · {user.promo}
        </p>
        <div className="text-xs text-emerald-400 font-semibold mt-2">
          En ligne · Membre vérifié
        </div>

        <div className="mt-6 pt-6 border-t border-accent/15 flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          {!isEditing && (
            <button
              type="button"
              onClick={handleOpenEdit}
              className="px-5 py-2.5 bg-accent text-accent-contrast font-bold rounded-xl text-sm hover:bg-accent-light transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Pencil size={15} /> Modifier mon profil
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-5 py-2.5 border border-accent/30 bg-[#252840] text-white font-semibold rounded-xl text-sm hover:border-accent hover:text-accent transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Settings size={16} /> Paramètres de l&apos;app
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="px-5 py-2.5 border border-accent/30 text-accent font-semibold rounded-xl text-sm hover:bg-accent/15 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
          <button
            type="button"
            onClick={onRequestDeleteAccount}
            className="px-5 py-2.5 bg-red-500/15 text-red-400 border border-red-500/30 font-semibold rounded-xl text-sm hover:bg-red-500/25 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Trash2 size={16} /> Supprimer mon compte
          </button>
        </div>
      </section>

      {/* Personal Information / Edit Form */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="bg-[#1a1d2e] border border-accent/25 rounded-3xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-accent flex items-center gap-2">
              <Pencil size={17} /> Modifier mes informations
            </h2>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-[#a09888] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <X size={14} /> Annuler
            </button>
          </div>

          {/* Photo / Avatar Picker */}
          <div className="p-4 bg-[#252840]/60 border border-accent/15 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#1a1d2e] border border-accent/25 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                  <AvatarDisplay avatar={avatar} alt={name || user.name} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Photo de profil</div>
                  <div className="text-[11px] text-[#a09888]">
                    Importez une image ou choisissez un avatar
                  </div>
                </div>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-accent/15 border border-accent/35 text-accent text-xs font-semibold rounded-xl hover:bg-accent hover:text-accent-contrast transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Camera size={14} /> Changer la photo
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {PROFILE_EMOJI_PRESETS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  aria-label={`Choisir l'avatar ${emoji}`}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-colors cursor-pointer ${
                    avatar === emoji
                      ? 'bg-accent/20 border-accent'
                      : 'bg-[#1a1d2e] border-accent/14 hover:border-accent/45'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#a09888] mb-1">
                Nom complet <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a09888] mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a09888] mb-1">
                Pays <span className="text-red-400">*</span>
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
              >
                {countryOptions.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a09888] mb-1">
                Ville <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#a09888] mb-1">
                Université <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={univ}
                onChange={e => setUniv(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a09888] mb-1">
                Promotion <span className="text-red-400">*</span>
              </label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>
                    Promo {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a09888] mb-1">
                Filière <span className="text-red-400">*</span>
              </label>
              <select
                value={filiere}
                onChange={e => setFiliere(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
              >
                {filiereOptions.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#a09888] mb-1">
                Profession / Poste actuel <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {formError && (
            <div
              role="alert"
              className="px-3.5 py-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-xs text-red-300 font-medium"
            >
              {formError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <Check size={16} /> Enregistrer les modifications
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-3 bg-[#252840] text-white font-semibold rounded-xl text-sm hover:bg-[#2d3050] transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <section className="bg-[#1a1d2e] border border-accent/16 rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-accent">
              Informations personnelles
            </h2>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Pencil size={13} /> Modifier
            </button>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="py-2 border-b border-accent/10">
              <dt className="text-xs text-[#a09888]">Nom complet</dt>
              <dd className="text-white font-medium mt-0.5">{user.name}</dd>
            </div>
            <div className="py-2 border-b border-accent/10">
              <dt className="text-xs text-[#a09888]">Email</dt>
              <dd className="text-white font-medium mt-0.5 break-all">{user.email}</dd>
            </div>
            <div className="py-2 border-b border-accent/10">
              <dt className="text-xs text-[#a09888]">Université</dt>
              <dd className="text-white font-medium mt-0.5">{user.univ}</dd>
            </div>
            <div className="py-2 border-b border-accent/10">
              <dt className="text-xs text-[#a09888]">Pays</dt>
              <dd className="text-white font-medium mt-0.5">{user.country}</dd>
            </div>
            <div className="py-2 border-b border-accent/10">
              <dt className="text-xs text-[#a09888]">Ville</dt>
              <dd className="text-white font-medium mt-0.5">{user.city}</dd>
            </div>
            <div className="py-2 border-b border-accent/10">
              <dt className="text-xs text-[#a09888]">Promotion</dt>
              <dd className="text-white font-medium mt-0.5">{user.promo || `Promo ${user.year}`}</dd>
            </div>
            <div className="py-2 border-b border-accent/10 sm:border-b-0">
              <dt className="text-xs text-[#a09888]">Filière</dt>
              <dd className="text-white font-medium mt-0.5">{user.filiere}</dd>
            </div>
            <div className="py-2">
              <dt className="text-xs text-[#a09888]">Profession / Poste</dt>
              <dd className="text-white font-medium mt-0.5">{user.role}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
};
