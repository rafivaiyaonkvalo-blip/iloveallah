import React, { useEffect } from 'react';
import { 
  X, 
  Shield, 
  Zap, 
  Flame, 
  Trophy, 
  Award, 
  Sparkles, 
  Heart, 
  Clock, 
  CheckCircle2, 
  Activity,
  Layers
} from 'lucide-react';
import { UserGamificationState } from '../types';
import { SPIRITUAL_LEVELS, getSpiritualLevel, DAILY_EXP_GOAL } from '../data/instantAmals';
import { toBengaliNumber } from '../utils/hijri';

interface TawhidStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: UserGamificationState;
  safeDaysStreak: number;
  isDark: boolean;
  onOpenLevelAmals?: (levelId: number) => void;
}

export const TawhidStatusModal: React.FC<TawhidStatusModalProps> = ({
  isOpen,
  onClose,
  gamification,
  safeDaysStreak,
  isDark,
  onOpenLevelAmals,
}) => {
  // Esc চাপলে বন্ধ হবে
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { currentLevel, nextLevel, progressInLevel, pointsNeeded } = getSpiritualLevel(gamification.totalPoints);

  // Compute Halal spiritual attributes based on user's journey
  const taqwaStat = Math.floor(gamification.totalPoints * 0.4) + (safeDaysStreak * 5);
  const ikhlasStat = Math.floor(gamification.totalAmalCount * 4);
  const sabrStat = safeDaysStreak * 10 + 15;
  const himmatStat = Math.floor(gamification.totalPoints * 0.25) + 20;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      {/* সবসময় ডার্ক 'সিস্টেম' থিম — লাইট মোডেও পাঠযোগ্য */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="তাওহীদ স্ট্যাটাস উইন্ডো"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border relative overflow-hidden shadow-2xl bg-[#030d1a] border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30 text-white"
      >
        {/* Holographic Cyber Grid Lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex items-center justify-between relative bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  TAWHID SYSTEM
                </span>
                <h3 className="font-mono text-sm sm:text-base font-black tracking-wider text-cyan-300 uppercase">
                  [ TAWHID STATUS WINDOW ]
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                তাওহীদ সিস্টেম • আত্মিক সামর্থ্য ও লেভেল
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

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar font-mono">
          {/* 1. Main Character Card */}
          <div className="p-4 rounded-2xl border relative overflow-hidden bg-slate-950/90 border-cyan-500/30">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest block font-bold">
                  [ PLAYER / বান্দাহ ]
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  আল্লাহর বান্দাহ <span className="text-xs font-normal text-cyan-400/90">(মুসাফির)</span>
                </h2>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold mt-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  <span>{currentLevel.badge}</span>
                  <span>{currentLevel.name}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest block font-bold">
                  [ LEVEL ]
                </span>
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                  LV.{toBengaliNumber(currentLevel.id)}
                </span>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="mt-4 pt-3 border-t border-cyan-500/20">
              <div className="flex items-center justify-between text-xs mb-1 font-bold">
                <span className="text-cyan-400">EXP প্রগ্রেস:</span>
                <span className="text-white">
                  {toBengaliNumber(gamification.totalPoints)} / {nextLevel ? toBengaliNumber(nextLevel.minPoints) : '∞'} EXP ({toBengaliNumber(progressInLevel)}%)
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-900 border border-cyan-500/40 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.9)]"
                  style={{ width: `${progressInLevel}%` }}
                />
              </div>

              {nextLevel && (
                <span className="text-[10px] text-cyan-300/80 block mt-1">
                  * পরবর্তী স্তর [{nextLevel.name.split(' ')[0]}] আনলক করতে আরও {toBengaliNumber(pointsNeeded)} EXP প্রয়োজন।
                </span>
              )}
            </div>
          </div>

          {/* 2. Spiritual Vitality Gauges (Iman & Nafs Resistance) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl border bg-slate-950/70 border-emerald-500/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                <Heart className="w-3.5 h-3.5 fill-emerald-400" />
                <span>আজকের অর্জন</span>
              </div>
              <span className="text-xl font-black text-white">{toBengaliNumber(gamification.todayPoints)} / {toBengaliNumber(DAILY_EXP_GOAL)}</span>
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden mt-1.5">
                <div
                  className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((gamification.todayPoints / DAILY_EXP_GOAL) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl border bg-slate-950/70 border-cyan-500/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>নফস প্রতিরোধ স্ট্রিক</span>
              </div>
              <span className="text-xl font-black text-white">{toBengaliNumber(safeDaysStreak)} দিন</span>
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  style={{ width: `${Math.min(100, Math.max(15, safeDaysStreak * 10))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Attributes (রুহানি গুণাবলী স্ট্যাটস) */}
          <div className="p-4 rounded-2xl border bg-slate-950/70 border-cyan-500/20">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2.5">
              [ STATS / আত্মিক সামর্থ্য ]
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-300">তাকওয়া (Taqwa / সংযম):</span>
                <span className="font-black text-cyan-400">+{toBengaliNumber(taqwaStat)}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-300">ইখলাস (Ikhlas / একনিষ্ঠতা):</span>
                <span className="font-black text-emerald-400">+{toBengaliNumber(ikhlasStat)}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-300">সবর (Sabr / অবিচলতা):</span>
                <span className="font-black text-amber-400">+{toBengaliNumber(sabrStat)}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-slate-300">হিম্মত (Himmat / আত্মিক উদ্যম):</span>
                <span className="font-black text-indigo-400">+{toBengaliNumber(himmatStat)}</span>
              </div>
            </div>
          </div>

          {/* 4. Completed Quests Count */}
          <div className="p-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-white block">তাওহীদ মিশন সম্পন্ন{(gamification.goalStreak || 0) > 0 ? ` • 🔥 ${toBengaliNumber(gamification.goalStreak || 0)} দিন টানা লক্ষ্য পূরণ` : ''}</span>
                <span className="text-[10px] text-slate-400 block">প্রতি মিশনে +৪ EXP অর্জিত</span>
              </div>
            </div>
            <span className="text-xl font-black text-cyan-300">
              {toBengaliNumber(gamification.totalAmalCount)} টি
            </span>
          </div>

          {/* 5. All Spiritual Tiers List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
                [ TAWHID TIERS & RANKS ]
              </span>
              <span className="text-[10px] text-cyan-300/80 font-mono">
                * লেভেলে ক্লিক করে আমল দেখুন
              </span>
            </div>
            <div className="space-y-1.5">
              {SPIRITUAL_LEVELS.map((lvl) => {
                const isUnlocked = gamification.totalPoints >= lvl.minPoints;
                const isCurrent = currentLevel.id === lvl.id;
                const levelAmalsCount = (gamification.completedHistory || []).filter(item => item.levelId === lvl.id).length;

                return (
                  <div
                    key={lvl.id}
                    onClick={() => onOpenLevelAmals?.(lvl.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenLevelAmals?.(lvl.id); } }}
                    title="এই স্তরের আমলসমূহ দেখতে ক্লিক করুন"
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer active:scale-98 ${
                      isCurrent
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400 hover:bg-cyan-500/30'
                        : isUnlocked
                        ? 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-cyan-400/40 hover:bg-slate-900/90'
                        : 'bg-slate-950/40 border-white/5 text-slate-600 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lvl.badge}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold block">{lvl.name}</span>
                          {levelAmalsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                              {toBengaliNumber(levelAmalsCount)} টি আমল
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">{lvl.description}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold block">
                        {toBengaliNumber(lvl.minPoints)} EXP
                      </span>
                      {isCurrent ? (
                        <span className="text-[9px] uppercase font-bold text-cyan-400 flex items-center gap-0.5 justify-end">
                          <span>চলমান</span>
                          <span className="text-[8px]">➔</span>
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[9px] uppercase font-bold text-emerald-400 flex items-center gap-0.5 justify-end">
                          <span>আনলকড</span>
                          <span className="text-[8px]">➔</span>
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase font-bold text-slate-600">লকড</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-950/80 flex items-center justify-end font-mono">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/40 cursor-pointer active:scale-98 transition-all tracking-wider uppercase"
          >
            [ CLOSE TAWHID SYSTEM ]
          </button>
        </div>
      </div>
    </div>
  );
};
