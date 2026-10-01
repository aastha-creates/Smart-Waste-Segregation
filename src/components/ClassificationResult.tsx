import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  History, 
  MapPin, 
  Lightbulb, 
  ThumbsUp, 
  ThumbsDown, 
  ShieldAlert, 
  TreeDeciduous
} from 'lucide-react';
import { WasteAnalysisResult } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ClassificationResultProps {
  result: WasteAnalysisResult;
  imageSrc: string;
  scanRecordId?: string | null;
  onReset: () => void;
  onViewHistory: () => void;
  onNavigateMap?: (category?: string) => void;
}

export const ClassificationResult: React.FC<ClassificationResultProps> = ({
  result,
  imageSrc,
  scanRecordId,
  onReset,
  onViewHistory,
  onNavigateMap,
}) => {
  const { t, isRTL, translateCategory, translateBin, translateDynamicText } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean | null>(null);
  const [showCorrectionSelect, setShowCorrectionSelect] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<string>('paper');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const copyRecommendation = () => {
    if (result.disposal_recommendation) {
      navigator.clipboard.writeText(
        `Smart Waste Segregation - ${result.item_name || result.category?.toUpperCase()}:\n${result.disposal_recommendation}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFeedback = async (confirmed: boolean, correction?: string) => {
    setIsSubmittingFeedback(true);
    try {
      if (scanRecordId) {
        await fetch(`/api/scans/${scanRecordId}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmed, correction }),
        });
      }
      setFeedbackSubmitted(confirmed);
      setShowCorrectionSelect(false);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // 1. Poor Image Quality Response
  if (result.image_quality && result.image_quality !== 'good') {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl p-8 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t('result.qualityIssue')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('result.unclearImage')}
            </h2>
          </div>

          <p className="text-slate-600 dark:text-slate-300 max-w-md text-sm sm:text-base leading-relaxed">
            {result.image_quality_reason || t('result.unclearImage')}
          </p>

          <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2">
            <img
              src={imageSrc}
              alt="Scan capture"
              className="w-full h-48 object-contain rounded-xl opacity-80"
            />
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-300 text-left max-w-md space-y-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
            <p className="font-bold">{t('result.qualityTips')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('result.tip1')}</li>
              <li>{t('result.tip2')}</li>
              <li>{t('result.tip3')}</li>
              <li>{t('result.tip4')}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
            <button
              onClick={onReset}
              className="flex-1 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('scan.retakePhoto')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Non-Waste Safeguard Response
  if (!result.is_waste) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl p-8 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t('result.safeguard')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('result.noWasteDetected')}
            </h2>
          </div>

          <p className="text-slate-600 dark:text-slate-300 max-w-md text-sm sm:text-base leading-relaxed">
            {result.reason || t('result.noWasteDetected')}
          </p>

          <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 p-2">
            <img
              src={imageSrc}
              alt="Uploaded scan"
              className="w-full h-48 object-contain rounded-xl"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 text-left max-w-md space-y-1" dir={isRTL ? 'rtl' : 'ltr'}>
            <p className="font-bold text-slate-800 dark:text-slate-200">{t('result.safeguardTips')}</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>{t('result.safeguardTip1')}</li>
              <li>{t('result.safeguardTip2')}</li>
              <li>{t('result.safeguardTip3')}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
            <button
              onClick={onReset}
              className="flex-1 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('scan.retakePhoto')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Visual stream badge configuration for all 10 categories
  const categoryConfig: Record<string, {
    icon: string;
    badgeBg: string;
    colorHex: string;
  }> = {
    plastic: { icon: '♻️', badgeBg: 'bg-blue-600 text-white', colorHex: '#3B82F6' },
    paper: { icon: '📄', badgeBg: 'bg-amber-600 text-white', colorHex: '#F59E0B' },
    metal: { icon: '🔩', badgeBg: 'bg-slate-700 text-white', colorHex: '#64748B' },
    organic: { icon: '🍃', badgeBg: 'bg-emerald-600 text-white', colorHex: '#10B981' },
    glass: { icon: '🍾', badgeBg: 'bg-cyan-600 text-white', colorHex: '#06B6D4' },
    e_waste: { icon: '🔌', badgeBg: 'bg-purple-600 text-white', colorHex: '#8B5CF6' },
    textile: { icon: '👕', badgeBg: 'bg-pink-600 text-white', colorHex: '#EC4899' },
    battery: { icon: '🔋', badgeBg: 'bg-yellow-500 text-slate-950', colorHex: '#EAB308' },
    hazardous: { icon: '⚠️', badgeBg: 'bg-rose-600 text-white', colorHex: '#EF4444' },
    other: { icon: '📦', badgeBg: 'bg-slate-600 text-white', colorHex: '#94A3B8' }
  };

  const currentCategory = result.category || 'plastic';
  const config = categoryConfig[currentCategory] || categoryConfig.plastic;
  const localizedCategoryTitle = translateCategory(currentCategory);
  const localizedBinName = translateBin(currentCategory);

  const confidenceScore = typeof result.confidence === 'number' 
    ? (result.confidence <= 1 ? Math.round(result.confidence * 100) : Math.round(result.confidence))
    : 92;

  const isHighConfidence = confidenceScore >= 80;
  const isModerateConfidence = confidenceScore >= 50 && confidenceScore < 80;

  const certaintyTierLabel = isHighConfidence 
    ? t('result.highCertainty') 
    : isModerateConfidence 
    ? t('result.moderateCertainty') 
    : t('result.lowCertainty');

  const evidenceLabel = isHighConfidence
    ? t('result.strongEvidence')
    : isModerateConfidence
    ? t('result.moderateEvidence')
    : t('result.lowEvidence');

  const detectedItemDisplay = translateDynamicText(result.item_name) || result.item_name || `${localizedCategoryTitle}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. LARGE SCANNED IMAGE CARD (FIRST ELEMENT) */}
      <div className="rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 px-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('result.scannedImage')}</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
            {t('result.highResFocus')}
          </span>
        </div>

        {/* Large Centered Image Container - Uncropped, High Fidelity */}
        <div className="w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200/60 dark:border-slate-800 shadow-inner p-2 sm:p-4 min-h-[260px] max-h-[540px]">
          <img
            src={imageSrc}
            alt="Scanned waste"
            className="w-full h-auto max-h-[500px] object-contain rounded-xl mx-auto"
          />
        </div>
      </div>

      {/* 2. 1. CLASSIFICATION (FIRST INFORMATION RESULT CARD BELOW LARGE IMAGE) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{t('result.classification')}</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
            {t('result.primaryResult')}
          </span>
        </div>

        {/* Classification Details - Full Width, Clean Layout */}
        <div className="space-y-4">
          {/* Category Pill and Material */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs ${config.badgeBg}`}>
              <span className="text-base">{config.icon}</span>
              <span>{localizedCategoryTitle}</span>
            </span>
            {result.material && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {t('result.materialLabel')} {result.material}
              </span>
            )}
          </div>

          {/* Detected Waste Name */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('result.detectedWaste')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {detectedItemDisplay}
            </h2>
          </div>

          {/* AI Explanation / Rationale */}
          {result.reason && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-bold block mb-1">
                {t('result.explanationLabel')}
              </strong>
              {result.reason}
            </div>
          )}
        </div>
      </div>

      {/* 3. 2. CONFIDENCE (SECOND RESULT CARD) */}
      <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('result.confidence')}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {t('result.certaintyTier', { tier: certaintyTierLabel })}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('result.aiConfidence')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">
                {confidenceScore}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {evidenceLabel}
              </span>
            </div>
          </div>

          <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isHighConfidence ? 'text-emerald-500' : isModerateConfidence ? 'text-amber-500' : 'text-rose-500'}
                strokeDasharray={`${confidenceScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-black text-xs text-slate-900 dark:text-white font-mono">
              {confidenceScore}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isHighConfidence ? 'bg-emerald-500' : isModerateConfidence ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${confidenceScore}%` }}
          />
        </div>
      </div>

      {/* 4. 3. CONTAMINATION CHECK (THIRD RESULT CARD) */}
      <div className={`rounded-3xl p-6 border shadow-md space-y-3 ${
        result.contamination_detected
          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
          : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
      }`}>
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('result.contaminationCheck')}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/60">
            {t('result.streamPurity')}
          </span>
        </div>

        <div className="flex items-start gap-3">
          {result.contamination_detected ? (
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm sm:text-base">
              {result.contamination_detected
                ? t('result.contaminationDetected')
                : t('result.cleanStream')}
            </h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {result.contamination_note ? translateDynamicText(result.contamination_note) : (
                result.contamination_detected
                  ? t('result.contaminatedNote')
                  : t('result.cleanNote')
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 5. 4. SECOND-LIFE / REUSE (FOURTH RESULT CARD) */}
      {result.second_life_suggestion && (
        <div className="rounded-3xl p-6 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-800/80 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-teal-200 dark:border-teal-800/50 pb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
              {t('result.secondLife')}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
              {t('result.circularEconomy')}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-teal-950 dark:text-teal-200">
                {t('result.secondLifeTitle')}
              </h4>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {translateDynamicText(result.second_life_suggestion) || result.second_life_suggestion}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. 5. DISPOSAL RECOMMENDATION (FIFTH RESULT CARD) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('result.disposal')}
          </span>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {t('result.certifiedRule')}
          </span>
        </div>

        {/* Target Bin Assignment */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
            {t('result.recommendedBin')}
          </span>
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-black text-slate-900 dark:text-white">
            <span className="text-xl">{config.icon}</span>
            <span>{localizedBinName}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {result.disposal_recommendation}
          </p>
        </div>

        {/* Preparation Checklist */}
        {result.actionable_steps && result.actionable_steps.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t('result.prepSteps')}
            </span>
            <div className="space-y-2">
              {result.actionable_steps.map((step, idx) => {
                const isChecked = completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3 rounded-xl border text-xs flex items-center gap-3 transition cursor-pointer select-none ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 line-through'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Environmental Impact Note */}
        {result.environmental_impact && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 text-xs flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
            <TreeDeciduous className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{result.environmental_impact}</span>
          </div>
        )}
      </div>

      {/* 7. 6. FIND DISPOSAL POINT / DISPOSAL MAP (SIXTH RESULT CARD) */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
            {t('result.findDisposal')}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
            {t('result.interactiveMap')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-black tracking-tight">
              {t('result.whereToDispose', { category: localizedCategoryTitle })}
            </h4>
            <p className="text-xs text-emerald-100 leading-relaxed max-w-md">
              {t('result.locateDepots')}
            </p>
          </div>

          {onNavigateMap && (
            <button
              onClick={() => onNavigateMap(currentCategory)}
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-800 font-extrabold text-xs shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-100 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{t('result.findCategoryPoints', { category: localizedCategoryTitle })}</span>
            </button>
          )}
        </div>
      </div>

      {/* 8. 7. USER FEEDBACK (SEVENTH RESULT CARD) */}
      <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('result.feedback')}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('result.aiDataset')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t('result.wasCorrect')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('result.feedbackHelp')}
            </p>
          </div>

          {feedbackSubmitted !== null ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('result.feedbackRecorded')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                disabled={isSubmittingFeedback}
                onClick={() => handleFeedback(true)}
                className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{t('result.yesCorrect')}</span>
              </button>

              <button
                disabled={isSubmittingFeedback}
                onClick={() => setShowCorrectionSelect(true)}
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{t('result.noIncorrect')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Correction Selection */}
        {showCorrectionSelect && feedbackSubmitted === null && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-200">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('result.correctionPrompt')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCorrection}
                onChange={(e) => setSelectedCorrection(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="plastic">{translateCategory('plastic')}</option>
                <option value="paper">{translateCategory('paper')}</option>
                <option value="metal">{translateCategory('metal')}</option>
                <option value="organic">{translateCategory('organic')}</option>
                <option value="glass">{translateCategory('glass')}</option>
                <option value="e_waste">{translateCategory('e_waste')}</option>
                <option value="textile">{translateCategory('textile')}</option>
                <option value="battery">{translateCategory('battery')}</option>
                <option value="hazardous">{translateCategory('hazardous')}</option>
                <option value="other">{translateCategory('other')}</option>
              </select>

              <button
                disabled={isSubmittingFeedback}
                onClick={() => handleFeedback(false, selectedCorrection)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
              >
                {t('result.submitCorrection')}
              </button>

              <button
                onClick={() => setShowCorrectionSelect(false)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                {t('common.cancel')}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {t('result.feedbackNote')}
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={copyRecommendation}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t('result.copied') : t('result.copyAdvice')}</span>
          </button>

          <button
            onClick={onViewHistory}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('result.viewInHistory')}</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('result.scanAnother')}</span>
        </button>
      </div>
    </div>
  );
};
