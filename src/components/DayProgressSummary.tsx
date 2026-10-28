import React from 'react';
import { Shield, Sparkles, CheckCircle2, Award, Calendar, Moon } from 'lucide-react';
import { HijriDayRecord, IntervalId } from '../types';
import { toBengaliNumber } from '../utils/hijri';
import { ISLAMIC_INTERVALS } from '../constants/intervals';

interface DayProgressSummaryProps {
  dayRecord: HijriDayRecord;
  onUpdateReflection: (text: string) => void;
  onTriggerCelebration: () => void;
}

export const DayProgressSummary: React.FC<DayProgressSummaryProps> = ({
  dayRecord,
  onUpdateReflection,
  onTriggerCelebration
}) => {
  const safeScore = dayRecord.safeScore;
  const total = 5;
  const percentage = Math.round((safeScore / total) * 100);

  const getScoreColor = () => {
    if (safeScore >= 4.5) return 'text-emerald-400';
    if (safeScore >= 3) return 'text-teal-400';
    if (safeScore >= 2) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getDayStatusMessage = () => {
    if (safeScore === 5) {
      return {
        title: 'আলহামদুলিল্লাহ! পারফেক্ট সেফ ডে! 🌟',
        subtitle: 'আপনি আজকের ৫টি ওয়াক্তের প্রত্যেকটিতে সফলভাবে সেফজোন ধরে রেখেছেন।',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      };
    }
    if (safeScore >= 4) {
      return {
        title: 'অসাধারণ অগ্রগতি! মাশাআল্লাহ 🛡️',
        subtitle: 'আপনি দিনের অধিকাংশ সময় দৃঢ়তার সাথে নিজেকে সুরক্ষিত রেখেছেন।',
        badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
      };
    }
    if (safeScore >= 2.5) {
      return {
        title: 'চেষ্টা চালিয়ে যান! হতাশ হবেন না 💪',
        subtitle: 'ভুলত্রুটি থেকে শিক্ষা নিয়ে পরবর্তী ওয়াক্তগুলোতে আরও বেশি সতর্ক থাকুন।',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    }
    return {
      title: 'নতুন করে তাওবা ও প্রত্যাবর্তন করুন 🤲',
      subtitle: 'আল্লাহ ক্ষমাশীল। একটি মুহূর্তেই নতুন নিয়তে ঘুরে দাঁড়ানো সম্ভব।',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    };
  };

  const statusMsg = getDayStatusMessage();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Score & Ring */}
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800 fill-none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - safeScore / total)}`}
                strokeLinecap="round"
                className="text-emerald-500 fill-none transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl sm:text-2xl font-black ${getScoreColor()}`}>
                {toBengaliNumber(safeScore)}/{toBengaliNumber(total)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">সেফ স্কোর</span>
            </div>
          </div>

          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-1.5 ${statusMsg.badgeBg}`}>
              <span>{statusMsg.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              {statusMsg.subtitle}
            </p>
            {safeScore === 5 && (
              <button
                onClick={onTriggerCelebration}
                className="mt-2 text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" /> উল্লাস উদ্যাপন করুন
              </button>
            )}
          </div>
        </div>

        {/* 5-Waqt Mini Sequence Tracker */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 lg:w-96">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span>মাগরিব ➔ মাগরিব ক্রমধারা:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              {toBengaliNumber(percentage)}% অর্জিত
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {ISLAMIC_INTERVALS.map((intv) => {
              const rec = dayRecord.intervals[intv.id];
              let bg = 'bg-slate-800/60 border-slate-700/60 text-slate-400';
              let iconChar = '○';

              if (rec?.status === 'safe') {
                bg = 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300';
                iconChar = '✓';
              } else if (rec?.status === 'struggled') {
                bg = 'bg-amber-600/30 border-amber-500/50 text-amber-300';
                iconChar = '▲';
              } else if (rec?.status === 'breached') {
                bg = 'bg-rose-600/30 border-rose-500/50 text-rose-300';
                iconChar = '✕';
              }

              return (
                <div
                  key={intv.id}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${bg}`}
                  title={`${intv.nameBn} - ${rec?.status || 'pending'}`}
                >
                  <span className="text-xs font-bold mb-0.5">{iconChar}</span>
                  <span className="text-[10px] leading-tight font-medium line-clamp-1">
                    {intv.order === 1 ? 'মাগরিব' : intv.order === 2 ? 'এশা' : intv.order === 3 ? 'ফজর' : intv.order === 4 ? 'জোহর' : 'আসর'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>সূর্যাস্ত হতে শুরু</span>
            <span>পরবর্তী সূর্যাস্তে হিসাব সমাপ্ত</span>
          </div>
        </div>
      </div>
    </div>
  );
};
