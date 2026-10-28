import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronRight,
  Shield,
  Zap,
  Sword,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InstantAmalItem, UserGamificationState } from '../types';
import { INSTANT_AMAL_DECK, getSpiritualLevel, DAILY_EXP_GOAL } from '../data/instantAmals';
import { DAILY_GOAL_BONUS } from '../utils/gamification';
import { toBengaliNumber } from '../utils/hijri';

interface InstantAmalCardProps {
  gamification: UserGamificationState;
  onCompleteAmal: (amal: InstantAmalItem) => void;
  onOpenLevelModal: () => void;
  isDark: boolean;
}

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'সকল', icon: '🌟' },
  { id: 'dhikr', label: 'জিকির', icon: '📿' },
  { id: 'dua', label: 'দুআ', icon: '🤲' },
  { id: 'quran', label: 'কুরআন', icon: '📖' },
  { id: 'akhlaq', label: 'আখলাক', icon: '💚' },
  { id: 'salat', label: 'সালাত', icon: '🕌' },
];

export const InstantAmalCard: React.FC<InstantAmalCardProps> = ({
  gamification,
  onCompleteAmal,
  onOpenLevelModal,
  isDark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const uncompleted = INSTANT_AMAL_DECK.filter(a => !gamification.completedAmalIds.includes(a.id));
    const targetList = uncompleted.length > 0 ? uncompleted : INSTANT_AMAL_DECK;
    return Math.floor(Math.random() * targetList.length);
  });

  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [justCompleted, setJustCompleted] = useState<boolean>(false);
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const filteredDeck = useMemo(() => {
    const deck = selectedCategory === 'all'
      ? INSTANT_AMAL_DECK
      : INSTANT_AMAL_DECK.filter(a => a.category === selectedCategory);
    return deck.length > 0 ? deck : INSTANT_AMAL_DECK;
  }, [selectedCategory]);

  const currentAmal: InstantAmalItem = filteredDeck[currentIndex % filteredDeck.length];
  const isAlreadyCompletedToday = gamification.completedAmalIds.includes(currentAmal.id);

  // গণনা (তাসবীহ কাউন্টার): নতুন আমলে শূন্য থেকে শুরু
  const [tapCount, setTapCount] = useState<number>(0);
  useEffect(() => { setTapCount(0); }, [currentAmal.id]);
  const target = currentAmal.count && currentAmal.count > 1 ? currentAmal.count : 0;
  const countDone = target > 0 && tapCount >= target;

  const { currentLevel, nextLevel, progressInLevel, pointsNeeded } = useMemo(() => {
    return getSpiritualLevel(gamification.totalPoints);
  }, [gamification.totalPoints]);

  const handleNextAmal = () => {
    setIsRotating(true);
    timersRef.current.push(window.setTimeout(() => {
      const candidates = filteredDeck
        .map((item, idx) => idx)
        .filter(idx => idx !== currentIndex % filteredDeck.length);
      const fresh = candidates.filter(idx => !gamification.completedAmalIds.includes(filteredDeck[idx].id));
      const pool = fresh.length > 0 ? fresh : candidates.length > 0 ? candidates : [0];
      const nextIdx = pool[Math.floor(Math.random() * pool.length)];
      setCurrentIndex(nextIdx);
      setIsRotating(false);
    }, 200));
  };

  const handleClaim = () => {
    if (isAlreadyCompletedToday) {
      handleNextAmal();
      return;
    }
    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#00e5ff', '#38bdf8', '#10b981', '#f59e0b', '#6366f1']
      });
    } catch {}

    setJustCompleted(true);
    onCompleteAmal(currentAmal);

    timersRef.current.push(window.setTimeout(() => {
      setJustCompleted(false);
      handleNextAmal();
    }, 1300));
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden backdrop-blur-2xl mb-4 ${
      isDark 
        ? 'bg-gradient-to-b from-slate-950 via-[#061325] to-slate-950 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20' 
        : 'bg-gradient-to-b from-white via-sky-50/50 to-white border-sky-300 shadow-lg shadow-sky-100'
    }`}>
      {/* Tawhid System Holographic Corner Accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Cyber / Blue Neon Scanline subtle glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75" />

      {/* 1. Header: [ SYSTEM QUEST NOTIFICATION ] */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/40 border border-cyan-300/40">
            <Zap className="w-4 h-4 text-cyan-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded border ${
                isDark 
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                  : 'bg-sky-100 text-sky-800 border-sky-300'
              }`}>
                [ TAWHID SYSTEM ]
              </span>
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                তাওহীদ মিশন (তাৎক্ষণিক আমল)
              </span>
            </div>
            <span className={`text-[10px] font-mono block mt-0.5 ${isDark ? 'text-cyan-400/80' : 'text-slate-600'}`}>
              TAWHID REWARD: +৪ EXP / নম্বর
            </span>
          </div>
        </div>

        {/* Tawhid System Status Window Pill (Clickable) */}
        <button
          type="button"
          onClick={onOpenLevelModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none active:scale-95 group ${
            isDark 
              ? 'bg-[#041226] hover:bg-[#071c3b] border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-400' 
              : 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-900 shadow-sm'
          }`}
          title="তাওহীদ সিস্টেম স্ট্যাটাস উইন্ডো দেখতে চাপুন"
        >
          <div className="text-left font-mono leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-amber-400 text-xs">{currentLevel.badge}</span>
              <span className="text-[10px] uppercase font-black text-cyan-400">LVL {toBengaliNumber(currentLevel.id)}</span>
            </div>
            <span className={`block text-[11px] font-black tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {toBengaliNumber(gamification.totalPoints)} <span className="text-[9px] text-cyan-300">EXP</span>
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar select-none relative z-10">
        {CATEGORY_OPTIONS.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const catCount = cat.id === 'all' ? INSTANT_AMAL_DECK.length : INSTANT_AMAL_DECK.filter(a => a.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : isDark
                  ? 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-[9px] font-mono ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>({toBengaliNumber(catCount)})</span>
            </button>
          );
        })}
      </div>

      {/* 2. Main Holographic Quest Window */}
      <div className={`rounded-2xl p-4 border transition-all duration-200 relative ${
        isDark 
          ? 'bg-slate-950/80 border-cyan-500/20 shadow-inner' 
          : 'bg-white/95 border-sky-200 shadow-sm'
      }`}>
        {/* Quest Meta (Time & Refresh) */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
              isDark 
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30' 
                : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
              <Clock className="w-3 h-3 text-cyan-400" />
              সময়: {toBengaliNumber(currentAmal.durationMinutes)} মিনিট
            </span>

            {isAlreadyCompletedToday && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3" /> আজ সম্পন্ন
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextAmal}
            disabled={isRotating}
            className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300'
            }`}
            title="নতুন আরেকটি কুইয়েস্ট নিন"
          >
            <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin text-cyan-400' : ''}`} />
            <span>নতুন কুইয়েস্ট</span>
          </button>
        </div>

        {/* Quest Counter */}
        <div className="flex items-center justify-center mt-1.5 mb-1">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${isDark ? 'bg-slate-900/60 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            মিশন {toBengaliNumber((currentIndex % filteredDeck.length) + 1)}/{toBengaliNumber(filteredDeck.length)} • আজ সম্পন্ন: {toBengaliNumber(gamification.completedAmalIds.length)}টি
          </span>
        </div>

        {/* Quest Title */}
        <div className="mb-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/90 font-bold mb-0.5">
            [ TAWHID OBJECTIVE ]
          </div>
          <h4 className={`text-base sm:text-lg font-bold tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {currentAmal.title}
          </h4>
          {(currentAmal.timing || currentAmal.count) && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {currentAmal.timing && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${isDark ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  🕒 কখন: {currentAmal.timing}
                </span>
              )}
              {currentAmal.count && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                  🔁 {toBengaliNumber(currentAmal.count)} বার
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arabic Box */}
        {currentAmal.arabic && (
          <div dir="rtl" lang="ar" className={`p-3 rounded-xl font-arabic text-base sm:text-lg leading-relaxed text-center my-2.5 border ${
            isDark 
              ? 'bg-slate-900/90 border-cyan-500/30 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.1)]' 
              : 'bg-sky-50/80 border-sky-200 text-sky-950 font-semibold'
          }`}>
            {currentAmal.arabic}
          </div>
        )}

        {/* বাংলা উচ্চারণ (উৎসের অনুবাদ থেকে হুবহু) */}
        {currentAmal.pronunciation && (
          <p className={`text-xs mb-2.5 leading-relaxed rounded-lg px-2.5 py-1.5 border ${isDark ? 'bg-slate-900/60 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
            <span className="font-bold text-cyan-500">উচ্চারণ: </span>{currentAmal.pronunciation}
          </p>
        )}

        {/* Bangla Meaning */}
        {currentAmal.banglaMeaning && (
          <p className={`text-xs mb-2.5 italic leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            "{currentAmal.banglaMeaning}"
          </p>
        )}

        {/* আমল করার নিয়ম */}
        {currentAmal.steps && currentAmal.steps.length > 0 && (
          <div className={`text-xs mb-2.5 rounded-lg px-2.5 py-2 border ${isDark ? 'bg-slate-900/60 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
            <span className="font-bold text-cyan-500 block mb-1">আমলের নিয়ম:</span>
            <ol className="list-decimal pl-4 space-y-0.5">
              {currentAmal.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        )}

        {/* গণনার কাউন্টার: যতবার পড়তে হবে ততবার ট্যাপ */}
        {target > 0 && (
          <div className="mb-3">
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => setTapCount(c => Math.min(c + 1, target))}
                className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all active:scale-95 cursor-pointer select-none ${
                  countDone
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : isDark ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/50' : 'bg-cyan-50 border-cyan-300 text-cyan-900 hover:bg-cyan-100'
                }`}
                aria-label="প্রতিবার পড়ার পর ট্যাপ করুন"
              >
                {countDone ? '✓ পূর্ণ হয়েছে' : 'পড়ে ট্যাপ করুন'} — {toBengaliNumber(tapCount)}/{toBengaliNumber(target)}
              </button>
              <button
                type="button"
                onClick={() => setTapCount(0)}
                className={`px-3 rounded-xl border text-xs font-bold cursor-pointer ${isDark ? 'border-white/10 text-slate-400 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:text-slate-800'}`}
                title="গণনা শূন্য করুন"
              >
                ↺
              </button>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden mt-1.5 ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-200" style={{ width: `${Math.round((tapCount / target) * 100)}%` }} />
            </div>
          </div>
        )}

        {/* Quest Reward & Benefit */}
        <div className={`p-3 rounded-xl border text-xs mb-3.5 ${
          isDark 
            ? 'bg-[#021020] border-cyan-500/30 text-cyan-200/90' 
            : 'bg-sky-50 border-sky-200 text-sky-950'
        }`}>
          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                [ TAWHID REWARD & FAZILAT ]
              </span>
              <span className="font-semibold block mt-0.5 leading-snug">{currentAmal.benefit}</span>
              <span className={`text-[10px] font-mono block mt-1 opacity-80 ${isDark ? 'text-cyan-400' : 'text-slate-600'}`}>
                দলীল: {currentAmal.reference}
              </span>
            </div>
          </div>
        </div>

        {/* Quest Action Button */}
        <button
          type="button"
          onClick={handleClaim}
          disabled={justCompleted || isRotating}
          className={`w-full py-3 rounded-xl font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-98 relative overflow-hidden shadow-lg ${
            justCompleted
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white animate-pulse shadow-emerald-500/50'
              : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white shadow-cyan-600/40 hover:shadow-cyan-500/60 border border-cyan-400/40'
          }`}
        >
          {justCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="tracking-wide uppercase font-black">[ TAWHID QUEST COMPLETED! +৪ EXP CLAIMED ]</span>
            </>
          ) : (
            <>
              <Target className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span className="tracking-wide uppercase">{isAlreadyCompletedToday ? '[ আজ সম্পন্ন ✓ • EXP নেওয়া হয়েছে — পরের মিশন ➔ ]' : '[ COMPLETE TAWHID QUEST • +৪ নম্বর/EXP গ্রহণ করুন ]'}</span>
            </>
          )}
        </button>
      </div>

      {/* 3. Tawhid System Status Bar */}
      <div className="mt-3 px-1">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Shield className="w-3.5 h-3.5" />
            <span>{currentLevel.name}</span>
          </span>
          <span className="text-slate-400">
            আজকের অর্জন: <strong className={isDark ? 'text-cyan-300' : 'text-slate-900'}>+{toBengaliNumber(gamification.todayPoints)} EXP</strong>
          </span>
        </div>

        {/* EXP Progress Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden border ${
          isDark ? 'bg-slate-950 border-cyan-500/30' : 'bg-slate-200 border-slate-300'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            style={{ width: `${progressInLevel}%` }}
          />
        </div>

        {/* দৈনিক লক্ষ্য */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
            <span className={isDark ? 'text-emerald-300' : 'text-emerald-700'}>
              🎯 দৈনিক লক্ষ্য: {toBengaliNumber(Math.min(gamification.todayPoints, DAILY_EXP_GOAL))}/{toBengaliNumber(DAILY_EXP_GOAL)} EXP
            </span>
            <span className="text-slate-500">
              {gamification.goalBonusDate === gamification.lastPointsDate
                ? '✓ বোনাস পাওয়া হয়েছে'
                : `পূরণ হলে +${toBengaliNumber(DAILY_GOAL_BONUS)} বোনাস`}
              {(gamification.goalStreak || 0) > 0 && ` • 🔥 ${toBengaliNumber(gamification.goalStreak || 0)} দিন`}
            </span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((gamification.todayPoints / DAILY_EXP_GOAL) * 100))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1">
          <span>লেভেল অগ্রগতি: {toBengaliNumber(progressInLevel)}%</span>
          {nextLevel && (
            <span>পরবর্তী র‍্যাংকে আর {toBengaliNumber(pointsNeeded)} EXP প্রয়োজন</span>
          )}
        </div>
      </div>
    </div>
  );
};
