import React, { useEffect } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CompletedAmalRecord } from '../types';
import { SPIRITUAL_LEVELS, SpiritualLevelInfo, INSTANT_AMAL_DECK } from '../data/instantAmals';
import { toBengaliNumber } from '../utils/hijri';

interface TawhidLevelAmalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelId: number | null;
  onSelectLevelId: (id: number) => void;
  completedHistory: CompletedAmalRecord[];
  userTotalPoints: number;
  userCurrentLevelId: number;
  isDark: boolean;
}

function formatBengaliDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const dateStr = d.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} • ${timeStr}`;
  } catch {
    return isoStr;
  }
}

export const TawhidLevelAmalsModal: React.FC<TawhidLevelAmalsModalProps> = ({
  isOpen,
  onClose,
  levelId,
  onSelectLevelId,
  completedHistory,
  userTotalPoints,
  userCurrentLevelId,
  isDark,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || levelId === null) return null;

  const currentLevelInfo = SPIRITUAL_LEVELS.find(l => l.id === levelId) || SPIRITUAL_LEVELS[0];
  
  // Amals completed in this specific level
  const amalsForThisLevel = completedHistory.filter(item => item.levelId === currentLevelInfo.id);

  // Status computation
  const isPassed = userTotalPoints > currentLevelInfo.maxPoints;
  const isCurrent = userCurrentLevelId === currentLevelInfo.id;
  const isLocked = userTotalPoints < currentLevelInfo.minPoints;

  // Previous and Next Level navigation
  const prevLevel = SPIRITUAL_LEVELS.find(l => l.id === currentLevelInfo.id - 1);
  const nextLevel = SPIRITUAL_LEVELS.find(l => l.id === currentLevelInfo.id + 1);

  // Suggested amals for empty state
  const suggestedAmals = [0, 1, 2].map(i => INSTANT_AMAL_DECK[(currentLevelInfo.id * 3 + i) % INSTANT_AMAL_DECK.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="লেভেল আমল লগ"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl border relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh] bg-[#030d1a] border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30 text-white"
      >
        {/* Holographic Cyber Corner Lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex items-center justify-between relative bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  TAWHID LEVEL QUEST LOG
                </span>
                <h3 className="font-mono text-sm sm:text-base font-black tracking-wider text-cyan-300 uppercase">
                  [ লেভেল আমল লগ ]
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                এই স্তর অতিক্রম করতে সম্পন্ন করা তাওহীদ আমলসমূহের বিস্তারিত তালিকা
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1.5 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Banner & Quick Switcher */}
        <div className="p-4 border-b border-cyan-500/20 bg-slate-950/40 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={!prevLevel}
              onClick={() => prevLevel && onSelectLevelId(prevLevel.id)}
              className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-mono font-bold transition-all ${
                prevLevel 
                  ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer active:scale-95' 
                  : 'border-white/5 text-slate-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">পূর্ববর্তী স্তর</span>
            </button>

            {/* Level Information Badge */}
            <div className="text-center flex-1 px-2">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="text-xl">{currentLevelInfo.badge}</span>
                <span className="text-xs font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {currentLevelInfo.rankCode}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  LV.{toBengaliNumber(currentLevelInfo.id)}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {currentLevelInfo.name}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-slate-400">
                  প্রয়োজনীয় সীমা: <span className="text-cyan-300 font-bold">{toBengaliNumber(currentLevelInfo.minPoints)} - {toBengaliNumber(currentLevelInfo.maxPoints)} EXP</span>
                </span>
                <span className="text-slate-600">•</span>
                {isPassed ? (
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ✓ স্তর অতিক্রান্ত
                  </span>
                ) : isCurrent ? (
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
                    ⚡ বর্তমান স্তর
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10">
                    🔒 ভবিষ্যৎ স্তর
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={!nextLevel}
              onClick={() => nextLevel && onSelectLevelId(nextLevel.id)}
              className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-mono font-bold transition-all ${
                nextLevel 
                  ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer active:scale-95' 
                  : 'border-white/5 text-slate-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">পরবর্তী স্তর</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-cyan-500/10 text-center font-mono text-xs">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block text-[10px]">এই স্তরে মোট মিশন</span>
              <span className="text-cyan-400 font-black text-sm">
                {toBengaliNumber(amalsForThisLevel.length)} টি আমল সম্পন্ন
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block text-[10px]">অর্জিত রিওয়ার্ড</span>
              <span className="text-emerald-400 font-black text-sm">
                +{toBengaliNumber(amalsForThisLevel.length * 4)} EXP / নম্বর
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable List of Completed Amals */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 custom-scrollbar flex-1 font-mono">
          {amalsForThisLevel.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 px-1">
                <span>[ সম্পন্নকৃত তাওহীদ মিশন তালিকা ]</span>
                <span className="text-slate-400">{toBengaliNumber(amalsForThisLevel.length)} টি রেকর্ড</span>
              </div>

              {amalsForThisLevel.map((record, idx) => (
                <div
                  key={record.id || idx}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    isDark 
                      ? 'bg-slate-950/70 border-cyan-500/25 hover:border-cyan-400/50 shadow-sm' 
                      : 'bg-sky-50/60 border-sky-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 text-xs font-black shrink-0">
                        {toBengaliNumber(idx + 1)}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                        {record.title}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black shrink-0">
                      +{toBengaliNumber(record.points || 4)} EXP
                    </span>
                  </div>

                  {record.arabic && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 my-2 text-right">
                      <p dir="rtl" lang="ar" className="font-arabic text-sm sm:text-base text-amber-300 leading-relaxed font-semibold">
                        {record.arabic}
                      </p>
                    </div>
                  )}

                  {record.banglaMeaning && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-2 font-sans italic">
                      "{record.banglaMeaning}"
                    </p>
                  )}

                  <div className="space-y-1 pt-2 border-t border-white/5 text-[11px] font-sans">
                    {record.benefit && (
                      <div className="flex items-start gap-1.5 text-emerald-400/90">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                        <span><strong>ফজিলত:</strong> {record.benefit}</span>
                      </div>
                    )}
                    {record.reference && (
                      <div className="flex items-start gap-1.5 text-cyan-300/80">
                        <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
                        <span><strong>দলীল:</strong> {record.reference}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatBengaliDate(record.completedAt)}</span>
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {record.levelName || currentLevelInfo.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-8 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mx-auto mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                {isLocked ? <Lock className="w-7 h-7 text-slate-500" /> : <Clock className="w-7 h-7" />}
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white mb-1">
                {isLocked 
                  ? 'এই স্তরটি এখনও আনলক হয়নি' 
                  : 'এই স্তরে এখনও কোনো তাওহীদ মিশন সম্পন্ন করা হয়নি'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6 font-sans">
                {isLocked 
                  ? `পূর্ববর্তী স্তরসমূহের তাওহীদ মিশন সম্পন্ন করে প্রয়োজনীয় ${toBengaliNumber(currentLevelInfo.minPoints)} EXP অর্জন করলেই এই স্তরটি স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে।`
                  : 'ট্র্যাকার ভিউ থেকে প্রতিদিনের তাৎক্ষণিক তাওহীদ মিশন সম্পন্ন করুন। এই স্তর অতিক্রম করতে সম্পন্ন করা প্রতিটি আমল এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।'}
              </p>

              {/* Suggested Quests */}
              <div className="text-left max-w-lg mx-auto p-4 rounded-2xl border border-cyan-500/20 bg-slate-950/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-2">
                  [ এই স্তরের জন্য প্রস্তাবিত সহীহ আমলসমূহ ]
                </span>
                <div className="space-y-2">
                  {suggestedAmals.map((amal) => (
                    <div key={amal.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-white block">{amal.title}</span>
                        <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{amal.benefit}</span>
                        <span className="text-[9px] font-mono text-cyan-400/80 block mt-0.5">{amal.reference}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-950/80 flex items-center justify-between font-mono shrink-0">
          <div className="text-xs text-slate-400">
            মোট সম্পন্ন আমল: <span className="text-cyan-400 font-bold">{toBengaliNumber(completedHistory.length)} টি</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/40 cursor-pointer active:scale-98 transition-all tracking-wider uppercase"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
