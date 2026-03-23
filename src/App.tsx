import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryItem, Trip, UserProfile, CustomList, UserAccount } from './types';
import InventoryView from './components/InventoryView';
import TripListView from './components/TripListView';
import TripDetailView from './components/TripDetailView';
import ProfileView from './components/ProfileView';
import LandingView from './components/LandingView';
import OnboardingView from './components/OnboardingView';
import AuthView from './components/AuthView';
import { Luggage, Box, Plane, User, Globe, Home, ShieldCheck, Info } from 'lucide-react';
import { motion, PanInfo, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import { SUGGESTED_ITEMS } from './data/constants';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'landing' | 'trips' | 'inventory' | 'profile'>('landing');
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(localStorage.getItem('isopack_active_user'));
  const [isGuest, setIsGuest] = useState<boolean>(localStorage.getItem('isopack_is_guest') === 'true');

  const [allEssentials, setAllEssentials] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('packwise_essentials_v2');
    return saved ? JSON.parse(saved) : (SUGGESTED_ITEMS['All Essentials'] || []);
  });

  const trips = useLiveQuery(() => 
    activeUserId ? db.trips.where('ownerId').equals(activeUserId).toArray() : Promise.resolve([])
  , [activeUserId]) || [];

  const inventory = useLiveQuery(() => 
    activeUserId ? db.inventory.where('ownerId').equals(activeUserId).toArray() : Promise.resolve([])
  , [activeUserId]) || [];

  const customLists = useLiveQuery(() => 
    activeUserId ? db.customLists.where('ownerId').equals(activeUserId).toArray() : Promise.resolve([])
  , [activeUserId]) || [];

  const profile = useLiveQuery(() => 
    activeUserId ? db.profiles.where('ownerId').equals(activeUserId).first() : Promise.resolve(null)
  , [activeUserId]) || null;

  useEffect(() => {
    localStorage.setItem('packwise_essentials_v2', JSON.stringify(allEssentials));
  }, [allEssentials]);

  useEffect(() => {
    const init = async () => {
      if (profile?.language) {
        i18n.changeLanguage(profile.language);
      }
      setIsInitializing(false);
    };
    init();
  }, [profile]);

  const migrateGuestData = async (newUserId: string) => {
    try {
      const guestTrips = await db.trips.where('ownerId').equals('guest').toArray();
      const guestInventory = await db.inventory.where('ownerId').equals('guest').toArray();
      const guestLists = await db.customLists.where('ownerId').equals('guest').toArray();

      await Promise.all([
        ...guestTrips.map(t => db.trips.update(t.id, { ownerId: newUserId })),
        ...guestInventory.map(i => db.inventory.update(i.id, { ownerId: newUserId })),
        ...guestLists.map(l => db.customLists.update(l.id, { ownerId: newUserId }))
      ]);

      toast.success(t('auth.migrationSuccess', 'Your guest data has been linked to your new account!'));
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  const handleAuthSuccess = async (account: UserAccount, profile: UserProfile) => {
    if (isGuest) {
      await migrateGuestData(account.id);
    }
    setActiveUserId(account.id);
    setIsGuest(false);
    localStorage.setItem('isopack_active_user', account.id);
    localStorage.setItem('isopack_is_guest', 'false');
  };

  const handleGuestMode = () => {
    setActiveUserId('guest');
    setIsGuest(true);
    localStorage.setItem('isopack_active_user', 'guest');
    localStorage.setItem('isopack_is_guest', 'true');
  };

  const signOut = async () => {
    if (isGuest) {
      // Purge guest data
      await Promise.all([
        db.trips.where('ownerId').equals('guest').delete(),
        db.inventory.where('ownerId').equals('guest').delete(),
        db.customLists.where('ownerId').equals('guest').delete()
      ]);
      toast.success(t('auth.guestPurged', 'Guest data purged.'));
    }
    setActiveUserId(null);
    setIsGuest(false);
    localStorage.removeItem('isopack_active_user');
    localStorage.removeItem('isopack_is_guest');
  };

  const addTrip = async (trip: Trip) => {
    if (!activeUserId) return;
    await db.trips.add({ ...trip, ownerId: activeUserId });
  };

  const deleteTrip = async (id: string) => {
    await db.trips.delete(id);
  };

  const deleteAccount = async () => {
    if (!activeUserId) return;
    await Promise.all([
      db.trips.where('ownerId').equals(activeUserId).delete(),
      db.inventory.where('ownerId').equals(activeUserId).delete(),
      db.customLists.where('ownerId').equals(activeUserId).delete(),
      db.profiles.where('ownerId').equals(activeUserId).delete(),
      db.users.delete(activeUserId)
    ]);
    signOut();
  };

  const updateTrip = async (updatedTrip: Trip) => {
    await db.trips.put(updatedTrip);
  };

  const addItem = async (item: InventoryItem) => {
    if (!activeUserId) return;
    await db.inventory.add({ ...item, ownerId: activeUserId });
  };

  const deleteItem = async (id: string) => {
    await db.inventory.delete(id);
  };

  const updateItem = async (item: InventoryItem) => {
    await db.inventory.put(item);
  };

  const addList = async (list: CustomList) => {
    if (!activeUserId) return;
    await db.customLists.add({ ...list, ownerId: activeUserId });
  };

  const deleteList = async (id: string) => {
    await db.customLists.delete(id);
  };

  const updateList = async (list: CustomList) => {
    await db.customLists.put(list);
  };

  const updateProfile = async (updatedProfile: UserProfile) => {
    if (!activeUserId) return;
    await db.profiles.put({ ...updatedProfile, ownerId: activeUserId });
  };

  const tabs: ('landing' | 'trips' | 'inventory' | 'profile')[] = ['landing', 'trips', 'inventory', 'profile'];

  const handleExportData = async () => {
    if (!activeUserId) return;
    try {
      const data = {
        version: 1,
        timestamp: Date.now(),
        userId: activeUserId,
        trips,
        inventory,
        customLists,
        profile
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `isopack-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('profile.exportSuccess', 'Backup exported successfully!'));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('profile.exportFailed', 'Failed to export backup.'));
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUserId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (!data.trips || !data.inventory || !data.customLists) {
          throw new Error('Invalid backup file format');
        }

        await Promise.all([
          ...data.trips.map((t: Trip) => db.trips.put({ ...t, ownerId: activeUserId })),
          ...data.inventory.map((i: InventoryItem) => db.inventory.put({ ...i, ownerId: activeUserId })),
          ...data.customLists.map((l: CustomList) => db.customLists.put({ ...l, ownerId: activeUserId }))
        ]);

        if (data.profile) {
          await db.profiles.put({ ...data.profile, ownerId: activeUserId });
        }

        toast.success(t('profile.importSuccess', 'Data imported successfully!'));
      } catch (error) {
        console.error('Import failed:', error);
        toast.error(t('profile.importFailed', 'Failed to import data. Check file format.'));
      }
    };
    reader.readAsText(file);
  };

  if (isInitializing) {
    return null;
  }

  if (!activeUserId) {
    return (
      <>
        <Toaster position="top-center" />
        <AuthView onAuthSuccess={handleAuthSuccess} onGuestMode={handleGuestMode} />
      </>
    );
  }

  if (!profile && !isGuest) {
    return (
      <OnboardingView 
        onComplete={(name) => {
          const newProfile: UserProfile = {
            uid: activeUserId,
            name,
            joinedAt: Date.now(),
            ownerId: activeUserId
          };
          updateProfile(newProfile);
        }} 
      />
    );
  }

  const guestProfile: UserProfile = {
    uid: 'guest',
    name: t('auth.guest', 'Guest'),
    joinedAt: Date.now(),
    ownerId: 'guest'
  };

  const currentProfile = profile || guestProfile;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-sans selection:bg-emerald-200 flex flex-col sm:flex-row">
      <Toaster position="top-center" />

      <aside className="hidden sm:flex flex-col w-20 lg:w-64 shrink-0 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 sticky top-0 h-screen transition-all duration-300 z-50">
        <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start gap-3 cursor-pointer" onClick={() => { setActiveTab('landing'); setActiveTripId(null); }}>
          <div className="bg-emerald-500 text-white p-2.5 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20">
            <Luggage className="w-6 h-6" />
          </div>
          <h1 className="hidden lg:block text-2xl font-black tracking-tighter text-stone-900 dark:text-white uppercase italic">IsoPack</h1>
        </div>

        {/* Local Sovereignty Indicator */}
        <div className="px-4 mb-6 hidden lg:block">
          <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-700 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Local Protocol</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-stone-500">Device Encrypted</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-3 lg:px-4 space-y-2 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setActiveTripId(null); }}
              className={`w-full p-3 lg:px-4 lg:py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center lg:justify-start gap-3 ${
                activeTab === tab && !activeTripId
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800/50'
              }`}
            >
              {tab === 'landing' && <Home className="w-5 h-5 shrink-0" />}
              {tab === 'trips' && <Plane className="w-5 h-5 shrink-0" />}
              {tab === 'inventory' && <Box className="w-5 h-5 shrink-0" />}
              {tab === 'profile' && <User className="w-5 h-5 shrink-0" />}
              <span className="hidden lg:block capitalize">{t(`nav.${tab}`)}</span>
            </button>
          ))}
        </nav>
        
        {currentProfile && (
          <div className="p-3 lg:p-4 border-t border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-center lg:justify-start gap-3 lg:px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center shrink-0 overflow-hidden border-2 border-stone-200 dark:border-stone-600">
                {currentProfile.avatarUrl ? (
                  <img src={currentProfile.avatarUrl} alt={currentProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5 text-stone-400" />
                )}
              </div>
              <div className="hidden lg:flex flex-col overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-1">
                  {isGuest ? 'Guest Session' : 'Local User'}
                </p>
                <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{currentProfile.name}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden pb-24 sm:pb-8">
        <div className="max-w-4xl mx-auto h-full">
          {isGuest && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-2xl flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-900 dark:text-amber-100 font-bold">
                    {t('auth.guestWarningShort', 'Ephemeral Session')}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t('auth.guestWarningDesc', 'Data will be purged on exit. Create an account to save progress.')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveUserId(null)}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors shrink-0"
              >
                {t('auth.saveProgress', 'Save Progress')}
              </button>
            </div>
          )}

          <motion.div
            key={activeTripId || activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTripId && trips.find(t => t.id === activeTripId) ? (
              <TripDetailView 
                activeUserId={activeUserId}
                trip={trips.find(t => t.id === activeTripId)!} 
                inventory={inventory}
                profile={currentProfile}
                customLists={customLists}
                allEssentials={allEssentials}
                updateTrip={updateTrip}
                onDeleteTrip={deleteTrip}
                onBack={() => setActiveTripId(null)}
                onAddItem={addItem}
              />
            ) : activeTab === 'landing' ? (
              <LandingView 
                profile={currentProfile}
                trips={trips}
                onNavigate={setActiveTab}
              />
            ) : activeTab === 'trips' ? (
              <TripListView 
                activeUserId={activeUserId}
                trips={trips} 
                inventory={inventory} 
                profile={currentProfile} 
                customLists={customLists} 
                allEssentials={allEssentials} 
                onAddTrip={addTrip} 
                onDeleteTrip={deleteTrip} 
                onSelectTrip={setActiveTripId} 
              />
            ) : activeTab === 'inventory' ? (
              <InventoryView 
                activeUserId={activeUserId}
                inventory={inventory} 
                customLists={customLists} 
                allEssentials={allEssentials} 
                setAllEssentials={setAllEssentials} 
                onAddItem={addItem} 
                onDeleteItem={deleteItem} 
                onUpdateItem={updateItem} 
                onAddList={addList} 
                onDeleteList={deleteList} 
                onUpdateList={updateList} 
              />
            ) : (
              <ProfileView 
                profile={currentProfile} 
                inventory={inventory} 
                onUpdateProfile={async (p) => updateProfile(p)} 
                onSignOut={signOut} 
                onDeleteAccount={deleteAccount} 
                onExportData={handleExportData}
                onImportData={handleImportData}
              />
            )}
          </motion.div>
        </div>
      </main>

      {/* Portrait Lock Overlay for Mobile */}
      <div className="hidden max-sm:landscape:flex fixed inset-0 z-[100] bg-stone-900 text-white flex-col items-center justify-center p-8 text-center">
        <div className="bg-emerald-500 p-4 rounded-2xl mb-6 animate-bounce">
          <Luggage className="w-12 h-12 rotate-90" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('app.portraitOnly', 'Portrait Mode Only')}</h2>
        <p className="text-stone-400">
          {t('app.rotateDevice', 'Please rotate your device to portrait mode for the best experience.')}
        </p>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 px-6 py-3 flex items-center justify-between z-50">
        <button
          onClick={() => { setActiveTab('landing'); setActiveTripId(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'landing' && !activeTripId ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.home', 'Home')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('trips'); setActiveTripId(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'trips' && !activeTripId ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}
        >
          <Plane className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.trips')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('inventory'); setActiveTripId(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'inventory' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}
        >
          <Box className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.inventory')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('profile'); setActiveTripId(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.profile')}</span>
        </button>
      </nav>
    </div>
  );
}
