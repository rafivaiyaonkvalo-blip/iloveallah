import rawTips from '../data/quranHadith2000.json';
import { TipItem } from '../types';

export const QURAN_HADITH_2000_TIPS: TipItem[] = rawTips as TipItem[];

export const DEFAULT_TIPS: TipItem[] = QURAN_HADITH_2000_TIPS;

/**
 * Returns a randomized subset of tips for daily rotation or sliders
 */
export function getRandomTipsPool(count: number = 30): TipItem[] {
  if (QURAN_HADITH_2000_TIPS.length <= count) {
    return QURAN_HADITH_2000_TIPS;
  }
  const shuffled = [...QURAN_HADITH_2000_TIPS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
