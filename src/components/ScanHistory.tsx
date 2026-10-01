import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Table as TableIcon,
  RefreshCw,
  FileText,
  Sparkles,
  X,
  ExternalLink,
  CheckCircle2,
  User,
  Users,
  Leaf,
  Award,
  TreeDeciduous,
  ShieldCheck
} from 'lucide-react';
import { WasteScanRecord, UserProfile, UserRecyclingStats } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ScanHistoryProps {
  onScanNew: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({ 
  onScanNew,
  currentUser,
  onOpenAuthModal
}) => {
  const { t, isRTL, translateCategory } = useLanguage();
  const [scans, setScans] = useState<WasteScanRecord[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Scope: 'mine' (personal user scans) vs 'all' (all community/facility scans)
  const [scopeFilter, setScopeFilter] = useState<'mine' | 'all'>(currentUser ? 'mine' : 'all');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<WasteScanRecord | null>(null);

  // Personal user recycling stats
  const [userStats, setUserStats] = useState<UserRecyclingStats | null>(null);

  // Sync scope filter if user logs in/out
  useEffect(() => {
    if (currentUser) {
      setScopeFilter('mine');
      fetchUserStats();
    } else {
      setScopeFilter('all');
      setUserStats(null);
    }
  }, [currentUser]);

  const fetchUserStats = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/user/stats?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  // Fetch scans from server
  const fetchScans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      // Filter by personal user if scope is 'mine'
      if (scopeFilter === 'mine' && currentUser) {
        params.append('userId', currentUser.id);
      }

      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/scans?${params.toString()}`);
      const data = await res.json();
      setScans(data.items || []);
      setTotalScans(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching scan history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [currentPage, categoryFilter, scopeFilter, startDate, endDate, pageSize]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchScans();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const deleteScan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this scan record?')) return;
    try {
      const res = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScans(scans.filter(s => s.id !== id));
        setTotalScans(prev => Math.max(0, prev - 1));
        if (currentUser) fetchUserStats();
      }
    } catch (err) {
      console.error('Error deleting scan:', err);
    }
  };

  const exportCSV = () => {
    if (scans.length === 0) return;
    const headers = ['ID', 'User', 'Date', 'Time', 'Item Name', 'Category', 'Confidence %', 'Recommendation'];
    const rows = scans.map(s => {
      const d = new Date(s.created_at);
      return [
        s.id,
        s.user_name || 'Anonymous',
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        `"${(s.item_name || '').replace(/"/g, '""')}"`,
        s.category?.toUpperCase() || 'UNKNOWN',
        Math.round((s.confidence || 0) * 100),
        `"${(s.recommendation || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_waste_scans_${scopeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryBadges: Record<string, { badge: string; icon: string }> = {
    plastic: { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: '♻️' },
    paper: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: '📄' },
    metal: { badge: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700', icon: '🔩' },
    organic: { badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', icon: '🍃' },
    glass: { badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', icon: '🍾' },
    e_waste: { badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: '🔌' },
    textile: { badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-300 border-pink-200 dark:border-pink-800', icon: '👕' },
    battery: { badge: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-300', icon: '🔋' },
    hazardous: { badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border-rose-200 dark:border-rose-800', icon: '⚠️' },
    other: { badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200', icon: '📦' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('history.title')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              {totalScans.toLocaleString()} {scopeFilter === 'mine' ? t('history.myScansTab', { count: totalScans }) : t('history.communityScansTab', { count: totalScans })}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('history.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onScanNew}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('history.scanFirst')}</span>
          </button>
        </div>
      </div>

      {/* Personal User Stats Card (if logged in) */}
      {currentUser && userStats && (
        <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-600/15 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg">{currentUser.name}’s Recycling Profile</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 text-white">
                    <Award className="w-3 h-3 text-amber-300" />
                    <span>{userStats.badge}</span>
                  </span>
                </div>
                <p className="text-xs text-emerald-100">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-emerald-200">Your Total Scans</span>
                <p className="text-2xl font-black">{userStats.totalScans}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-emerald-200">Estimated CO₂ Saved</span>
                <p className="text-2xl font-black">{userStats.co2SavedKg} kg</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/20 text-center text-xs">
            <div className="bg-white/10 rounded-xl p-2">
              <span className="font-bold">{userStats.categoryCounts.plastic}</span>
              <p className="text-[10px] text-emerald-100">Plastic ♻️</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <span className="font-bold">{userStats.categoryCounts.paper}</span>
              <p className="text-[10px] text-emerald-100">Paper 📄</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <span className="font-bold">{userStats.categoryCounts.metal}</span>
              <p className="text-[10px] text-emerald-100">Metal 🔩</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <span className="font-bold">{userStats.categoryCounts.organic}</span>
              <p className="text-[10px] text-emerald-100">Organic 🍃</p>
            </div>
          </div>
        </div>
      )}

      {/* Guest Sign-in prompt banner if not logged in */}
      {!currentUser && onOpenAuthModal && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <User className="w-4 h-4" />
            </div>
            <p className="text-amber-900 dark:text-amber-200">
              You are currently viewing all community facility scans. <strong>Sign in or create an account</strong> to view and maintain your personal scan history!
            </p>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 transition cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Scope Selector: My Scans vs All Scans */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                if (!currentUser && onOpenAuthModal) {
                  onOpenAuthModal();
                  return;
                }
                setScopeFilter('mine');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                scopeFilter === 'mine'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Scans {currentUser ? `(${currentUser.name})` : ''}</span>
            </button>

            <button
              onClick={() => {
                setScopeFilter('all');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                scopeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Community Scans</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-5 relative">
            <Search className={`w-4 h-4 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
            <input
              type="text"
              placeholder={t('history.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="lg:col-span-7 flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: t('history.filterAll') },
              { id: 'plastic', label: translateCategory('plastic') },
              { id: 'paper', label: translateCategory('paper') },
              { id: 'metal', label: translateCategory('metal') },
              { id: 'organic', label: translateCategory('organic') },
              { id: 'glass', label: translateCategory('glass') },
              { id: 'e_waste', label: translateCategory('e_waste') },
              { id: 'textile', label: translateCategory('textile') },
              { id: 'battery', label: translateCategory('battery') },
              { id: 'hazardous', label: translateCategory('hazardous') },
              { id: 'other', label: translateCategory('other') }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Loading scan history...
          </p>
        </div>
      ) : scans.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {scopeFilter === 'mine' ? 'No Scans Under Your Account Yet' : 'No Scans Found'}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {scopeFilter === 'mine'
                ? 'You haven’t performed any scans yet while logged in. Scan an item now to record it in your personal dashboard!'
                : 'No waste scans matched your search criteria. Try clearing the filter or scan a new item now.'}
            </p>
          </div>
          <button
            onClick={onScanNew}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
          >
            Scan Your First Item
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Layout */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {scans.map((scan) => {
            const cat = categoryBadges[scan.category || 'plastic'] || categoryBadges.plastic;
            const scanDate = new Date(scan.created_at);
            const confPct = Math.round((scan.confidence || 0) * 100);
            const isUserOwner = currentUser && scan.user_id === currentUser.id;

            return (
              <div
                key={scan.id}
                onClick={() => setSelectedScan(scan)}
                className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Thumbnail */}
                  <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={scan.image_url}
                      alt={scan.item_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border backdrop-blur-md ${cat.badge}`}>
                        <span>{cat.icon}</span>
                        <span>{scan.category}</span>
                      </span>
                    </div>

                    {/* Attribution pill */}
                    {isUserOwner ? (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        You
                      </div>
                    ) : scan.user_name ? (
                      <div className="absolute top-2 right-2 bg-slate-900/80 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                        {scan.user_name}
                      </div>
                    ) : null}

                    <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                      {confPct}% conf
                    </div>
                  </div>

                  {/* Item info */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                      {scan.item_name || 'Classified Waste Item'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {scanDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {scanDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Recommendation snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {scan.recommendation}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                  <button
                    onClick={(e) => deleteScan(scan.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout */
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Account</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Recommendation</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scans.map((scan) => {
                  const cat = categoryBadges[scan.category || 'plastic'] || categoryBadges.plastic;
                  const scanDate = new Date(scan.created_at);
                  const confPct = Math.round((scan.confidence || 0) * 100);
                  const isUserOwner = currentUser && scan.user_id === currentUser.id;

                  return (
                    <tr
                      key={scan.id}
                      onClick={() => setSelectedScan(scan)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={scan.image_url}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {scan.item_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isUserOwner ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            You
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {scan.user_name || 'Guest'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${cat.badge}`}>
                          <span>{cat.icon}</span>
                          <span>{scan.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${confPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            {confPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-xs text-slate-600 dark:text-slate-400">
                        {scan.recommendation}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {scanDate.toLocaleDateString()} {scanDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => deleteScan(scan.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-slate-500">
            Showing Page <span className="font-bold text-slate-700 dark:text-slate-300">{currentPage}</span> of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scan Details #{selectedScan.id}
              </span>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-16/10 rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={selectedScan.image_url}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedScan.item_name}
                  </h3>
                  {selectedScan.user_name && (
                    <p className="text-xs text-slate-400">
                      Logged by {selectedScan.user_name}
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {Math.round((selectedScan.confidence || 0) * 100)}% Confidence
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-bold text-emerald-900 dark:text-emerald-200">Disposal Recommendation:</p>
                <p>{selectedScan.recommendation}</p>
              </div>

              {selectedScan.reason && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">AI Material Rationale:</p>
                  <p className="mt-0.5">{selectedScan.reason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
