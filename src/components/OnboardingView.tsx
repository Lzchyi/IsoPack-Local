import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Luggage, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  onComplete: (name: string) => void;
}

export default function OnboardingView({ onComplete }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || t('auth.traveler', 'Traveler');
    onComplete(finalName);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col items-center justify-center p-6 text-stone-900 dark:text-stone-100">
      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg">
            <Luggage className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">{t('app.name', 'IsoPack')}</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" />
            {t('auth.localSovereignty', 'Local Sovereignty Protocol')}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">{t('onboarding.welcome', 'Welcome aboard')}</h2>
            <p className="text-stone-500 dark:text-stone-400">
              {t('onboarding.setupDesc', 'Let\'s set up your local profile to get started.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest ml-1">
                {t('profile.name', 'Your Name')}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white text-lg font-medium"
                placeholder={t('auth.traveler', 'Traveler')}
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
            >
              {t('onboarding.startPacking', 'Start Packing')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
            <p className="text-[10px] text-center text-stone-400 dark:text-stone-500 uppercase tracking-widest leading-relaxed">
              {t('onboarding.privacyNote', 'Your profile data is stored exclusively on this device and is never uploaded to any cloud server.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
