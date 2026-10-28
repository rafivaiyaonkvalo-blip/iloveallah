import { IntervalId, PrayerTimes } from '../types';

export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
}

export const HIJRI_MONTHS_BN = [
  'মুহাররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জুমাদাল উলা',
  'জুমাদাল উখরা',
  'রজব',
  'শাবান',
  'রমাদান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ'
];

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qadah',
  'Dhu al-Hijjah'
];

export interface HijriDateInfo {
  hijriKey: string;             // "1448-04-18"
  day: number;
  month: number;                // 1-12
  monthNameBn: string;
  monthNameEn: string;
  year: number;
  formattedBn: string;          // "১৮ রবিউস সানি ১৪৪৮ হিজরি"
  formattedEn: string;          // "18 Rabi al-Thani 1448 AH"
  gregorianStartStr: string;    // "২৯ সেপ্টেম্বর ২০২৬ (মাগরিব)"
  gregorianEndStr: string;      // "৩০ সেপ্টেম্বর ২০২৬ (মাগরিব)"
  isPostMaghrib: boolean;       // whether this Islamic day started after today's sunset
}

// Convert "HH:mm" to minutes from midnight
export function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Check whether current time has passed Maghrib today
export function isAfterMaghrib(date: Date, maghribTimeStr: string): boolean {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const maghribMinutes = timeStrToMinutes(maghribTimeStr);
  return currentMinutes >= maghribMinutes;
}

// Calculate the active Hijri day based on Islamic sunset boundary
export function getActiveHijriDate(
  currentDate: Date = new Date(),
  prayerTimes: PrayerTimes = {
    fajr: '04:45',
    sunrise: '05:55',
    dhuhr: '12:00',
    asr: '16:15',
    maghrib: '18:00',
    isha: '19:30'
  },
  offsetDays: number = 0
): HijriDateInfo {
  const postMaghrib = isAfterMaghrib(currentDate, prayerTimes.maghrib);
  
  // In Islamic calendar, after Maghrib, the new Hijri day begins (which corresponds to next Gregorian day's daylight)
  const calcDate = new Date(currentDate.getTime());
  
  // If after Maghrib today, add 1 day to Gregorian calendar to match the upcoming Hijri day
  if (postMaghrib) {
    calcDate.setDate(calcDate.getDate() + 1);
  }
  
  // Apply user-configured moon sighting offset (-1, 0, +1)
  if (offsetDays !== 0) {
    calcDate.setDate(calcDate.getDate() + offsetDays);
  }

  // Calculate using Intl islamic-umalqura
  let hDay = 1;
  let hMonth = 1;
  let hYear = 1448;

  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(calcDate);
    for (const part of parts) {
      if (part.type === 'day') hDay = parseInt(part.value, 10);
      if (part.type === 'month') hMonth = parseInt(part.value, 10);
      if (part.type === 'year') hYear = parseInt(part.value, 10);
    }
  } catch {
    // Fallback if browser doesn't support umalqura calendar
    const epochRef = new Date(2026, 8, 29); // 29 Sep 2026 ~ 18 Rabi al-Thani 1448
    const diffDays = Math.round((calcDate.getTime() - epochRef.getTime()) / (1000 * 60 * 60 * 24));
    let estDays = 18 + diffDays;
    hDay = ((estDays - 1) % 30) + 1;
    hMonth = 4;
    hYear = 1448;
  }

  // Safe bounds
  if (hMonth < 1) hMonth = 1;
  if (hMonth > 12) hMonth = 12;
  const monthNameBn = HIJRI_MONTHS_BN[hMonth - 1] || 'রবিউস সানি';
  const monthNameEn = HIJRI_MONTHS_EN[hMonth - 1] || 'Rabi al-Thani';

  const paddedMonth = String(hMonth).padStart(2, '0');
  const paddedDay = String(hDay).padStart(2, '0');
  const hijriKey = `${hYear}-${paddedMonth}-${paddedDay}`;

  const formattedBn = `${toBengaliNumber(hDay)} ${monthNameBn}, ${toBengaliNumber(hYear)} হিজরি`;
  const formattedEn = `${hDay} ${monthNameEn} ${hYear} AH`;

  // Start & End Gregorian strings
  const startDate = new Date(calcDate.getTime());
  if (postMaghrib) {
    startDate.setDate(startDate.getDate() - 1);
  }
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + 1);

  const gregorianStartStr = `${toBengaliNumber(startDate.getDate())} ${getBanglaMonth(startDate.getMonth())} ${toBengaliNumber(startDate.getFullYear())} (মাগরিব)`;
  const gregorianEndStr = `${toBengaliNumber(endDate.getDate())} ${getBanglaMonth(endDate.getMonth())} ${toBengaliNumber(endDate.getFullYear())} (মাগরিব)`;

  return {
    hijriKey,
    day: hDay,
    month: hMonth,
    monthNameBn,
    monthNameEn,
    year: hYear,
    formattedBn,
    formattedEn,
    gregorianStartStr,
    gregorianEndStr,
    isPostMaghrib: postMaghrib
  };
}

