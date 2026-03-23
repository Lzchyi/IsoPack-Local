import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Luggage, ShieldCheck, User, Lock, ArrowRight, UserPlus, LogIn, Info, Download } from 'lucide-react';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { hashPassword, generateSalt } from '../utils/crypto';
import { UserAccount, UserProfile } from '../types';
import { toast } from 'react-hot-toast';

interface Props {
  onAuthSuccess: (account: UserAccount, profile: UserProfile) => void;
  onGuestMode: () => void;
}

export default function AuthView({ onAuthSuccess, onGuestMode }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register' | 'guest-info'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setIsLoading(true);

    try {
      const existing = await db.users.where('username').equals(username).first();
      if (existing) {
        toast.error(t('auth.userExists', 'Username already taken on this device.'));
        setIsLoading(false);
        return;
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);
      const userId = nanoid();

      const newAccount: UserAccount = {
        id: userId,
        username,
        passwordHash,
        salt,
        createdAt: Date.now(),
        isGuest: false
      };

      const newProfile: UserProfile = {
        uid: userId,
        name: username,
        joinedAt: Date.now(),
        ownerId: userId
      };

      await db.users.add(newAccount);
      await db.profiles.add(newProfile);

      toast.success(t('auth.welcome', 'Account created locally!'));
      onAuthSuccess(newAccount, newProfile);
    } catch (error) {
      console.error(error);
      toast.error(t('auth.error', 'Failed to create account.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setIsLoading(true);

    try {
      const account = await db.users.where('username').equals(username).first();
      if (!account) {
        toast.error(t('auth.invalid', 'Invalid username or password.'));
        setIsLoading(false);
        return;
      }

      const hash = await hashPassword(password, account.salt);
      if (hash !== account.passwordHash) {
        toast.error(t('auth.invalid', 'Invalid username or password.'));
        setIsLoading(false);
        return;
      }

      const profile = await db.profiles.where('ownerId').equals(account.id).first();
      if (profile) {
        onAuthSuccess(account, profile);
      } else {
        // Fallback profile if missing
        const newProfile: UserProfile = {
          uid: account.id,
          name: account.username,
          joinedAt: account.createdAt,
          ownerId: account.id
        };
        await db.profiles.add(newProfile);
        onAuthSuccess(account, newProfile);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('auth.error', 'Login failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Aesthetic Branding */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-3xl mb-6 shadow-xl shadow-emerald-500/20"
          >
            <Luggage className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-stone-900 dark:text-white mb-2 uppercase italic">IsoPack</h1>
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Local Sovereignty Protocol</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'guest-info' ? (
            <motion.div
              key="guest-info"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-sm border border-stone-200 dark:border-stone-700"
            >
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl mb-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                    {t('auth.guestWarning', 'Guest Mode is ephemeral. All data will be purged from this device once you sign out.')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-stone-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white">{t('auth.localOnly', 'Zero Cloud')}</h3>
                    <p className="text-sm text-stone-500">{t('auth.localOnlyDesc', 'Your data never leaves this device. No servers, no tracking.')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-stone-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white">{t('auth.backupFirst', 'Manual Backups')}</h3>
                    <p className="text-sm text-stone-500">{t('auth.backupFirstDesc', 'Since we are local, you must use the Export feature to backup your data.')}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onGuestMode}
                className="w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                {t('auth.continueGuest', 'Continue as Guest')}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setMode('login')}
                className="w-full mt-4 text-stone-500 text-sm font-medium hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                {t('auth.backToLogin', 'Go back to Login')}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={mode}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-sm border border-stone-200 dark:border-stone-700"
            >
              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">{t('auth.username', 'Username')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-stone-900 dark:text-white"
                      placeholder="traveler_01"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">{t('auth.password', 'Local Password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-stone-900 dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? t('auth.login', 'Sign In') : t('auth.register', 'Create Local Account')}
                      {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-stone-100 dark:border-stone-700 flex flex-col gap-3">
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-stone-500 text-sm font-medium hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  {mode === 'login' ? t('auth.noAccount', "Don't have a local account? Create one") : t('auth.hasAccount', 'Already have an account? Sign in')}
                </button>
                <button
                  onClick={() => setMode('guest-info')}
                  className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline transition-all"
                >
                  {t('auth.useGuest', 'Use Guest Mode (Ephemeral)')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Local-First Aesthetic Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            {t('auth.sovereignty', 'Data Sovereignty Guaranteed')}
          </p>
          <p className="text-[10px] text-stone-400 mt-1">
            {t('auth.deviceOnly', 'Your data never leaves this physical device.')}
          </p>
        </div>
      </div>
    </div>
  );
}
