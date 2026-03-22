import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryItem, Trip, UserProfile, CustomList } from './types';
import InventoryView from './components/InventoryView';
import TripListView from './components/TripListView';
import TripDetailView from './components/TripDetailView';
import ProfileView from './components/ProfileView';
import LandingView from './components/LandingView';
import { Luggage, Box, Plane, User, Globe, Home } from 'lucide-react';
import { motion, PanInfo } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { SUGGESTED_ITEMS } from './data/constants';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'landing' | 'trips' | 'inventory' | 'profile'>('landing');
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [allEssentials, setAllEssentials] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('packwise_essentials_v2');
    return saved ? JSON.parse(saved) : (SUGGESTED_ITEMS['All Essentials'] || []);
  });

  const trips = useLiveQuery(() => db.trips.toArray()) || [];
  const inventory = useLiveQuery(() => db.inventory.toArray()) || [];
  // Need to add customLists to db.ts
  // const customLists = useLiveQuery(() => db.customLists.toArray()) || [];
  // For now, let's keep customLists in localStorage or add it to db.ts
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    localStorage.setItem('packwise_essentials_v2', JSON.stringify(allEssentials));
  }, [allEssentials]);

  useEffect(() => {
    const initProfile = async () => {
      const savedProfile = localStorage.getItem('packwise_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setProfile(profile);
        if (profile.language) {
          i18n.changeLanguage(profile.language);
        }
      } else {
        const defaultProfile: UserProfile = {
          uid: 'local',
          name: t('auth.traveler'),
          joinedAt: Date.now(),
          language: i18n.language as 'en-GB' | 'zh-CN'
        };
        localStorage.setItem('packwise_profile', JSON.stringify(defaultProfile));
        setProfile(defaultProfile);
      }
    };
    initProfile();

    const savedLists = localStorage.getItem('packwise_lists');
    if (savedLists) setCustomLists(JSON.parse(savedLists));
  }, []);

  const tabs: ('landing' | 'trips' | 'inventory' | 'profile')[] = ['landing', 'trips', 'inventory', 'profile'];

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocityThreshold = 0.5;

    if (Math.abs(info.offset.x) < threshold && Math.abs(info.velocity.x) < velocityThreshold) return;

    if (info.offset.x > threshold) {
      if (activeTripId) {
        setActiveTripId(null);
      } else {
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1]);
        }
      }
    } else if (info.offset.x < -threshold) {
      if (!activeTripId) {
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1]);
        }
      }
    }
  };

  const addTrip = async (trip: Trip) => {
    await db.trips.add(trip);
  };

  const deleteTrip = async (id: string) => {
    await db.trips.delete(id);
  };

  const deleteAccount = async () => {
    await db.delete();
    localStorage.clear();
    window.location.reload();
  };

  const signOut = async () => {
    // For offline-first, sign out is just clearing local session if any
    localStorage.removeItem('packwise_profile');
    window.location.reload();
  };

  const updateTrip = async (updatedTrip: Trip) => {
    await db.trips.put(updatedTrip);
  };

  const addItem = async (item: InventoryItem) => {
    await db.inventory.add(item);
  };

  const deleteItem = async (id: string) => {
    await db.inventory.delete(id);
  };

  const updateItem = async (item: InventoryItem) => {
    await db.inventory.put(item);
  };

  const addList = async (list: CustomList) => {
    const newLists = [...customLists, list];
    setCustomLists(newLists);
    localStorage.setItem('packwise_lists', JSON.stringify(newLists));
  };

  const deleteList = async (id: string) => {
    const newLists = customLists.filter(l => l.id !== id);
    setCustomLists(newLists);
    localStorage.setItem('packwise_lists', JSON.stringify(newLists));
  };

  const updateList = async (list: CustomList) => {
    const newLists = customLists.map(l => l.id === list.id ? list : l);
    setCustomLists(newLists);
    localStorage.setItem('packwise_lists', JSON.stringify(newLists));
  };

  const updateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('packwise_profile', JSON.stringify(updatedProfile));
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-sans selection:bg-emerald-200 flex flex-col sm:flex-row">
      <Toaster position="top-center" />

      <aside className="hidden sm:flex flex-col w-20 lg:w-64 shrink-0 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 sticky top-0 h-screen transition-all duration-300">
        <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start gap-3 cursor-pointer" onClick={() => { setActiveTab('landing'); setActiveTripId(null); }}>
          <div className="bg-emerald-500 text-white p-2.5 rounded-xl shrink-0">
            <Luggage className="w-6 h-6" />
          </div>
          <h1 className="hidden lg:block text-2xl font-bold tracking-tight text-stone-900 dark:text-white">{t('app.name')}</h1>
        </div>
        
        <nav className="flex-1 px-3 lg:px-4 space-y-2 mt-4">
          <button
            onClick={() => { setActiveTab('landing'); setActiveTripId(null); }}
            className={`w-full p-3 lg:px-4 lg:py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center lg:justify-start gap-3 ${
              activeTab === 'landing' && !activeTripId
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800/50'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">{t('nav.home', 'Home')}</span>
          </button>
          <button
            onClick={() => { setActiveTab('trips'); setActiveTripId(null); }}
            className={`w-full p-3 lg:px-4 lg:py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center lg:justify-start gap-3 ${
              activeTab === 'trips' && !activeTripId
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800/50'
            }`}
          >
            <Plane className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">{t('nav.trips')}</span>
          </button>
          <button
            onClick={() => { setActiveTab('inventory'); setActiveTripId(null); }}
            className={`w-full p-3 lg:px-4 lg:py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center lg:justify-start gap-3 ${
              activeTab === 'inventory' 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800/50'
            }`}
          >
            <Box className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">{t('nav.inventory')}</span>
          </button>
          <button
            onClick={() => { setActiveTab('profile'); setActiveTripId(null); }}
            className={`w-full p-3 lg:px-4 lg:py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center lg:justify-start gap-3 ${
              activeTab === 'profile' 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800/50'
            }`}
          >
            <User className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">{t('nav.profile')}</span>
          </button>
        </nav>
        
        {profile && (
          <div className="p-3 lg:p-4 border-t border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-center lg:justify-start gap-3 lg:px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-stone-900 dark:text-white truncate">{profile.name}</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden pb-24 sm:pb-8">
        <div className="max-w-4xl mx-auto h-full">
          <motion.div
            key={activeTripId || activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onPanEnd={handleSwipe}
            className="h-full"
          >
            {activeTripId ? (
              <TripDetailView 
                trip={trips.find(t => t.id === activeTripId)!} 
                inventory={inventory}
                profile={profile}
                isGuest={false}
                customLists={customLists}
                allEssentials={allEssentials}
                updateTrip={updateTrip}
                onDeleteTrip={deleteTrip}
                onBack={() => setActiveTripId(null)}
                onAddItem={addItem}
              />
            ) : activeTab === 'landing' ? (
              <LandingView 
                profile={profile}
                trips={trips}
                onNavigate={setActiveTab}
              />
            ) : activeTab === 'trips' ? (
              <TripListView 
                trips={trips} 
                inventory={inventory} 
                profile={profile} 
                isGuest={false} 
                customLists={customLists} 
                allEssentials={allEssentials} 
                onAddTrip={addTrip} 
                onDeleteTrip={deleteTrip} 
                onSelectTrip={setActiveTripId} 
              />
            ) : activeTab === 'inventory' ? (
              <InventoryView 
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
                profile={profile} 
                isGuest={false} 
                inventory={inventory} 
                onUpdateProfile={async (p) => updateProfile(p)} 
                onSignOut={signOut} 
                onDeleteAccount={deleteAccount} 
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
