import { PrayerTimes } from '../types';

export interface DistrictLocation {
  id: string;
  nameBn: string;
  lat: number;
  lng: number;
}

export const BD_DISTRICTS: DistrictLocation[] = [
  { id: 'dhaka', nameBn: 'ঢাকা (কেন্দ্রীয়)', lat: 23.8103, lng: 90.4125 },
  { id: 'chittagong', nameBn: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832 },
  { id: 'sylhet', nameBn: 'সিলেট', lat: 24.8949, lng: 91.8687 },
  { id: 'rajshahi', nameBn: 'রাজশাহী', lat: 24.3745, lng: 88.6042 },
  { id: 'khulna', nameBn: 'খুলনা', lat: 22.8456, lng: 89.5403 },
  { id: 'barisal', nameBn: 'বরিশাল', lat: 22.7010, lng: 90.3535 },
  { id: 'rangpur', nameBn: 'রংপুর', lat: 25.7439, lng: 89.2752 },
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203 },
  { id: 'comilla', nameBn: 'কুমিল্লা', lat: 23.4682, lng: 91.1788 },
];

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export function toBnDigit(num: number | string): string {
  return String(num).replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)] || d);
}

/**
 * Format 24h time ("17:48") to Bengali 12h representation ("০৫:৪৮ PM")
 */
export function formatTimeTo12HourBn(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const isPm = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  const amPm = isPm ? 'PM' : 'AM';
  return `${toBnDigit(h)}:${toBnDigit(String(m).padStart(2, '0'))} ${amPm}`;
}

/**
 * High-precision NOAA solar algorithm for calculating prayer & sunset times in Bangladesh.
 * Accounts for day of year, solar declination, equation of time, solar altitude, and atmospheric refraction.
 */
export function calculateBangladeshPrayerTimes(
  date: Date,
  lat: number = 23.8103,
  lng: number = 90.4125
): PrayerTimes {
  const timezone = 6; // BST (Bangladesh Standard Time: UTC+6)

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Julian Day
  const a = Math.floor((14 - (month + 1)) / 12);
  const y = year + 4800 - a;
  const m = (month + 1) + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const t = (jd - 2451545.0) / 36525.0;

  // Geometric Mean Longitude Sun (deg)
  let L0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
  L0 = ((L0 % 360) + 360) % 360;

  // Geometric Mean Anomaly Sun (deg)
  const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const Mrad = (M * Math.PI) / 180;

  // Eccentricity of Earth orbit
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

  // Sun Equation of Center
  const C =
    Math.sin(Mrad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * Mrad) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * Mrad) * 0.000289;

  // Sun True Longitude & Apparent Longitude
  const sunTrueLong = L0 + C;
  const omega = 125.04 - 1934.136 * t;
  const lambda = sunTrueLong - 0.00569 - 0.00478 * Math.sin((omega * Math.PI) / 180);

  // Mean Obliquity of Ecliptic
  const epsilon0 = 23 + (26 + (21.448 - t * (46.8150 + t * (0.00059 - t * 0.001813)))) / 60 / 60;
  const obliq = (epsilon0 + 0.00256 * Math.cos((omega * Math.PI) / 180)) * (Math.PI / 180);

  // Sun Declination
  const sinDecl = Math.sin(obliq) * Math.sin((lambda * Math.PI) / 180);
  const decl = Math.asin(sinDecl);

  // Equation of Time (minutes)
  const y2 = Math.tan(obliq / 2) * Math.tan(obliq / 2);
  const L0rad = (L0 * Math.PI) / 180;
  const eqtime =
    4 *
    (180 / Math.PI) *
    (y2 * Math.sin(2 * L0rad) -
      2 * e * Math.sin(Mrad) +
      4 * e * y2 * Math.sin(Mrad) * Math.cos(2 * L0rad) -
      0.5 * y2 * y2 * Math.sin(4 * L0rad) -
      1.25 * e * e * Math.sin(2 * Mrad));

  // Solar Noon in hours (BST)
  const solarNoon = (720 - 4 * lng - eqtime + timezone * 60) / 60;

  const phi = (lat * Math.PI) / 180;

  function hourAngle(altitudeDeg: number): number | null {
    const altRad = (altitudeDeg * Math.PI) / 180;
    const cosHA =
      (Math.sin(altRad) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
    if (cosHA > 1 || cosHA < -1) return null;
    return (Math.acos(cosHA) * 180) / Math.PI;
  }

  // Sunset & Sunrise (-0.833 deg solar altitude) + 1 min precautionary ihtiyat for Maghrib
  const haSun = hourAngle(-0.833) || 90;
  const sunrise = solarNoon - haSun / 15;
  const sunset = solarNoon + haSun / 15 + 1 / 60;

  // Fajr: 18 deg below horizon
  const haFajr = hourAngle(-18) || 108;
  const fajr = solarNoon - haFajr / 15;

  // Isha: 18 deg below horizon
  const haIsha = hourAngle(-18) || 108;
  const isha = solarNoon + haIsha / 15;

  // Asr: Hanafi standard (shadow factor = 2 + tan(noonZenith))
  const noonZenith = Math.abs(phi - decl);
  const asrAlt = (Math.atan(1 / (2 + Math.tan(noonZenith))) * 180) / Math.PI;
  const haAsr = hourAngle(asrAlt) || 60;
  const asr = solarNoon + haAsr / 15;

  function formatTime(hours: number): string {
    let totalMinutes = Math.round(hours * 60);
    totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return {
    fajr: formatTime(fajr),
    sunrise: formatTime(sunrise),
    dhuhr: formatTime(solarNoon),
    asr: formatTime(asr),
    maghrib: formatTime(sunset),
    isha: formatTime(isha),
  };
}
