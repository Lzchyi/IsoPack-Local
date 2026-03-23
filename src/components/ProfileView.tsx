import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, InventoryItem } from '../types';
import { User, Save, LogOut, ShieldCheck, Globe, Shield, X, Trash2, Info, Moon, Sun, Camera, Pencil, Download, Upload, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from './ConfirmationModal';
import { useDarkMode } from '../hooks/useDarkMode';
import { compressImage } from '../utils/image';
import { toast } from 'react-hot-toast';

interface Props {
  profile: UserProfile | null;
  inventory: InventoryItem[];
  onUpdateProfile: (profile: UserProfile) => Promise<void>;
  onUpdatePassword?: (password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileView({ profile, inventory, onUpdateProfile, onUpdatePassword, onSignOut, onDeleteAccount, onExportData, onImportData }: Props) {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [name, setName] = useState(profile?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const mustBringItems = inventory.filter(item => item.isMaster);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const compressedFile = await compressImage(file, 400, 0.7);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await onUpdateProfile({
          ...profile,
          avatarUrl: base64String
        });
        toast.success(t('profile.imageUpdated', 'Profile picture updated'));
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error('Failed to update profile picture', err);
      toast.error(t('profile.imageUpdateFailed', 'Failed to update profile picture'));
    }
  };

  const handleDeleteImage = async () => {
    if (!profile) return;
    try {
      await onUpdateProfile({
        ...profile,
        avatarUrl: undefined
      });
      toast.success(t('profile.imageDeleted', 'Profile picture deleted'));
    } catch (err) {
      console.error('Failed to delete profile picture', err);
      toast.error(t('profile.imageDeleteFailed', 'Failed to delete profile picture'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !profile) return;

    try {
      await onUpdateProfile({
        ...profile,
        name: name.trim()
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLanguageChange = async (lang: 'en-GB' | 'zh-CN') => {
    // Always change language in i18next
    i18n.changeLanguage(lang);

    // Only update profile if it exists (user is logged in)
    if (profile) {
      try {
        await onUpdateProfile({
          ...profile,
          language: lang
        });
      } catch (err) {
        console.error('Failed to update language in profile', err);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t('profile.title')}</h2>
          <p className="text-stone-500 mt-1">{t('app.tagline')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 p-6 sm:p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border-4 border-white dark:border-stone-800 shadow-md overflow-hidden">
              {profile?.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-3xl font-bold">
                  {profile?.name ? getInitials(profile.name) : <User className="w-12 h-12" />}
                </span>
              )}
            </div>
            
            <div className="absolute -bottom-2 -right-2 flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsPhotoMenuOpen(!isPhotoMenuOpen)}
                  className="p-2 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl shadow-lg border border-stone-100 dark:border-stone-700 hover:scale-110 transition-transform"
                  title={t('profile.editPhoto', 'Edit Photo')}
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isPhotoMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsPhotoMenuOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-700 overflow-hidden z-20"
                      >
                        <button
                          onClick={() => {
                            fileInputRef.current?.click();
                            setIsPhotoMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          {t('profile.uploadPhoto', 'Upload Photo')}
                        </button>
                        {profile?.avatarUrl && (
                          <button
                            onClick={() => {
                              handleDeleteImage();
                              setIsPhotoMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t('profile.removePhoto', 'Remove Photo')}
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {isEditing ? (
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim() || !profile) return;

              try {
                if (newPassword) {
                  if (newPassword !== confirmPassword) {
                    toast.error(t('auth.passwordMismatch', 'Passwords do not match.'));
                    return;
                  }
                  if (onUpdatePassword) {
                    await onUpdatePassword(newPassword);
                  }
                }
                await onUpdateProfile({
                  ...profile,
                  name: name.trim()
                });
                setIsEditing(false);
                setNewPassword('');
                setConfirmPassword('');
              } catch (err) {
                console.error('Failed to update profile', err);
              }
            }} 
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">{t('inventory.yourName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-center text-lg text-stone-900 dark:text-stone-100"
                required
              />
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-700 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">{t('profile.changePassword', 'Change Local Password')}</h4>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-500 ml-1">{t('profile.newPassword', 'New Password')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-500 ml-1">{t('profile.confirmPassword', 'Confirm New Password')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(profile?.name || '');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 px-6 py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-medium rounded-xl transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                {t('common.save')}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white">{profile?.name}</h3>
              <p className="text-stone-500 dark:text-stone-400 mt-1">
                {t('profile.joined')} {new Date(profile?.joinedAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="pt-6 border-t border-stone-100 dark:border-stone-700 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-medium rounded-xl transition-colors"
              >
                {t('common.edit')}
              </button>
              <button
                onClick={() => setIsSignOutModalOpen(true)}
                className="px-6 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.signOut')}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={onSignOut}
        title={t('profile.signOutConfirmTitle')}
        message={t('profile.signOutConfirmMessage')}
      />

      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="p-2 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">{t('profile.darkMode')}</h3>
          </div>
          <div className="flex flex-nowrap bg-stone-100 dark:bg-stone-900 p-1 rounded-xl overflow-x-auto no-scrollbar w-40">
            <button
              onClick={() => setIsDarkMode(false)}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${!isDarkMode ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}
            >
              {t('common.light')}
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${isDarkMode ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}
            >
              {t('common.dark')}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="p-2 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">{t('profile.language')}</h3>
          </div>
          <div className="flex flex-nowrap bg-stone-100 dark:bg-stone-900 p-1 rounded-xl overflow-x-auto no-scrollbar w-40">
            <button
              onClick={() => handleLanguageChange('en-GB')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${i18n.language === 'en-GB' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('zh-CN')}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${i18n.language === 'zh-CN' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'}`}
            >
              中文
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPrivacy(true)}
            className="flex items-center gap-3 flex-1 text-left p-0"
          >
            <div className="p-2 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold dark:text-stone-100">{t('profile.privacy')}</h3>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('profile.dataSovereignty', 'Data Sovereignty')}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">{t('profile.localOnlyDesc', 'Your data never leaves this device.')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={onExportData}
            className="flex items-center justify-center gap-2 p-4 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl transition-all group"
          >
            <Download className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{t('profile.exportData', 'Export Backup')}</p>
              <p className="text-xs text-stone-500">{t('profile.exportDesc', 'Download JSON file')}</p>
            </div>
          </button>

          <label className="flex items-center justify-center gap-2 p-4 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl transition-all group cursor-pointer">
            <Upload className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{t('profile.importData', 'Import Backup')}</p>
              <p className="text-xs text-stone-500">{t('profile.importDesc', 'Restore from file')}</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl flex gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
            {t('profile.backupWarning', 'Since IsoPack is local-only, we recommend exporting a backup periodically. If you clear your browser data or lose this device, your data will be lost.')}
          </p>
        </div>
      </div>


      {profile && (
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('inventory.master')}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{t('app.tagline')}</p>
            </div>
          </div>

          <div className="space-y-2">
            {mustBringItems.length === 0 ? (
              <p className="text-center text-stone-500 dark:text-stone-400 py-4 text-sm bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-700 border-dashed">
                {t('inventory.noEssentials')}
              </p>
            ) : (
              mustBringItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 transition-colors">
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">{t(`item.${item.name}`, item.name)}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{t(`category.${item.category}`, item.category)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={() => setIsDeleteAccountModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium border border-red-100 dark:border-red-900/30"
        >
          <Trash2 className="w-5 h-5" />
          {t('profile.deleteAllData', 'Delete All Data')}
        </button>
      </div>

      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowPrivacy(false)} />
          <div className="relative bg-white dark:bg-stone-800 rounded-3xl shadow-xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white">{t('privacy.title')}</h3>
              <button onClick={() => setShowPrivacy(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors text-stone-500 dark:text-stone-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="prose prose-stone dark:prose-invert">
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                {t('privacy.content')}
              </p>
            </div>
            <button
              onClick={() => setShowPrivacy(false)}
              className="w-full mt-8 bg-stone-900 dark:bg-stone-700 text-white font-medium rounded-xl px-6 py-3 hover:bg-stone-800 dark:hover:bg-stone-600 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsDeleteAccountModalOpen(false)} />
          <div className="relative bg-white dark:bg-stone-800 rounded-3xl shadow-xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <Trash2 className="w-6 h-6" />
                <h3 className="text-2xl font-bold">{t('profile.deleteAccountConfirmTitle')}</h3>
              </div>
              <button onClick={() => setIsDeleteAccountModalOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors text-stone-500 dark:text-stone-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                {t('profile.deleteAccountConfirmMessage')}
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">
                  {t('profile.deleteAccountWarning')}
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t('profile.deleteAccountInputPlaceholder')}
                  className="w-full bg-white dark:bg-stone-900 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsDeleteAccountModalOpen(false)}
                className="flex-1 px-6 py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-medium rounded-xl transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                disabled={deleteConfirmText !== 'Delete Confirm'}
                onClick={() => {
                  onDeleteAccount();
                  setIsDeleteAccountModalOpen(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white font-medium rounded-xl px-6 py-3 transition-colors"
              >
                {t('profile.deleteAccountButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
