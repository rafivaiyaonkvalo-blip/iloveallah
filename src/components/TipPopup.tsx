import React, { useState } from 'react';
import { Sparkles, X, Shuffle, BookOpen, Heart, Bookmark, Copy, Check } from 'lucide-react';
import { TipItem } from '../types';

interface TipPopupProps {
  isOpen: boolean;
  tips: TipItem[];
  isDark: boolean;
  onClose: () => void;
  onOpenLibrary: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const TipPopup: React.FC<TipPopupProps> = ({
  isOpen,
  tips,
  isDark,
  onClose,
  onOpenLibrary,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [index, setIndex] = useState(() => {
    if (tips.length === 0) return 0;
    return Math.floor(Math.random() * tips.length);
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen || tips.length === 0) return null;

  const currentTip = tips[index] || tips[0];

  const handleNextRandom = () => {
    if (tips.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * tips.length);
    if (nextIdx === index) {
      nextIdx = (index + 1) % tips.length;
    }
    setIndex(nextIdx);
  };

  const handleGoToLibrary = () => {
    onClose();
    onOpenLibrary();
  };

  const handleCopy = () => {
    const dalilText = currentTip.reference || currentTip.dalil;
    const textToCopy = dalilText 
      ? `"${currentTip.text}" — [দলিল: ${dalilText}]` 
      : `"${currentTip.text}"`;
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl relative transition-all transform scale-100 ${
          isDark 
            ? 'bg-slate-900/95 border-emerald-500/30 text-white shadow-emerald-950/50' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Subtle Decorative Aura */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors cursor-pointer active:scale-90 ${
            isDark 
              ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Sparkles */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-amber-200 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <span>আজকের অনুপ্রেরণা ও উপদেশ</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                isDark ? 'bg-slate-800 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                ২০০০+ সম্ভার
              </span>
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              কুরআন ও সহিহ হাদিসের আলোয় আত্মশুদ্ধির সেরা পাথেয়
            </p>
          </div>
        </div>

        {/* Tip Body Card */}
        <div className={`rounded-2xl p-5 my-4 border relative ${
          isDark 
            ? 'bg-slate-950/70 border-white/5 text-slate-100' 
            : 'bg-slate-50 border-slate-200/80 text-slate-800'
        }`}>
          <div className="text-2xl text-emerald-500/40 font-serif leading-none mb-1">“</div>
          <p className="text-sm sm:text-base leading-relaxed font-medium px-2 py-1">
            {currentTip.text}
          </p>
          <div className="text-2xl text-emerald-500/40 font-serif leading-none text-right mt-1">”</div>

          {/* Dalil Citation Badge */}
          {(currentTip.reference || currentTip.dalil) && (
            <div className="mt-3 pt-3 border-t border-slate-500/10 flex items-center justify-between gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border ${
                isDark 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                <span>📖 দলিল:</span>
                <span>{currentTip.reference || currentTip.dalil}</span>
              </span>

              {/* Action buttons inside card: Copy & Favorite */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isDark 
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-white/10' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                  }`}
                  title="টিপস ও দলিল কপি করুন"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>কপি</span>
                    </>
                  )}
                </button>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(currentTip.id)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isFavorite
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-white/10'
                          : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                    title={isFavorite ? 'বুকমার্ক থেকে সরান' : 'বুকমার্ক করুন'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {tips.length > 1 && (
              <button
                type="button"
                onClick={handleNextRandom}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title="অন্য আরেকটি উপদেশ দেখুন"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>পরবর্তী উপদেশ</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleGoToLibrary}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-white/10' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
              title="সম্পূর্ণ লাইব্রেরিতে গিয়ে সব টিপস দেখুন বা অনুসন্ধান করুন"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>লাইব্রেরি</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>জাযাকাল্লাহু খাইরান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
