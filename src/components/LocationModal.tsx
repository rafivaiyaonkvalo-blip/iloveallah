import React, { useState } from 'react';
import { X, MapPin, Navigation, Check, Globe, RefreshCw, Sun, Moon, Clock } from 'lucide-react';
import { UserLocation, POPULAR_CITIES, saveUserLocation, toBn } from '../utils/calendarService';
import { PrayerTimes } from '../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: UserLocation;
  prayerTimes: PrayerTimes;
  onSelectLocation: (loc: UserLocation) => void;
  isDark?: boolean;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  prayerTimes,
  onSelectLocation,
  isDark = true,
}) => {
  if (!isOpen) return null;

  const [customCity, setCustomCity] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<string | null>(null);

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setDetectMsg('আপনার ব্রাউজার জিপিএস সাপোর্ট করে না। নিচে থেকে শহর বেছে নিন।');
      return;
    }

    setIsDetecting(true);
    setDetectMsg('জিপিএস লোকেশন খোঁজা হচ্ছে...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const detectedLoc: UserLocation = {
          city: 'My Location',
          country: 'Local',
          latitude: lat,
          longitude: lng,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka',
          displayName: `জিপিএস কোঅর্ডিনেট (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
          source: 'gps',
        };
        saveUserLocation(detectedLoc);
        onSelectLocation(detectedLoc);
        setIsDetecting(false);
        setDetectMsg('সফলভাবে আপনার বর্তমান লোকেশন সনাক্ত ও সিঙ্ক করা হয়েছে!');
        setTimeout(() => {
          setDetectMsg(null);
          onClose();
        }, 1200);
      },
      (err) => {
        setIsDetecting(false);
        setDetectMsg('জিপিএস পারমিশন পাওয়া যায়নি। তালিকা থেকে শহর নির্বাচন করুন।');
        setTimeout(() => setDetectMsg(null), 3500);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPopular = (cityItem: typeof POPULAR_CITIES[0]) => {
    const newLoc: UserLocation = {
      city: cityItem.city,
      country: cityItem.country,
      latitude: cityItem.lat,
      longitude: cityItem.lng,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka',
      displayName: cityItem.nameBn,
      source: 'manual',
    };
    saveUserLocation(newLoc);
    onSelectLocation(newLoc);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCity.trim()) return;

    const newLoc: UserLocation = {
      city: customCity.trim(),
      country: customCountry.trim() || 'Bangladesh',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka',
      displayName: `${customCity.trim()}, ${customCountry.trim() || 'Bangladesh'}`,
      source: 'manual',
    };
    saveUserLocation(newLoc);
    onSelectLocation(newLoc);
    onClose();
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">লোকেশন ও ওয়াক্ত সেটিংস</h3>
            <p className="text-xs text-slate-400">আসল ইসলামিক ক্যালেন্ডার ও স্থানীয় ওয়াক্তের সময়সূচি</p>
          </div>
        </div>

        {/* Live Calendar Connection Status Badge */}
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="text-xs">
            <span className="font-bold text-emerald-400 block">
              আল-আধান (Aladhan) অফিসিয়াল ইসলামিক ক্যালেন্ডার
            </span>
            <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              বর্তমান লোকেশন: <strong className="text-emerald-300">{currentLocation.displayName}</strong>
            </span>
          </div>
        </div>

        {/* Today's local prayer times */}
        <div
          className={`p-3.5 rounded-2xl mb-4 border ${
            isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-slate-400">
            আজকের স্থানীয় ওয়াক্তের সময়সূচি
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block">ফজর</span>
              <span className="font-bold text-emerald-400">{toBn(prayerTimes.fajr)}</span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block">জোহর</span>
              <span className="font-bold text-emerald-400">{toBn(prayerTimes.dhuhr)}</span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block">আসর</span>
              <span className="font-bold text-emerald-400">{toBn(prayerTimes.asr)}</span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-amber-400 font-semibold block">মাগরিব</span>
              <span className="font-bold text-amber-300">{toBn(prayerTimes.maghrib)}</span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 block">এশা</span>
              <span className="font-bold text-emerald-400">{toBn(prayerTimes.isha)}</span>
            </div>
          </div>
        </div>

        {/* GPS Auto Detect Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGpsDetect}
            disabled={isDetecting}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'সনাক্ত করা হচ্ছে...' : 'বর্তমান GPS লোকেশন অটো সনাক্ত করুন'}</span>
          </button>

          {detectMsg && (
            <p className="text-[11px] text-emerald-400 mt-2 text-center animate-fadeIn">
              {detectMsg}
            </p>
          )}
        </div>

        {/* Popular Cities Grid */}
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-slate-400">
            জনপ্রিয় শহরসমূহ
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {POPULAR_CITIES.map((c) => {
              const isSelected = currentLocation.city.toLowerCase() === c.city.toLowerCase();
              return (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => handleSelectPopular(c)}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                      : isDark
                      ? 'bg-slate-950/60 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-emerald-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{c.nameBn}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom City Form */}
        <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-white/5">
          <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-slate-400">
            অন্য যেকোনো শহর লিখুন
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="শহরের নাম (যেমন: Bogra, Comilla)"
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border outline-none ${
                isDark
                  ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 cursor-pointer"
            >
              সেট করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
