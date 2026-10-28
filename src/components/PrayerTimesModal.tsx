import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Sunset, 
  Sunrise, 
  Sun, 
  Moon, 
  Check, 
  Sliders, 
  RotateCcw,
  MapPin,
  Sparkles
} from 'lucide-react';
import { PrayerTimes } from '../types';
import { 
  BD_DISTRICTS, 
  formatTimeTo12HourBn, 
  toBnDigit 
} from '../utils/prayerTimes';

interface PrayerTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerTimes: PrayerTimes;
  currentIntervalId?: string;
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  customMaghribTime: string | null;
  onUpdateCustomMaghrib: (timeStr: string | null) => void;
  isDark: boolean;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({
  isOpen,
  onClose,
  prayerTimes,
  currentIntervalId,
  selectedDistrictId,
  onSelectDistrict,
  customMaghribTime,
  onUpdateCustomMaghrib,
  isDark,
}) => {
  const [manualTime, setManualTime] = useState<string>(
    customMaghribTime || prayerTimes.maghrib || '17:48'
  );
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(!!customMaghribTime);

  if (!isOpen) return null;

  const handleSaveCustom = () => {
    if (isEditingCustom && manualTime) {
      onUpdateCustomMaghrib(manualTime);
    } else {
      onUpdateCustomMaghrib(null);
    }
    onClose();
  };

  const handleResetToAuto = () => {
    setIsEditingCustom(false);
    onUpdateCustomMaghrib(null);
  };

  const items = [
    {
      id: 'fajr',
      nameBn: 'ফজর',
      nameAr: 'الفجر',
      time: prayerTimes.fajr,
      icon: <Sunrise className="w-4 h-4 text-teal-400" />,
      note: 'সুবহে সাদিক',
    },
    {
      id: 'sunrise',
      nameBn: 'সূর্যোদয়',
      nameAr: 'الشروق',
      time: prayerTimes.sunrise,
      icon: <Sun className="w-4 h-4 text-amber-300" />,
      note: 'নামাজ নিষিদ্ধ সময়',
    },
    {
      id: 'dhuhr',
      nameBn: 'জোহর',
      nameAr: 'الظهر',
      time: prayerTimes.dhuhr,
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      note: 'দ্বিপ্রহর পরবর্তী',
    },
    {
      id: 'asr',
      nameBn: 'আসর',
      nameAr: 'العصر',
      time: prayerTimes.asr,
      icon: <Sunset className="w-4 h-4 text-orange-400" />,
      note: 'হানাফী মানদণ্ড',
    },
    {
      id: 'maghrib',
      nameBn: 'মাগরিব',
      nameAr: 'المغرب',
      time: prayerTimes.maghrib,
      icon: <Sunset className="w-4 h-4 text-rose-400" />,
      note: 'সূর্যাস্ত • হিজরি দিনের শুরু',
      isMaghrib: true,
    },
    {
      id: 'isha',
      nameBn: 'এশা',
      nameAr: 'العشاء',
      time: prayerTimes.isha,
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      note: 'রাত্রিকালীন সালাত',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col ${
          isDark 
            ? 'bg-slate-950/95 border-emerald-500/20 text-slate-100' 
            : 'bg-white/95 border-emerald-600/20 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5">
                <span>নামাজের ওয়াক্ত ও সময়সূচি</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  বাংলাদেশ
                </span>
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                সূর্যাস্ত ও ঋতু পরিবর্তনের সাথে স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* District Selector */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-slate-900/60 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">জেলা নির্বাচন:</span>
            </div>
            <select
              value={selectedDistrictId}
              onChange={(e) => onSelectDistrict(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer outline-none transition-colors ${
                isDark 
                  ? 'bg-slate-800 border-white/10 text-slate-100 focus:border-emerald-500' 
                  : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-600'
              }`}
            >
              {BD_DISTRICTS.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.nameBn}
                </option>
              ))}
            </select>
          </div>

          {/* Prayer Times Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all relative overflow-hidden ${
                  item.isMaghrib
                    ? isDark
                      ? 'bg-gradient-to-br from-amber-950/40 to-slate-900/80 border-amber-500/40 ring-1 ring-amber-500/30'
                      : 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/20'
                    : isDark
                    ? 'bg-slate-900/50 border-white/5'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {item.icon}
                    <span className="font-bold text-xs sm:text-sm">{item.nameBn}</span>
                  </div>
                  <span className={`text-[10px] font-arabic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.nameAr}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black tracking-tight text-emerald-400">
                  {formatTimeTo12HourBn(item.time)}
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className={item.isMaghrib ? 'text-amber-400 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'}>
                    {item.note}
                  </span>
                  <span className={`font-mono text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Maghrib Customization Section */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold">মাগরিব সূর্যাস্ত সমন্বয়</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCustom(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !isEditingCustom
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  স্বয়ংক্রিয় হিসাব
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingCustom(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isEditingCustom
                      ? 'bg-amber-600 text-white shadow-sm'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ম্যানুয়াল সময়
                </button>
              </div>
            </div>

            {isEditingCustom ? (
              <div className="space-y-2.5 pt-2 border-t border-white/5">
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  আপনার স্থানীয় মসজিদের আজানের সময় অনুযায়ী মাগরিবের সময় নির্ধারণ করুন:
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm font-bold font-mono outline-none ${
                      isDark 
                        ? 'bg-slate-800 border-white/10 text-amber-300 focus:border-amber-500' 
                        : 'bg-white border-slate-300 text-amber-700 focus:border-amber-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-amber-400">
                    ({formatTimeTo12HourBn(manualTime)})
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToAuto}
                    title="স্বয়ংক্রিয় সৌর হিসেবে ফিরে যান"
                    className={`ml-auto p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDark 
                        ? 'border-white/10 hover:bg-slate-800 text-slate-300' 
                        : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>অটো রিসেট</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>বর্তমানে NOAA সৌর অ্যালগরিদমে প্রতিদিনের সূর্যাস্ত স্বয়ংক্রিয়ভাবে হিসাব হচ্ছে।</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 shrink-0 ${
          isDark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSaveCustom}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
