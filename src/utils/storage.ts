import { HijriDayRecord, IntervalId, IntervalRecord, UserSettings } from '../types';
import { HijriDateInfo } from './hijri';

const STORAGE_KEY_RECORDS = 'safezone_hijri_records_v1';
const STORAGE_KEY_SETTINGS = 'safezone_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  hijriOffsetDays: 0,
  prayerTimes: {
    fajr: '04:45',
    sunrise: '05:55',
    dhuhr: '12:00',
    asr: '16:15',
    maghrib: '18:00',
    isha: '19:30'
  },
  use24Hour: false,
  city: 'ঢাকা (Dhaka)',
  dailyGoalIntervals: 5,
  enableSound: true
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadAllRecords(): Record<string, HijriDayRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveAllRecords(records: Record<string, HijriDayRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records:', e);
  }
}

export function createEmptyIntervalRecord(id: IntervalId): IntervalRecord {
  return {
    intervalId: id,
    status: 'pending',
    habits: {
      gazeProtected: true,
      screenDisciplined: true,
      salahOnTime: true,
      dhikrQuran: false,
      productiveFocus: true
    },
    slipReasons: [],
    notes: '',
    updatedAt: new Date().toISOString()
  };
}

export function getOrCreateDayRecord(hijriInfo: HijriDateInfo): HijriDayRecord {
  const records = loadAllRecords();
  const existing = records[hijriInfo.hijriKey];
  if (existing) return existing;

  const newRecord: HijriDayRecord = {
    hijriKey: hijriInfo.hijriKey,
    hijriFormatted: hijriInfo.formattedBn,
    gregorianStart: hijriInfo.gregorianStartStr,
    gregorianEnd: hijriInfo.gregorianEndStr,
    intervals: {
      maghrib_isha: createEmptyIntervalRecord('maghrib_isha'),
      isha_fajr: createEmptyIntervalRecord('isha_fajr'),
      fajr_dhuhr: createEmptyIntervalRecord('fajr_dhuhr'),
      dhuhr_asr: createEmptyIntervalRecord('dhuhr_asr'),
      asr_maghrib: createEmptyIntervalRecord('asr_maghrib')
    },
    dailyReflection: '',
    safeScore: 0,
    totalAnswered: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  records[hijriInfo.hijriKey] = newRecord;
  saveAllRecords(records);
  return newRecord;
}

export function updateIntervalInRecord(
  hijriKey: string,
  intervalId: IntervalId,
  updates: Partial<IntervalRecord>
): HijriDayRecord {
  const records = loadAllRecords();
  let dayRecord = records[hijriKey];
  if (!dayRecord) return dayRecord;

  const currentInterval = dayRecord.intervals[intervalId] || createEmptyIntervalRecord(intervalId);
  const updatedInterval: IntervalRecord = {
    ...currentInterval,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  dayRecord.intervals[intervalId] = updatedInterval;

  // Recalculate safe score
  let safeCount = 0;
  let answeredCount = 0;
  const intervalKeys: IntervalId[] = ['maghrib_isha', 'isha_fajr', 'fajr_dhuhr', 'dhuhr_asr', 'asr_maghrib'];
  
  for (const key of intervalKeys) {
    const item = dayRecord.intervals[key];
    if (item.status !== 'pending') {
      answeredCount++;
      if (item.status === 'safe') {
        safeCount += 1;
      } else if (item.status === 'struggled') {
        safeCount += 0.5; // partial credit for fighting against slip
      }
    }
  }

  dayRecord.safeScore = safeCount;
  dayRecord.totalAnswered = answeredCount;
  dayRecord.updatedAt = new Date().toISOString();

  records[hijriKey] = dayRecord;
  saveAllRecords(records);
  return dayRecord;
}

export function calculateStats(records: Record<string, HijriDayRecord>) {
  const list = Object.values(records).sort((a, b) => b.hijriKey.localeCompare(a.hijriKey));
  const totalDaysTracked = list.length;
  
  let totalSafeCount = 0;
  let totalBreachedCount = 0;
  let totalStruggledCount = 0;
  let perfectDays = 0;

  const intervalSlipCounts: Record<IntervalId, number> = {
    maghrib_isha: 0,
    isha_fajr: 0,
    fajr_dhuhr: 0,
    dhuhr_asr: 0,
    asr_maghrib: 0
  };

  const slipReasonCounts: Record<string, number> = {};

  for (const day of list) {
    if (day.safeScore === 5) perfectDays++;

    const keys: IntervalId[] = ['maghrib_isha', 'isha_fajr', 'fajr_dhuhr', 'dhuhr_asr', 'asr_maghrib'];
    for (const k of keys) {
      const itm = day.intervals[k];
      if (itm.status === 'safe') totalSafeCount++;
      if (itm.status === 'struggled') totalStruggledCount++;
      if (itm.status === 'breached') {
        totalBreachedCount++;
        intervalSlipCounts[k] = (intervalSlipCounts[k] || 0) + 1;
        if (itm.slipReasons) {
          for (const r of itm.slipReasons) {
            slipReasonCounts[r] = (slipReasonCounts[r] || 0) + 1;
          }
        }
      }
    }
  }

  // Calculate current streak
  let currentStreak = 0;
  for (const day of list) {
    // If user achieved at least 4 safe intervals or answered safe on all answered intervals
    if (day.totalAnswered > 0 && day.safeScore >= 4) {
      currentStreak++;
    } else if (day.totalAnswered > 0) {
      break;
    }
  }

  // Vulnerable interval: which one has the highest slips
  let mostVulnerableInterval: IntervalId = 'isha_fajr';
  let maxSlips = -1;
  (Object.keys(intervalSlipCounts) as IntervalId[]).forEach((id) => {
    if (intervalSlipCounts[id] > maxSlips) {
      maxSlips = intervalSlipCounts[id];
      mostVulnerableInterval = id;
    }
  });

  return {
    totalDaysTracked,
    perfectDays,
    currentStreak,
    totalSafeCount,
    totalStruggledCount,
    totalBreachedCount,
    intervalSlipCounts,
    mostVulnerableInterval,
    slipReasonCounts
  };
}

export function exportBackupJson(): string {
  const data = {
    records: loadAllRecords(),
    settings: loadSettings(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.records) {
      saveAllRecords(parsed.records);
    }
    if (parsed.settings) {
      saveSettings(parsed.settings);
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}
