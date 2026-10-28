import React, { useState } from 'react';
import { X, Lock, Key, Check, AlertCircle, Shield } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPasswordEnabled: boolean;
  currentPassword: string;
  currentPin?: string;
  isPwaApp?: boolean;
  onUpdateSecurity: (enabled: boolean, newPassword?: string, newPin?: string) => void;
  onLockNow: () => void;
  onDisguiseLockNow?: () => void;
  isDark?: boolean;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  isPasswordEnabled,
  currentPassword,
  isPwaApp = false,
  onUpdateSecurity,
  onLockNow,
  onDisguiseLockNow,
  isDark = true,
}) => {
  if (!isOpen) return null;

  const [enabled, setEnabled] = useState(isPasswordEnabled);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(true);

  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleToggle = (newVal: boolean) => {
    setEnabled(newVal);
    onUpdateSecurity(newVal);
    setMsg({
      text: newVal
        ? 'পাসওয়ার্ড লক সক্রিয় করা হয়েছে।'
        : 'পাসওয়ার্ড লক বন্ধ করা হয়েছে।',
      type: 'success',
    });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (currentPassword && oldPass !== currentPassword) {
      if (oldPass.trim().toLowerCase() !== currentPassword.trim().toLowerCase()) {
        setMsg({ text: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!', type: 'error' });
        return;
      }
    }

    if (!newPass.trim()) {
      setMsg({ text: 'দয়া করে নতুন পাসওয়ার্ড লিখুন।', type: 'error' });
      return;
    }

    if (newPass.length < 3) {
      setMsg({ text: 'পাসওয়ার্ড ন্যূনতম ৩ অক্ষরের হতে হবে।', type: 'error' });
      return;
    }

    if (newPass !== confirmPass) {
      setMsg({ text: 'নতুন পাসওয়ার্ড দুটি মিলছে না!', type: 'error' });
      return;
    }

    onUpdateSecurity(enabled, newPass.trim());
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setMsg({ text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', type: 'success' });
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border relative ${
          isDark
            ? 'glass-card border-white/10 text-slate-100 bg-slate-900/90'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">নিরাপত্তা ও পাসওয়ার্ড সেটিংস</h3>
            <p className="text-xs text-slate-400">অ্যান্ড্রয়েড অ্যাপ ও ওয়েবসাইট নিরাপত্তা কনফিগারেশন</p>
          </div>
        </div>

        {/* Global Feedback Message */}
        {msg && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
              msg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {msg.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* 1. Toggle Password Lock ON / OFF */}
        <div
          className={`p-4 rounded-2xl mb-4 border flex items-center justify-between ${
            isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="pr-4">
            <span className="text-sm font-bold block mb-0.5">ওয়েবসাইট পাসওয়ার্ড লক</span>
            <span
              className={`text-xs block ${
                enabled
                  ? 'text-emerald-400 font-medium'
                  : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {enabled
                ? 'সক্রিয় (পাসওয়ার্ড দিয়ে আনলক)'
                : 'বন্ধ (ওয়েবসাইট সরাসরি খুলবে)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleToggle(!enabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              enabled ? 'bg-emerald-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Change Password Section */}
        {enabled && (
          <div
            className={`p-4 rounded-2xl mb-4 border ${
              isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold">পাসওয়ার্ড পরিবর্তন করুন</h4>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}>
              {/* Decoy fields to block browser autofill */}
              <div style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1, overflow: 'hidden' }} aria-hidden="true">
                <input type="text" name="fake_pass_user" tabIndex={-1} autoComplete="off" />
                <input type="password" name="fake_pass_pwd" tabIndex={-1} autoComplete="off" />
              </div>

              {/* Old Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  বর্তমান পাসওয়ার্ড
                </label>
                <input
                  type="text"
                  name="auth_field_curr"
                  id="auth_field_curr"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড লিখুন"
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
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border outline-none mask-password-field ${
                    isDark
                      ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  নতুন পাসওয়ার্ড
                </label>
                <input
                  type="text"
                  name="auth_field_next"
                  id="auth_field_next"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
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
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border outline-none mask-password-field ${
                    isDark
                      ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  নতুন পাসওয়ার্ড পুনরায় লিখুন
                </label>
                <input
                  type="text"
                  name="auth_field_conf"
                  id="auth_field_conf"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
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
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border outline-none mask-password-field ${
                    isDark
                      ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-98"
              >
                পাসওয়ার্ড সেভ করুন
              </button>
            </form>
          </div>
        )}

        {/* 4. Quick Actions */}
        <div className="space-y-2 mb-4">
          {isPwaApp && onDisguiseLockNow && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDisguiseLockNow();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>তাৎক্ষণিক গোপন লক করুন (Stealth Lock)</span>
            </button>
          )}

          {enabled && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockNow();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>ওয়েবসাইট এখনই লক করুন (Lock Now)</span>
            </button>
          )}
        </div>

        {/* Close Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
