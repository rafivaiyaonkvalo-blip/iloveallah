import { PrayerTimes } from '../types';

export interface UserLocation {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  displayName: string;
  source: 'gps' | 'ip' | 'timezone' | 'manual';
}

export interface LiveCalendarData {
  hijriDay: number;
  hijriMonth: number;
  hijriMonthNameBn: string;
  hijriMonthNameAr: string;
  hijriMonthNameEn: string;
  hijriYear: number;
  hijriKey: string;             // "1448-04-18"
  formattedBn: string;          // "১৮ রবিউস সানি ১৪৪৮ হিজরি"
  gregorianDateStr: string;     // "29 Sep 2026"
  weekdayBn: string;            // "মঙ্গলবার"
  prayerTimes: PrayerTimes;
  locationName: string;
  lastUpdated: number;
}

export const HIJRI_MONTHS_BN = [
  'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 
  'জুমাদাল উলা', 'জুমাদাল উখরা', 'রজব', 'শাবান', 
  'রমাদান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
];

export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBn(num: number | string): string {
  return String(num).replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)] || d);
}

export const POPULAR_CITIES = [
  { city: 'Dhaka', country: 'Bangladesh', nameBn: 'ঢাকা, বাংলাদেশ', lat: 23.8103, lng: 90.4125 },
  { city: 'Chittagong', country: 'Bangladesh', nameBn: 'চট্টগ্রাম, বাংলাদেশ', lat: 22.3569, lng: 91.7832 },
  { city: 'Sylhet', country: 'Bangladesh', nameBn: 'সিলেট, বাংলাদেশ', lat: 24.8949, lng: 91.8687 },
  { city: 'Rajshahi', country: 'Bangladesh', nameBn: 'রাজশাহী, বাংলাদেশ', lat: 24.3745, lng: 88.6042 },
  { city: 'Khulna', country: 'Bangladesh', nameBn: 'খুলনা, বাংলাদেশ', lat: 22.8456, lng: 89.5403 },
  { city: 'Mecca', country: 'Saudi Arabia', nameBn: 'মক্কা, সৌদি আরব', lat: 21.3891, lng: 39.8579 },
  { city: 'Medina', country: 'Saudi Arabia', nameBn: 'মদিনা, সৌদি আরব', lat: 24.5247, lng: 39.5692 },
  { city: 'London', country: 'United Kingdom', nameBn: 'লন্ডন, যুক্তরাজ্য', lat: 51.5074, lng: -0.1278 },
  { city: 'New York', country: 'United States', nameBn: 'নিউ ইয়র্ক, যুক্তরাষ্ট্র', lat: 40.7128, lng: -74.0060 }
];

export function getDefaultLocation(): UserLocation {
  const saved = localStorage.getItem('sz_user_location');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  // Detect via browser timezone
  let tz = 'Asia/Dhaka';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';
  } catch {
    // fallback
  }

  if (tz.includes('Dhaka') || tz.includes('Bangladesh')) {
    return {
      city: 'Dhaka',
      country: 'Bangladesh',
      latitude: 23.8103,
      longitude: 90.4125,
      timezone: tz,
      displayName: 'ঢাকা, বাংলাদেশ',
      source: 'timezone'
    };
  }

  return {
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: 23.8103,
    longitude: 90.4125,
    timezone: tz,
    displayName: 'ঢাকা, বাংলাদেশ',
    source: 'timezone'
  };
}

export function saveUserLocation(loc: UserLocation) {
  localStorage.setItem('sz_user_location', JSON.stringify(loc));
}

// Convert "HH:mm (BST)" or "HH:mm" to clean "HH:mm"
function cleanTimeStr(rawTime: string): string {
  if (!rawTime) return '12:00';
  const match = rawTime.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }
  return rawTime.trim();
}

/**
 * Fetch authentic Hijri date & prayer times from Aladhan Official API
 */
export async function fetchLiveCalendarData(
  location: UserLocation,
  date: Date = new Date()
): Promise<LiveCalendarData> {
  const epoch = Math.floor(date.getTime() / 1000);
  let url = '';

  if (location.latitude && location.longitude) {
    url = `https://api.aladhan.com/v1/timings/${epoch}?latitude=${location.latitude}&longitude=${location.longitude}&method=1`;
  } else {
    const encodedCity = encodeURIComponent(location.city);
    const encodedCountry = encodeURIComponent(location.country);
    url = `https://api.aladhan.com/v1/timingsByCity?city=${encodedCity}&country=${encodedCountry}&method=1`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Aladhan API returned HTTP ${response.status}`);
  }

  const json = await response.json();
  const data = json.data;
  const hijri = data.date.hijri;
  const timings = data.timings;

  const hDay = parseInt(hijri.day, 10);
  const hMonth = hijri.month.number;
  const hYear = parseInt(hijri.year, 10);
  const monthNameBn = HIJRI_MONTHS_BN[(hMonth - 1) % 12] || hijri.month.en;
  const monthNameAr = hijri.month.ar || '';
  const monthNameEn = hijri.month.en || '';

  const paddedMonth = String(hMonth).padStart(2, '0');
  const paddedDay = String(hDay).padStart(2, '0');
  const hijriKey = `${hYear}-${paddedMonth}-${paddedDay}`;
  const formattedBn = `${toBn(hDay)} ${monthNameBn}, ${toBn(hYear)} হিজরি`;

  const parsedPrayerTimes: PrayerTimes = {
    fajr: cleanTimeStr(timings.Fajr),
    sunrise: cleanTimeStr(timings.Sunrise),
    dhuhr: cleanTimeStr(timings.Dhuhr),
    asr: cleanTimeStr(timings.Asr),
    maghrib: cleanTimeStr(timings.Maghrib),
    isha: cleanTimeStr(timings.Isha)
  };

  const weekdaysBn: Record<string, string> = {
    Sunday: 'রবিবার',
    Monday: 'সোমবার',
    Tuesday: 'মঙ্গলবার',
    Wednesday: 'বুধবার',
    Thursday: 'বৃহস্পতিবার',
    Friday: 'শুক্রবার',
    Saturday: 'শনিবার'
  };
  const weekdayEn = data.date.gregorian?.weekday?.en || '';
  const weekdayBn = weekdaysBn[weekdayEn] || 'আজ';

  const result: LiveCalendarData = {
    hijriDay: hDay,
    hijriMonth: hMonth,
    hijriMonthNameBn: monthNameBn,
    hijriMonthNameAr: monthNameAr,
    hijriMonthNameEn: monthNameEn,
    hijriYear: hYear,
    hijriKey,
    formattedBn,
    gregorianDateStr: data.date.readable || date.toDateString(),
    weekdayBn,
    prayerTimes: parsedPrayerTimes,
    locationName: location.displayName || `${location.city}, ${location.country}`,
    lastUpdated: Date.now()
  };

  // Cache in localStorage for offline availability
  localStorage.setItem('sz_live_calendar', JSON.stringify(result));
  return result;
}

/**
 * Get cached calendar data if available
 */
export function getCachedCalendarData(): LiveCalendarData | null {
  const saved = localStorage.getItem('sz_live_calendar');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}
