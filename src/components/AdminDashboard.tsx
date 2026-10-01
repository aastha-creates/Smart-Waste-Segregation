import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Sparkles, 
  RotateCcw, 
  LogOut, 
  Calendar, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Leaf, 
  Recycle, 
  TreeDeciduous, 
  Zap, 
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Printer
} from 'lucide-react';
import { AdminUser, DashboardStats, WasteScanRecord } from '../types';
import { WasteReportModal } from './WasteReportModal';
import { useLanguage } from '../i18n/LanguageContext';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRangeDays, setTimeRangeDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Recent scans table state
  const [recentScans, setRecentScans] = useState<WasteScanRecord[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [tableCategory, setTableCategory] = useState('all');
  const [tablePage, setTablePage] = useState(1);
  const [tableTotalPages, setTableTotalPages] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scans/stats?days=${timeRangeDays}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentScans = async () => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: tablePage.toString(),
        limit: '8',
      });
      if (tableCategory !== 'all') params.append('category', tableCategory);
      if (tableSearch.trim()) params.append('search', tableSearch.trim());

      const res = await fetch(`/api/scans?${params.toString()}`);
      const data = await res.json();
      setRecentScans(data.items || []);
      setTableTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching recent table scans:', err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRangeDays]);

  useEffect(() => {
    fetchRecentScans();
  }, [tablePage, tableCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTablePage(1);
      fetchRecentScans();
    }, 300);
    return () => clearTimeout(timer);
  }, [tableSearch]);

  const handleResetDemoData = async () => {
    if (!confirm('Reset all scans back to the initial 700+ realistic demo records?')) return;
    try {
      const res = await fetch('/api/scans/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotification('Database successfully reset to demo records!');
        setTimeout(() => setNotification(null), 3000);
        fetchStats();
        fetchRecentScans();
      }
    } catch (err) {
      console.error('Error resetting demo data:', err);
    }
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

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Loading facility analytics...</p>
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalScans: 0,
    plastic: 0,
    paper: 0,
    metal: 0,
    organic: 0,
    glass: 0,
    e_waste: 0,
    textile: 0,
    battery: 0,
    hazardous: 0,
    other: 0,
    mostFrequentCategory: 'Plastic',
    avgConfidence: 94,
    co2SavedKg: 1200,
    aiQuality: { totalFeedback: 0, confirmed: 0, corrected: 0, correctionRate: 0, mostCorrectedCategory: 'Paper' },
    contamination: { totalChecked: 0, contaminatedCount: 0, cleanCount: 0, contaminationRate: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Banner / Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('admin.dashboardTitle')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Logged in as <strong className="text-slate-700 dark:text-slate-200">{user.name}</strong> ({user.role})
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRangeDays(days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeRangeDays === days
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Last {days} Days
              </button>
            ))}
          </div>

          {/* FEATURE 9: Generate Waste Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('admin.downloadReport')}</span>
          </button>

          <button
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Reset to synthetic records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('admin.logout')}</span>
          </button>
        </div>
      </div>

      {/* Main KPIs Row (Organized intelligently without overcrowding) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Detected */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Waste Scans
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {kpis.totalScans.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Facility verified</span>
          </div>
        </div>

        {/* Most Frequent Category */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
            Dominant Stream
          </span>
          <p className="text-2xl font-black truncate">
            {kpis.mostFrequentCategory}
          </p>
          <p className="text-[11px] text-emerald-100 font-semibold">
            Avg Conf: {kpis.avgConfidence}%
          </p>
        </div>

        {/* Average Confidence */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Avg Confidence
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {kpis.avgConfidence}%
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            High accuracy tier
          </p>
        </div>

        {/* FEATURE 5 & 8: AI Correction Rate */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            AI Correction Rate
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {kpis.aiQuality?.correctionRate || 0}%
          </p>
          <p className="text-[11px] text-slate-500 font-semibold truncate">
            {kpis.aiQuality?.confirmed || 0} confirmed by users
          </p>
        </div>

        {/* FEATURE 3: Possible Contamination Rate */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contamination Rate
          </span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {kpis.contamination?.contaminationRate || 0}%
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">
            {kpis.contamination?.contaminatedCount || 0} flagged items
          </p>
        </div>

        {/* Carbon Offset */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            CO₂ Offset Saved
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {kpis.co2SavedKg.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            kg equivalent
          </p>
        </div>
      </div>

      {/* FEATURE 5 & 8: AI CLASSIFICATION QUALITY & CONTAMINATION SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* AI Quality Panel */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                AI Classification Quality Metrics
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Feedback Dataset</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Predictions</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {kpis.aiQuality?.totalFeedback || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Confirmed</span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {kpis.aiQuality?.confirmed || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Corrected</span>
              <p className="text-xl font-black text-slate-700 dark:text-slate-300 mt-0.5">
                {kpis.aiQuality?.corrected || 0}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Correction Rate: <strong>{kpis.aiQuality?.correctionRate || 0}%</strong></span>
            <span>Most Corrected: <strong>{kpis.aiQuality?.mostCorrectedCategory || 'None'}</strong></span>
          </div>
        </div>

        {/* Contamination Panel */}
        <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Contamination Visual Inspection
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Stream Purity</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Evaluated</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {kpis.contamination?.totalChecked || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Clean Items</span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {kpis.contamination?.cleanCount || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60">
              <span className="text-[10px] uppercase font-bold text-amber-600">Flagged</span>
              <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
                {kpis.contamination?.contaminatedCount || 0}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Visual Contamination Rate: <strong>{kpis.contamination?.contaminationRate || 0}%</strong></span>
            <span>Pre-Rinse Compliance: <strong>{(100 - (kpis.contamination?.contaminationRate || 0)).toFixed(1)}%</strong></span>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="space-y-8">
        
        {/* Row 1: Donut (Category Distribution) + Daily Detection Area Chart */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Chart 1: Category Distribution */}
          <div className="lg:col-span-5 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Chart 1 — Category Distribution
                </h3>
                <span className="text-xs font-bold text-slate-400">All Scans</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Proportion of waste materials segregated across streams.
              </p>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats?.categoryDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      color: '#fff',
                      border: 'none'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              {(stats?.categoryDistribution || []).slice(0, 6).map((item) => (
                <div key={item.key} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Daily Waste Volume Area Chart */}
          <div className="lg:col-span-7 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Chart 2 — Daily Waste Volume Trends
                </h3>
                <span className="text-xs font-bold text-slate-400">Last {timeRangeDays} Days</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Total daily waste scans processed through the AI vision pipeline.
              </p>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      color: '#fff',
                      border: 'none'
                    }} 
                  />
                  <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" name="Total Scans" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Monthly Comparison Bar Chart + Trend Line Chart */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Chart 3: Monthly Statistics Bar Chart */}
          <div className="lg:col-span-6 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Chart 3 — Monthly Volume Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aggregate monthly stream comparison.
              </p>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      color: '#fff',
                      border: 'none'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="plastic" fill="#3B82F6" name="Plastic" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paper" fill="#F59E0B" name="Paper" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="metal" fill="#64748B" name="Metal" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="organic" fill="#10B981" name="Organic" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Multi-Series Category Trend Line Chart */}
          <div className="lg:col-span-6 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Chart 4 — Category Trend Trajectories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Individual category volume shifts over calendar days.
              </p>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.dailyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      color: '#fff',
                      border: 'none'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="plastic" stroke="#3B82F6" strokeWidth={2} dot={false} name="Plastic" />
                  <Line type="monotone" dataKey="paper" stroke="#F59E0B" strokeWidth={2} dot={false} name="Paper" />
                  <Line type="monotone" dataKey="metal" stroke="#64748B" strokeWidth={2} dot={false} name="Metal" />
                  <Line type="monotone" dataKey="organic" stroke="#10B981" strokeWidth={2} dot={false} name="Organic" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 8: AI & Analytics Generated Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              AI Insights & Environmental Findings
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Ground-truth analysis from live scan database
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2 hover:border-emerald-400 transition"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  insight.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {insight.title}
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Detections Table Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Recent Waste Detections Feed
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live inspection feed with sorting, contamination and feedback indicators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Table Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search scans..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter for 10 streams */}
            <select
              value={tableCategory}
              onChange={(e) => {
                setTableCategory(e.target.value);
                setTablePage(1);
              }}
              className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Streams</option>
              <option value="plastic">Plastic</option>
              <option value="paper">Paper & Cardboard</option>
              <option value="metal">Metal</option>
              <option value="organic">Organic</option>
              <option value="glass">Glass</option>
              <option value="e_waste">E-Waste</option>
              <option value="textile">Textile</option>
              <option value="battery">Battery</option>
              <option value="hazardous">Hazardous</option>
              <option value="other">Other / Residual</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-3">Image</th>
                <th className="py-3 px-3">Item Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Contamination</th>
                <th className="py-3 px-3">AI Feedback</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tableLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : recentScans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                recentScans.map((scan) => {
                  const cat = categoryBadges[scan.category || 'plastic'] || categoryBadges.plastic;
                  const d = new Date(scan.created_at);
                  const confPct = Math.round((scan.confidence || 0) * 100);

                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3">
                        <img
                          src={scan.image_url}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {scan.item_name}
                        </span>
                        {scan.material && (
                          <span className="text-[10px] text-slate-400">
                            {scan.material}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold uppercase border ${cat.badge}`}>
                          <span>{cat.icon}</span>
                          <span>{scan.category}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {scan.contamination_detected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            <span>Flagged</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Clean</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {scan.user_confirmed === true ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                            <ThumbsUp className="w-3 h-3" />
                            <span>Confirmed</span>
                          </span>
                        ) : scan.user_confirmed === false ? (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold" title={`Corrected to: ${scan.user_correction}`}>
                            <ThumbsDown className="w-3 h-3" />
                            <span>Corrected</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${confPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            {confPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">
                        {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {tableTotalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Page {tablePage} of {tableTotalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTablePage(p => Math.max(1, p - 1))}
                disabled={tablePage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setTablePage(p => Math.min(tableTotalPages, p + 1))}
                disabled={tablePage === tableTotalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 9: Waste Report Modal */}
      {stats && (
        <WasteReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          stats={stats}
        />
      )}
    </div>
  );
};
