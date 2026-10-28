import React, { useState } from 'react';
import { X, Settings, Download, Upload, Clock, Calendar, Check, AlertTriangle, RotateCcw } from 'lucide-react';
import { UserSettings } from '../types';
import { exportBackupJson, importBackupJson } from '../utils/storage';
import { toBengaliNumber } from '../utils/hijri';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onRefreshData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onRefreshData
}) => {
  if (!isOpen) return null;

  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleOffsetChange = (offset: number) => {
    setLocalSettings({ ...localSettings, hijriOffsetDays: offset });
  };

  const handlePrayerTimeChange = (key: keyof UserSettings['prayerTimes'], val: string) => {
    setLocalSettings({
      ...localSettings,
      prayerTimes: {
        ...localSettings.prayerTimes,
        [key]: val
      }
    });
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleExport = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safezone-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJson(content);
        if (success) {
          setImportStatus('সফলভাবে ডেটা রিস্টোর করা হয়েছে!');
          onRefreshData();
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('ফাইলটি সঠিক নয়। দয়া করে বৈধ ব্যাকআপ ফাইল নির্বাচন করুন।');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">সেটিংস ও ওয়াক্ত কনফিগারেশন</h3>
            <p className="text-xs text-slate-400">হিজরি তারিখ সমন্বয় ও স্থানীয় সালাতের সময়সূচি</p>
          </div>
        </div>

        {/* 1. Hijri Date Moon Sighting Adjustment */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            <span>হিজরি চাঁদ দেখা সমন্বয় (Moon Sighting Offset):</span>
          </label>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            বাংলাদেশের স্থানীয় চাঁদ দেখা কমিটির তারিখ অনুযায়ী যদি ১ দিন আগে বা পরে হয়, তবে এখান থেকে সহজেই সমন্বয় করতে পারবেন:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: -1, label: '-১ দিন (১ দিন কমান)' },
              { val: 0, label: '০ (আন্তর্জাতিক স্ট্যান্ডার্ড)' },
              { val: 1, label: '+১ দিন (১ দিন বাড়ান)' }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleOffsetChange(opt.val)}
                className={`p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  localSettings.hijriOffsetDays === opt.val
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Prayer Times Settings */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span>ওয়াক্ত ও সালাতের সময়সূচি (আপনার এলাকা অনুযায়ী):</span>
          </label>
          <p className="text-xs text-slate-400 mb-3">
            মাগরিবের সময় থেকেই পরবর্তী হিজরি দিনের চক্র গণনা শুরু হয়।
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">ফজর (Fajr):</label>
              <input
                type="time"
                value={localSettings.prayerTimes.fajr}
                onChange={(e) => handlePrayerTimeChange('fajr', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">জোহর (Dhuhr):</label>
              <input
                type="time"
                value={localSettings.prayerTimes.dhuhr}
                onChange={(e) => handlePrayerTimeChange('dhuhr', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">আসর (Asr):</label>
              <input
                type="time"
                value={localSettings.prayerTimes.asr}
                onChange={(e) => handlePrayerTimeChange('asr', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-emerald-400 font-bold block mb-1">মাগরিব (সূর্যাস্ত/দিনের শুরু):</label>
              <input
                type="time"
                value={localSettings.prayerTimes.maghrib}
                onChange={(e) => handlePrayerTimeChange('maghrib', e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">এশা (Isha):</label>
              <input
                type="time"
                value={localSettings.prayerTimes.isha}
                onChange={(e) => handlePrayerTimeChange('isha', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Backup & Restore */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            ডেটা ব্যাকআপ ও রিস্টোর (১০০% প্রাইভেট):
          </label>
          <p className="text-xs text-slate-400 mb-3">
            আপনার সকল সেফজোন ডেটা আপনার ডিভাইসের ব্রাউজারেই সংরক্ষিত থাকে। আপনি চাইলে ব্যাকআপ ফাইল ডাউনলোড করে রাখতে পারেন।
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ব্যাকআপ ডাউনলোড (JSON)</span>
            </button>

            <label className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>ব্যাকআপ ফাইল রিস্টোর</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <p className="mt-2 text-xs text-emerald-400 font-medium">
              {importStatus}
            </p>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
