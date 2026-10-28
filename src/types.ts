export type IntervalId = 
  | 'maghrib_isha'
  | 'isha_fajr'
  | 'fajr_dhuhr'
  | 'dhuhr_asr'
  | 'asr_maghrib';

export type SafeStatus = 'safe' | 'struggled' | 'breached' | 'pending';
export type WaqtStatus = 'safe' | 'unsafe' | null;
export type DayData = Record<IntervalId, WaqtStatus>;

export interface HabitCheck {
  gazeProtected: boolean;       // চোখের হেফাজত
  screenDisciplined: boolean;   // সোশ্যাল মিডিয়া/স্ক্রিন টাইম বর্জন
  salahOnTime: boolean;         // ওয়াক্তমতো জামাআতে সালাত
  dhikrQuran: boolean;          // জিকির, কুরআন ও তিলাওয়াত
  productiveFocus: boolean;     // হালাল কাজ/পড়াশোনায় একাগ্রতা
}

export interface IntervalRecord {
  intervalId: IntervalId;
  status: SafeStatus;
  habits: HabitCheck;
  slipReasons: string[];
  notes: string;
  updatedAt: string;
}

export interface HijriDayRecord {
  hijriKey: string;           // e.g. "1448-04-18"
  hijriFormatted: string;     // e.g. "১৮ রবিউস সানি ১৪৪৮ হিজরি"
  gregorianStart: string;     // e.g. "29 Sep 2026 (Maghrib)"
  gregorianEnd: string;       // e.g. "30 Sep 2026 (Maghrib)"
  intervals: Record<IntervalId, IntervalRecord>;
  dailyReflection: string;
  safeScore: number;          // 0 to 5
  totalAnswered: number;      // 0 to 5
  createdAt: string;
  updatedAt: string;
}

export interface IntervalDefinition {
  id: IntervalId;
  order: number;
  nameBn: string;
  nameEn: string;
  arabicName: string;
  timeRangeDefault: string;
  icon: string;
  descriptionBn: string;
  adviceBn: string;
  keyHazardsBn: string[];
}

export interface PrayerTimes {
  fajr: string;     // "04:45"
  sunrise: string;  // "05:55"
  dhuhr: string;    // "12:00"
  asr: string;      // "16:15"
  maghrib: string;  // "18:00"
  isha: string;     // "19:30"
}

export interface UserSettings {
  hijriOffsetDays: number;
  prayerTimes: PrayerTimes;
  use24Hour: boolean;
  city: string;
  dailyGoalIntervals: number;
  enableSound: boolean;
}

export interface DailyPersonalAim {
  id: string;
  title: string;
  category: 'spiritual' | 'study' | 'health' | 'character';
  completed: boolean;
}

export interface TipItem {
  id: string;
  text: string;
  reference?: string;
  dalil?: string;
  topic?: string;
  category?: string;
  source?: string;
  isFavorite?: boolean;
  isCustom?: boolean;
  createdAt?: number;
}

export type TipPopupFrequency = 'every_time' | 'once_a_day' | 'off';

export interface TipsState {
  items: TipItem[];
  frequency: TipPopupFrequency;
  lastPopupDate?: string;
}

export interface InstantAmalItem {
  id: string;
  title: string;              // আমলের মূল শিরোনাম (যেমন: ১০০ বার ইস্তিগফার)
  arabic?: string;            // আরবি ইবারত
  banglaMeaning?: string;     // বাংলা অর্থ
  benefit: string;           // হাদিসের ফজিলত
  reference: string;         // সহীহ হাদিস দলীল
  durationMinutes: number;   // আনুমানিক কত মিনিট লাগবে (১, ২ বা ৩ মিনিট)
  points: number;            // ৪ পয়েন্ট
  category: 'dhikr' | 'dua' | 'quran' | 'akhlaq' | 'salat';
}

export interface CompletedAmalRecord {
  id: string;                  // ইউনিক আইডি (যেমন: timestamp-id)
  amalId: string;              // সংশ্লিষ্ট আমলের আইডি
  title: string;               // আমলের শিরোনাম
  points: number;              // অর্জিত পয়েন্ট (+৪ EXP)
  completedAt: string;         // সম্পন্ন করার সময় (ISO string)
  levelId: number;             // যে লেভেলে থাকাকালীন সম্পন্ন করা হয়েছে (১-২৫)
  levelName: string;           // লেভেলের নাম (যেমন: মুবতাদি ১ (নবযাত্রী))
  rankCode: string;            // র‍্যাংক কোড (যেমন: E-RANK)
  arabic?: string;             // আরবি ইবারত
  banglaMeaning?: string;      // বাংলা অনুবাদ
  benefit?: string;            // ফজিলত
  reference?: string;          // সহীহ দলীল
  category?: 'dhikr' | 'dua' | 'quran' | 'akhlaq' | 'salat';
}

export interface UserGamificationState {
  totalPoints: number;
  todayPoints: number;
  lastPointsDate: string;     // YYYY-MM-DD
  completedAmalIds: string[]; // আজ সম্পন্ন করা আমলসমূহের ID
  totalAmalCount: number;    // সর্বমোট সম্পন্ন আমলের সংখ্যা
  currentLevelId: number;    // ১ থেকে ২৫
  goalBonusDate?: string;    // যেদিন দৈনিক লক্ষ্যের বোনাস নেওয়া হয়েছে (YYYY-MM-DD)
  goalStreak?: number;       // টানা কত দিন দৈনিক লক্ষ্য পূরণ হয়েছে
  lastGoalDate?: string;     // সর্বশেষ যেদিন লক্ষ্য পূরণ হয়েছে
  completedHistory?: CompletedAmalRecord[]; // লেভেল অনুযায়ী সম্পন্ন করা সকল আমলের বিস্তারিত লগ
}

