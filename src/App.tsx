import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ScanWaste } from './components/ScanWaste';
import { ScanHistory } from './components/ScanHistory';
import { DisposalMap } from './components/DisposalMap';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { AuthModal } from './components/AuthModal';
import { Chatbot } from './components/Chatbot';
import { AdminUser, UserProfile, WasteScanRecord } from './types';
import { Recycle, ShieldAlert } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [initialPreset, setInitialPreset] = useState<string | null>(null);
  const [initialMapCategory, setInitialMapCategory] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smartwaste-auth-user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Admin user state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smartwaste-admin-user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Verify whether active user has an authenticated admin role
  const isAdminAuthenticated = Boolean(
    adminUser || (currentUser && currentUser.role === 'admin')
  );

  const effectiveAdminUser: AdminUser | null = adminUser || (currentUser?.role === 'admin' ? {
    name: currentUser.name,
    email: currentUser.email,
    role: 'admin',
    accessLevel: 'full',
    token: localStorage.getItem('smartwaste-auth-token') || '',
  } : null);

  // Sync admin user profile when signed in as admin
  useEffect(() => {
    if (currentUser?.role === 'admin' && !adminUser) {
      const adminData: AdminUser = {
        name: currentUser.name,
        email: currentUser.email,
        role: 'admin',
        accessLevel: 'full',
        token: localStorage.getItem('smartwaste-auth-token') || '',
      };
      setAdminUser(adminData);
      localStorage.setItem('smartwaste-admin-user', JSON.stringify(adminData));
    }
  }, [currentUser, adminUser]);

  // Support direct route entry (/admin, /admin-dashboard, #admin)
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path === '/admin-dashboard' || hash === '#admin') {
        setActiveTab('admin');
      }
    };
    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  // Verify user token on initial load
  useEffect(() => {
    const token = localStorage.getItem('smartwaste-auth-token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('smartwaste-auth-user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('smartwaste-auth-token');
          localStorage.removeItem('smartwaste-auth-user');
          setCurrentUser(null);
        }
      })
      .catch(() => {
        // Offline or server not ready
      });
    }
  }, []);

  const handleOpenAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleUserLogout = () => {
    localStorage.removeItem('smartwaste-auth-token');
    localStorage.removeItem('smartwaste-auth-user');
    localStorage.removeItem('smartwaste-admin-user');
    setCurrentUser(null);
    setAdminUser(null);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  const handleScanClick = () => {
    setInitialPreset(null);
    setActiveTab('scan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSample = (sampleType: string) => {
    setInitialPreset(sampleType);
    setActiveTab('scan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreCategory = (category: 'plastic' | 'paper' | 'metal' | 'organic') => {
    setInitialPreset(category);
    setActiveTab('scan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanCompleted = (_record: WasteScanRecord) => {
    // Record is saved automatically to the database
  };

  const handleNavigateMap = (category?: string) => {
    setInitialMapCategory(category || null);
    setActiveTab('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('smartwaste-admin-user');
    setAdminUser(null);
    if (currentUser?.role === 'admin') {
      localStorage.removeItem('smartwaste-auth-token');
      localStorage.removeItem('smartwaste-auth-user');
      setCurrentUser(null);
    }
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Navbar with User & Map Controls */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminLoggedIn={isAdminAuthenticated}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onUserLogout={handleUserLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage
            onScanClick={handleScanClick}
            onExploreCategory={handleExploreCategory}
            onQuickSample={handleQuickSample}
          />
        )}

        {activeTab === 'scan' && (
          <ScanWaste
            onScanCompleted={handleScanCompleted}
            onNavigateHistory={() => setActiveTab('history')}
            initialPreset={initialPreset}
            currentUser={currentUser}
            onOpenAuthModal={() => handleOpenAuthModal('login')}
            onNavigateMap={handleNavigateMap}
          />
        )}

        {activeTab === 'history' && (
          <ScanHistory
            onScanNew={() => {
              setInitialPreset(null);
              setActiveTab('scan');
            }}
            currentUser={currentUser}
            onOpenAuthModal={() => handleOpenAuthModal('login')}
          />
        )}

        {activeTab === 'map' && (
          <DisposalMap
            initialCategory={initialMapCategory}
            onScanNew={handleScanClick}
          />
        )}

        {activeTab === 'admin' && (
          isAdminAuthenticated && effectiveAdminUser ? (
            <AdminDashboard
              user={effectiveAdminUser}
              onLogout={handleAdminLogout}
            />
          ) : showAdminLogin ? (
            <div className="max-w-md mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
              <AdminLogin 
                onLoginSuccess={(u) => {
                  setAdminUser(u);
                  setShowAdminLogin(false);
                }} 
              />
              <div className="text-center mt-3">
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="text-xs text-slate-500 hover:underline cursor-pointer"
                >
                  {t('adminGate.backToRestricted')}
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto my-16 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800 shadow-xs">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {t('adminGate.restricted')}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t('adminGate.title')}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('adminGate.description')}
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    {t('adminGate.goHome')}
                  </button>
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    {t('adminGate.signInAdmin')}
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Auth Modal for Sign In and Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Conversational AI Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
                  <Recycle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block">
                    Smart Waste Segregation
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                    AI-powered waste intelligence • Built by Team ASTELLA
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Empowering communities with real-time computer vision, contamination inspection, second-life reuse ideas, and verified smart disposal mapping.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                Classification Streams
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span>♻️</span>
                  <span>Plastic Polymers & Packaging</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>📄</span>
                  <span>Paper & Corrugated Cardboard</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>🔩</span>
                  <span>Metal (Aluminum, Steel & Tin)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>🍾</span>
                  <span>Glass Bottles & Food Jars</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>🔌</span>
                  <span>E-Waste & Small Electronics</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>🔋</span>
                  <span>Batteries & Lithium Packs</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Household Hazardous Waste</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-1.5 text-xs font-medium">
                <li>
                  <button onClick={() => setActiveTab('home')} className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition cursor-pointer">
                    {t('nav.home')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('scan')} className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition cursor-pointer">
                    {t('nav.scan')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('history')} className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition cursor-pointer">
                    {t('nav.history')}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigateMap()} className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition cursor-pointer">
                    {t('nav.map')}
                  </button>
                </li>
                {isAdminAuthenticated && (
                  <li>
                    <button onClick={() => setActiveTab('admin')} className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition cursor-pointer">
                      {t('nav.admin')}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
            <p>
              © 2026 Smart Waste Segregation • AI-powered waste intelligence • Built by Team ASTELLA
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Stream Vision Active • Gemini 3.1 Flash Lite</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
