import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '../types';
import { Luggage, ArrowRight } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingView({ onComplete }: Props) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || t('auth.traveler');
    const newProfile: UserProfile = {
      uid: 'local',
      name: finalName,
      joinedAt: Date.now(),
      language: i18n.language as 'en-GB' | 'zh-CN'
    };
    onComplete(newProfile);
  };

  const handleGuest = () => {
    const newProfile: UserProfile = {
      uid: 'local',
      name: t('auth.traveler'),
      joinedAt: Date.now(),
      language: i18n.language as 'en-GB' | 'zh-CN'
    };
    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col items-center justify-center p-6 text-stone-900 dark:text-stone-100">
      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg">
            <Luggage className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{t('app.name', 'IsoPack Local')}</h1>
          <p className="text-stone-500 dark:text-stone-400 text-lg">
            {t('app.tagline', 'Your Ultimate Travel Packing Checklist')}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t('profile.name', 'Your Name')}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white"
                placeholder={t('auth.traveler', 'Traveler')}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {t('common.continue', 'Continue')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-stone-800 text-stone-500">
                {t('common.or', 'or')}
              </span>
            </div>
          </div>

          <button
            onClick={handleGuest}
            className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            {t('auth.continueAsGuest', 'Continue as Guest')}
          </button>
        </div>
      </div>
    </div>
  );
}
