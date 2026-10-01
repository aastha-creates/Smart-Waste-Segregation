import React from 'react';
import { 
  Camera, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Leaf, 
  Cpu, 
  ChevronRight,
  Globe2,
  Zap,
  Target
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LandingPageProps {
  onScanClick: () => void;
  onExploreCategory: (category: 'plastic' | 'paper' | 'metal' | 'organic') => void;
  onQuickSample: (sampleType: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onScanClick, 
  onExploreCategory,
  onQuickSample 
}) => {
  const { t, isRTL, translateCategory } = useLanguage();

  const categories = [
    {
      id: 'plastic',
      name: translateCategory('plastic'),
      badge: 'Polymer Stream',
      icon: '♻️',
      color: 'blue',
      borderClass: 'border-blue-500/30 hover:border-blue-500',
      bgGradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      examples: ['PET bottles', 'HDPE containers', 'Clean plastic wraps', 'Bottle caps'],
      bin: 'Yellow / Blue Recycling Bin',
      recTip: 'Rinse thoroughly and avoid greasy or contaminated soft plastics.',
    },
    {
      id: 'paper',
      name: translateCategory('paper'),
      badge: 'Cellulose Stream',
      icon: '📄',
      color: 'amber',
      borderClass: 'border-amber-500/30 hover:border-amber-500',
      bgGradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
      accentColor: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      examples: ['Cardboard boxes', 'Office paper', 'Magazines', 'Newspapers'],
      bin: 'Blue / Paper Recycling Cart',
      recTip: 'Must be dry and unsoiled. Greasy pizza boxes belong in compost.',
    },
    {
      id: 'metal',
      name: translateCategory('metal'),
      badge: 'Alloy Stream',
      icon: '🔩',
      color: 'slate',
      borderClass: 'border-slate-500/30 hover:border-slate-400',
      bgGradient: 'from-slate-500/10 via-gray-500/5 to-transparent',
      accentColor: 'text-slate-600 dark:text-slate-300',
      badgeClass: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      examples: ['Aluminum drink cans', 'Tin food cans', 'Aerosol cans', 'Clean foil'],
      bin: 'Metal / Mixed Dry Recyclables',
      recTip: 'Infinitely recyclable with zero degradation. Empty liquids first.',
    },
    {
      id: 'organic',
      name: translateCategory('organic'),
      badge: 'Bio-Compost Stream',
      icon: '🍃',
      color: 'emerald',
      borderClass: 'border-emerald-500/30 hover:border-emerald-500',
      bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      examples: ['Food scraps', 'Fruit peels', 'Coffee grounds', 'Yard trimmings'],
      bin: 'Green Organic / Compost Bin',
      recTip: 'Keep strictly free from plastic stickers, bags, and twist ties.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: t('landing.step1Title'),
      description: t('landing.step1Desc'),
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      step: '02',
      title: t('landing.step2Title'),
      description: t('landing.step2Desc'),
      icon: Cpu,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      step: '03',
      title: t('landing.step3Title'),
      description: t('landing.step3Desc'),
      icon: Leaf,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const valueProps = [
    {
      title: t('landing.vp1Title'),
      desc: t('landing.vp1Desc'),
      icon: Target,
    },
    {
      title: t('landing.vp2Title'),
      desc: t('landing.vp2Desc'),
      icon: Zap,
    },
    {
      title: t('landing.vp3Title'),
      desc: t('landing.vp3Desc'),
      icon: ShieldCheck,
    },
    {
      title: t('landing.vp4Title'),
      desc: t('landing.vp4Desc'),
      icon: Globe2,
    },
    {
      title: t('landing.vp5Title'),
      desc: t('landing.vp5Desc'),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-cyan-500/10 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline and Actions */}
            <div className={`lg:col-span-7 space-y-8 ${isRTL ? 'text-center lg:text-right' : 'text-center lg:text-left'}`}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('hero.badge')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t('common.builtBy')}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                {t('hero.title')}{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                  {t('hero.titleAccent')}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onScanClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Camera className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>{t('hero.ctaScan')}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'transform rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform duration-200`} />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold text-base hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {t('landing.howItWorksCta')}
                </button>
              </div>

              {/* Instant Test Presets */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                  {t('landing.quickDemo')}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <button
                    onClick={() => onQuickSample('plastic')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 transition cursor-pointer"
                  >
                    <span>♻️ {translateCategory('plastic')}</span>
                  </button>
                  <button
                    onClick={() => onQuickSample('metal')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <span>🔩 {translateCategory('metal')}</span>
                  </button>
                  <button
                    onClick={() => onQuickSample('paper')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <span>📄 {translateCategory('paper')}</span>
                  </button>
                  <button
                    onClick={() => onQuickSample('organic')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <span>🍃 {translateCategory('organic')}</span>
                  </button>
                  <button
                    onClick={() => onQuickSample('non_waste')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition cursor-pointer"
                    title="Tests non-waste rejection safeguard"
                  >
                    <span>🚫 Non-Waste</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
                {/* Visual Scanner Mockup Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t('landing.liveFeed')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    60 FPS • 1080p
                  </span>
                </div>

                {/* Waste Visual Sample */}
                <div className="relative my-4 aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center group">
                  <img
                    src="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=700&q=80"
                    alt="Sample plastic bottle waste item"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Laser scan line overlay */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-scanline" />

                  {/* Bounding box guide */}
                  <div className="absolute inset-6 border-2 border-dashed border-emerald-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">
                        PLASTIC (PET #1)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
                        CONF: 96%
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] font-semibold text-white/90 bg-black/60 px-2 py-1 rounded-md backdrop-blur-xs">
                        PET Water Bottle
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analysis Preview Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">♻️</span>
                      <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                        {t('landing.binLabel')} Yellow/Blue Bin
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {t('result.highCertainty')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    Rinse clean of liquid, crush to save space, and place into the designated plastic recycling stream.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {t('landing.howHeading')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('landing.howTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            {t('landing.howSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black text-slate-300 dark:text-slate-700">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {t('landing.streamsHeading')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('landing.streamsTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            {t('landing.streamsSubtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onExploreCategory(cat.id as any)}
              className={`rounded-3xl p-6 bg-white dark:bg-slate-900 border ${cat.borderClass} shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cat.badgeClass}`}>
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('landing.binLabel')} <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.bin}</span>
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t('landing.commonItems')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.examples.map((ex, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  💡 {cat.recTip}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>{t('landing.scanSample', { name: cat.name })}</span>
                <ChevronRight className={`w-4 h-4 ${isRTL ? 'transform rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Smart Waste Segregation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl mb-12 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              {t('landing.whyHeading')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t('landing.whyTitle')}
            </h2>
            <p className="text-slate-300 text-base">
              {t('landing.whySubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueProps.map((vp, i) => {
              const Icon = vp.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {vp.title}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {vp.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-600/20 space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-emerald-50 max-w-xl mx-auto text-base sm:text-lg">
            {t('landing.ctaSubtitle')}
          </p>

          <div className="pt-2">
            <button
              onClick={onScanClick}
              className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-base shadow-lg hover:bg-slate-100 hover:scale-105 active:scale-100 transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-5 h-5 text-emerald-600" />
              <span>{t('landing.ctaButton')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
