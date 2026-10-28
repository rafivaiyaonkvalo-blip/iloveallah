import React, { useEffect, useRef } from 'react';
import { Zap, Award, Sparkles, ArrowUp, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpiritualLevelInfo } from '../data/instantAmals';
import { toBengaliNumber } from '../utils/hijri';

interface TawhidLevelUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: SpiritualLevelInfo;
  prevLevel: SpiritualLevelInfo | null;
  isDark: boolean;
}

export const TawhidLevelUpPopup: React.FC<TawhidLevelUpPopupProps> = ({
  isOpen,
  onClose,
  newLevel,
  prevLevel,
  isDark,
}) => {
  const hasFireRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      hasFireRef.current = false;
      return;
    }

    // Fire confetti on mount
    if (!hasFireRef.current) {
      hasFireRef.current = true;
      try {
        // Gold burst
        confetti({ particleCount: 100, spread: 120, origin: { y: 0.5 }, colors: ['#fbbf24', '#f59e0b', '#d97706', '#22d3ee', '#06b6d4'] });
        // Side bursts
        setTimeout(() => {
          confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: ['#22d3ee', '#10b981', '#6366f1'] });
          confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: ['#22d3ee', '#10b981', '#6366f1'] });
        }, 300);
      } catch {}
    }

    // Auto-dismiss after 4.5s
    const timer = setTimeout(() => onCloseRef.current(), 4500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg"
      onClick={onClose}
    >
      {/* Main Card */}
      <div 
        className="w-full max-w-sm rounded-3xl border-2 border-cyan-400/60 bg-gradient-to-b from-[#041832] via-[#030d1a] to-[#041832] p-6 sm:p-8 text-center relative overflow-hidden animate-tawhid-scale-in animate-tawhid-glow-pulse"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-tawhid-shimmer rounded-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-3 right-3 p-1.5 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-300">
              TAWHID RANK UP!
            </span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>

          <h2 className="text-lg sm:text-xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-300 to-cyan-300 uppercase tracking-wider">
            [ তাওহীদ স্তর উন্নীত! ]
          </h2>
        </div>

        {/* Badge */}
        <div className="my-5 animate-tawhid-badge-bounce">
          <span className="text-6xl sm:text-7xl block drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            {newLevel.badge}
          </span>
        </div>

        {/* Level transition */}
        {prevLevel && (
          <div className="flex items-center justify-center gap-3 mb-4 font-mono">
            <div className="text-center opacity-60">
              <span className="text-xs text-slate-400 block">পূর্ববর্তী</span>
              <span className="text-lg font-black text-slate-400">
                LV.{toBengaliNumber(prevLevel.id)}
              </span>
            </div>
            <ArrowUp className="w-5 h-5 text-amber-400 rotate-90 animate-pulse" />
            <div className="text-center">
              <span className="text-xs text-cyan-400 block font-bold">বর্তমান</span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400">
                LV.{toBengaliNumber(newLevel.id)}
              </span>
            </div>
          </div>
        )}

        {/* New level name */}
        <div className="mb-3 px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 mb-2">
            <span className="text-[10px] font-mono font-extrabold uppercase text-cyan-300 tracking-widest">
              {newLevel.rankCode}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            {newLevel.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {newLevel.description}
          </p>
        </div>

        {/* Motivational message */}
        <div className="mt-5 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
          <p className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>আল্লাহু আকবার! তাওহীদের পথে আরো এক ধাপ এগিয়ে গেলেন!</span>
          </p>
          <p className="text-[10px] text-emerald-400/80 font-mono mt-1">
            EXP অর্জন অব্যাহত রাখুন • পরবর্তী র‍্যাংকের দিকে অগ্রসর হোন
          </p>
        </div>

        {/* Close hint */}
        <p className="text-[9px] text-slate-500 font-mono mt-4">
          [ বন্ধ করতে যে কোনো জায়গায় ক্লিক করুন ]
        </p>
      </div>
    </div>
  );
};
