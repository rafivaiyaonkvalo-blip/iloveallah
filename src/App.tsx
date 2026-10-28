import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, 
  Check, 
  X, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  AlertTriangle, 
  Moon, 
  Sun, 
  Sunset, 
  Sunrise, 
  CalendarDays,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Cloud,
  Lock,
  Key,
  Calculator as CalcIcon,
  Lightbulb,
  Heart,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Headphones,
  Zap,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getRealHijriMonthCalendar, 
  CALENDAR_WEEKDAYS_SHORT, 
  CALENDAR_WEEKDAYS_FULL,
  getWeekdayForHijriKey
} from './utils/hijri';
import { HalalBackground } from './components/HalalBackground';
import { AnimatedSplashIntro } from './components/AnimatedSplashIntro';
import { ToolsView } from './components/ToolsView';
import { LockScreen } from './components/LockScreen';
import { CalculatorDisguise } from './components/CalculatorDisguise';
import { SecurityModal } from './components/SecurityModal';
import { PrayerTimesModal } from './components/PrayerTimesModal';
import { TipsSlider } from './components/TipsSlider';
import { TipsLibrarySection } from './components/TipsLibrarySection';
import { TipPopup } from './components/TipPopup';
import { EarbudsTimeModal } from './components/EarbudsTimeModal';
import { InstantAmalCard } from './components/InstantAmalCard';
import { TawhidStatusModal } from './components/TawhidStatusModal';
import { TawhidLevelAmalsModal } from './components/TawhidLevelAmalsModal';
import { TawhidLevelUpPopup } from './components/TawhidLevelUpPopup';
import { getSpiritualLevel, SPIRITUAL_LEVELS, getLocalDateStr, DAILY_EXP_GOAL } from './data/instantAmals';
import { EMPTY_GAMIFICATION, normalizeGamification, applyAmalCompletion, mergeGamification, DAILY_GOAL_BONUS } from './utils/gamification';
import { 
  calculateBangladeshPrayerTimes, 
  formatTimeTo12HourBn, 
  BD_DISTRICTS 
} from './utils/prayerTimes';
import { PrayerTimes, TipItem, TipPopupFrequency, InstantAmalItem, UserGamificationState, CompletedAmalRecord } from './types';
import { DEFAULT_TIPS } from './utils/defaultTips';
import { fetchSupabaseState, saveSupabaseState, subscribeToSupabase } from './utils/dbSync';

type IntervalId = 'maghrib_isha' | 'isha_fajr' | 'fajr_dhuhr' | 'dhuhr_asr' | 'asr_maghrib';
type Status = 'safe' | 'unsafe' | null;

interface IntervalPair {
  id: IntervalId;
  startWaqt: string;
  startArabic: string;
  endWaqt: string;
  endArabic: string;
  startIcon: React.ReactNode;
  endIcon: React.ReactNode;
  colorClass: string;
}

const INTERVAL_PAIRS: IntervalPair[] = [
  { 
    id: 'maghrib_isha', 
    startWaqt: 'মাগরিব', 
    startArabic: 'المغرب',
    endWaqt: 'এশা', 
    endArabic: 'العشاء',
    startIcon: <Sunset className="w-4 h-4 text-amber-500" />,
    endIcon: <Moon className="w-4 h-4 text-indigo-400" />,
    colorClass: 'text-amber-500'
  },
  { 
    id: 'isha_fajr', 
    startWaqt: 'এশা', 
    startArabic: 'العشاء',
    endWaqt: 'ফজর', 
    endArabic: 'الفجر',
    startIcon: <Moon className="w-4 h-4 text-indigo-400" />,
    endIcon: <Sunrise className="w-4 h-4 text-teal-400" />,
    colorClass: 'text-indigo-400'
  },
  { 
    id: 'fajr_dhuhr', 
    startWaqt: 'ফজর', 
    startArabic: 'الفجر',
    endWaqt: 'জোহর', 
    endArabic: 'الظهر',
    startIcon: <Sunrise className="w-4 h-4 text-teal-400" />,
    endIcon: <Sun className="w-4 h-4 text-amber-400" />,
    colorClass: 'text-teal-400'
  },
  { 
    id: 'dhuhr_asr', 
    startWaqt: 'জোহর', 
    startArabic: 'الظهر',
    endWaqt: 'আসর', 
    endArabic: 'العصر',
    startIcon: <Sun className="w-4 h-4 text-yellow-500" />,
    endIcon: <Sunset className="w-4 h-4 text-orange-400" />,
    colorClass: 'text-yellow-500'
  },
  { 
    id: 'asr_maghrib', 
    startWaqt: 'আসর', 
    startArabic: 'العصر',
    endWaqt: 'মাগরিব', 
    endArabic: 'المغرب',
    startIcon: <Sunset className="w-4 h-4 text-orange-400" />,
    endIcon: <Sunset className="w-4 h-4 text-amber-400" />,
    colorClass: 'text-orange-400'
  },
];

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBn(num: number | string): string {
  return String(num).replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)] || d);
}

const HIJRI_MONTHS = [
  'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 
  'জুমাদাল উলা', 'জুমাদাল উখরা', 'রজব', 'শাবান', 
  'রমাদান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
];

const BENGALI_WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

export type TimeRange = '1d' | '2d' | '3d' | '7d' | '14d' | '30d' | '40d' | 'all';

interface TimeRangeOption {
  id: TimeRange;
  label: string;
  badge: string;
  days: number;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { id: '1d', label: '১ দিন', badge: 'আজকের দিন', days: 1 },
  { id: '2d', label: '২ দিন', badge: 'বিগত ২ দিন', days: 2 },
  { id: '3d', label: '৩ দিন', badge: 'বিগত ৩ দিন', days: 3 },
  { id: '7d', label: '৭ দিন', badge: '১ সপ্তাহ', days: 7 },
  { id: '14d', label: '১৪ দিন', badge: '২ সপ্তাহ', days: 14 },
  { id: '30d', label: '৩০ দিন', badge: '১ মাস', days: 30 },
  { id: '40d', label: '৪০ দিন', badge: '৪০ দিন', days: 40 },
  { id: 'all', label: 'সর্বমোট', badge: 'সব রেকর্ড', days: -1 },
];

const BD_OFFSET_DAYS = -1;

function getHijriInfo(
  date: Date, 
  offsetDays: number = BD_OFFSET_DAYS, 
  maghribTimeStr?: string
) {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const effectiveMaghribStr = maghribTimeStr || calculateBangladeshPrayerTimes(date).maghrib;
  const [mH, mM] = effectiveMaghribStr.split(':').map(Number);
  const maghribMinutes = (mH || 17) * 60 + (mM || 48);
  const isPostMaghrib = currentMinutes >= maghribMinutes;

  const targetDate = new Date(date.getTime());
  if (isPostMaghrib) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  if (offsetDays !== 0) {
    targetDate.setDate(targetDate.getDate() + offsetDays);
  }

  let hDay = 18;
  let hMonth = 4;
  let hYear = 1448;

  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(targetDate);
    for (const part of parts) {
      if (part.type === 'day') hDay = parseInt(part.value, 10);
      if (part.type === 'month') hMonth = parseInt(part.value, 10);
      if (part.type === 'year') hYear = parseInt(part.value, 10);
    }
  } catch {
    // fallback
  }

  const monthName = HIJRI_MONTHS[(hMonth - 1) % 12] || 'রবিউস সানি';
  const hijriKey = `${hYear}-${String(hMonth).padStart(2, '0')}-${String(hDay).padStart(2, '0')}`;
  const formatted = `${toBn(hDay)} ${monthName}, ${toBn(hYear)} হিজরি`;
  const weekdayName = getWeekdayForHijriKey(hijriKey, offsetDays);

  return { 
    hijriKey, 
    formatted, 
    dayNum: hDay, 
    monthNum: hMonth, 
    monthName, 
    yearNum: hYear, 
    isPostMaghrib,
    weekdayName,
    fullFormattedWithWeekday: `${formatted} • ${weekdayName}`
  };
}

function getActiveIntervalId(date: Date, pt?: PrayerTimes): IntervalId {
  const cur = date.getHours() * 60 + date.getMinutes();
  const times = pt || {
    fajr: '04:45',
    sunrise: '05:55',
    dhuhr: '12:00',
    asr: '16:15',
    maghrib: '17:50',
    isha: '19:15'
  };

  const [fH, fM] = (times.fajr || '04:45').split(':').map(Number);
  const [dH, dM] = (times.dhuhr || '12:00').split(':').map(Number);
  const [aH, aM] = (times.asr || '16:15').split(':').map(Number);
  const [mH, mM] = (times.maghrib || '17:50').split(':').map(Number);
  const [iH, iM] = (times.isha || '19:15').split(':').map(Number);

  const fajr = (fH || 4) * 60 + (fM || 45);
  const dhuhr = (dH || 12) * 60 + (dM || 0);
  const asr = (aH || 16) * 60 + (aM || 15);
  const maghrib = (mH || 17) * 60 + (mM || 50);
  const isha = (iH || 19) * 60 + (iM || 15);

  if (cur >= maghrib && cur < isha) return 'maghrib_isha';
  if (cur >= isha || cur < fajr) return 'isha_fajr';
  if (cur >= fajr && cur < dhuhr) return 'fajr_dhuhr';
  if (cur >= dhuhr && cur < asr) return 'dhuhr_asr';
  return 'asr_maghrib';
}

type DayData = Record<IntervalId, Status>;

const mergeHistoryData = (localHist: Record<string, DayData>, remoteHist: Record<string, DayData>): Record<string, DayData> => {
  const merged: Record<string, DayData> = { ...remoteHist };
  for (const [dateKey, localDay] of Object.entries(localHist)) {
    if (!merged[dateKey]) {
      merged[dateKey] = { ...localDay };
    } else {
      const remoteDay = merged[dateKey];
      const mergedDay = { ...remoteDay };
      for (const [waqt, val] of Object.entries(localDay)) {
        if (val !== null && val !== undefined) {
          mergedDay[waqt as keyof DayData] = val;
        }
      }
      merged[dateKey] = mergedDay;
    }
  }
  return merged;
};

const mergeHabitData = (
  localHabits: Record<string, Record<string, boolean>>,
  remoteHabits: Record<string, Record<string, boolean>>
): Record<string, Record<string, boolean>> => {
  const merged = { ...remoteHabits };
  for (const [dateKey, localDay] of Object.entries(localHabits)) {
    if (!merged[dateKey]) {
      merged[dateKey] = { ...localDay };
    } else {
      merged[dateKey] = { ...merged[dateKey], ...localDay };
    }
  }
  return merged;
};

const mergeNumberHabitData = (
  localHabits: Record<string, Record<string, number>>,
  remoteHabits: Record<string, Record<string, number>>
): Record<string, Record<string, number>> => {
  const merged = { ...remoteHabits };
  for (const [dateKey, localDay] of Object.entries(localHabits)) {
    if (!merged[dateKey]) {
      merged[dateKey] = { ...localDay };
    } else {
      merged[dateKey] = { ...merged[dateKey], ...localDay };
    }
  }
  return merged;
};

