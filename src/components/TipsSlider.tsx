import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Shuffle, 
  Bookmark, 
  Check, 
  Copy, 
  Share2, 
  Play, 
  Pause, 
  Quote
} from 'lucide-react';
import { TipItem } from '../types';

interface TipsSliderProps {
  tips: TipItem[];
  isDark: boolean;
  onOpenLibrary: () => void;
  favoriteIds?: string[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const toBn = (num: number): string => {
  return num.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
};

export const TipsSlider: React.FC<TipsSliderProps> = ({ 
  tips, 
  isDark, 
  onOpenLibrary,
  favoriteIds,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (tips.length === 0) return 0;
    return Math.floor(Math.random() * tips.length);
  });

  const [isManualPaused, setIsManualPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalTips = tips.length;
  const AUTOSLIDE_INTERVAL_MS = 8000;
  const TICK_INTERVAL_MS = 80;

  const isPaused = isManualPaused || isHovered;

  // Auto-slide countdown timer with smooth progress bar
  useEffect(() => {
    if (totalTips <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (AUTOSLIDE_INTERVAL_MS / TICK_INTERVAL_MS));
        if (next >= 100) {
          setCurrentIndex((curr) => (curr + 1) % totalTips);
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [totalTips, isPaused]);

  if (totalTips === 0) return null;

  const currentTip = tips[currentIndex] || tips[0];

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + totalTips) % totalTips);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % totalTips);
  };

