import React, { useEffect, useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface IntroSplashProps {
  onFinish: () => void;
  isDark?: boolean;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onFinish, isDark = true }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Smooth progress timer (1.8 seconds)
    const startTime = Date.now();
    const duration = 1800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 350); // slight fade-out transition
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      } ${
        isDark
          ? 'bg-[#070b12] text-slate-100'
          : 'bg-slate-900 text-slate-100'
      }`}
    >
      {/* Background ambient lighting effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full animate-fadeIn">
        {/* Animated Shield Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-2xl shadow-emerald-500/30">
            <div className="w-full h-full rounded-[14px] bg-slate-950/80 backdrop-blur-md flex items-center justify-center border border-emerald-500/20">
              <Shield className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute -top-1.5 -right-1.5">
            <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
          </div>
        </div>

        {/* Bismillah Calligraphy */}
        <h2 className="font-arabic text-2xl sm:text-3xl font-bold tracking-wide text-emerald-300 mb-2 leading-relaxed">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </h2>

        {/* Brand Name & Tagline */}
        <h1 className="text-xl sm:text-2xl font-black tracking-widest uppercase text-white mb-1.5 flex items-center gap-2">
          <span>SAFEZONE</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mb-8">
          মাগরিব হতে মাগরিব • আত্মশুদ্ধি ও আমল হেফাজত
        </p>

        {/* Elegant Progress Bar */}
        <div className="w-48 sm:w-56 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 mb-4 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider py-1 px-3 rounded-lg hover:bg-slate-800/50 cursor-pointer"
        >
          সরাসরি প্রবেশ করুন (Skip)
        </button>
      </div>
    </div>
  );
};