export function getBanglaMonth(monthIndex: number): string {
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  return months[monthIndex] || '';
}

// Determine the current interval ID based on current clock and prayer schedule
export function getCurrentIntervalId(
  now: Date,
  prayerTimes: PrayerTimes
): { currentId: IntervalId; nextId: IntervalId; minutesLeftInInterval: number; progressPercent: number } {
  const curMinutes = now.getHours() * 60 + now.getMinutes();

  const fajrMin = timeStrToMinutes(prayerTimes.fajr);
  const dhuhrMin = timeStrToMinutes(prayerTimes.dhuhr);
  const asrMin = timeStrToMinutes(prayerTimes.asr);
  const maghribMin = timeStrToMinutes(prayerTimes.maghrib);
  const ishaMin = timeStrToMinutes(prayerTimes.isha);

  // Interval order in an Islamic Day:
  // 1. maghrib -> isha (maghribMin to ishaMin)
  // 2. isha -> fajr (ishaMin to midnight to fajrMin)
  // 3. fajr -> dhuhr (fajrMin to dhuhrMin)
  // 4. dhuhr -> asr (dhuhrMin to asrMin)
  // 5. asr -> maghrib (asrMin to maghribMin)

  if (curMinutes >= maghribMin && curMinutes < ishaMin) {
    const total = ishaMin - maghribMin;
    const elapsed = curMinutes - maghribMin;
    return {
      currentId: 'maghrib_isha',
      nextId: 'isha_fajr',
      minutesLeftInInterval: Math.max(0, ishaMin - curMinutes),
      progressPercent: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
    };
  } else if (curMinutes >= ishaMin || curMinutes < fajrMin) {
    // Isha to Fajr crosses midnight
    const total = (24 * 60 - ishaMin) + fajrMin;
    const elapsed = curMinutes >= ishaMin 
      ? curMinutes - ishaMin 
      : (24 * 60 - ishaMin) + curMinutes;
    const left = curMinutes >= ishaMin 
      ? (24 * 60 - curMinutes) + fajrMin 
      : fajrMin - curMinutes;
    return {
      currentId: 'isha_fajr',
      nextId: 'fajr_dhuhr',
      minutesLeftInInterval: Math.max(0, left),
      progressPercent: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
    };
  } else if (curMinutes >= fajrMin && curMinutes < dhuhrMin) {
    const total = dhuhrMin - fajrMin;
    const elapsed = curMinutes - fajrMin;
    return {
      currentId: 'fajr_dhuhr',
      nextId: 'dhuhr_asr',
      minutesLeftInInterval: Math.max(0, dhuhrMin - curMinutes),
      progressPercent: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
    };
  } else if (curMinutes >= dhuhrMin && curMinutes < asrMin) {
    const total = asrMin - dhuhrMin;
    const elapsed = curMinutes - dhuhrMin;
    return {
      currentId: 'dhuhr_asr',
      nextId: 'asr_maghrib',
      minutesLeftInInterval: Math.max(0, asrMin - curMinutes),
      progressPercent: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
    };
  } else {
    // Asr to Maghrib
    const total = maghribMin - asrMin;
    const elapsed = curMinutes - asrMin;
    return {
      currentId: 'asr_maghrib',
      nextId: 'maghrib_isha',
      minutesLeftInInterval: Math.max(0, maghribMin - curMinutes),
      progressPercent: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
    };
  }
}

