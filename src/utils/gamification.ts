import { CompletedAmalRecord, InstantAmalItem, UserGamificationState } from '../types';
import { DAILY_EXP_GOAL, getLocalDateStr, getSpiritualLevel } from '../data/instantAmals';

/** দৈনিক লক্ষ্য পূরণ করলে একবার পাওয়া বোনাস EXP */
export const DAILY_GOAL_BONUS = 10;

export const EMPTY_GAMIFICATION = (today: string = getLocalDateStr()): UserGamificationState => ({
  totalPoints: 0,
  todayPoints: 0,
  lastPointsDate: today,
  completedAmalIds: [],
  totalAmalCount: 0,
  currentLevelId: 1,
  completedHistory: [],
  goalStreak: 0,
});

function yesterdayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return getLocalDateStr(new Date(y, m - 1, d - 1));
}

/** দিন বদলালে আজকের হিসাব শূন্য করে; একই দিন হলে একই অবজেক্ট ফেরত দেয়। */
export function normalizeGamification(
  state: UserGamificationState,
  today: string = getLocalDateStr(),
): UserGamificationState {
  if (state.lastPointsDate === today) return state;
  // গতকালও লক্ষ্য পূরণ না হলে স্ট্রিক ভেঙে যায়
  const keepStreak = state.lastGoalDate === today || state.lastGoalDate === yesterdayOf(today);
  return {
    ...state,
    todayPoints: 0,
    lastPointsDate: today,
    completedAmalIds: [],
    goalStreak: keepStreak ? state.goalStreak || 0 : 0,
  };
}

export interface CompletionResult {
  next: UserGamificationState;
  /** এই আমলেই দৈনিক লক্ষ্য পূরণ হয়ে বোনাস পাওয়া গেছে কি না */
  goalBonusAwarded: boolean;
}

/** একটি আমল সম্পন্ন হলে নতুন state হিসাব করে (কোনো সাইড-ইফেক্ট নেই)। */
export function applyAmalCompletion(
  current: UserGamificationState,
  amal: InstantAmalItem,
  now: Date = new Date(),
): CompletionResult {
  const today = getLocalDateStr(now);
  const prev = normalizeGamification(current, today);

  // একই আমলে একই দিনে দ্বিতীয়বার EXP নেই (EXP-ফার্মিং রোধ)
  if (prev.completedAmalIds.includes(amal.id)) {
    return { next: prev, goalBonusAwarded: false };
  }

  let totalPoints = prev.totalPoints + amal.points;
  let todayPoints = prev.todayPoints + amal.points;
  let goalStreak = prev.goalStreak || 0;
  let lastGoalDate = prev.lastGoalDate;
  let goalBonusDate = prev.goalBonusDate;

  const goalBonusAwarded = todayPoints >= DAILY_EXP_GOAL && prev.goalBonusDate !== today;
  if (goalBonusAwarded) {
    totalPoints += DAILY_GOAL_BONUS;
    todayPoints += DAILY_GOAL_BONUS;
    goalStreak = lastGoalDate === yesterdayOf(today) ? goalStreak + 1 : 1;
    lastGoalDate = today;
    goalBonusDate = today;
  }

  // রেকর্ডে লেভেল = আমল সম্পন্ন করার মুহূর্তের লেভেল (বোনাস ছাড়া)
  const levelAtCompletion = getSpiritualLevel(prev.totalPoints + amal.points).currentLevel;
  const record: CompletedAmalRecord = {
    id: `amal-rec-${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`,
    amalId: amal.id,
    title: amal.title,
    points: amal.points,
    completedAt: now.toISOString(),
    levelId: levelAtCompletion.id,
    levelName: levelAtCompletion.name,
    rankCode: levelAtCompletion.rankCode,
    arabic: amal.arabic,
    banglaMeaning: amal.banglaMeaning,
    benefit: amal.benefit,
    reference: amal.reference,
    category: amal.category,
  };

  const next: UserGamificationState = {
    ...prev,
    totalPoints,
    todayPoints,
    lastPointsDate: today,
    completedAmalIds: prev.completedAmalIds.includes(amal.id)
      ? prev.completedAmalIds
      : [...prev.completedAmalIds, amal.id],
    totalAmalCount: prev.totalAmalCount + 1,
    currentLevelId: getSpiritualLevel(totalPoints).currentLevel.id,
    completedHistory: [record, ...(prev.completedHistory || [])],
    goalStreak,
    lastGoalDate,
    goalBonusDate,
  };
  return { next, goalBonusAwarded };
}

/**
 * স্থানীয় ও রিমোট (অন্য ডিভাইস) state মার্জ। কখনো অগ্রগতি কমায় না।
 * আজকের হিসাব সেই পক্ষ থেকে আসে যার তারিখ নতুন।
 */
export function mergeGamification(
  local: UserGamificationState,
  remote: UserGamificationState,
  today: string = getLocalDateStr(),
): UserGamificationState {
  const l = normalizeGamification(local, today);
  const r = normalizeGamification(remote, today);

  const map = new Map<string, CompletedAmalRecord>();
  (l.completedHistory || []).forEach(x => map.set(x.id, x));
  (r.completedHistory || []).forEach(x => map.set(x.id, x));
  const completedHistory = Array.from(map.values()).sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  const totalPoints = Math.max(l.totalPoints, r.totalPoints || 0);
  const ids = Array.from(new Set([...(l.completedAmalIds || []), ...(r.completedAmalIds || [])]));
  const goalDone = l.goalBonusDate === today || r.goalBonusDate === today;

  return {
    totalPoints,
    todayPoints: Math.max(l.todayPoints, r.todayPoints || 0),
    lastPointsDate: today,
    completedAmalIds: ids,
    totalAmalCount: Math.max(l.totalAmalCount, r.totalAmalCount || 0, completedHistory.length),
    currentLevelId: getSpiritualLevel(totalPoints).currentLevel.id,
    completedHistory,
    goalStreak: Math.max(l.goalStreak || 0, r.goalStreak || 0),
    lastGoalDate: [l.lastGoalDate, r.lastGoalDate].filter(Boolean).sort().pop(),
    goalBonusDate: goalDone ? today : [l.goalBonusDate, r.goalBonusDate].filter(Boolean).sort().pop(),
  };
}
