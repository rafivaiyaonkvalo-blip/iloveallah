import React, { useState, useEffect } from 'react';
import { Headphones, Check, X, RotateCcw } from 'lucide-react';
import { IntervalId } from '../types';

interface EarbudsTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  waqtId: IntervalId | null;
  waqtLabel: string;
  startWaqt: string;
  endWaqt: string;
  initialMinutes: number;
  onSave: (minutes: number) => void;
  isDark: boolean;
  toBn: (n: number | string) => string;
}

const PRESET_MINUTES = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180];

export const EarbudsTimeModal: React.FC<EarbudsTimeModalProps> = ({
  isOpen,
  onClose,
  waqtId,
  startWaqt,
  endWaqt,
  initialMinutes,
  onSave,
  isDark,
  toBn,
}) => {
  const [minutes, setMinutes] = useState<number>(initialMinutes || 0);

  useEffect(() => {
    if (isOpen) {
      setMinutes(initialMinutes || 0);
    }
  }, [isOpen, initialMinutes]);

  if (!isOpen || !waqtId) return null;

  const formatMinutesText = (m: number): string => {
    if (m <= 0) return '০ মিনিট';
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    if (hrs > 0 && mins > 0) return `${toBn(hrs)} ঘণ্টা ${toBn(mins)} মিনিট`;
    if (hrs > 0) return `${toBn(hrs)} ঘণ্টা`;
    return `${toBn(mins)} মিনিট`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinutes(Number(e.target.value));
  };

  const handleSave = () => {
    onSave(minutes);
    onClose();
  };

  const handleReset = () => {
    setMinutes(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-sm rounded-2xl border p-4 sm:p-5 shadow-2xl transition-all ${
          isDark 
            ? 'bg-slate-900/95 border-emerald-500/30 text-slate-100 shadow-emerald-950/50' 
            : 'bg-white border-emerald-100 text-slate-800 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-white/10 border-slate-200">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                আল্লাহর জন্য ইয়ারবাড
              </h3>
              <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {startWaqt} ➔ {endWaqt} ওয়াক্ত
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark 
                ? 'border-white/10 hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Duration Display */}
        <div className="my-4 text-center">
          <div className={`inline-flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl border ${
            minutes > 0
              ? (isDark ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200')
              : (isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-200')
          }`}>
            <span className={`text-xl sm:text-2xl font-black tracking-tight ${
              minutes > 0 ? 'text-emerald-400' : (isDark ? 'text-slate-400' : 'text-slate-500')
            }`}>
              {formatMinutesText(minutes)}
            </span>
            <span className={`text-[10px] sm:text-[11px] mt-0.5 font-semibold ${
              minutes > 0 ? (isDark ? 'text-emerald-300/80' : 'text-emerald-700') : 'text-slate-400'
            }`}>
              {minutes > 0 ? 'দ্বীনি জ্ঞান ও তিলাওয়াত শোনার সময়' : 'কোনো সময় নির্ধারণ করা নেই'}
            </span>
          </div>
        </div>

        {/* Slider Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
            <span>০ মি.</span>
            <span>১ ঘণ্টা</span>
            <span>২ ঘণ্টা</span>
            <span>৩ ঘণ্টা</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            step="5"
            value={minutes}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Quick Presets Grid */}
        <div className="mb-4">
          <label className={`text-[11px] font-bold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            দ্রুত নির্বাচন করুন:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_MINUTES.map((m) => {
              const isSelected = minutes === m;
              let label = `${toBn(m)} মি.`;
              if (m === 60) label = '১ ঘণ্টা';
              if (m === 90) label = '১.৫ ঘ.';
              if (m === 120) label = '২ ঘণ্টা';
              if (m === 180) label = '৩ ঘণ্টা';

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                      : isDark
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-white/5'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Purpose / Niyyah Note */}
        <p className={`text-[10px] sm:text-[11px] text-center mb-4 leading-relaxed px-1 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          🎧 আল্লাহর সন্তুষ্টির জন্য কুরআন তিলাওয়াত, হাদিসের ব্যাখ্যা বা দ্বীনি বয়ান শোনার সময় ট্র্যাক রাখুন।
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 dark:border-white/10 border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
              isDark 
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border-white/10' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 border-slate-200'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>রিসেট</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDark 
                  ? 'border-white/10 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>সেভ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
