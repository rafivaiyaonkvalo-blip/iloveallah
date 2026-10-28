import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, Shield, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { HalalBackground } from './HalalBackground';

interface LockScreenProps {
  onUnlock: () => void;
  savedPassword: string;
  savedPin?: string;
  isDark?: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  savedPassword,
  savedPin = '313',
  isDark = true,
}) => {
  const [inputPass, setInputPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPass) return;

    const trimmedInput = inputPass.trim();
    const cleanSavedPass = (savedPassword || 'iloveAllah').trim();
    const cleanSavedPin = (savedPin || '313').trim();

    // Flexible matching:
    // 1. Direct or case-insensitive match with savedPassword
    // 2. Direct match with secret PIN (e.g. 313)
    // 3. Fallback to 'iloveallah' (case-insensitive)
    const isPasswordMatch = trimmedInput.toLowerCase() === cleanSavedPass.toLowerCase();
    const isPinMatch = trimmedInput === '313' || trimmedInput === cleanSavedPin;
    const isDefaultMatch = trimmedInput.toLowerCase() === 'iloveallah';

    if (isPasswordMatch || isPinMatch || isDefaultMatch) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInputPass('');
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center safe-app-container antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300 relative ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      <HalalBackground isDark={isDark} />

      <div
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-2xl transition-all duration-300 relative z-10 ${
          shake ? 'animate-bounce' : 'animate-fadeIn'
        } ${
          isDark
            ? 'glass-card border-white/20 bg-slate-950/85 shadow-black/70'
            : 'bg-white/95 border-slate-300 shadow-slate-300/80'
        }`}
      >
        {/* Top Lock Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3.5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                  isDark ? 'bg-slate-950/90' : 'bg-white'
                }`}
              >
                <Lock className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm">
              <Shield className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              SafeZone লক
            </h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${
              isDark 
                ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-amber-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border-emerald-300'
            }`}>
              <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span>I Love Allah</span>
              <span className="font-arabic text-xs font-bold text-amber-400 ml-0.5">ﷻ</span>
            </span>
          </div>
          <p
            className={`text-xs sm:text-sm font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            আপনার আমল ড্যাশবোর্ডে প্রবেশ করতে পাসওয়ার্ড দিন
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleVerify} className="space-y-4" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}>
          {/* Invisible decoy inputs to trick browser password managers into ignoring real field */}
          <div style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1, overflow: 'hidden' }} aria-hidden="true">
            <input type="text" name="fake_user" tabIndex={-1} autoComplete="off" />
            <input type="password" name="fake_pass" tabIndex={-1} autoComplete="off" />
          </div>

          <div>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                name="entry_auth_token"
                id="entry_auth_token"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                readOnly={isReadOnly}
                onFocus={() => setIsReadOnly(false)}
                onClick={() => setIsReadOnly(false)}
                onTouchStart={() => setIsReadOnly(false)}
                value={inputPass}
                onChange={(e) => {
                  setInputPass(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="পাসওয়ার্ড বা গোপন পিন লিখুন..."
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 pr-11 outline-none ${
                  showPassword ? 'unmask-password-field' : 'mask-password-field'
                } ${
                  error
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5 text-rose-300'
                    : isDark
                    ? 'bg-slate-900/80 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-2 font-medium animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>পাসওয়ার্ড বা পিন ভুল হয়েছে! আবার চেষ্টা করুন।</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-98 cursor-pointer"
          >
            <span>আনলক করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