const formatEarbudMinutesBn = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '০ মি.';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${toBn(hrs)} ঘ. ${toBn(mins)} মি.`;
  if (hrs > 0) return `${toBn(hrs)} ঘণ্টা`;
  return `${toBn(mins)} মি.`;
};

export const App: React.FC = () => {
  const [view, setView] = useState<'tracker' | 'analytics' | 'tools'>('tracker');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentCustomTipIdx, setCurrentCustomTipIdx] = useState(0);
  const [isAddingTrackerTip, setIsAddingTrackerTip] = useState(false);
  const [trackerTipText, setTrackerTipText] = useState('');
  const [trackerTipDalil, setTrackerTipDalil] = useState('');

  // Intro Splash state (shown on launch, skip with ?nosplash=1)
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return !window.location.search.includes('nosplash=1');
    } catch {
      return true;
    }
  });
  const [introClosing, setIntroClosing] = useState<boolean>(false);

  // Listen for replay intro triggers
  useEffect(() => {
    const handleReplay = () => {
      setIntroClosing(false);
      setShowIntro(true);
    };
    window.addEventListener('sz_replay_intro', handleReplay);
    window.addEventListener('uls_replay_intro', handleReplay);
    return () => {
      window.removeEventListener('sz_replay_intro', handleReplay);
      window.removeEventListener('uls_replay_intro', handleReplay);
    };
  }, []);

  // Security & Password states (Synced centrally across all browsers/devices)
  const [isPasswordEnabled, setIsPasswordEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sz_pass_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [savedPassword, setSavedPassword] = useState<string>(() => {
    const saved = localStorage.getItem('sz_pass_hash');
    return saved || 'iloveAllah';
  });

  // Calculator disguise secret PIN - permanently fixed to '313' forever (cannot be changed)
  const PERMANENT_CALC_PIN = '313';
  const [savedPin] = useState<string>(() => {
    try {
      localStorage.setItem('sz_calc_pin', '313');
    } catch {}
    return '313';
  });

  // Detect if running as standalone installed PWA app on Android or PC
  const isPwaApp = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    new URLSearchParams(window.location.search).get('source') === 'pwa'
  );

  // Default to true so newly opened browsers aren't immediately blocked before server sync responds
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const savedUnlocked = localStorage.getItem('sz_unlocked');
    return savedUnlocked !== null ? JSON.parse(savedUnlocked) : true;
  });

  // Disguise lock state: active in installed Android & iOS PWA app
  const [isDisguiseLocked, setIsDisguiseLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        new URLSearchParams(window.location.search).get('source') === 'pwa';
      if (!isStandalone) {
        try { localStorage.removeItem('sz_disguise_locked'); } catch {}
        return false;
      }
      // In installed PWA app, always start locked on launch
      return true;
    }
    return false;
  });

  // Auto-lock into Calculator disguise whenever user exits, minimizes, or switches apps on Android / iOS
  useEffect(() => {
    if (!isPwaApp) return;

    const triggerDisguiseLock = () => {
      setIsDisguiseLocked(true);
      setIsUnlocked(false);
      try {
        localStorage.setItem('sz_disguise_locked', 'true');
        localStorage.setItem('sz_unlocked', 'false');
      } catch {}
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerDisguiseLock();
      }
    };

    const handlePageHide = () => {
      triggerDisguiseLock();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('freeze' as any, triggerDisguiseLock);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('freeze' as any, triggerDisguiseLock);
    };
  }, [isPwaApp]);

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Broadcast channel for instantaneous cross-tab synchronization
  const broadcastUpdate = (payload: { records?: Record<string, DayData>; security?: any }) => {
    try {
      const bc = new BroadcastChannel('sz_cross_sync');
      bc.postMessage({ type: 'STATE_UPDATE', ...payload });
      bc.close();
    } catch {
      // BroadcastChannel not available or error
    }
  };

  const handleUnlockDisguise = async () => {
    setIsDisguiseLocked(false);
    setIsUnlocked(true);
    hasTriggeredTipPopupRef.current = false;
    localStorage.setItem('sz_disguise_locked', 'false');
    localStorage.setItem('sz_unlocked', 'true');
    broadcastUpdate({ security: { isUnlocked: true } });
    savePartialSecurityToServer({ isUnlocked: true });
  };

  const handleLockDisguise = async () => {
    setIsDisguiseLocked(true);
    setIsUnlocked(false);
    localStorage.setItem('sz_disguise_locked', 'true');
    localStorage.setItem('sz_unlocked', 'false');
    broadcastUpdate({ security: { isUnlocked: false } });
    savePartialSecurityToServer({ isUnlocked: false });
  };

  const handleUpdateSecurity = async (enabled: boolean, newPassword?: string, _newPin?: string) => {
    setIsPasswordEnabled(enabled);
    localStorage.setItem('sz_pass_enabled', JSON.stringify(enabled));
    if (newPassword) {
      setSavedPassword(newPassword);
      localStorage.setItem('sz_pass_hash', newPassword);
    }
    localStorage.setItem('sz_calc_pin', PERMANENT_CALC_PIN);
    const nextUnlocked = !enabled ? true : isUnlocked;
    if (!enabled) {
      setIsUnlocked(true);
      localStorage.setItem('sz_unlocked', 'true');
    }

    const secPayload = {
      isPasswordEnabled: enabled,
      savedPassword: newPassword || savedPassword,
      savedPin: PERMANENT_CALC_PIN,
      isUnlocked: nextUnlocked,
    };

    broadcastUpdate({ security: secPayload });
    savePartialSecurityToServer(secPayload);
  };

  const handleLockNow = async () => {
    setIsUnlocked(false);
    localStorage.setItem('sz_unlocked', 'false');
    broadcastUpdate({ security: { isUnlocked: false } });
    savePartialSecurityToServer({ isUnlocked: false });
  };
  const [now, setNow] = useState(new Date());
  const offsetDays = BD_OFFSET_DAYS;

  // Clean Theme Toggle: 'dark' | 'light' (Zero text, instant flip)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sz_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sz_theme', next);
  };

  const [history, setHistory] = useState<Record<string, DayData>>(() => {
    try {
      const saved = localStorage.getItem('sz_simple_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [zikrHistory, setZikrHistory] = useState<Record<string, Record<IntervalId, boolean>>>(() => {
    try {
      const saved = localStorage.getItem('sz_zikr_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [earlyHistory, setEarlyHistory] = useState<Record<string, Record<IntervalId, boolean>>>(() => {
    try {
      const saved = localStorage.getItem('sz_early_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [khushuHistory, setKhushuHistory] = useState<Record<string, Record<IntervalId, boolean>>>(() => {
    try {
      const saved = localStorage.getItem('sz_khushu_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [earbudsHistory, setEarbudsHistory] = useState<Record<string, Record<IntervalId, number>>>(() => {
    try {
      const saved = localStorage.getItem('sz_earbuds_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingEarbudInterval, setEditingEarbudInterval] = useState<IntervalId | null>(null);

  // Tawhid System Gamification & Instant Amal State
  const [gamification, setGamification] = useState<UserGamificationState>(() => {
    try {
      const saved = localStorage.getItem('sz_gamification');
      if (saved) return normalizeGamification({ ...EMPTY_GAMIFICATION(), ...JSON.parse(saved) });
    } catch {}
    return EMPTY_GAMIFICATION();
  });
  const [goalBonusToast, setGoalBonusToast] = useState<boolean>(false);

  // অ্যাপ খোলা অবস্থায় মধ্যরাত পেরোলে আজকের হিসাব নিজে থেকে শূন্য হবে
  useEffect(() => {
    const tick = () => setGamification(prev => normalizeGamification(prev));
    const id = window.setInterval(tick, 60000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, []);

  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [selectedLevelIdForAmals, setSelectedLevelIdForAmals] = useState<number | null>(null);
  const [isLevelAmalsModalOpen, setIsLevelAmalsModalOpen] = useState<boolean>(false);

  // Level-Up popup state
  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: typeof SPIRITUAL_LEVELS[0]; prevLevel: typeof SPIRITUAL_LEVELS[0] | null } | null>(null);
  const prevLevelIdRef = useRef<number>(gamification.currentLevelId || 1);

  const handleOpenLevelAmals = (levelId: number) => {
    setSelectedLevelIdForAmals(levelId);
    setIsLevelAmalsModalOpen(true);
  };

  // Detect level-up and trigger celebration popup
  useEffect(() => {
    const currentId = gamification.currentLevelId || 1;
    const prevId = prevLevelIdRef.current;
    if (currentId > prevId) {
      const newLvl = SPIRITUAL_LEVELS.find(l => l.id === currentId) || null;
      const prevLvl = SPIRITUAL_LEVELS.find(l => l.id === prevId) || null;
      if (newLvl) {
        setLevelUpInfo({ newLevel: newLvl, prevLevel: prevLvl });
      }
    }
    prevLevelIdRef.current = currentId;
  }, [gamification.currentLevelId]);

  const handleCompleteInstantAmal = (amal: InstantAmalItem) => {
    const { next, goalBonusAwarded } = applyAmalCompletion(gamification, amal);

    // সাইড-ইফেক্ট একবারই চলবে (state updater-এর ভেতরে নয়)
    setGamification(next);
    try { localStorage.setItem('sz_gamification', JSON.stringify(next)); } catch {}
    broadcastUpdate({ security: { gamification: next } });
    saveRecordsToServer(history, zikrHistory, khushuHistory, earbudsHistory, next);

    if (goalBonusAwarded) {
      setGoalBonusToast(true);
      window.setTimeout(() => setGoalBonusToast(false), 4000);
    }
  };

  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [isServerLoaded, setIsServerLoaded] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);
  const lastLocalEditTimeRef = useRef<number>(0);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Personal Tips State & 2000+ Quran/Hadith Library
  const [tipsList, setTipsList] = useState<TipItem[]>(() => {
    try {
      const saved = localStorage.getItem('sz_user_tips');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length >= 1000) return parsed;
          const userOnly = parsed.filter(t => t.id && !t.id.startsWith('qh-') && !t.id.startsWith('tip-'));
          if (userOnly.length > 0) {
            return [...userOnly, ...DEFAULT_TIPS];
          }
        }
      }
    } catch {}
    return DEFAULT_TIPS;
  });

  const [favoriteTipIds, setFavoriteTipIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sz_favorite_tips');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [tipPopupFrequency, setTipPopupFrequency] = useState<TipPopupFrequency>(() => {
    try {
      const saved = localStorage.getItem('sz_tip_popup_freq');
      if (saved === 'every_time' || saved === 'once_a_day' || saved === 'off') {
        return saved;
      }
    } catch {}
    return 'every_time';
  });

  const [isTipPopupOpen, setIsTipPopupOpen] = useState(false);
  const hasTriggeredTipPopupRef = useRef(false);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(() => {
    try {
      return localStorage.getItem('sz_bd_district') || 'dhaka';
    } catch {
      return 'dhaka';
    }
  });

  const [customMaghribTime, setCustomMaghribTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sz_custom_maghrib');
    } catch {
      return null;
    }
  });

  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

  // Dynamic seasonal prayer times for selected district in Bangladesh
  const activeDistrict = BD_DISTRICTS.find((d) => d.id === selectedDistrictId) || BD_DISTRICTS[0];
  const dynamicPrayerTimes = useMemo(() => {
    return calculateBangladeshPrayerTimes(now, activeDistrict.lat, activeDistrict.lng);
  }, [now, activeDistrict]);

  const prayerTimes: PrayerTimes = useMemo(() => {
    if (customMaghribTime) {
      return {
        ...dynamicPrayerTimes,
        maghrib: customMaghribTime,
      };
    }
    return dynamicPrayerTimes;
  }, [dynamicPrayerTimes, customMaghribTime]);

  const handleSelectDistrict = (distId: string) => {
    setSelectedDistrictId(distId);
    try {
      localStorage.setItem('sz_bd_district', distId);
    } catch {}
  };

  const handleUpdateCustomMaghrib = (timeStr: string | null) => {
    setCustomMaghribTime(timeStr);
    if (timeStr) {
      try {
        localStorage.setItem('sz_custom_maghrib', timeStr);
      } catch {}
    } else {
      try {
        localStorage.removeItem('sz_custom_maghrib');
      } catch {}
    }
  };

  const hijriInfo = getHijriInfo(now, offsetDays, prayerTimes.maghrib);
  const [activeDateKey, setActiveDateKey] = useState<string>(hijriInfo.hijriKey);

  // Month navigation in calendar modal
  const [calYear, setCalYear] = useState<number>(hijriInfo.yearNum);
  const [calMonth, setCalMonth] = useState<number>(hijriInfo.monthNum);

  const openCalendar = () => {
    const [y, m] = (activeDateKey || hijriInfo.hijriKey).split('-').map(Number);
    setCalYear(y || hijriInfo.yearNum);
    setCalMonth(m || hijriInfo.monthNum);
    setIsCalendarOpen(true);
  };

  const handlePrevMonth = () => {
    if (calMonth === 1) {
      setCalMonth(12);
      setCalYear((prev) => prev - 1);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 12) {
      setCalMonth(1);
      setCalYear((prev) => prev + 1);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  // Sync tips and bookmarks to Supabase database (compact and efficient)
  const syncTipsToServer = (updatedTips: TipItem[], favs?: string[], freq?: TipPopupFrequency) => {
    try {
      const customOnly = updatedTips.filter(t => !t.id.startsWith('qh-'));
      const secPayload = {
        isPasswordEnabled,
        savedPassword,
        savedPin: PERMANENT_CALC_PIN,
        isUnlocked,
        tips: updatedTips.slice(0, 50),
        customTips: customOnly,
        favoriteTips: favs !== undefined ? favs : favoriteTipIds,
        tipsFrequency: freq || tipPopupFrequency,
      };
      saveSupabaseState(history, secPayload);
    } catch {}
  };

  const handleAddTip = (text: string, dalil?: string) => {
    const newTip: TipItem = {
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      text,
      dalil,
      source: 'custom',
      createdAt: Date.now(),
    };
    const updated = [newTip, ...tipsList];
    setTipsList(updated);
    try { localStorage.setItem('sz_user_tips', JSON.stringify(updated)); } catch {}
    syncTipsToServer(updated);
  };

  const handleUpdateTip = (id: string, text: string, dalil?: string) => {
    const updated = tipsList.map((t) => (t.id === id ? { ...t, text, dalil: dalil !== undefined ? dalil : t.dalil } : t));
    setTipsList(updated);
    try { localStorage.setItem('sz_user_tips', JSON.stringify(updated)); } catch {}
    syncTipsToServer(updated);
  };

  const handleDeleteTip = (id: string) => {
    const updated = tipsList.filter((t) => t.id !== id);
    setTipsList(updated);
    try { localStorage.setItem('sz_user_tips', JSON.stringify(updated)); } catch {}
    syncTipsToServer(updated);
  };

  const handleToggleFavoriteTip = (id: string) => {
    const next = favoriteTipIds.includes(id) ? favoriteTipIds.filter((item) => item !== id) : [...favoriteTipIds, id];
    setFavoriteTipIds(next);
    try { localStorage.setItem('sz_favorite_tips', JSON.stringify(next)); } catch {}
    syncTipsToServer(tipsList, next);
  };

  const handleResetDefaultTips = () => {
    setTipsList(DEFAULT_TIPS);
    try { localStorage.setItem('sz_user_tips', JSON.stringify(DEFAULT_TIPS)); } catch {}
    syncTipsToServer(DEFAULT_TIPS);
  };

  const handleChangeTipFrequency = (freq: TipPopupFrequency) => {
    setTipPopupFrequency(freq);
    try { localStorage.setItem('sz_tip_popup_freq', freq); } catch {}
    syncTipsToServer(tipsList, favoriteTipIds, freq);
  };

  // Entrance Tip Popup Effect on App Launch / Unlock
  useEffect(() => {
    if (!isUnlocked || isDisguiseLocked || showIntro || hasTriggeredTipPopupRef.current) {
      return;
    }

    if (tipPopupFrequency === 'off') return;

    if (tipPopupFrequency === 'once_a_day') {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastShown = localStorage.getItem('sz_last_tip_popup_date');
      if (lastShown === todayStr) return;
      localStorage.setItem('sz_last_tip_popup_date', todayStr);
    }

    const timer = setTimeout(() => {
      setIsTipPopupOpen(true);
      hasTriggeredTipPopupRef.current = true;
    }, 900);

    return () => clearTimeout(timer);
  }, [isUnlocked, isDisguiseLocked, showIntro, tipPopupFrequency]);

  // Save records to centralized Supabase database & server storage
  const saveRecordsToServer = async (
    data: Record<string, DayData>,
    overrideZikr?: Record<string, Record<string, boolean>>,
    overrideKhushu?: Record<string, Record<string, boolean>>,
    overrideEarbuds?: Record<string, Record<IntervalId, number>>,
    overrideGamification?: UserGamificationState
  ) => {
    setIsSyncing(true);
    isSyncingRef.current = true;
    try {
      // 1. Direct real-time save to Supabase Database
      const secPayload = {
        isPasswordEnabled,
        savedPassword,
        savedPin: PERMANENT_CALC_PIN,
        isUnlocked,
        tips: tipsList,
        customTips,
        favoriteTips: favoriteTipIds,
        tipsFrequency: tipPopupFrequency,
        zikrHistory: overrideZikr || zikrHistory,
        khushuHistory: overrideKhushu || khushuHistory,
        earbudsHistory: overrideEarbuds || earbudsHistory,
        gamification: overrideGamification || gamification,
      };
      saveSupabaseState(data, secPayload).then((ok) => {
        if (ok) {
          setSyncSuccess(true);
          setLastSyncTime(new Date());
        }
      }).catch(() => {});

    } catch {
      // Offline fallback
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  };

  const savePartialSecurityToServer = (partialSec: any) => {
    const secPayload = {
      isPasswordEnabled,
      savedPassword,
      savedPin: PERMANENT_CALC_PIN,
      isUnlocked,
      tips: tipsList,
      customTips,
      favoriteTips: favoriteTipIds,
      tipsFrequency: tipPopupFrequency,
      zikrHistory,
      khushuHistory,
      earbudsHistory,
      gamification,
      ...partialSec,
    };
    saveSupabaseState(history, secPayload).then((ok) => {
      if (ok) {
        setSyncSuccess(true);
        setLastSyncTime(new Date());
      }
    }).catch(() => {});
  };

  // Supabase Initial Load & Instant Multi-Device Realtime Sync
  useEffect(() => {
    // 1. Pull latest Supabase state on load
    fetchSupabaseState().then((remote) => {
      if (remote && remote.records && Object.keys(remote.records).length > 0) {
        setHistory((prevHistory) => {
          const merged = mergeHistoryData(prevHistory, remote.records as Record<string, DayData>);
          localStorage.setItem('sz_simple_records', JSON.stringify(merged));
          return merged;
        });
        setSyncSuccess(true);
        setLastSyncTime(new Date());
      }
      // Also load tips and favorites from remote if present
      if (remote && remote.security) {
        if (Array.isArray(remote.security.favoriteTips)) {
          setFavoriteTipIds(remote.security.favoriteTips);
          try { localStorage.setItem('sz_favorite_tips', JSON.stringify(remote.security.favoriteTips)); } catch {}
        }
        const remoteCustom = remote.security.customTips;
        if (Array.isArray(remoteCustom) && remoteCustom.length > 0) {
          setTipsList((prev) => {
            const customMap = new Map();
            remoteCustom.forEach((ct: TipItem) => customMap.set(ct.id, ct));
            prev.filter(t => !t.id.startsWith('qh-')).forEach(t => customMap.set(t.id, t));
            const merged = [...Array.from(customMap.values()), ...DEFAULT_TIPS];
            try { localStorage.setItem('sz_user_tips', JSON.stringify(merged)); } catch {}
            return merged;
          });
        } else if (Array.isArray(remote.security.tips) && remote.security.tips.length >= 1000) {
          setTipsList(remote.security.tips);
          try { localStorage.setItem('sz_user_tips', JSON.stringify(remote.security.tips)); } catch {}
        }
        if (remote.security.tipsFrequency) {
          setTipPopupFrequency(remote.security.tipsFrequency);
          try { localStorage.setItem('sz_tip_popup_freq', remote.security.tipsFrequency); } catch {}
        }
        if (remote.security.zikrHistory) {
          setZikrHistory(prev => {
            const m = mergeHabitData(prev, remote.security.zikrHistory!);
            try { localStorage.setItem('sz_zikr_history', JSON.stringify(m)); } catch {}
            return m;
          });
        }
        if (remote.security.khushuHistory) {
          setKhushuHistory(prev => {
            const m = mergeHabitData(prev, remote.security.khushuHistory!);
            try { localStorage.setItem('sz_khushu_history', JSON.stringify(m)); } catch {}
            return m;
          });
        }
        if (remote.security.earbudsHistory) {
          setEarbudsHistory(prev => {
            const m = mergeNumberHabitData(prev, remote.security.earbudsHistory!);
            try { localStorage.setItem('sz_earbuds_history', JSON.stringify(m)); } catch {}
            return m;
          });
        }
        if (remote.security.gamification) {
          setGamification(prev => {
            const merged = mergeGamification(prev, remote.security.gamification!);
            try { localStorage.setItem('sz_gamification', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      }
    }).catch(() => {});

    // 2. Real-time subscription across all mobile & PC devices
    const unsubscribe = subscribeToSupabase((remoteState) => {
      if (Date.now() - lastLocalEditTimeRef.current < 2500) return;
      if (remoteState && remoteState.records) {
        setHistory((prevHistory) => {
          const merged = mergeHistoryData(prevHistory, remoteState.records as Record<string, DayData>);
          localStorage.setItem('sz_simple_records', JSON.stringify(merged));
          return merged;
        });
        setSyncSuccess(true);
        setLastSyncTime(new Date());
      }
      if (remoteState && remoteState.security) {
        if (Array.isArray(remoteState.security.favoriteTips)) {
          setFavoriteTipIds(remoteState.security.favoriteTips);
          try { localStorage.setItem('sz_favorite_tips', JSON.stringify(remoteState.security.favoriteTips)); } catch {}
        }
        const remoteCustom = remoteState.security.customTips;
        if (Array.isArray(remoteCustom) && remoteCustom.length > 0) {
          setTipsList((prev) => {
            const customMap = new Map();
            remoteCustom.forEach((ct: TipItem) => customMap.set(ct.id, ct));
            prev.filter(t => !t.id.startsWith('qh-')).forEach(t => customMap.set(t.id, t));
            const merged = [...Array.from(customMap.values()), ...DEFAULT_TIPS];
            try { localStorage.setItem('sz_user_tips', JSON.stringify(merged)); } catch {}
            return merged;
          });
        } else if (Array.isArray(remoteState.security.tips) && remoteState.security.tips.length >= 1000) {
          setTipsList(remoteState.security.tips);
          try { localStorage.setItem('sz_user_tips', JSON.stringify(remoteState.security.tips)); } catch {}
        }
        if (remoteState.security.tipsFrequency) {
          setTipPopupFrequency(remoteState.security.tipsFrequency);
          try { localStorage.setItem('sz_tip_popup_freq', remoteState.security.tipsFrequency); } catch {}
        }
        if (remoteState.security.zikrHistory) {
          setZikrHistory(prev => {
            const m = mergeHabitData(prev, remoteState.security.zikrHistory!);
            try { localStorage.setItem('sz_zikr_history', JSON.stringify(m)); } catch {}
            return m;
          });
        }
        if (remoteState.security.khushuHistory) {
          setKhushuHistory(prev => {
            const m = mergeHabitData(prev, remoteState.security.khushuHistory!);
            try { localStorage.setItem('sz_khushu_history', JSON.stringify(m)); } catch {}
            return m;
          });
        }
        if (remoteState.security.earbudsHistory) {
          setEarbudsHistory(prev => {
            const m = mergeNumberHabitData(prev, remoteState.security.earbudsHistory!);
            try { localStorage.setItem('sz_earbuds_history', JSON.stringify(m)); } catch {}
            return m;
          });
        }
        if (remoteState.security.gamification) {
          setGamification(prev => {
            const merged = mergeGamification(prev, remoteState.security.gamification!);
            try { localStorage.setItem('sz_gamification', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // BroadcastChannel listener for 0ms instant cross-tab & cross-window sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('sz_cross_sync');
      bc.onmessage = (event) => {
        if (!event.data) return;
        const { type, records, security } = event.data;
        if (type === 'STATE_UPDATE') {
          if (records) {
            setHistory((prevHistory) => {
              const merged = { ...prevHistory, ...records };
              localStorage.setItem('sz_simple_records', JSON.stringify(merged));
              return merged;
            });
          }
          if (security) {
            if (typeof security.isUnlocked === 'boolean') {
              setIsUnlocked(security.isUnlocked);
              localStorage.setItem('sz_unlocked', JSON.stringify(security.isUnlocked));
            }
            if (typeof security.isPasswordEnabled === 'boolean') {
              setIsPasswordEnabled(security.isPasswordEnabled);
              localStorage.setItem('sz_pass_enabled', JSON.stringify(security.isPasswordEnabled));
            }
            if (security.savedPassword) {
              setSavedPassword(security.savedPassword);
              localStorage.setItem('sz_pass_hash', security.savedPassword);
            }
            if (security.zikrHistory) {
              setZikrHistory(security.zikrHistory);
              localStorage.setItem('sz_zikr_history', JSON.stringify(security.zikrHistory));
            }
            if (security.khushuHistory) {
              setKhushuHistory(security.khushuHistory);
              localStorage.setItem('sz_khushu_history', JSON.stringify(security.khushuHistory));
            }
            if (security.earbudsHistory) {
              setEarbudsHistory(security.earbudsHistory);
              localStorage.setItem('sz_earbuds_history', JSON.stringify(security.earbudsHistory));
            }
            if (security.gamification) {
              setGamification(prev => {
                const merged = mergeGamification(prev, security.gamification!);
                try { localStorage.setItem('sz_gamification', JSON.stringify(merged)); } catch {}
                return merged;
              });
            }
            // PIN is permanently locked to 313
            localStorage.setItem('sz_calc_pin', PERMANENT_CALC_PIN);
          }
        }
      };
    } catch {
      // not supported
    }
    return () => {
      bc?.close();
    };
  }, []);

  const currentIntervalId = getActiveIntervalId(now, prayerTimes);
  const currentViewKey = activeDateKey || hijriInfo.hijriKey;
  const isViewingToday = currentViewKey === hijriInfo.hijriKey;
  const isPastDate = currentViewKey < hijriInfo.hijriKey;
  const isFutureDate = currentViewKey > hijriInfo.hijriKey;

  // All active and past days are fully unlocked and editable (future days are protected by isFutureDate)
  const isDateLocked = (_key: string): boolean => false;
  const isCurrentDayLocked = false;

  const currentDayData: DayData = history[currentViewKey] || {
    maghrib_isha: null,
    isha_fajr: null,
    fajr_dhuhr: null,
    dhuhr_asr: null,
    asr_maghrib: null,
  };

  // Status Cycle: null -> safe -> unsafe -> null
  const handleToggleZikr = (hijriDateKey: string, intervalId: IntervalId) => {
    setZikrHistory(prev => {
      const dateData = prev[hijriDateKey] || {};
      const nextDateData = { ...dateData, [intervalId]: !dateData[intervalId] };
      const next = { ...prev, [hijriDateKey]: nextDateData };
      try { localStorage.setItem('sz_zikr_history', JSON.stringify(next)); } catch {}
      saveRecordsToServer(history, next, khushuHistory, earbudsHistory);
      broadcastUpdate({ security: { zikrHistory: next } });
      return next;
    });
  };

  const handleToggleEarly = (hijriDateKey: string, intervalId: IntervalId) => {
    setEarlyHistory(prev => {
      const dateData = prev[hijriDateKey] || {};
      const nextDateData = { ...dateData, [intervalId]: !dateData[intervalId] };
      const next = { ...prev, [hijriDateKey]: nextDateData };
      try { localStorage.setItem('sz_early_history', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleToggleKhushu = (hijriDateKey: string, intervalId: IntervalId) => {
    setKhushuHistory(prev => {
      const dateData = prev[hijriDateKey] || {};
      const nextDateData = { ...dateData, [intervalId]: !dateData[intervalId] };
      const next = { ...prev, [hijriDateKey]: nextDateData };
      try { localStorage.setItem('sz_khushu_history', JSON.stringify(next)); } catch {}
      saveRecordsToServer(history, zikrHistory, next, earbudsHistory);
      broadcastUpdate({ security: { khushuHistory: next } });
      return next;
    });
  };

  const handleSaveEarbudsTime = (intervalId: IntervalId, minutes: number) => {
    setEarbudsHistory(prev => {
      const dateData = prev[currentViewKey] || ({} as Record<IntervalId, number>);
      const nextDateData = { ...dateData, [intervalId]: minutes };
      const next = { ...prev, [currentViewKey]: nextDateData };
      try { localStorage.setItem('sz_earbuds_history', JSON.stringify(next)); } catch {}
      saveRecordsToServer(history, zikrHistory, khushuHistory, next);
      broadcastUpdate({ security: { earbudsHistory: next } });
      return next;
    });
  };

  const handleCycleStatus = (id: IntervalId) => {
    // Future dates cannot be filled in advance
    if (isFutureDate) {
      alert('ভবিষ্যতের দিন এখনো আসেনি। শুধুমাত্র বর্তমান বা বিগত দিনের আমল পূরণ করা যাবে।');
      return;
    }

    const current = currentDayData[id];
    let next: Status = null;
    if (current === null) {
      next = 'safe';
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fef08a']
      });
    } else if (current === 'safe') {
      next = 'unsafe';
    } else {
      next = null;
    }

    lastLocalEditTimeRef.current = Date.now();
    const updatedDay: DayData = { ...currentDayData, [id]: next };
    const updatedHistory = { ...history, [currentViewKey]: updatedDay };

    setHistory(updatedHistory);
    localStorage.setItem('sz_simple_records', JSON.stringify(updatedHistory));
    broadcastUpdate({ records: updatedHistory });
    saveRecordsToServer(updatedHistory);
  };

  const handleResetCurrentDay = () => {
    if (isFutureDate) {
      alert('ভবিষ্যতের দিন এখনো আসেনি।');
      return;
    }
    const dayLabel = isViewingToday ? 'আজকের দিনের' : 'এই দিনের';
    if (window.confirm(`${dayLabel} ট্র্যাকিং রিসেট করতে চান?`)) {
      lastLocalEditTimeRef.current = Date.now();
      const updatedHistory = { ...history };
      delete updatedHistory[currentViewKey];
      setHistory(updatedHistory);
      localStorage.setItem('sz_simple_records', JSON.stringify(updatedHistory));
      broadcastUpdate({ records: updatedHistory });
      saveRecordsToServer(updatedHistory);
    }
  };

  // Navigate viewed date by day delta (-1 for previous day, +1 for next day)
  const navigateDay = (delta: number) => {
    const [y, m, d] = (activeDateKey || hijriInfo.hijriKey).split('-').map(Number);
    const currentCal = getRealHijriMonthCalendar(y, m, offsetDays);
    let nextD = d + delta;
    let nextM = m;
    let nextY = y;

    if (nextD < 1) {
      if (nextM === 1) {
        nextM = 12;
        nextY -= 1;
      } else {
        nextM -= 1;
      }
      const prevCal = getRealHijriMonthCalendar(nextY, nextM, offsetDays);
      nextD = prevCal.totalDays;
    } else if (nextD > currentCal.totalDays) {
      if (nextM === 12) {
        nextM = 1;
        nextY += 1;
      } else {
        nextM += 1;
      }
      nextD = 1;
    }

    const nextKey = `${nextY}-${String(nextM).padStart(2, '0')}-${String(nextD).padStart(2, '0')}`;
    setActiveDateKey(nextKey);
  };

  const safeCount = Object.values(currentDayData).filter((v) => v === 'safe').length;
  const unsafeCount = Object.values(currentDayData).filter((v) => v === 'unsafe').length;
  const answeredCount = Object.values(currentDayData).filter((v) => v !== null).length;
  const unfillCount = 5 - (safeCount + unsafeCount);

  const streak = Object.entries(history).filter(([_, d]) => {
    return Object.values(d).filter((v) => v === 'safe').length >= 4;
  }).length;

  // Calendar Day Opacity Colors (Calibrated for both Dark & Light modes)
  const getDayColorOpacity = (dayData?: DayData): string => {
    if (!dayData) {
      return isDark 
        ? 'bg-slate-900/60 border border-white/5 text-slate-500 hover:bg-slate-800'
        : 'bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200';
    }
    const safeC = Object.values(dayData).filter((v) => v === 'safe').length;
    const unsafeC = Object.values(dayData).filter((v) => v === 'unsafe').length;

    if (safeC === 5) {
      return 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/40 ring-1 ring-emerald-300';
    } else if (safeC === 4) {
      return 'bg-emerald-500/80 text-white font-bold';
    } else if (safeC === 3) {
      return isDark ? 'bg-emerald-500/60 text-emerald-100 font-semibold' : 'bg-emerald-600/70 text-white font-semibold';
    } else if (safeC === 1 || safeC === 2) {
      return isDark ? 'bg-amber-500/45 text-amber-100 font-semibold' : 'bg-amber-400/65 text-amber-950 font-bold';
    } else if (unsafeC > 0) {
      return isDark ? 'bg-rose-500/50 text-rose-100 font-medium border border-rose-500/40' : 'bg-rose-500/70 text-white font-semibold';
    }
    return isDark 
      ? 'bg-slate-900/60 border border-white/5 text-slate-500 hover:bg-slate-800'
      : 'bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200';
  };

  // Overall Totals (All Recorded Days in Database)
  const totalDays = Object.keys(history).length;
  let totalSafeCount = 0;
  let totalUnsafeCount = 0;
  let totalUnmarkedCount = 0;
  let perfectDays = 0;

  Object.values(history).forEach((day) => {
    let daySafe = 0;
    INTERVAL_PAIRS.forEach((item) => {
      if (day[item.id] === 'safe') {
        totalSafeCount++;
        daySafe++;
      } else if (day[item.id] === 'unsafe') {
        totalUnsafeCount++;
      } else {
        totalUnmarkedCount++;
      }
    });
    if (daySafe === 5) perfectDays++;
  });

  const totalAnsweredAll = totalSafeCount + totalUnsafeCount;
  const overallSafeRate = totalAnsweredAll > 0 ? Math.round((totalSafeCount / totalAnsweredAll) * 100) : 0;

  // Selected Timeframe Calculations (1d, 2d, 3d, 7d, 14d, 30d, all)
  const getRangeDays = (range: TimeRange) => {
    const currentOpt = TIME_RANGE_OPTIONS.find((o) => o.id === range) || TIME_RANGE_OPTIONS[3];

    if (range === 'all') {
      const keysSet = new Set<string>([...Object.keys(history), hijriInfo.hijriKey]);
      const sortedKeys = Array.from(keysSet).sort().reverse();

      return sortedKeys.map((key) => {
        const [y, m, d] = key.split('-').map(Number);
        const mName = HIJRI_MONTHS[(m - 1) % 12] || 'হিজরি';
        const dayData: DayData = history[key] || {
          maghrib_isha: null,
          isha_fajr: null,
          fajr_dhuhr: null,
          dhuhr_asr: null,
          asr_maghrib: null,
        };
        const sC = Object.values(dayData).filter((v) => v === 'safe').length;
        const uC = Object.values(dayData).filter((v) => v === 'unsafe').length;
        const unfC = 5 - (sC + uC);
        const weekdayName = getWeekdayForHijriKey(key, offsetDays);
        
        // Count Zikr, Khushu and Earbuds
        const dayZikr = zikrHistory[key] || {};
        const zC = Object.values(dayZikr).filter(Boolean).length;
        const dayKhushu = khushuHistory[key] || {};
        const kC = Object.values(dayKhushu).filter(Boolean).length;
        const dayEarbuds = earbudsHistory[key] || {};
        const ebMins = Object.values(dayEarbuds).reduce((acc, v) => acc + (Number(v) || 0), 0);

        return {
          key,
          dayNum: d,
          monthName: mName,
          formatted: `${toBn(d)} ${mName}`,
          weekdayName,
          data: dayData,
          safeCount: sC,
          unsafeCount: uC,
          unfillCount: unfC,
          zikrCount: zC,
          khushuCount: kC,
          earbudsMinutes: ebMins,
          isToday: key === hijriInfo.hijriKey,
          isPerfect: sC === 5,
        };
      });
    }

    const count = currentOpt.days;
    const result = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const hInfo = getHijriInfo(d, offsetDays);
      const dayData: DayData = history[hInfo.hijriKey] || {
        maghrib_isha: null,
        isha_fajr: null,
        fajr_dhuhr: null,
        dhuhr_asr: null,
        asr_maghrib: null,
      };
      const sC = Object.values(dayData).filter((v) => v === 'safe').length;
      const uC = Object.values(dayData).filter((v) => v === 'unsafe').length;
      const unfC = 5 - (sC + uC);
      const weekdayName = getWeekdayForHijriKey(hInfo.hijriKey, offsetDays);

      // Count Zikr, Khushu and Earbuds
      const dayZikr = zikrHistory[hInfo.hijriKey] || {};
      const zC = Object.values(dayZikr).filter(Boolean).length;
      const dayKhushu = khushuHistory[hInfo.hijriKey] || {};
      const kC = Object.values(dayKhushu).filter(Boolean).length;
      const dayEarbuds = earbudsHistory[hInfo.hijriKey] || {};
      const ebMins = Object.values(dayEarbuds).reduce((acc, v) => acc + (Number(v) || 0), 0);

      result.push({
        key: hInfo.hijriKey,
        dayNum: hInfo.dayNum,
        monthName: hInfo.monthName,
        formatted: `${toBn(hInfo.dayNum)} ${hInfo.monthName}`,
        weekdayName,
        data: dayData,
        safeCount: sC,
        unsafeCount: uC,
        unfillCount: unfC,
        zikrCount: zC,
        khushuCount: kC,
        earbudsMinutes: ebMins,
        isToday: hInfo.hijriKey === hijriInfo.hijriKey,
        isPerfect: sC === 5,
      });
    }
    return result;
  };

  const { currentStreak, bestStreak } = useMemo(() => {
    let current = 0;
    let best = 0;
    let temp = 0;
    let isCurrentActive = true;

    for (let i = 0; i < 365; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const hInfo = getHijriInfo(d, offsetDays);
      const dayData = history[hInfo.hijriKey];
      
      const safeCount = dayData ? Object.values(dayData).filter(v => v === 'safe').length : 0;
      
      if (i === 0) {
        if (safeCount === 5) {
          temp++;
          current++;
        }
        continue;
      }

      if (safeCount === 5) {
        temp++;
        if (isCurrentActive) current++;
      } else {
        isCurrentActive = false;
        if (temp > best) best = temp;
        temp = 0;
      }
    }
    if (temp > best) best = temp;
    
    return { currentStreak: current, bestStreak: best };
  }, [history, now, offsetDays]);

  const rangeDaysList = getRangeDays(selectedRange);
  const rangeTotalDays = rangeDaysList.length;
  const rangeTotalPossibleWaqts = rangeTotalDays * 5;

  let rangeSafeWaqts = 0;
  let rangeUnsafeWaqts = 0;
  let rangeUnfilledWaqts = 0;
  let rangePerfectDays = 0;
  let rangeZikrWaqts = 0;
  let rangeKhushuWaqts = 0;
  let rangeEarbudsMinutes = 0;

  const rangeIntervalStats: Record<IntervalId, { safe: number; unsafe: number; unfilled: number; khushu: number; zikr: number }> = {
    maghrib_isha: { safe: 0, unsafe: 0, unfilled: 0, khushu: 0, zikr: 0 },
    isha_fajr: { safe: 0, unsafe: 0, unfilled: 0, khushu: 0, zikr: 0 },
    fajr_dhuhr: { safe: 0, unsafe: 0, unfilled: 0, khushu: 0, zikr: 0 },
    dhuhr_asr: { safe: 0, unsafe: 0, unfilled: 0, khushu: 0, zikr: 0 },
    asr_maghrib: { safe: 0, unsafe: 0, unfilled: 0, khushu: 0, zikr: 0 },
  };

  rangeDaysList.forEach((item) => {
    rangeSafeWaqts += item.safeCount;
    rangeUnsafeWaqts += item.unsafeCount;
    rangeUnfilledWaqts += item.unfillCount;
    rangeZikrWaqts += item.zikrCount || 0;
    rangeKhushuWaqts += item.khushuCount || 0;
    rangeEarbudsMinutes += item.earbudsMinutes || 0;
    if (item.isPerfect) {
      rangePerfectDays++;
    }

    INTERVAL_PAIRS.forEach((pair) => {
      const st = item.data[pair.id];
      if (st === 'safe') {
        rangeIntervalStats[pair.id].safe++;
      } else if (st === 'unsafe') {
        rangeIntervalStats[pair.id].unsafe++;
      } else {
        rangeIntervalStats[pair.id].unfilled++;
      }
      
      const dayZikr = zikrHistory[item.key] || {};
      const dayKhushu = khushuHistory[item.key] || {};
      if (dayZikr[pair.id]) rangeIntervalStats[pair.id].zikr++;
      if (dayKhushu[pair.id]) rangeIntervalStats[pair.id].khushu++;
    });
  });

  const rangeAnsweredWaqts = rangeSafeWaqts + rangeUnsafeWaqts;
  const rangeSafeRate = rangeAnsweredWaqts > 0 ? Math.round((rangeSafeWaqts / rangeAnsweredWaqts) * 100) : 0;
  const rangeUnsafeRate = rangeAnsweredWaqts > 0 ? Math.round((rangeUnsafeWaqts / rangeAnsweredWaqts) * 100) : 0;
  
  const rangeKhushuRate = rangeAnsweredWaqts > 0 ? Math.round((rangeKhushuWaqts / rangeAnsweredWaqts) * 100) : 0;
  const rangeZikrRate = rangeAnsweredWaqts > 0 ? Math.round((rangeZikrWaqts / rangeAnsweredWaqts) * 100) : 0;

  const { 
    khushuCorrelation, 
    zikrCorrelation, 
    earbudCorrelation, 
    earbudWaqtTotals, 
    peakEarbudWaqt, 
    maxEarbudMins 
  } = useMemo(() => {
    let khushuAndSafe = 0;
    let khushuTotal = 0;
    let zikrAndSafe = 0;
    let zikrTotal = 0;
    let earbudAndSafe = 0;
    let earbudTotal = 0;

    const waqtTotals: Record<IntervalId, number> = {
      maghrib_isha: 0,
      isha_fajr: 0,
      fajr_dhuhr: 0,
      dhuhr_asr: 0,
      asr_maghrib: 0,
    };

    rangeDaysList.forEach(day => {
      const hKey = day.key;
      const kData = khushuHistory[hKey] || {};
      const zData = zikrHistory[hKey] || {};
      const ebData = earbudsHistory[hKey] || {};
      const dData = day.data || {};
      
      INTERVAL_PAIRS.forEach(iv => {
        const isSafe = dData[iv.id] === 'safe';
        const mins = Number(ebData[iv.id]) || 0;
        waqtTotals[iv.id] += mins;

        if (kData[iv.id]) {
          khushuTotal++;
          if (isSafe) khushuAndSafe++;
        }
        if (zData[iv.id]) {
          zikrTotal++;
          if (isSafe) zikrAndSafe++;
        }
        if (mins > 0) {
          earbudTotal++;
          if (isSafe) earbudAndSafe++;
        }
      });
    });

    let peakId: IntervalId | null = null;
    let maxMins = 0;
    (Object.keys(waqtTotals) as IntervalId[]).forEach((id) => {
      if (waqtTotals[id] > maxMins) {
        maxMins = waqtTotals[id];
        peakId = id;
      }
    });

    return {
      khushuCorrelation: khushuTotal > 0 ? Math.round((khushuAndSafe / khushuTotal) * 100) : 0,
      zikrCorrelation: zikrTotal > 0 ? Math.round((zikrAndSafe / zikrTotal) * 100) : 0,
      earbudCorrelation: earbudTotal > 0 ? Math.round((earbudAndSafe / earbudTotal) * 100) : 0,
      earbudWaqtTotals: waqtTotals,
      peakEarbudWaqt: peakId,
      maxEarbudMins: maxMins,
    };
  }, [rangeDaysList, khushuHistory, zikrHistory, earbudsHistory]);

  const safePctBar = rangeTotalPossibleWaqts > 0 ? Math.round((rangeSafeWaqts / rangeTotalPossibleWaqts) * 100) : 0;
  const unsafePctBar = rangeTotalPossibleWaqts > 0 ? Math.round((rangeUnsafeWaqts / rangeTotalPossibleWaqts) * 100) : 0;
  const unfilledPctBar = Math.max(0, 100 - safePctBar - unsafePctBar);

  let maxRangeSlips = -1;
  let rangeVulnerableId: IntervalId | null = null;
  let maxRangeSafe = -1;
  let rangeSafestId: IntervalId | null = null;

  (Object.keys(rangeIntervalStats) as IntervalId[]).forEach((id) => {
    const slips = rangeIntervalStats[id].unsafe;
    const safes = rangeIntervalStats[id].safe;
    if (slips > maxRangeSlips && slips > 0) {
      maxRangeSlips = slips;
      rangeVulnerableId = id;
    }
    if (safes > maxRangeSafe && safes > 0) {
      maxRangeSafe = safes;
      rangeSafestId = id;
    }
  });

  const rangeVulnerableItem = INTERVAL_PAIRS.find((i) => i.id === rangeVulnerableId);
  const rangeSafestItem = INTERVAL_PAIRS.find((i) => i.id === rangeSafestId);

  const formatKeyToBangla = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    const mName = HIJRI_MONTHS[(m - 1) % 12] || 'হিজরি';
    return `${toBn(d)} ${mName}, ${toBn(y)} হিজরি`;
  };

  const selectedRangeOption = TIME_RANGE_OPTIONS.find((o) => o.id === selectedRange) || TIME_RANGE_OPTIONS[3];

  // -------------------------------------------------------------
  // VIEW: CALCULATOR DISGUISE (ONLY in Android / installed PWA app)
  // -------------------------------------------------------------
  if (isPwaApp && (isDisguiseLocked || !isUnlocked)) {
    return (
      <CalculatorDisguise
        secretPin={savedPin}
        onUnlock={handleUnlockDisguise}
        isDark={isDark}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW: LOCK SCREEN (Shows after intro if password is ON)
  // -------------------------------------------------------------
  if (isPasswordEnabled && !isUnlocked) {
    return (
      <>
        <LockScreen
          savedPassword={savedPassword}
          savedPin={savedPin}
          onUnlock={async () => {
            setIsUnlocked(true);
            localStorage.setItem('sz_unlocked', 'true');
            broadcastUpdate({ security: { isUnlocked: true } });
            savePartialSecurityToServer({ isUnlocked: true });
          }}
          isDark={isDark}
        />
        {showIntro && (
          <AnimatedSplashIntro
            darkMode={isDark}
            onClosing={() => setIntroClosing(true)}
            onFinish={() => {
              setIntroClosing(false);
              setShowIntro(false);
            }}
          />
        )}
      </>
    );
  }

  // -------------------------------------------------------------
  // VIEW: TOOLS / PURIFY FULL PAGE
  // -------------------------------------------------------------
  if (view === 'tools') {
    return (
      <ToolsView 
        isDark={isDark}
        onReturn={() => setView('tracker')}
      />
    );
  }
  // -------------------------------------------------------------
  // VIEW: ANALYTICS FULL PAGE (ENRICHED & BEAUTIFUL)
  // -------------------------------------------------------------
  if (view === 'analytics') {
    return (
      <div className={`min-h-screen safe-app-container antialiased selection:bg-emerald-500 selection:text-white flex flex-col items-center transition-colors duration-300 relative ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}>
        <HalalBackground isDark={isDark} />
        
        <div className="w-full max-w-xl animate-fadeIn">
          {/* Top Navigation & Status Bar (Clean & Responsive for Mobile/Desktop) */}
          <div className={`mb-4 pb-3 border-b ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            {/* Primary Bar: Navigation on Left, Quick Action Dock on Right */}
            <div className="flex items-center justify-between gap-2">
              {/* Back to Tracker Button (Harmonized h-9 Glass Pill) */}
              <button
                onClick={() => setView('tracker')}
                className={`h-9 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border flex items-center gap-2 group cursor-pointer active:scale-95 shadow-xs backdrop-blur-xl ${
                  isDark 
                    ? 'bg-slate-950/80 hover:bg-slate-900 text-slate-200 hover:text-emerald-400 border-white/15 shadow-black/20' 
                    : 'bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 border-slate-300/80 shadow-slate-200/60'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1 text-emerald-500" />
                <span>ট্র্যাকারে ফিরুন</span>
              </button>

              {/* Desktop-only: Integrated Horizontal Badge */}
              <div className={`hidden sm:inline-flex items-center gap-2.5 h-9 px-3.5 rounded-2xl border shadow-xs backdrop-blur-xl ${
                isDark 
                  ? 'bg-slate-950/80 border-white/15 text-white shadow-black/20' 
                  : 'bg-white/90 border-slate-300/80 text-slate-900 shadow-slate-200/60'
              }`}>
                <span className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                  <span>রিপোর্ট</span>
                </span>
                <span className="w-px h-3 bg-slate-300 dark:bg-white/20 shrink-0" />
                <span className="inline-flex items-center gap-1 text-xs font-bold shrink-0">
                  <span className={isDark ? "bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-300 bg-clip-text text-transparent font-extrabold" : "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent font-extrabold"}>
                    I Love Allah
                  </span>
                  <span className="font-arabic text-xs font-black text-amber-500 select-none">ﷻ</span>
                </span>
                <span className="w-px h-3 bg-slate-300 dark:bg-white/20 shrink-0" />
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'ক্লাউড সিঙ্ক'}</span>
                </div>
              </div>

              {/* Action Controls Dock (Harmonized h-9 Glass Dock) */}
              <div className={`h-9 px-1 rounded-2xl border flex items-center gap-0.5 sm:gap-1 shadow-xs backdrop-blur-xl transition-all ${
                isDark 
                  ? 'bg-slate-950/80 border-white/15 shadow-black/20' 
                  : 'bg-white/90 border-slate-300/80 shadow-slate-200/60'
              }`}>
                {isPasswordEnabled && (
                  <button
                    type="button"
                    onClick={handleLockNow}
                    title="ওয়েবসাইট এখনই লক করুন"
                    className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                      isDark
                        ? 'text-slate-300 hover:text-amber-400 hover:bg-white/10'
                        : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsTipPopupOpen(true)}
                  title="আজকের উপদেশ ও অনুপ্রেরণা"
                  className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                    isDark
                      ? 'text-slate-300 hover:text-amber-400 hover:bg-white/10'
                      : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(true)}
                  title="পাসওয়ার্ড ও নিরাপত্তা সেটিংস"
                  className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                    isDark
                      ? 'text-slate-300 hover:text-emerald-400 hover:bg-white/10'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  title={isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
                  className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                    isDark
                      ? 'text-slate-300 hover:text-amber-300 hover:bg-white/10'
                      : 'text-slate-600 hover:text-amber-500 hover:bg-slate-100'
                  }`}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Mobile-only: Full-width Sleek Status Banner underneath */}
            <div className={`sm:hidden mt-2 h-8 px-3 rounded-2xl border flex items-center justify-between shadow-xs backdrop-blur-xl ${
              isDark 
                ? 'bg-slate-950/70 border-white/10 text-white' 
                : 'bg-white/80 border-slate-200 text-slate-900 shadow-slate-100'
            }`}>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-extrabold tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
                  রিপোর্ট
                </span>
                <span className="w-px h-2.5 bg-slate-300 dark:bg-white/20 mx-0.5" />
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold">
                  <span className={isDark ? "bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-300 bg-clip-text text-transparent font-extrabold" : "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent font-extrabold"}>
                    I Love Allah
                  </span>
                  <span className="font-arabic text-xs font-black text-amber-500 select-none">ﷻ</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'ক্লাউড সিঙ্ক'}</span>
              </div>
            </div>
          </div>

          {/* Timeframe Filter Card (1d, 2d, 3d, 7d, 14d, 30d, all) */}
          <div className={`p-3 sm:p-3.5 rounded-2xl border mb-4 backdrop-blur-xl shadow-sm ${
            isDark ? 'bg-slate-950/85 border-white/15' : 'bg-white/95 border-slate-300 shadow-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2 px-0.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                সময়সীমা নির্বাচন করুন
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {selectedRangeOption.badge}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
              {TIME_RANGE_OPTIONS.map((opt) => {
                const isActive = selectedRange === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedRange(opt.id)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 border active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                        : (isDark 
                            ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10' 
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm')
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Range Performance Overview & Visual Progress Bar */}
          <div className={`p-4 sm:p-5 rounded-2xl mb-4 border backdrop-blur-xl transition-all ${
            isDark ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold block ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}>
                  {selectedRangeOption.badge} রিপোর্ট
                </span>
                <h2 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedRange === '1d' ? 'আজকের আমল ও আত্মনিয়ন্ত্রণ' : `${selectedRangeOption.label}র সামগ্রিক পারফরম্যান্স`}
                </h2>
              </div>

              <div className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 border ${
                rangeSafeRate >= 80 
                  ? (isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-300')
                  : rangeSafeRate >= 50 
                  ? (isDark ? 'bg-amber-950/80 text-amber-300 border-amber-700' : 'bg-amber-50 text-amber-800 border-amber-300')
                  : (isDark ? 'bg-rose-950/80 text-rose-300 border-rose-700' : 'bg-rose-50 text-rose-700 border-rose-300')
              }`}>
                {toBn(rangeSafeRate)}% সেফ
              </div>
            </div>

            {/* 3-Segment Visual Bar */}
            <div className="space-y-2">
              <div className={`w-full h-3 rounded-full overflow-hidden flex ${
                isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}>
                {safePctBar > 0 && (
                  <div
                    style={{ width: `${safePctBar}%` }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                    title={`সেফ: ${safePctBar}%`}
                  />
                )}
                {unsafePctBar > 0 && (
                  <div
                    style={{ width: `${unsafePctBar}%` }}
                    className="bg-gradient-to-r from-rose-500 to-red-600 h-full transition-all duration-500"
                    title={`আনসেফ: ${unsafePctBar}%`}
                  />
                )}
                {unfilledPctBar > 0 && (
                  <div
                    style={{ width: `${unfilledPctBar}%` }}
                    className={isDark ? 'bg-slate-700/80 h-full' : 'bg-slate-300 h-full'}
                    title={`পূরণ বাকি: ${unfilledPctBar}%`}
                  />
                )}
              </div>

              {/* Legend with Counts and Percentages */}
              <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold pt-1">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>সেফ: {toBn(rangeSafeWaqts)} ({toBn(safePctBar)}%)</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>আনসেফ: {toBn(rangeUnsafeWaqts)} ({toBn(unsafePctBar)}%)</span>
                </span>
                <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-400'}`} />
                  <span>পূরণ বাকি: {toBn(rangeUnfilledWaqts)} ({toBn(unfilledPctBar)}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tawhid System Spiritual Status Window in Analytics */}
          <div className={`rounded-3xl p-4 sm:p-5 border mb-5 relative overflow-hidden backdrop-blur-xl transition-all ${
            isDark 
              ? 'bg-gradient-to-r from-slate-950 via-[#041226] to-slate-950 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20' 
              : 'bg-gradient-to-r from-sky-50 via-white to-sky-50 border-sky-300 shadow-md'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block tracking-widest">[ TAWHID SYSTEM ]</span>
                  <h3 className={`text-sm sm:text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>তাওহীদ সিস্টেম রুহানি র‍্যাংক</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLevelModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/30 transition-all cursor-pointer"
              >
                তাওহীদ স্ট্যাটাস ➔
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-cyan-500/20">
              <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-white/5' : 'bg-sky-100/70 border-sky-200'}`}>
                <span className="text-[10px] font-mono text-cyan-500 block">লেভেল</span>
                <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>LV.{toBn(gamification.currentLevelId || 1)}</span>
              </div>
              <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-white/5' : 'bg-sky-100/70 border-sky-200'}`}>
                <span className="text-[10px] font-mono text-cyan-500 block">মোট EXP</span>
                <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{toBn(gamification.totalPoints)}</span>
              </div>
              <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-white/5' : 'bg-sky-100/70 border-sky-200'}`}>
                <span className="text-[10px] font-mono text-cyan-500 block">মিশন সম্পন্ন</span>
                <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{toBn(gamification.totalAmalCount)} টি</span>
              </div>
            </div>

            {/* Interactive Level Amals Browser */}
            <div className="mt-4 pt-3 border-t border-cyan-500/20">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>লেভেল ট্র্যাকার ও আমল লগ</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-300/80">
                  * লেভেলে ক্লিক করে পার করার আমল দেখুন
                </span>
              </div>

              {/* Scrollable list of levels */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar select-none pt-1">
                {SPIRITUAL_LEVELS.map((lvl) => {
                  const isCurrent = (gamification.currentLevelId || 1) === lvl.id;
                  const isUnlocked = gamification.totalPoints >= lvl.minPoints;
                  const amalsInLevel = (gamification.completedHistory || []).filter(item => item.levelId === lvl.id);
                  const count = amalsInLevel.length;

                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleOpenLevelAmals(lvl.id)}
                      className={`shrink-0 p-2.5 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer min-w-[135px] sm:min-w-[150px] ${
                        isCurrent
                          ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400 hover:bg-cyan-500/30'
                          : isUnlocked
                          ? (isDark ? 'bg-slate-900/80 border-cyan-500/30 text-slate-200 hover:border-cyan-400/60 hover:bg-slate-900' : 'bg-white border-sky-300 text-slate-700 hover:bg-sky-50')
                          : 'bg-slate-950/60 border-white/5 text-slate-500 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-base">{lvl.badge}</span>
                        <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          isCurrent 
                            ? 'bg-cyan-400 text-slate-950' 
                            : isUnlocked 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          LV.{toBn(lvl.id)}
                        </span>
                      </div>
                      <span className={`text-xs font-bold block truncate ${isDark && !isCurrent ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lvl.name.split(' ')[0]}
                      </span>
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5 text-[10px] font-mono">
                        <span className="text-cyan-400 font-bold">
                          {count > 0 ? `${toBn(count)}টি আমল` : '০টি আমল'}
                        </span>
                        <span className="text-slate-400 text-[9px]">আমল ➔</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Streaks Widget */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
            <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col items-center justify-center backdrop-blur-xl transition-all ${
              isDark ? 'glass-card border-orange-500/20 bg-orange-950/10' : 'bg-orange-50 border-orange-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Flame className={`w-4 h-4 sm:w-5 sm:h-5 ${currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
                <span className={`text-[11px] sm:text-sm font-bold ${isDark ? 'text-orange-400/80' : 'text-orange-700'}`}>বর্তমান স্ট্রাইক</span>
              </div>
              <div className={`text-3xl sm:text-4xl font-black ${currentStreak > 0 ? (isDark ? 'text-orange-400' : 'text-orange-600') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                {toBn(currentStreak)} <span className="text-[10px] sm:text-xs font-semibold">দিন</span>
              </div>
              <span className={`text-[9px] sm:text-[10px] mt-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>টানা সেফ থাকার রেকর্ড</span>
            </div>
            
            <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col items-center justify-center backdrop-blur-xl transition-all ${
              isDark ? 'glass-card border-amber-500/20 bg-amber-950/10' : 'bg-amber-50 border-amber-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Award className={`w-4 h-4 sm:w-5 sm:h-5 ${bestStreak > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className={`text-[11px] sm:text-sm font-bold ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>সর্বোচ্চ রেকর্ড</span>
              </div>
              <div className={`text-3xl sm:text-4xl font-black ${bestStreak > 0 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                {toBn(bestStreak)} <span className="text-[10px] sm:text-xs font-semibold">দিন</span>
              </div>
              <span className={`text-[9px] sm:text-[10px] mt-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>এযাবৎকালের সেরা স্ট্রাইক</span>
            </div>
          </div>

          {/* 6 Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {/* 1. Safe Waqts */}
            <div className={`rounded-2xl p-3 text-center border transition-all ${
              isDark ? 'glass-card border-white/5 bg-slate-900/60' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider block mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                সেফ ওয়াক্ত
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-500">
                {toBn(rangeSafeWaqts)} <span className="text-[10px] sm:text-xs font-medium">ওয়াক্ত</span>
              </div>
              <span className={`text-[10px] block mt-0.5 font-bold ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
                {toBn(rangeSafeRate)}% হার
              </span>
            </div>

            {/* 2. Unsafe Waqts */}
            <div className={`rounded-2xl p-3 text-center border transition-all ${
              isDark ? 'glass-card border-white/5 bg-slate-900/60' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider block mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                আনসেফ ওয়াক্ত
              </span>
              <div className="text-xl sm:text-2xl font-black text-rose-500">
                {toBn(rangeUnsafeWaqts)} <span className="text-[10px] sm:text-xs font-medium">ওয়াক্ত</span>
              </div>
              <span className={`text-[10px] block mt-0.5 font-bold ${isDark ? 'text-rose-400/80' : 'text-rose-700'}`}>
                {toBn(rangeUnsafeRate)}% বিচ্যুতি
              </span>
            </div>

            {/* 3. Unfilled Waqts (Directly beside Unsafe as requested) */}
            <div className={`rounded-2xl p-3 text-center border transition-all ${
              isDark ? 'glass-card border-white/5 bg-slate-900/60' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider block mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                পূরণ বাকি
              </span>
              <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {toBn(rangeUnfilledWaqts)} <span className="text-[10px] sm:text-xs font-medium">ওয়াক্ত</span>
              </div>
              <span className={`text-[10px] block mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                অসম্পূর্ণ
              </span>
            </div>
          </div>

          {/* 6.1 Special Habits Grid (Khushu, Zikr, Earbuds) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-5">
            {/* Masjid & Khushu Count */}
            <div className={`rounded-2xl p-2.5 sm:p-3 text-center border transition-all ${
              isDark ? 'glass-card border-sky-500/20 bg-sky-950/20' : 'bg-sky-50 border-sky-200 shadow-sm'
            }`}>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider block mb-1 font-semibold ${
                isDark ? 'text-sky-400' : 'text-sky-700'
              }`}>
                মসজিদ ও খুশু
              </span>
              <div className={`text-base sm:text-2xl font-black ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                {toBn(rangeKhushuWaqts)} <span className="text-[10px] sm:text-xs font-medium">বার</span>
              </div>
              <span className={`text-[10px] block mt-0.5 font-bold ${isDark ? 'text-sky-400/80' : 'text-sky-700'}`}>
                {toBn(rangeKhushuRate)}% সালাতে
              </span>
            </div>

            {/* Zikr Count */}
            <div className={`rounded-2xl p-2.5 sm:p-3 text-center border transition-all ${
              isDark ? 'glass-card border-emerald-500/20 bg-emerald-950/20' : 'bg-emerald-50 border-emerald-200 shadow-sm'
            }`}>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider block mb-1 font-semibold ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                জিকির ও দুআ
              </span>
              <div className={`text-base sm:text-2xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {toBn(rangeZikrWaqts)} <span className="text-[10px] sm:text-xs font-medium">বার</span>
              </div>
              <span className={`text-[10px] block mt-0.5 font-bold ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
                {toBn(rangeZikrRate)}% সালাতে
              </span>
            </div>

            {/* Earbuds Time */}
            <div className={`rounded-2xl p-2.5 sm:p-3 text-center border transition-all ${
              isDark ? 'glass-card border-teal-500/20 bg-teal-950/20' : 'bg-teal-50 border-teal-200 shadow-sm'
            }`}>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider block mb-1 font-semibold ${
                isDark ? 'text-teal-400' : 'text-teal-700'
              }`}>
                ইয়ারবাড (দ্বীনি)
              </span>
              <div className={`text-base sm:text-2xl font-black ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                {formatEarbudMinutesBn(rangeEarbudsMinutes)}
              </div>
              <span className={`text-[10px] block mt-0.5 font-bold ${isDark ? 'text-teal-400/80' : 'text-teal-700'}`}>
                আল্লাহর জন্য
              </span>
            </div>
          </div>

          {/* Habit Correlation Insight */}
          {selectedRange !== '1d' && (khushuCorrelation > 0 || zikrCorrelation > 0 || earbudCorrelation > 0) && (
            <div className={`rounded-xl p-4 mb-5 border flex items-center gap-3 backdrop-blur-xl ${
              isDark ? 'glass-card border-indigo-500/20 bg-indigo-950/20' : 'bg-indigo-50 border-indigo-200 shadow-sm'
            }`}>
              <Sparkles className={`w-6 h-6 shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <div className="text-[11px] sm:text-xs leading-relaxed space-y-1">
                <strong className={`block ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>এআই বিশ্লেষণ:</strong> 
                {khushuCorrelation > 0 && (
                  <span className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    • যেদিন আপনি মসজিদে সালাত আদায় করেন, সেদিন আপনার সেফ থাকার হার <strong>{toBn(khushuCorrelation)}%</strong>।
                  </span>
                )}
                {zikrCorrelation > 0 && (
                  <span className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    • নিয়মিত জিকির আপনার সেফ থাকার হারকে <strong>{toBn(zikrCorrelation)}%</strong> পর্যন্ত ধরে রাখে!
                  </span>
                )}
                {earbudCorrelation > 0 && (
                  <span className={`block ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                    • আল্লাহর জন্য ইয়ারবাড (কুরআন/দ্বীনি নসিহত) শোনার ওয়াক্তগুলোতে সেফ থাকার হার <strong>{toBn(earbudCorrelation)}%</strong>!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 4 & 6: Perfect Days & Total Days */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {/* 4. Perfect Days */}
            <div className={`rounded-2xl p-3 text-center border transition-all ${
              isDark ? 'glass-card border-white/5 bg-slate-900/60' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider block mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                ৫/৫ পারফেক্ট
              </span>
              <div className="text-xl sm:text-2xl font-black text-teal-400">
                {toBn(rangePerfectDays)} <span className="text-[10px] sm:text-xs font-medium">দিন</span>
              </div>
              <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {toBn(rangeTotalDays)} দিনের মাঝে
              </span>
            </div>

            {/* 6. Total Tracked Days */}
            <div className={`rounded-2xl p-3 text-center border transition-all ${
              isDark ? 'glass-card border-white/5 bg-slate-900/60' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider block mb-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                মোট দিন
              </span>
              <div className="text-xl sm:text-2xl font-black text-indigo-400">
                {toBn(rangeTotalDays)} <span className="text-[10px] sm:text-xs font-medium">দিন</span>
              </div>
              <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {toBn(rangeTotalPossibleWaqts)} ওয়াক্ত
              </span>
            </div>
          </div>

          {/* Waqt-by-Waqt Breakdown (All 5 Waqts Deep Dive) */}
          <div className={`rounded-2xl p-4 sm:p-5 mb-5 border backdrop-blur-xl ${
            isDark ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ওয়াক্তভিত্তিক বিস্তারিত বিশ্লেষণ
                </h3>
              </div>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedRangeOption.label}
              </span>
            </div>

            <div className="space-y-3">
              {INTERVAL_PAIRS.map((item) => {
                const stats = rangeIntervalStats[item.id];
                const answered = stats.safe + stats.unsafe;
                const safePercent = answered > 0 ? Math.round((stats.safe / answered) * 100) : 0;
                const isWorst = item.id === rangeVulnerableId && maxRangeSlips > 0;
                const isBest = item.id === rangeSafestId && stats.safe > 0 && stats.unsafe === 0;

                return (
                  <div key={item.id} className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-950/60 border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-black/10 dark:bg-white/5">
                          {item.startIcon}
                        </span>
                        <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                          {item.startWaqt}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                          {item.endWaqt}
                        </span>

                        {isWorst && (
                          <span className="text-[10px] bg-rose-500/15 text-rose-500 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>ঝুঁকিপূর্ণ</span>
                          </span>
                        )}
                        {isBest && (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            <span>সেরা</span>
                          </span>
                        )}
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${
                          stats.unsafe > 0 
                            ? 'text-rose-500' 
                            : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                        }`}>
                          {stats.safe} সেফ • {stats.unsafe} আনসেফ • {stats.unfilled} বাকি
                        </span>
                      </div>
                    </div>

                    {/* Waqt Success Bar */}
                    <div className={`w-full h-2 rounded-full overflow-hidden flex ${
                      isDark ? 'bg-slate-800/90' : 'bg-slate-200'
                    }`}>
                      {stats.safe > 0 && (
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${Math.round((stats.safe / rangeTotalDays) * 100)}%` }}
                        />
                      )}
                      {stats.unsafe > 0 && (
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
                          style={{ width: `${Math.round((stats.unsafe / rangeTotalDays) * 100)}%` }}
                        />
                      )}
                    </div>

                    {/* Khushu, Zikr & Earbuds Progress Bars */}
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                      {/* Khushu Mini Bar */}
                      <div>
                        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold mb-1.5">
                          <span className={`flex items-center gap-1 truncate ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                            মসজিদ
                          </span>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{stats.khushu}/{rangeTotalDays}</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-sky-950/50' : 'bg-sky-100'}`}>
                          <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${rangeTotalDays > 0 ? (stats.khushu / rangeTotalDays) * 100 : 0}%` }} />
                        </div>
                      </div>
                      
                      {/* Zikr Mini Bar */}
                      <div>
                        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold mb-1.5">
                          <span className={`flex items-center gap-1 truncate ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            জিকির
                          </span>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{stats.zikr}/{rangeTotalDays}</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950/50' : 'bg-emerald-100'}`}>
                          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${rangeTotalDays > 0 ? (stats.zikr / rangeTotalDays) * 100 : 0}%` }} />
                        </div>
                      </div>

                      {/* Earbuds Mini Bar */}
                      <div>
                        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold mb-1.5">
                          <span className={`flex items-center gap-1 truncate ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                            <Headphones className="w-2.5 h-2.5 shrink-0 text-teal-400" />
                            ইয়ারবাড
                          </span>
                          <span className={isDark ? 'text-teal-300 font-bold' : 'text-teal-700 font-bold'}>{formatEarbudMinutesBn(earbudWaqtTotals[item.id])}</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-teal-950/50' : 'bg-teal-100'}`}>
                          <div 
                            className="h-full bg-teal-500 transition-all duration-500" 
                            style={{ 
                              width: `${rangeEarbudsMinutes > 0 ? Math.min(100, Math.round((earbudWaqtTotals[item.id] / rangeEarbudsMinutes) * 100)) : 0}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Targeted Advice for Vulnerable Interval */}
            {maxRangeSlips > 0 && rangeVulnerableItem && (
              <div className={`mt-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                isDark 
                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-200' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5 font-bold">
                    বিশেষ সতর্কতা ({rangeVulnerableItem.startWaqt} ➔ {rangeVulnerableItem.endWaqt}):
                  </strong>
                  নির্বাচিত {selectedRangeOption.label} এই সময়টিতে সর্বাধিক {toBn(maxRangeSlips)} বার বিচ্যুতি ঘটেছে। এই ওয়াক্তের মধ্যবর্তী সময়টিতে মোবাইল স্ক্রোলিং ও অপ্রয়োজনীয় কাজ থেকে সতর্ক থাকুন।
                </div>
              </div>
            )}
          </div>

          {/* Earbuds Spiritual Audio Analysis Deep-Dive Card */}
          <div className={`rounded-2xl p-4 sm:p-5 mb-5 border backdrop-blur-xl ${
            isDark ? 'glass-card border-teal-500/25 bg-teal-950/15' : 'bg-teal-50/70 border-teal-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-500/20">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'}`}>
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm sm:text-base font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    আল্লাহর জন্য ইয়ারবাড বিশ্লেষণ
                  </h3>
                  <p className={`text-[10px] sm:text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    কুরআন তিলাওয়াত, তাদাব্বুর ও দ্বীনি আলোচনা শোনার গভীর পর্যালোচনা
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                isDark ? 'bg-teal-900/40 text-teal-300 border-teal-500/30' : 'bg-teal-100 text-teal-800 border-teal-300'
              }`}>
                {selectedRangeOption.label}
              </span>
            </div>

            {/* 3 Metric Summary Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              <div className={`rounded-xl p-3 text-center border ${
                isDark ? 'bg-slate-950/60 border-white/5' : 'bg-white border-teal-100 shadow-xs'
              }`}>
                <span className={`text-[10px] sm:text-[11px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  মোট শোনার সময়
                </span>
                <span className={`text-base sm:text-xl font-black block mt-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {formatEarbudMinutesBn(rangeEarbudsMinutes)}
                </span>
                <span className={`text-[9px] sm:text-[10px] block mt-0.5 ${isDark ? 'text-teal-400/80' : 'text-teal-700'}`}>
                  দ্বীনি আলোচনা/কুরআন
                </span>
              </div>

              <div className={`rounded-xl p-3 text-center border ${
                isDark ? 'bg-slate-950/60 border-white/5' : 'bg-white border-teal-100 shadow-xs'
              }`}>
                <span className={`text-[10px] sm:text-[11px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  দৈনিক গড়
                </span>
                <span className={`text-base sm:text-xl font-black block mt-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {formatEarbudMinutesBn(Math.round(rangeEarbudsMinutes / Math.max(1, rangeTotalDays)))}
                </span>
                <span className={`text-[9px] sm:text-[10px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  প্রতিদিনের অর্জিত সময়
                </span>
              </div>

              <div className={`rounded-xl p-3 text-center border ${
                isDark ? 'bg-slate-950/60 border-white/5' : 'bg-white border-teal-100 shadow-xs'
              }`}>
                <span className={`text-[10px] sm:text-[11px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  সর্বাধিক ওয়াক্ত
                </span>
                <span className={`text-xs sm:text-sm font-black block mt-1 truncate ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {peakEarbudWaqt && maxEarbudMins > 0 ? (
                    (() => {
                      const p = INTERVAL_PAIRS.find(x => x.id === peakEarbudWaqt);
                      return p ? `${p.startWaqt} ➔ ${p.endWaqt}` : 'তথ্য নেই';
                    })()
                  ) : 'তথ্য নেই'}
                </span>
                <span className={`text-[9px] sm:text-[10px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {maxEarbudMins > 0 ? formatEarbudMinutesBn(maxEarbudMins) : '০ মি.'}
                </span>
              </div>
            </div>

            {/* Waqt-by-Waqt Listening Time Bar Chart */}
            <div className={`p-3.5 rounded-xl border mb-3.5 space-y-2.5 ${
              isDark ? 'bg-slate-950/50 border-white/5' : 'bg-white/80 border-teal-100'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                  ওয়াক্তভিত্তিক শোনার সময় বণ্টন:
                </span>
                <span className={`text-[10px] font-semibold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                  মোট: {formatEarbudMinutesBn(rangeEarbudsMinutes)}
                </span>
              </div>

              {INTERVAL_PAIRS.map((p) => {
                const waqtMins = earbudWaqtTotals[p.id] || 0;
                const maxInAll = Math.max(1, maxEarbudMins || 60);
                const pctOfMax = Math.round((waqtMins / maxInAll) * 100);
                const pctOfTotal = rangeEarbudsMinutes > 0 ? Math.round((waqtMins / rangeEarbudsMinutes) * 100) : 0;

                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] sm:text-xs">
                      <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <span>{p.startWaqt} ➔ {p.endWaqt}</span>
                        {waqtMins > 0 && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                            isDark ? 'bg-teal-950 text-teal-400' : 'bg-teal-100 text-teal-700'
                          }`}>
                            {toBn(pctOfTotal)}%
                          </span>
                        )}
                      </span>
                      <span className={`font-bold ${waqtMins > 0 ? (isDark ? 'text-teal-400' : 'text-teal-600') : 'text-slate-400'}`}>
                        {formatEarbudMinutesBn(waqtMins)}
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${waqtMins > 0 ? Math.max(5, pctOfMax) : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spiritual Advice & Correlation Note */}
            <div className={`p-3 rounded-xl border text-[11px] sm:text-xs leading-relaxed flex items-start gap-2.5 ${
              isDark ? 'bg-teal-950/40 border-teal-500/25 text-teal-300' : 'bg-teal-100/70 border-teal-300/80 text-teal-950'
            }`}>
              <Sparkles className="w-4 h-4 shrink-0 text-teal-400 mt-0.5" />
              <div>
                {rangeEarbudsMinutes > 0 ? (
                  <>
                    <strong className="block mb-0.5 font-bold">আধ্যাত্মিক প্রভাব ও বরকত:</strong>
                    মাশাআল্লাহ! নির্বাচিত {selectedRangeOption.label} আপনি মোট <strong>{formatEarbudMinutesBn(rangeEarbudsMinutes)}</strong> আল্লাহর সন্তুষ্টিতে ইয়ারবাড ব্যবহার করেছেন। 
                    {earbudCorrelation > 0 && ` যেসব ওয়াক্তে আপনি ইয়ারবাড ব্যবহার করেছেন, সেসব ওয়াক্তে আপনার সেফ থাকার হার ${toBn(earbudCorrelation)}%! `}
                    কুরআন তিলাওয়াত ও দ্বীনি ইলম শ্রবণ অব্যাহত রাখুন, ইনশাআল্লাহ এটি আত্মশুদ্ধি ও তাকওয়ায় গভীর সাহায্য করবে।
                  </>
                ) : (
                  <>
                    <strong className="block mb-0.5 font-bold">ইয়ারবাড ট্র্যাকিং নির্দেশিকা:</strong>
                    এই সময়কালে এখনো কোনো ইয়ারবাড ব্যবহারের সময় রেকর্ড করা হয়নি। প্রধান ট্র্যাকার পেজে গিয়ে প্রতিটি ওয়াক্তের ডানপাশের ওয়াক্তের নামে ক্লিক করে সহজেই আপনি কতক্ষণ কুরআন বা নসিহত শুনেছেন তা ট্র্যাক করতে পারেন।
                  </>
                )}
              </div>
            </div>
          </div>

          {/* New Charts: Donut & Heatmap */}
          {selectedRange !== '1d' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              
              {/* Donut Chart */}
              <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl ${
                isDark ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h3 className={`text-sm sm:text-base font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Award className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
                  সার্বিক সাফল্যের অনুপাত
                </h3>
                
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-md">
                    {/* Background Ring */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" className={isDark ? 'stroke-slate-800' : 'stroke-slate-100'} strokeWidth="3" />
                    
                    {/* Unsafe Ring */}
                    {rangeUnsafeWaqts > 0 && (
                      <circle cx="18" cy="18" r="15.915" fill="transparent" className="stroke-rose-500" strokeWidth="3.5" 
                        strokeDasharray={`${(rangeUnsafeWaqts / Math.max(1, rangeDaysList.length * 5)) * 100} 100`} 
                        strokeDashoffset="0" 
                        strokeLinecap="round"
                      />
                    )}
                    {/* Safe Ring */}
                    {rangeSafeWaqts > 0 && (
                      <circle cx="18" cy="18" r="15.915" fill="transparent" className="stroke-emerald-500 transition-all duration-1000" strokeWidth="3.5" 
                        strokeDasharray={`${(rangeSafeWaqts / Math.max(1, rangeDaysList.length * 5)) * 100} 100`} 
                        strokeDashoffset={`-${(rangeUnsafeWaqts / Math.max(1, rangeDaysList.length * 5)) * 100}`} 
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {rangeDaysList.length > 0 ? toBn(Math.round((rangeSafeWaqts / (rangeDaysList.length * 5)) * 100)) : toBn(0)}%
                    </span>
                    <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>সাফল্য</span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex gap-5 mt-6 text-[10px] sm:text-xs font-bold bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>সেফ ({toBn(rangeSafeWaqts)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className={isDark ? 'text-rose-400' : 'text-rose-600'}>আনসেফ ({toBn(rangeUnsafeWaqts)})</span>
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col backdrop-blur-xl ${
                isDark ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h3 className={`text-sm sm:text-base font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <CalendarDays className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  আমলের ধারাবাহিকতা
                </h3>
                
                <div className="w-full overflow-x-auto no-scrollbar pb-2 flex-1 flex items-center">
                  <div className="flex gap-1.5 min-w-max mx-auto px-1">
                    {/* Rows Labels (Waqt Initials) */}
                    <div className="flex flex-col gap-1.5 mr-2 justify-between py-0.5">
                      {INTERVAL_PAIRS.map(iv => (
                        <span key={`label-${iv.id}`} className={`text-[9px] font-bold leading-none w-4 text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {iv.startWaqt.charAt(0)}
                        </span>
                      ))}
                    </div>
                    {/* Grid Columns (Days) */}
                    {[...rangeDaysList].reverse().map((dayItem) => (
                       <div key={dayItem.key} className="flex flex-col gap-1.5" title={dayItem.formatted}>
                          {INTERVAL_PAIRS.map(iv => {
                             const status = history[dayItem.key]?.[iv.id];
                             let bg = isDark ? 'bg-slate-800' : 'bg-slate-100';
                             if (status === 'safe') bg = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
                             else if (status === 'unsafe') bg = 'bg-rose-500';
                             
                             return (
                               <div 
                                 key={`${dayItem.key}-${iv.id}`} 
                                 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] ${bg} transition-colors cursor-pointer hover:ring-2 hover:ring-white/50`} 
                                 title={`${dayItem.formatted}: ${iv.startWaqt} -> ${iv.endWaqt} (${status === 'safe' ? 'সেফ' : status === 'unsafe' ? 'আনসেফ' : 'খালি'})`}
                               />
                             );
                          })}
                       </div>
                    ))}
                  </div>
                </div>
                
                <p className={`text-center text-[10px] mt-4 font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  প্রতিটি কলাম একটি দিন এবং প্রতিটি সারি একটি ওয়াক্ত নির্দেশ করে
                </p>
              </div>

            </div>
          )}
          
          {/* Trend Graph (Bar Chart) for 2d to 30d */}
          {selectedRange !== '1d' && (
            <div className={`rounded-2xl p-4 sm:p-5 mb-5 border backdrop-blur-xl ${
              isDark ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ট্রেন্ড অ্যানালাইসিস গ্রাফ
                </h3>
              </div>
              <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                <div className="flex items-end gap-2 min-w-max h-32 px-1">
                  {[...rangeDaysList].reverse().map((dayItem) => {
                    const totalSafe = dayItem.safeCount;
                    const totalUnsafe = dayItem.unsafeCount;
                    const hSafe = totalSafe * 20; // max 100% (5 * 20)
                    const hUnsafe = totalUnsafe * 20;
                    
                    return (
                      <div key={dayItem.key} className="flex flex-col items-center gap-2 w-8">
                        <div className={`w-3 h-24 rounded-full flex flex-col justify-end overflow-hidden ${
                          isDark ? 'bg-slate-800' : 'bg-slate-200'
                        }`}>
                          {totalUnsafe > 0 && (
                            <div 
                              style={{ height: `${hUnsafe}%` }} 
                              className="w-full bg-rose-500 rounded-t-sm"
                              title={`${dayItem.formatted}: ${toBn(totalUnsafe)} আনসেফ`}
                            />
                          )}
                          {totalSafe > 0 && (
                            <div 
                              style={{ height: `${hSafe}%` }} 
                              className="w-full bg-emerald-500 rounded-b-sm"
                              title={`${dayItem.formatted}: ${toBn(totalSafe)} সেফ`}
                            />
                          )}
                        </div>
                        <span className={`text-[9px] font-bold ${
                          dayItem.isToday 
                            ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                            : (isDark ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {dayItem.formatted.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Day-by-Day Historical Log in Selected Range */}
          <div className={`rounded-2xl p-4 sm:p-5 mb-5 border backdrop-blur-xl ${
            isDark ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  দিনভিত্তিক ওয়াক্তের হিসেব তালিকা
                </h3>
              </div>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {toBn(rangeDaysList.length)} দিন
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {rangeDaysList.map((dayItem) => {
                return (
                  <div
                    key={dayItem.key}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      dayItem.isToday 
                        ? (isDark ? 'bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/20' : 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300/50')
                        : (isDark ? 'bg-slate-950/50 border-white/5 hover:bg-slate-900/60' : 'bg-slate-50 border-slate-200 hover:bg-slate-100')
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {dayItem.formatted}
                        </span>
                        {dayItem.weekdayName && (
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            • {dayItem.weekdayName}
                          </span>
                        )}
                        {dayItem.isToday && (
                          <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-bold">
                            আজ
                          </span>
                        )}
                      </div>

                      {/* 5 Beads for this day */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {INTERVAL_PAIRS.map((pair) => {
                          const st = dayItem.data[pair.id];
                          return (
                            <span
                              key={pair.id}
                              title={`${pair.startWaqt} ➔ ${pair.endWaqt}: ${st || 'পূরণ বাকি'}`}
                              className={`w-2.5 h-2.5 rounded-full transition-all ${
                                st === 'safe'
                                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                  : st === 'unsafe'
                                  ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                                  : (isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-200 border border-slate-300')
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className={`text-xs font-extrabold ${
                        dayItem.safeCount === 5 
                          ? 'text-emerald-500' 
                          : dayItem.unsafeCount > 0 
                          ? 'text-rose-500' 
                          : (isDark ? 'text-slate-300' : 'text-slate-600')
                      }`}>
                        {toBn(dayItem.safeCount)}/৫ সেফ
                      </span>

                      <button
                        onClick={() => {
                          setActiveDateKey(dayItem.key);
                          setView('tracker');
                        }}
                        className={`text-[10px] font-bold px-2 py-0.8 rounded-lg border transition-all cursor-pointer ${
                          isDark 
                            ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-white/10' 
                            : 'bg-white hover:bg-slate-100 text-emerald-700 border-slate-300 shadow-xs'
                        }`}
                      >
                        দিনটি দেখুন
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spiritual Reflection & Nasihat */}
          <div className={`rounded-2xl p-4 sm:p-5 mb-5 border backdrop-blur-xl ${
            isDark ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                isDark ? 'text-amber-300' : 'text-amber-800'
              }`}>
                আত্মশুদ্ধি ও বিশেষ নসিহত
              </h3>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {rangeSafeRate >= 85
                ? 'আলহামদুলিল্লাহ! আপনার ধারাবাহিকতা অত্যন্ত প্রশংসনীয়। সালাতের হেফাজত এবং আল্লাহর ভয় অন্তরে জাগ্রত রেখে এই পবিত্র যাত্রা অক্ষুণ্ণ রাখুন।'
                : rangeSafeRate >= 50
                ? 'আপনি চেষ্টা করছেন, মাশাআল্লাহ। যে ওয়াক্তগুলোতে বিচ্যুতি বা অসতর্কতা ঘটে, সেই সময়ে মোবাইল দূরে রেখে ইস্তিগফার ও জিকিরে আত্মনিয়োগ করুন।'
                : 'হতাশ হবেন না। তাওবা ও ইস্তিগফারের মাধ্যমে নতুন সংকল্প নিয়ে আবার শুরু করুন। প্রতিটি ওয়াক্তের সালাত আদায় শেষে সাথে সাথে ট্র্যাকার আপডেট করুন।'}
            </p>

            <div className={`mt-3 pt-2.5 border-t text-[11px] font-arabic italic ${
              isDark ? 'border-white/5 text-emerald-300/80' : 'border-slate-200 text-emerald-800'
            }`}>
              "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا" — আর যারা আমার পথে চেষ্টা-সংগ্রাম করে, আমি অবশ্যই তাদেরকে আমার পথে পরিচালিত করব। (সূরা আনকাবুত: ৬৯)
            </div>
          </div>

          {/* Centralized Cloud Storage & Multi-Device Sync Card (Replaces Manual Backup) */}
          <div className={`rounded-2xl p-4 sm:p-5 mb-6 border backdrop-blur-xl ${
            isDark ? 'glass-card border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2.5 mb-2">
              <Cloud className="w-5 h-5 text-emerald-500" />
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                স্বয়ংক্রিয় সেন্ট্রালাইজড ডেটা সিঙ্ক
              </h3>
            </div>
            
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              ম্যানুয়াল ব্যাকআপের কোনো প্রয়োজন নেই। আপনার সমস্ত রেকর্ড স্বয়ংক্রিয়ভাবে সেন্ট্রাল সার্ভারে সংরক্ষিত হচ্ছে। ফোন, ট্যাবলেট বা ল্যাপটপ—যেকোনো ডিভাইস বা ব্রাউজার থেকে ভিজিট করলেই আপনার ডেটা রিয়েল-টাইমে আপডেট থাকবে।
            </p>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>সেন্ট্রাল স্টোরেজ সংযুক্ত</span>
              </span>
              {lastSyncTime && (
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  • শেষ সিঙ্ক: {toBn(lastSyncTime.getHours())}:{String(lastSyncTime.getMinutes()).padStart(2, '0')}
                </span>
              )}
            </div>
          </div>

          {/* Personal Tips & Reminders Library */}
          <TipsLibrarySection
            tips={tipsList}
            favoriteTipIds={favoriteTipIds}
            frequency={tipPopupFrequency}
            isDark={isDark}
            onAddTip={handleAddTip}
            onUpdateTip={handleUpdateTip}
            onDeleteTip={handleDeleteTip}
            onToggleFavorite={handleToggleFavoriteTip}
            onResetDefaults={handleResetDefaultTips}
            onChangeFrequency={handleChangeTipFrequency}
          />

          {/* Return Button */}
          <div className="text-center pb-6">
            <button
              onClick={() => setView('tracker')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              ট্র্যাকারে ফিরে যান
            </button>
          </div>
        </div>

        {/* Security & Password Modal */}
        <SecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          isPasswordEnabled={isPasswordEnabled}
          currentPassword={savedPassword}
          currentPin={savedPin}
          isPwaApp={isPwaApp}
          onUpdateSecurity={handleUpdateSecurity}
          onLockNow={handleLockNow}
          onDisguiseLockNow={isPwaApp ? handleLockDisguise : undefined}
          isDark={isDark}
        />

        {/* 'My Quran' / 'ULS Arabic' Animated Calligraphy Splash Screen */}
        {showIntro && (
          <AnimatedSplashIntro
            darkMode={isDark}
            onClosing={() => setIntroClosing(true)}
            onFinish={() => {
              setIntroClosing(false);
              setShowIntro(false);
            }}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: MAIN TRACKER (FLAWLESS IN BOTH DARK & LIGHT)
  // -------------------------------------------------------------
  const customTips = tipsList.filter(t => t.source === 'custom' || t.id.startsWith('custom-'));
  const activeCustomTipIdx = customTips.length > 0 ? (currentCustomTipIdx % customTips.length) : 0;
  const currentCustomTip = customTips[activeCustomTipIdx];

  return (
    <div className={`min-h-screen flex flex-col items-center safe-app-container antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300 relative ${
      isDark ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* 100% Halal Infinite Background Rotator */}
      <HalalBackground isDark={isDark} />

      <div className="w-full max-w-lg sm:max-w-xl animate-fadeIn">
        {/* Top Header Card with Ayah and Utility Buttons (Clean & Compact) */}
        <header className="mb-4 sm:mb-5">
          {/* Top Bar Utilities: Brand + Clean Minimal Icon Actions */}
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            {/* SAFEZONE Brand & "I Love Allah" Badge (Harmonized h-9 Glass Capsule) */}
            <div className={`h-9 px-2.5 sm:px-3.5 rounded-2xl border flex items-center gap-1.5 sm:gap-2 shadow-xs backdrop-blur-xl transition-all ${
              isDark 
                ? 'bg-slate-950/80 border-white/15 text-white shadow-black/20' 
                : 'bg-white/90 border-slate-300/80 text-slate-900 shadow-slate-200/60'
            }`}>
              <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className={`text-[11px] sm:text-xs font-black tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                SAFEZONE
              </span>

              <span className="w-px h-3 bg-slate-300 dark:bg-white/20 shrink-0" />

              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold shrink-0">
                <span className={isDark ? "bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-300 bg-clip-text text-transparent font-extrabold tracking-tight" : "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent font-extrabold tracking-tight"}>
                  I Love Allah
                </span>
                <span className="font-arabic text-xs font-black text-amber-500 dark:text-amber-400 leading-none select-none">ﷻ</span>
              </span>

              <span className="w-px h-3 bg-slate-300 dark:bg-white/20 shrink-0" />

              <button
                type="button"
                onClick={() => setIsLevelModalOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer select-none"
                title="তাওহীদ সিস্টেম স্ট্যাটাস উইন্ডো দেখতে চাপুন"
              >
                <span className="text-amber-400">⚡</span>
                <span>তাওহীদ LV.{toBn(gamification.currentLevelId || 1)}</span>
                <span className="text-[9px] text-slate-400">({toBn(gamification.totalPoints)})</span>
              </button>
            </div>

            {/* Clean Icon-Only Action Dock: Unified h-9 Glass Capsule */}
            <div className={`h-9 px-1 rounded-2xl border flex items-center gap-0.5 sm:gap-1 shadow-xs backdrop-blur-xl transition-all ${
              isDark 
                ? 'bg-slate-950/80 border-white/15 shadow-black/20' 
                : 'bg-white/90 border-slate-300/80 shadow-slate-200/60'
            }`}>
              {/* Quick Calculator Disguise Lock Button (ONLY shown in Android / PWA app) */}
              {isPwaApp && (
                <button
                  type="button"
                  onClick={handleLockDisguise}
                  title="গোপন লক"
                  className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                    isDark
                      ? 'text-slate-300 hover:text-amber-400 hover:bg-white/10'
                      : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                  }`}
                >
                  <CalcIcon className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Quick Lock Button (Visible if password is enabled) */}
              {isPasswordEnabled && (
                <button
                  type="button"
                  onClick={handleLockNow}
                  title="ওয়েবসাইট এখনই লক করুন"
                  className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                    isDark
                      ? 'text-slate-300 hover:text-amber-400 hover:bg-white/10'
                      : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Personal Tips & Reminders Quick Button */}
              <button
                type="button"
                onClick={() => setIsTipPopupOpen(true)}
                title="আজকের উপদেশ ও অনুপ্রেরণা"
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                  isDark
                    ? 'text-slate-300 hover:text-amber-400 hover:bg-white/10'
                    : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
              </button>

              {/* Security & Password Settings Modal Button */}
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(true)}
                title="পাসওয়ার্ড ও নিরাপত্তা সেটিংস"
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                  isDark
                    ? 'text-slate-300 hover:text-emerald-400 hover:bg-white/10'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                  isDark
                    ? 'text-slate-300 hover:text-amber-300 hover:bg-white/10'
                    : 'text-slate-600 hover:text-amber-500 hover:bg-slate-100'
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Ayah Card */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl border text-center transition-all duration-300 shadow-md backdrop-blur-xl ${
              isDark 
                ? 'bg-slate-950/85 border-white/15 text-slate-100 shadow-black/40' 
                : 'bg-white/95 border-slate-300/90 text-slate-900 shadow-slate-200'
            }`}
          >
            <span className={`font-arabic text-sm sm:text-base md:text-lg font-bold tracking-wide leading-relaxed block px-2 ${
              isDark ? 'text-emerald-300' : 'text-emerald-700'
            }`}>
              إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ
            </span>
          </div>
        </header>

        {/* User's Personal Tips Card */}
        {(customTips.length > 0 || isAddingTrackerTip) ? (
          <div className={`p-3.5 sm:p-4 rounded-2xl border mb-4 shadow-sm transition-all backdrop-blur-xl animate-fadeIn ${
            isDark ? 'glass-card border-white/10' : 'bg-white/90 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10 dark:border-white/10 border-slate-200/80">
              <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                <Lightbulb className="w-3.5 h-3.5" />
                <span>আপনার ব্যক্তিগত রিমাইন্ডার</span>
                {customTips.length > 1 && !isAddingTrackerTip && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                    isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200/80 text-slate-700'
                  }`}>
                    {toBn(activeCustomTipIdx + 1)}/{toBn(customTips.length)}
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Plus / Add Reminder Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTrackerTip(!isAddingTrackerTip);
                    if (!isAddingTrackerTip) {
                      setTrackerTipText('');
                      setTrackerTipDalil('');
                    }
                  }}
                  className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                    isAddingTrackerTip
                      ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                      : isDark 
                        ? 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/40' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                  }`}
                  title={isAddingTrackerTip ? "ফর্ম বন্ধ করুন" : "নতুন রিমাইন্ডার যোগ করুন"}
                >
                  {isAddingTrackerTip ? (
                    <>
                      <X className="w-3 h-3" />
                      <span>বাতিল</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>নতুন</span>
                    </>
                  )}
                </button>

                {/* Next Reminder Button */}
                {customTips.length > 1 && !isAddingTrackerTip && (
                  <button
                    type="button"
                    onClick={() => setCurrentCustomTipIdx((prev) => (prev + 1) % customTips.length)}
                    className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isDark 
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-white/10' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                    title="পরবর্তী রিমাইন্ডার দেখুন"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>পরেরটি</span>
                  </button>
                )}

                {/* Delete Current Tip */}
                {currentCustomTip && !isAddingTrackerTip && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('এই ব্যক্তিগত রিমাইন্ডারটি কি মুছে ফেলতে চান?')) {
                        handleDeleteTip(currentCustomTip.id);
                        setCurrentCustomTipIdx(0);
                      }
                    }}
                    className={`p-1 sm:p-1.5 rounded-lg border transition-colors cursor-pointer active:scale-95 ${
                      isDark 
                        ? 'bg-slate-800/60 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border-white/10 hover:border-rose-500/30' 
                        : 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200 hover:border-rose-200'
                    }`}
                    title="এই রিমাইন্ডারটি মুছুন"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Card Content: Add Form or Current Reminder */}
            {isAddingTrackerTip ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!trackerTipText.trim()) return;
                  handleAddTip(trackerTipText.trim(), trackerTipDalil.trim() || undefined);
                  setTrackerTipText('');
                  setTrackerTipDalil('');
                  setIsAddingTrackerTip(false);
                  setCurrentCustomTipIdx(0);
                }}
                className="space-y-2 pt-1 animate-fadeIn"
              >
                <div className="space-y-1">
                  <textarea
                    value={trackerTipText}
                    onChange={(e) => setTrackerTipText(e.target.value)}
                    placeholder="আপনার ব্যক্তিগত রিমাইন্ডার বা উপদেশ লিখুন..."
                    rows={2}
                    autoFocus
                    className={`w-full p-2.5 rounded-xl text-xs sm:text-sm border resize-none focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-900/90 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                    }`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    value={trackerTipDalil}
                    onChange={(e) => setTrackerTipDalil(e.target.value)}
                    placeholder="দলিল বা রেফারেন্স (ঐচ্ছিক)"
                    className={`w-full sm:flex-1 p-2 rounded-xl text-xs border focus:outline-none ${
                      isDark 
                        ? 'bg-slate-900/90 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-emerald-500' 
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                    }`}
                  />
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTrackerTip(false);
                        setTrackerTipText('');
                        setTrackerTipDalil('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        isDark 
                          ? 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700' 
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={!trackerTipText.trim()}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>সেভ করুন</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div>
                {currentCustomTip ? (
                  <>
                    <p className={`text-sm sm:text-base font-semibold leading-relaxed whitespace-pre-wrap ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {currentCustomTip.text}
                    </p>
                    {currentCustomTip.dalil && (
                      <p className={`text-[11px] sm:text-xs mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        - {currentCustomTip.dalil}
                      </p>
                    )}
                  </>
                ) : (
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    কোনো ব্যক্তিগত রিমাইন্ডার নেই। নতুন রিমাইন্ডার লিখতে উপরের ‘নতুন’ বাটনে ক্লিক করুন।
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* When no custom tips exist, show a minimal quick-add prompt */
          <div className={`p-3 rounded-2xl border mb-4 flex items-center justify-between shadow-sm transition-all backdrop-blur-xl animate-fadeIn ${
            isDark ? 'glass-card border-white/10' : 'bg-white/90 border-slate-200'
          }`}>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <Lightbulb className="w-3.5 h-3.5" />
              ব্যক্তিগত রিমাইন্ডার
            </span>
            <button
              type="button"
              onClick={() => setIsAddingTrackerTip(true)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                isDark 
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/30' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>রিমাইন্ডার যোগ করুন</span>
            </button>
          </div>
        )}

        {/* Past Day Banner */}
        {isPastDate && (
          <div className={`p-2.5 sm:p-3 rounded-2xl border mb-3 flex items-center justify-between text-xs font-semibold backdrop-blur-xl animate-fadeIn ${
            isDark 
              ? 'bg-emerald-950/40 border-emerald-600/30 text-emerald-300' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>বিগত দিনের আমল দেখা হচ্ছে (প্রয়োজনে সম্পাদনাযোগ্য)</span>
            </div>
            <button
              onClick={() => setActiveDateKey(hijriInfo.hijriKey)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold cursor-pointer transition-colors"
            >
              আজকের দিনে ফিরুন
            </button>
          </div>
        )}

        {/* Future Day Notice Banner */}
        {isFutureDate && (
          <div className={`p-2.5 sm:p-3 rounded-2xl border mb-3 flex items-center justify-between text-xs font-semibold backdrop-blur-xl animate-fadeIn ${
            isDark 
              ? 'bg-sky-950/40 border-sky-600/30 text-sky-300' 
              : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>ভবিষ্যতের দিন এখনো আসেনি (অগ্রিম পূরণ বন্ধ)</span>
            </div>
            <button
              onClick={() => setActiveDateKey(hijriInfo.hijriKey)}
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-[11px] font-bold cursor-pointer transition-colors"
            >
              আজকের দিনে ফিরুন
            </button>
          </div>
        )}

        {/* Tawhid System: Instant Amal & Tawhid Quest Card */}
        <InstantAmalCard
          gamification={gamification}
          onCompleteAmal={handleCompleteInstantAmal}
          onOpenLevelModal={() => setIsLevelModalOpen(true)}
          isDark={isDark}
        />

        {/* 1. 5 Rows: [Left Waqt] ── [Center Single Button] ── [Right Waqt] (NOW AT TOP) */}
        <div className="space-y-2.5 mb-4">
          {INTERVAL_PAIRS.map((item) => {
            const status = currentDayData[item.id];
            const isLive = isViewingToday && item.id === currentIntervalId;

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-3 sm:p-3.5 flex items-center justify-between border relative overflow-hidden transition-all duration-200 backdrop-blur-xl ${
                  isDark
                    ? (isLive 
                        ? 'border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/40 bg-slate-900/80' 
                        : 'glass-card glass-card-hover border-white/5')
                    : (isLive 
                        ? 'bg-white border-emerald-500/60 ring-1 ring-emerald-500/20 shadow-sm' 
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm')
                }`}
              >
                {/* Active Waqt Indicator Line */}
                {isLive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />
                )}

                {/* 1. Left: Starting Waqt */}
                <div className="w-20 sm:w-26 text-left select-none pl-1">
                  <div className="flex items-center gap-1 -ml-1">
                    <span 
                      onClick={() => !isFutureDate && handleToggleKhushu(currentViewKey, item.id)}
                      className={`text-sm sm:text-base font-bold tracking-tight pl-1 cursor-pointer transition-colors ${
                        khushuHistory[currentViewKey]?.[item.id] 
                          ? item.colorClass 
                          : (isDark ? 'text-white hover:text-slate-200' : 'text-slate-900 hover:text-slate-700')
                      }`}
                      title="আগে মসজিদে যাওয়া ও সুন্দরভাবে সালাত আদায় (ক্লিক করুন)"
                    >
                      {item.startWaqt}
                    </span>
                    <button
                      onClick={() => handleToggleZikr(currentViewKey, item.id)}
                      disabled={isFutureDate}
                      title="সালাত পরবর্তী জিকির ও দুআ করেছি"
                      className="p-1 rounded-lg cursor-pointer transition-transform active:scale-90"
                    >
                      {zikrHistory[currentViewKey]?.[item.id] ? (
                        <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                      ) : (
                        <Square className={`w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 hover:opacity-100 transition-opacity ${isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'}`} />
                      )}
                    </button>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-arabic block -mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500 font-medium'
                  }`}>
                    {item.startArabic}
                  </span>
                  {isLive && (
                    <span className={`text-[9px] font-bold tracking-wider uppercase block mt-0.5 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      • চলমান
                    </span>
                  )}
                </div>

                {/* 2. Middle: Just ONE Button (Click to toggle Safe / Unsafe / Reset) */}
                <div className="flex-1 flex justify-center px-1">
                  <button
                    onClick={() => handleCycleStatus(item.id)}
                    disabled={isFutureDate}
                    title={
                      isFutureDate
                        ? "ভবিষ্যতের দিন এখনো আসেনি (অগ্রিম পূরণ বন্ধ)"
                        : isPastDate
                        ? "বিগত দিনের আমল পরিবর্তন করতে চাপুন"
                        : "আমল ট্র্যাক করতে চাপুন"
                    }
                    className={`w-32 sm:w-40 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 select-none shadow-sm ${
                      isFutureDate ? 'cursor-not-allowed opacity-80' : 'cursor-pointer active:scale-95'
                    } ${
                      status === 'safe'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30'
                        : status === 'unsafe'
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30'
                        : (isDark 
                            ? 'bg-slate-800/80 hover:bg-slate-800 text-emerald-300 border border-white/10 hover:border-emerald-500/30' 
                            : 'bg-slate-100 hover:bg-slate-200 text-emerald-800 border border-slate-300 hover:border-emerald-500/40')
                    }`}
                  >
                    {status === 'safe' ? (
                      <span className="font-arabic text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>الْحَمْدُ لِلَّهِ</span>
                      </span>
                    ) : status === 'unsafe' ? (
                      <span className="font-arabic text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1">
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>رَبِّ اغْفِرْ لِي</span>
                      </span>
                    ) : (
                      <span className={`font-arabic text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <Shield className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span>لِلَّهِ</span>
                      </span>
                    )}
                  </button>
                </div>

                {/* 3. Right: Ending Waqt + Earbud Tracker */}
                {(() => {
                  const earbudMins = earbudsHistory[currentViewKey]?.[item.id] || 0;
                  return (
                    <div 
                      onClick={() => !isFutureDate && setEditingEarbudInterval(item.id)}
                      className={`w-24 sm:w-28 text-right select-none pr-1 transition-all rounded-xl p-1 -mr-1 group ${
                        isFutureDate ? 'opacity-80' : 'cursor-pointer hover:bg-white/5 active:scale-95'
                      }`}
                      title="আল্লাহর জন্য ইয়ারবাড ব্যবহারের সময় ট্র্যাক করুন (ক্লিক করুন)"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-sm sm:text-base font-bold tracking-tight transition-colors ${
                          earbudMins > 0 
                            ? 'text-teal-400 group-hover:text-teal-300' 
                            : (isDark ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-700')
                        }`}>
                          {item.endWaqt}
                        </span>
                      </div>

                      {earbudMins > 0 ? (
                        <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-teal-300 bg-teal-950/60 border border-teal-500/30 px-1.5 py-0.5 rounded-md mt-0.5 shadow-xs">
                          <Headphones className="w-2.5 h-2.5 text-teal-400 shrink-0" />
                          <span>{formatEarbudMinutesBn(earbudMins)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Headphones className="w-2.5 h-2.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          <span className={`text-[10px] sm:text-xs font-arabic ${
                            isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'
                          }`}>
                            {item.endArabic}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* 2. Interactive Hijri Date Card (NOW BELOW WAQT ROWS) */}
        <div className={`rounded-2xl p-3.5 sm:p-4 mb-3 shadow-sm border relative overflow-hidden w-full transition-all backdrop-blur-xl ${
          isDark ? 'glass-card border-white/10' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDay(-1)}
              title="আগের দিন"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border active:scale-95 shrink-0 cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-white/5' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* DATE AREA (CLICKABLE -> OPENS CALENDAR) */}
            <button
              type="button"
              onClick={openCalendar}
              className={`text-center px-2 py-1 rounded-xl transition-all group flex-1 cursor-pointer ${
                isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100/80'
              }`}
              title="হিজরি ক্যালেন্ডার খুলুন"
            >
              <div className={`flex items-center justify-center gap-1.5 text-base sm:text-lg font-bold tracking-tight group-hover:scale-102 transition-transform ${
                isDark ? 'text-emerald-300' : 'text-emerald-700'
              }`}>
                <CalendarDays className="w-4 h-4 opacity-80" />
                <span>{formatKeyToBangla(currentViewKey)}</span>
                <span className="opacity-80">•</span>
                <span className={isDark ? 'text-emerald-200' : 'text-emerald-800'}>
                  {getWeekdayForHijriKey(currentViewKey, offsetDays)}
                </span>
              </div>
              
              <p className={`text-[11px] sm:text-xs mt-0.5 flex flex-wrap items-center justify-center gap-1 font-normal ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isViewingToday && hijriInfo.isPostMaghrib ? (
                  <span>
                    মাগরিবের পর নতুন হিজরি দিন (<span className="font-semibold text-emerald-400">{hijriInfo.weekdayName} দিবাগত রাত</span>)
                  </span>
                ) : (
                  <span>মাগরিব ➔ মাগরিব হিজরি দিন ({getWeekdayForHijriKey(currentViewKey, offsetDays)})</span>
                )}
                {isViewingToday && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ml-0.5 ${
                    isDark 
                      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800' 
                      : 'text-emerald-700 bg-emerald-50 border-emerald-300'
                  }`}>
                    আজ
                  </span>
                )}
              </p>
            </button>

            <button
              onClick={() => navigateDay(1)}
              title="পরের দিন"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border active:scale-95 shrink-0 cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-white/5' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isViewingToday && (
            <div className={`mt-2.5 pt-2.5 border-t flex items-center justify-between text-xs ${
              isDark ? 'border-white/5' : 'border-slate-200'
            }`}>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {isPastDate ? 'বিগত দিনের রেকর্ড (সম্পাদনাযোগ্য)' : 'ভবিষ্যতের দিন'}
              </span>
              <button
                onClick={() => setActiveDateKey(hijriInfo.hijriKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
                  isDark 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                আজকের দিনে ফিরুন
              </button>
            </div>
          )}
        </div>

        {/* 3. Safe Score Card: Today + Total Safe & Total Unsafe Scores (NOW BELOW WAQT ROWS) */}
        <div className={`rounded-2xl p-3.5 sm:p-4 mb-4 shadow-sm border transition-all backdrop-blur-xl ${
          isDark ? 'glass-card border-white/10' : 'bg-white/90 border-slate-200'
        }`}>
          {/* Top Row: Today's Waqt Score + Streak & Reset */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 border-slate-200/80">
            <div>
              <span className={`text-[10px] sm:text-xs uppercase tracking-wider block font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                আজকের সেফ স্কোর
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className={`text-2xl sm:text-3xl font-extrabold ${
                  safeCount === 5 
                    ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                    : safeCount >= 3 
                    ? (isDark ? 'text-teal-300' : 'text-teal-600')
                    : (isDark ? 'text-white' : 'text-slate-900')
                }`}>
                  {toBn(safeCount)}
                </span>
                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  / ৫ ওয়াক্ত সেফ
                </span>
              </div>

              {/* 5 Visual Beads Indicator */}
              <div className="flex items-center gap-2 mt-2">
                {INTERVAL_PAIRS.map((item) => {
                  const st = currentDayData[item.id];
                  return (
                    <span
                      key={item.id}
                      title={`${item.startWaqt} ➔ ${item.endWaqt}: ${st || 'unmarked'}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        st === 'safe'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] scale-110'
                          : st === 'unsafe'
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] scale-110'
                          : (isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-200 border border-slate-300')
                      }`}
                    />
                  );
                })}
              </div>

              {/* Today's Breakdown: সেফ • আনসেফ • পূরণ বাকি */}
              <div className="text-[11px] sm:text-xs mt-2 font-medium flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">{toBn(safeCount)} সেফ</span>
                <span className="text-slate-400">•</span>
                <span className="text-rose-500 font-bold">{toBn(unsafeCount)} আনসেফ</span>
                <span className="text-slate-400">•</span>
                <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{toBn(unfillCount)} পূরণ বাকি</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {streak > 0 && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold shadow-sm ${
                  isDark 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{toBn(streak)} দিন</span>
                </div>
              )}

              {answeredCount > 0 && !isFutureDate ? (
                <button
                  onClick={handleResetCurrentDay}
                  title={isViewingToday ? "আজকের দিনের ট্র্যাকিং রিসেট" : "এই দিনের ট্র্যাকিং রিসেট"}
                  className={`p-2 rounded-xl transition-all border active:scale-95 cursor-pointer ${
                    isDark 
                      ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 border-white/5' 
                      : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Bottom Grid: Total Safe Score, Total Unsafe Score & Unfilled (beside unsafe) */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isDark 
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200' 
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            }`}>
              <span className={`text-[10px] sm:text-[11px] block font-semibold uppercase tracking-wider ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                মোট সেফ
              </span>
              <div className="text-base sm:text-lg font-black mt-0.5 text-emerald-500">
                {toBn(totalSafeCount)} <span className="text-[10px] sm:text-xs font-medium">ওয়াক্ত</span>
              </div>
            </div>

            <div className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isDark 
                ? 'bg-rose-950/40 border-rose-900/50 text-rose-200' 
                : 'bg-rose-50/90 border-rose-200 text-rose-900'
            }`}>
              <span className={`text-[10px] sm:text-[11px] block font-semibold uppercase tracking-wider ${
                isDark ? 'text-rose-400' : 'text-rose-700'
              }`}>
                মোট আনসেফ
              </span>
              <div className="text-base sm:text-lg font-black mt-0.5 text-rose-500">
                {toBn(totalUnsafeCount)} <span className="text-[10px] sm:text-xs font-medium">ওয়াক্ত</span>
              </div>
            </div>

            <div className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isDark 
                ? 'bg-slate-900/60 border-white/10 text-slate-300' 
                : 'bg-slate-100/90 border-slate-200 text-slate-700'
            }`}>
              <span className={`text-[10px] sm:text-[11px] block font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                পূরণ বাকি
              </span>
              <div className={`text-base sm:text-lg font-black mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {toBn(totalUnmarkedCount)} <span className="text-[10px] sm:text-xs font-medium">ওয়াক্ত</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Tips & Reminders Carousel Slider */}
        <TipsSlider
          tips={tipsList}
          isDark={isDark}
          onOpenLibrary={() => setView('analytics')}
          favoriteIds={favoriteTipIds}
          onToggleFavorite={handleToggleFavoriteTip}
        />

        {/* Bottom Prominent Buttons (Tools & Analytics) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
          <button
            onClick={() => setView('tools')}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-98 cursor-pointer ${
              isDark ? 'bg-slate-900 text-rose-400 border border-rose-900/50 hover:bg-rose-950/30' : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>আত্মশুদ্ধি ও রেসকিউ টুলস</span>
          </button>
          <button
            onClick={() => setView('analytics')}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.01] active:scale-98 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-white" />
            <span>অ্যানালাইজ ও বিস্তারিত রিপোর্ট</span>
          </button>
        </div>

        {/* Minimal Footer with High-Contrast Border Badge */}
        <footer className="text-center text-xs pb-6 pt-2 flex justify-center">
          <div className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border shadow-md backdrop-blur-xl transition-all flex-wrap ${
            isDark 
              ? 'bg-slate-950/85 border-white/15 text-slate-200 shadow-black/40' 
              : 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-200'
          }`}>
            <span className="font-semibold">SafeZone • মাগরিব হতে মাগরিব ওয়াক্ত ট্র্যাকার</span>
            <span className="opacity-30">•</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-all ${
              isDark 
                ? 'bg-amber-500/10 border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                : 'bg-amber-50/90 border-amber-300 shadow-xs'
            }`}>
              <span className={isDark ? "bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-300 bg-clip-text text-transparent font-black tracking-wide" : "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent font-black tracking-wide"}>
                I Love Allah
              </span>
              <span className="font-arabic text-xs font-extrabold text-amber-500 dark:text-amber-400 leading-none select-none">ﷻ</span>
            </span>
            <span className="opacity-30">•</span>
            <button
              type="button"
              onClick={() => {
                setIntroClosing(false);
                setShowIntro(true);
              }}
              className={`hover:underline cursor-pointer transition-colors flex items-center gap-1 font-semibold ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'
              }`}
              title="আরবী ক্যালিগ্রাফি অ্যানিমেটেড ইন্ট্রো পুনরায় দেখুন"
            >
              <span>ইন্ট্রো দেখুন</span>
            </button>
          </div>
        </footer>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HIJRI MONTH CALENDAR MODAL (Opens on Date Click) */}
      {/* Color Opacity reflects each day's SafeZone status */}
      {/* ------------------------------------------------------------- */}
      {isCalendarOpen && (() => {
        const monthCal = getRealHijriMonthCalendar(calYear, calMonth, offsetDays);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className={`rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border relative ${
              isDark 
                ? 'glass-card border-white/10 text-slate-100' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Month Navigation Header */}
              <div className={`flex items-center justify-between mb-3 pb-3 border-b pr-8 ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="পূর্ববর্তী হিজরি মাস"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border active:scale-95 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-white/5' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <div className={`text-base sm:text-lg font-bold flex items-center justify-center gap-1.5 ${
                    isDark ? 'text-emerald-300' : 'text-emerald-700'
                  }`}>
                    <Moon className="w-4 h-4 shrink-0" />
                    <span>{monthCal.monthNameBn}</span>
                    <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                      {toBn(monthCal.yearNum)} হিজরি
                    </span>
                  </div>
                  <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    মোট {toBn(monthCal.totalDays)} দিন
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="পরবর্তী হিজরি মাস"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border active:scale-95 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-white/5' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 7 Weekday Columns Header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5 select-none">
                {['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'].map((w, idx) => (
                  <span
                    key={idx}
                    className={`text-[11px] font-bold py-1 ${
                      idx === 6 
                        ? (isDark ? 'text-emerald-400 font-extrabold' : 'text-emerald-600 font-extrabold')
                        : (isDark ? 'text-slate-400' : 'text-slate-500')
                    }`}
                  >
                    {w}
                  </span>
                ))}
              </div>

              {/* Authentic 7-Column Hijri Grid with Bangladesh Weekday Alignment */}
              <div className="grid grid-cols-7 gap-1.5 mb-3">
                {Array.from({ length: monthCal.startWeekdayIndex }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-10 sm:h-11 rounded-xl bg-transparent" />
                ))}

                {monthCal.days.map((item) => {
                  const dayData = history[item.dayKey];
                  const bgClass = getDayColorOpacity(dayData);
                  const isSelected = item.dayKey === currentViewKey;
                  const isToday = item.dayKey === hijriInfo.hijriKey;
                  const isDayPast = item.dayKey < hijriInfo.hijriKey;

                  return (
                    <button
                      key={item.dayNum}
                      type="button"
                      title={`${toBn(item.dayNum)} ${monthCal.monthNameBn} (${item.weekdayName})${isDayPast ? ' - বিগত দিন' : ''}`}
                      onClick={() => {
                        setActiveDateKey(item.dayKey);
                        setIsCalendarOpen(false);
                      }}
                      className={`h-10 sm:h-11 rounded-xl flex items-center justify-center transition-all relative select-none cursor-pointer ${bgClass} ${
                        isSelected ? 'ring-2 ring-emerald-400 scale-105 shadow-lg' : ''
                      } ${isToday ? 'border-2 border-amber-400 font-black' : ''}`}
                    >
                      <span className="text-xs sm:text-sm font-bold">{toBn(item.dayNum)}</span>
                      {isToday && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Banner */}
              <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-900/60 border-white/5' : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  নির্বাচিত তারিখ:
                </span>
                <span className={`font-bold flex items-center gap-1.5 ${
                  isDark ? 'text-emerald-300' : 'text-emerald-700'
                }`}>
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{formatKeyToBangla(currentViewKey)}</span>
                  <span>•</span>
                  <span>{getWeekdayForHijriKey(currentViewKey, offsetDays)}</span>
                </span>
              </div>

              {/* Bottom Actions */}
              <div className={`flex items-center justify-between pt-2 border-t ${
                isDark ? 'border-white/5' : 'border-slate-200'
              }`}>
                <button
                  onClick={() => {
                    setActiveDateKey(hijriInfo.hijriKey);
                    setCalYear(hijriInfo.yearNum);
                    setCalMonth(hijriInfo.monthNum);
                    setIsCalendarOpen(false);
                  }}
                  className={`text-xs underline underline-offset-2 font-semibold ${
                    isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  আজকের দিনে ফিরে যান
                </button>

                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Earbuds Time Tracker Modal (For Allah) */}
      {(() => {
        const editingPair = INTERVAL_PAIRS.find((p) => p.id === editingEarbudInterval);
        return (
          <EarbudsTimeModal
            isOpen={editingEarbudInterval !== null}
            onClose={() => setEditingEarbudInterval(null)}
            waqtId={editingEarbudInterval}
            waqtLabel={editingPair ? `${editingPair.startWaqt} ➔ ${editingPair.endWaqt}` : ''}
            startWaqt={editingPair?.startWaqt || ''}
            endWaqt={editingPair?.endWaqt || ''}
            initialMinutes={editingEarbudInterval ? (earbudsHistory[currentViewKey]?.[editingEarbudInterval] || 0) : 0}
            onSave={(mins) => {
              if (editingEarbudInterval) {
                handleSaveEarbudsTime(editingEarbudInterval, mins);
              }
            }}
            isDark={isDark}
            toBn={toBn}
          />
        );
      })()}

      {/* Tawhid System Status Window Modal */}
      <TawhidStatusModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        gamification={gamification}
        safeDaysStreak={currentStreak || streak || 0}
        isDark={isDark}
        onOpenLevelAmals={(lvlId) => {
          setIsLevelModalOpen(false);
          handleOpenLevelAmals(lvlId);
        }}
      />

      {/* Tawhid Level Amals Log Modal */}
      <TawhidLevelAmalsModal
        isOpen={isLevelAmalsModalOpen}
        onClose={() => setIsLevelAmalsModalOpen(false)}
        levelId={selectedLevelIdForAmals ?? gamification.currentLevelId ?? 1}
        onSelectLevelId={(id) => setSelectedLevelIdForAmals(id)}
        completedHistory={gamification.completedHistory || []}
        userTotalPoints={gamification.totalPoints}
        userCurrentLevelId={gamification.currentLevelId || 1}
        isDark={isDark}
      />

      {/* দৈনিক লক্ষ্য পূরণের বোনাস */}
      {goalBonusToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-2xl border border-emerald-400/60 bg-[#031a14]/95 text-emerald-300 font-mono text-xs font-bold shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-fadeIn"
        >
          🎯 দৈনিক লক্ষ্য পূরণ! +{toBn(DAILY_GOAL_BONUS)} বোনাস EXP
        </div>
      )}

      {/* Tawhid Level-Up Celebration Popup */}
      {levelUpInfo && (
        <TawhidLevelUpPopup
          isOpen={true}
          onClose={() => setLevelUpInfo(null)}
          newLevel={levelUpInfo.newLevel}
          prevLevel={levelUpInfo.prevLevel}
          isDark={isDark}
        />
      )}

      {/* Prayer Times & Sunset Modal */}
      <PrayerTimesModal
        isOpen={isPrayerModalOpen}
        onClose={() => setIsPrayerModalOpen(false)}
        prayerTimes={prayerTimes}
        currentIntervalId={currentIntervalId}
        selectedDistrictId={selectedDistrictId}
        onSelectDistrict={handleSelectDistrict}
        customMaghribTime={customMaghribTime}
        onUpdateCustomMaghrib={handleUpdateCustomMaghrib}
        isDark={isDark}
      />

      {/* Security & Password Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        isPasswordEnabled={isPasswordEnabled}
        currentPassword={savedPassword}
        currentPin={savedPin}
        isPwaApp={isPwaApp}
        onUpdateSecurity={handleUpdateSecurity}
        onLockNow={handleLockNow}
        onDisguiseLockNow={isPwaApp ? handleLockDisguise : undefined}
        isDark={isDark}
      />

      {/* Inspirational Entrance / Wisdom Tip Popup */}
      <TipPopup
        isOpen={isTipPopupOpen}
        tips={tipsList}
        isDark={isDark}
        onClose={() => setIsTipPopupOpen(false)}
        onOpenLibrary={() => {
          setIsTipPopupOpen(false);
          setView('analytics');
        }}
        onToggleFavorite={handleToggleFavoriteTip}
      />

      {/* 'My Quran' / 'ULS Arabic' Animated Calligraphy Splash Screen */}
      {showIntro && (
        <AnimatedSplashIntro
          darkMode={isDark}
          onClosing={() => setIntroClosing(true)}
          onFinish={() => {
            setIntroClosing(false);
            setShowIntro(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
