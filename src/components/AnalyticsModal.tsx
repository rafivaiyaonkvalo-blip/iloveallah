import React from 'react';
import { X, BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Calendar, Flame, CheckCircle2 } from 'lucide-react';
import { HijriDayRecord, IntervalId } from '../types';
import { calculateStats } from '../utils/storage';
import { toBengaliNumber } from '../utils/hijri';
import { ISLAMIC_INTERVALS } from '../constants/intervals';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: Record<string, HijriDayRecord>;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  records
}) => {
  if (!isOpen) return null;

  const stats = calculateStats(records);
  const totalSlots = stats.totalDaysTracked * 5;
  const overallSafePercent = totalSlots > 0 
    ? Math.round((stats.totalSafeCount / totalSlots) * 100) 
    : 0;

  const vulnerableDef = ISLAMIC_INTERVALS.find(i => i.id === stats.mostVulnerableInterval);
  const historyList = Object.values(records).sort((a, b) => b.hijriKey.localeCompare(a.hijriKey));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">SafeZone পরিসংখ্যান ও পর্যালোচনা</h3>
            <p className="text-xs text-slate-400">ওয়াক্তভিত্তিক আত্মশুদ্ধির ধারাবাহিক অগ্রগতি</p>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-amber-400 mb-0.5 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>{toBengaliNumber(stats.currentStreak)}</span>
            </div>
            <span className="text-[11px] text-slate-400">বর্তমান স্ট্রিক (দিন)</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-emerald-400 mb-0.5">
              {toBengaliNumber(overallSafePercent)}%
            </div>
            <span className="text-[11px] text-slate-400">সামগ্রিক সেফ রেট</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-teal-400 mb-0.5">
              {toBengaliNumber(stats.perfectDays)}
            </div>
            <span className="text-[11px] text-slate-400">৫/৫ পারফেক্ট দিন</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-indigo-400 mb-0.5">
              {toBengaliNumber(stats.totalDaysTracked)}
            </div>
            <span className="text-[11px] text-slate-400">মোট ট্র্যাকড দিন</span>
          </div>
        </div>

        {/* Vulnerability Analysis Card */}
        {vulnerableDef && (
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2 text-rose-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>সবচেয়ে সতর্কতামূলক ওয়াক্ত: {vulnerableDef.nameBn}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              পরিসংখ্যান অনুসারে এই সময়ে সেফজোনে সবচেয়ে বেশি ঝুঁকি তৈরি হতে দেখা গেছে। এই ওয়াক্তের জন্য বিশেষ প্রস্তুতি গ্রহণ করুন:
            </p>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
              💡 <strong className="text-emerald-300">পরামর্শ:</strong> {vulnerableDef.adviceBn}
            </div>
          </div>
        )}

        {/* Recent Hijri Days History */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>বিগত হিজরি দিবসসমূহের রেকর্ড:</span>
          </h4>

          {historyList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800">
              এখনও কোনো পূর্ববর্তী রেকর্ড নেই। আজকের দিনটি থেকে ট্র্যাকিং শুরু করুন!
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {historyList.map((day) => (
                <div
                  key={day.hijriKey}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-200 block text-sm">{day.hijriFormatted}</strong>
                    <span className="text-[11px] text-slate-500">{day.gregorianStart} ➔ {day.gregorianEnd}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* 5 dots */}
                    <div className="flex items-center gap-1">
                      {ISLAMIC_INTERVALS.map((intv) => {
                        const rec = day.intervals[intv.id];
                        let dotColor = 'bg-slate-700';
                        if (rec?.status === 'safe') dotColor = 'bg-emerald-400';
                        if (rec?.status === 'struggled') dotColor = 'bg-amber-400';
                        if (rec?.status === 'breached') dotColor = 'bg-rose-500';
                        return (
                          <span
                            key={intv.id}
                            title={`${intv.nameBn}: ${rec?.status || 'pending'}`}
                            className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
                          />
                        );
                      })}
                    </div>

                    <span className="font-bold text-sm text-emerald-400 min-w-10 text-right">
                      {toBengaliNumber(day.safeScore)}/৫
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