export interface HijriCalendarDay {
  dayNum: number;
  dayKey: string;
  weekdayIndex: number; // 0=Sat, 1=Sun, ..., 6=Fri
  weekdayName: string;  // 'শনিবার', 'রবিবার', etc.
}

export interface HijriMonthCalendar {
  yearNum: number;
  monthNum: number;
  monthNameBn: string;
  totalDays: number;
  startWeekdayIndex: number;
  offsetDays: number;
  days: HijriCalendarDay[];
}

export const CALENDAR_WEEKDAYS_SHORT = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];
export const CALENDAR_WEEKDAYS_FULL = [
  'শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'
];

export function getRealHijriMonthCalendar(
  hYear: number, 
  hMonth: number, 
  offsetDays: number = 0
): HijriMonthCalendar {
  const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  const monthDiff = (hYear - 1448) * 12 + (hMonth - 4);
  const estDate = new Date(2026, 8, 29);
  estDate.setDate(estDate.getDate() + Math.round(monthDiff * 29.53));

  let p = new Date(estDate);
  for (let i = 0; i < 45; i++) {
    const parts = fmt.formatToParts(p);
    const d = parseInt(parts.find(x => x.type === 'day')?.value || '1', 10);
    const m = parseInt(parts.find(x => x.type === 'month')?.value || '1', 10);
    const y = parseInt(parts.find(x => x.type === 'year')?.value || '1448', 10);
    if (y === hYear && m === hMonth && d === 1) break;
    if (y > hYear || (y === hYear && m > hMonth) || (y === hYear && m === hMonth && d > 1)) {
      p.setDate(p.getDate() - 1);
    } else {
      p.setDate(p.getDate() + 1);
    }
  }

  for (let i = 0; i < 15; i++) {
    const parts = fmt.formatToParts(p);
    const d = parseInt(parts.find(x => x.type === 'day')?.value || '1', 10);
    const m = parseInt(parts.find(x => x.type === 'month')?.value || '1', 10);
    const y = parseInt(parts.find(x => x.type === 'year')?.value || '1448', 10);
    if (y === hYear && m === hMonth && d === 1) break;
    if (y > hYear || (y === hYear && m > hMonth) || (y === hYear && m === hMonth && d > 1)) {
      p.setDate(p.getDate() - 1);
    } else {
      p.setDate(p.getDate() + 1);
    }
  }

  // Base starting weekday of day 1 in astronomical Umm al-Qura (0=Sat, ..., 6=Fri)
  const baseStartWeekday = (p.getDay() + 1) % 7;
  // Apply lunar sighting offset so days and weekdays align with reality
  const startWeekdayIndex = ((baseStartWeekday - offsetDays) % 7 + 7) % 7;

  const days: HijriCalendarDay[] = [];
  let cur = new Date(p);
  while (true) {
    const pts = fmt.formatToParts(cur);
    const d = parseInt(pts.find(x => x.type === 'day')?.value || '1', 10);
    const m = parseInt(pts.find(x => x.type === 'month')?.value || '1', 10);
    const y = parseInt(pts.find(x => x.type === 'year')?.value || '1448', 10);
    if (m !== hMonth || y !== hYear) break;

    const weekdayIndex = (startWeekdayIndex + (d - 1)) % 7;
    const weekdayName = CALENDAR_WEEKDAYS_FULL[weekdayIndex];
    const dayKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dayNum: d, dayKey, weekdayIndex, weekdayName });
    cur.setDate(cur.getDate() + 1);
  }

  const totalDays = days.length > 0 ? days.length : 30;
  const monthNameBn = HIJRI_MONTHS_BN[(hMonth - 1) % 12] || 'হিজরি';

  return {
    yearNum: hYear,
    monthNum: hMonth,
    monthNameBn,
    totalDays,
    startWeekdayIndex,
    offsetDays,
    days
  };
}

// Canonical source of truth: Get authentic weekday name in Bengali for any Hijri date key (YYYY-MM-DD)
export function getWeekdayForHijriKey(key: string, offsetDays: number = 0): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return '';
  const cal = getRealHijriMonthCalendar(y, m, offsetDays);
  const weekdayIndex = ((cal.startWeekdayIndex + (d - 1)) % 7 + 7) % 7;
  return CALENDAR_WEEKDAYS_FULL[weekdayIndex] || '';
}