  const handleRandom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalTips <= 1) return;
    setProgress(0);
    let nextIdx = Math.floor(Math.random() * totalTips);
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % totalTips;
    }
    setCurrentIndex(nextIdx);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dalilText = currentTip.reference || currentTip.dalil;
    const fullText = dalilText 
      ? `"${currentTip.text}" — [${dalilText}]` 
      : `"${currentTip.text}"`;
    try {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const dalilText = currentTip.reference || currentTip.dalil;
    const fullText = dalilText 
      ? `"${currentTip.text}"\n— [${dalilText}]\n\nSafeZone • I Love Allah ﷻ\nhttps://iloveallah.vercel.app` 
      : `"${currentTip.text}"\n\nSafeZone • I Love Allah ﷻ\nhttps://iloveallah.vercel.app`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'দৈনিক রূহানি নসিহত',
          text: fullText,
          url: 'https://iloveallah.vercel.app'
        });
      } catch {}
    } else {
      handleCopy(e);
    }
  };

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 45) {
        handleNext();
      } else if (diff < -45) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Determine favorite status
  const isFav = favoriteIds 
    ? favoriteIds.includes(currentTip.id) 
    : (isFavorite || !!currentTip.isFavorite);

  // Smart categorization
  const getTipCategory = (tip: TipItem) => {
    const combined = `${tip.reference || ''} ${tip.dalil || ''} ${tip.text || ''}`.toLowerCase();
    if (
      combined.includes('কুরআন') || 
      combined.includes('কোরআন') || 
      combined.includes('সূরা') || 
      combined.includes('surah') || 
      combined.includes('quran') ||
      combined.includes('আয়াত')
    ) {
      return {
        label: 'আল-কুরআনুল কারীম',
        icon: '📖',
        pillClass: isDark 
          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
      };
    }
    if (
      combined.includes('বুখারি') || 
      combined.includes('মুসলিম') || 
      combined.includes('তিরমিজি') || 
      combined.includes('তিরমিযী') || 
      combined.includes('নাসায়ী') || 
      combined.includes('আবু দাউদ') || 
      combined.includes('ইবনে মাজাহ') || 
      combined.includes('হাদিস') || 
      combined.includes('রাসূল') || 
      combined.includes('মুসনাদে আহমাদ')
    ) {
      return {
        label: 'হাদিস শরীফ',
        icon: '📜',
        pillClass: isDark 
          ? 'bg-amber-950/50 text-amber-300 border-amber-500/30' 
          : 'bg-amber-50 text-amber-800 border-amber-300'
      };
    }
    return {
      label: 'রূহানি উপদেশ ও আমল',
      icon: '✨',
      pillClass: isDark 
        ? 'bg-teal-950/50 text-teal-300 border-teal-500/30' 
        : 'bg-teal-50 text-teal-800 border-teal-300'
    };
  };

  const category = getTipCategory(currentTip);

  return (
    <div 
      className={`rounded-3xl border backdrop-blur-2xl relative overflow-hidden transition-all duration-300 mb-5 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-900/90 border-white/10 hover:border-emerald-500/35 shadow-black/40' 
          : 'bg-gradient-to-b from-white/95 via-slate-50/90 to-white/95 border-slate-200/90 hover:border-emerald-300 shadow-slate-200/50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Live Auto-slide Countdown Progress Bar */}
      <div className="w-full h-1 bg-slate-200/30 dark:bg-white/5 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-100 ease-linear rounded-r-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Radiant Islamic Ambient Glows */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="p-4 sm:p-5 relative z-10">
        {/* Top Header: Title, Category Badge, Library Link */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-400/20 to-emerald-500/20 flex items-center justify-center border border-amber-500/30 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`text-xs sm:text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  দৈনিক রূহানি নসিহত
                </h4>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${category.pillClass}`}>
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action: Open Full Library */}
          <button
            type="button"
            onClick={onOpenLibrary}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs shrink-0 ${
              isDark 
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 border-white/10 hover:border-emerald-500/40' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
            title="সম্পূর্ণ লাইব্রেরি ব্রাউজ করুন"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">লাইব্রেরি</span>
          </button>
        </div>

        {/* Main Quote Card Content */}
        <div 
          key={currentTip.id || currentIndex}
          className="min-h-[80px] flex flex-col justify-center py-1.5 relative animate-fadeIn"
        >
          {/* Decorative Background Quotation Watermark */}
          <Quote className={`absolute right-1 top-0 w-12 h-12 pointer-events-none transition-opacity ${
            isDark ? 'text-emerald-500/10' : 'text-emerald-600/10'
          }`} />

          <p className={`text-sm sm:text-[15px] leading-relaxed sm:leading-loose font-medium relative z-10 transition-colors ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}>
            "{currentTip.text}"
          </p>

          {/* Dalil / Reference Badge and Actions Row */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            {/* Reference Badge */}
            {(currentTip.reference || currentTip.dalil) ? (
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl border shadow-2xs ${
                isDark 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' 
                  : 'bg-emerald-50/90 text-emerald-800 border-emerald-300/80'
              }`}>
                <span className="text-[11px]">📖</span>
                <span>{currentTip.reference || currentTip.dalil}</span>
              </span>
            ) : (
              <div />
            )}

            {/* Quick Actions Dock: Copy, Favorite, Share */}
            <div className="flex items-center gap-1">
              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 active:scale-90 ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : isDark 
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-white/10' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="নসিহত ও দলিল কপি করুন"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="hidden sm:inline">কপি</span>
                  </>
                )}
              </button>

              {/* Bookmark / Favorite Toggle */}
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(currentTip.id);
                  }}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                    isFav
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-xs'
                      : isDark 
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border-white/10' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-amber-600 border-slate-200'
                  }`}
                  title={isFav ? 'প্রিয় তালিকা থেকে সরান' : 'প্রিয় তালিকায় সংরক্ষণ করুন'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>
              )}

              {/* Native Web Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                  isDark 
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border-white/10' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-700 border-slate-200'
                }`}
                title="নসিহত শেয়ার করুন"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer: Slide Navigation & Controls */}
        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-500/10 text-xs">
          {/* Left: Random Shuffle Button */}
          <button
            type="button"
            onClick={handleRandom}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs ${
              isDark 
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
            }`}
            title="নতুন আরেকটি উপদেশ দেখুন"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>নতুন নসিহত</span>
          </button>

          {/* Center: Play/Pause Toggle & Status */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsManualPaused((prev) => !prev)}
              className={`p-1 rounded-lg border transition-all cursor-pointer active:scale-90 text-[10px] ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : isDark 
                    ? 'bg-slate-800/80 text-slate-400 hover:text-white border-white/5' 
                    : 'bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
              }`}
              title={isPaused ? 'অটো-স্লাইড চালু করুন' : 'অটো-স্লাইড থামিয়ে রাখুন'}
            >
              {isPaused ? <Play className="w-3 h-3 fill-amber-300" /> : <Pause className="w-3 h-3" />}
            </button>

            <span className={`text-[11px] font-mono font-bold px-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {toBn(currentIndex + 1)} / {toBn(totalTips)}
            </span>
          </div>

          {/* Right: Prev & Next Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePrev()}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 border shadow-xs ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-white/10' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title="পূর্ববর্তী নসিহত"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleNext()}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 border shadow-xs ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-white/10' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title="পরবর্তী নসিহত"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
