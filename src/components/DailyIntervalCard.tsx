import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square, 
  Clock, 
  Sparkles,
  Info,
  MessageSquare
} from 'lucide-react';
import { IntervalDefinition, IntervalRecord, SafeStatus } from '../types';
import { SLIP_OPTIONS_BN } from '../constants/intervals';
import { toBengaliNumber } from '../utils/hijri';

interface DailyIntervalCardProps {
  definition: IntervalDefinition;
  record: IntervalRecord;
  isCurrentlyActive: boolean;
  onUpdateStatus: (status: SafeStatus) => void;
  onUpdateHabit: (habitKey: keyof IntervalRecord['habits'], value: boolean) => void;
  onToggleSlipReason: (reason: string) => void;
  onUpdateNotes: (notes: string) => void;
}

export const DailyIntervalCard: React.FC<DailyIntervalCardProps> = ({
  definition,
  record,
  isCurrentlyActive,
  onUpdateStatus,
  onUpdateHabit,
  onToggleSlipReason,
  onUpdateNotes
}) => {
  const [expanded, setExpanded] = useState(isCurrentlyActive || record.status !== 'pending');

  const getStatusBadge = () => {
    switch (record.status) {
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
            <ShieldCheck className="w-3.5 h-3.5" /> নিরাপদ (Safe)
          </span>
        );
      case 'struggled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5" /> ঝুঁকিপূর্ণ (Struggled)
          </span>
        );
      case 'breached':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <ShieldAlert className="w-3.5 h-3.5" /> বিচ্যুত (Slipped)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5" /> অপেক্ষমান
          </span>
        );
    }
  };

  const getCardBorder = () => {
    if (isCurrentlyActive) {
      return 'border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/40';
    }
    switch (record.status) {
      case 'safe':
        return 'border-emerald-500/30 bg-slate-900/90';
      case 'struggled':
        return 'border-amber-500/30 bg-slate-900/90';
      case 'breached':
        return 'border-rose-500/30 bg-slate-900/90';
      default:
        return 'border-slate-800 bg-slate-900/60';
    }
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${getCardBorder()}`}>
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border-b border-slate-800/60">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0 border border-slate-700">
            {toBengaliNumber(definition.order)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-white">
                {definition.nameBn}
              </h3>
              <span className="text-xs font-arabic text-emerald-400/90">
                {definition.arabicName}
              </span>
              {isCurrentlyActive && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  এখন চলছে
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{definition.timeRangeDefault}</span>
              <span>•</span>
              <span className="italic text-slate-300">{definition.nameEn}</span>
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {getStatusBadge()}

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onUpdateStatus('safe')}
              title="সেফজোন বজায় আছে"
              className={`p-1.5 rounded transition-all ${
                record.status === 'safe'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStatus('struggled')}
              title="টানাপোড়েন / ঝুঁকি ছিল"
              className={`p-1.5 rounded transition-all ${
                record.status === 'struggled'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateStatus('breached')}
              title="বিচ্যুতি বা স্লিপ হয়েছে"
              className={`p-1.5 rounded transition-all ${
                record.status === 'breached'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {expanded && (
        <div className="p-4 sm:p-5 space-y-4 bg-slate-950/40">
          {/* Advice / Focus */}
          <div className="flex items-start gap-2.5 bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-3 text-xs text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300">করণীয় ও সতর্কতা: </strong>
              <span>{definition.adviceBn}</span>
            </div>
          </div>

          {/* Micro Habits Checkbox Grid */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2">
              ওয়াক্তের হেফাজত ও আমল চেকলিস্ট:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateHabit('gazeProtected', !record.habits.gazeProtected)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all border text-left ${
                  record.habits.gazeProtected
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {record.habits.gazeProtected ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>👁️ দৃষ্টির হেফাজত</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateHabit('screenDisciplined', !record.habits.screenDisciplined)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all border text-left ${
                  record.habits.screenDisciplined
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {record.habits.screenDisciplined ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>📱 স্ক্রিন/সোশ্যাল মিডিয়া নিয়ন্ত্রণ</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateHabit('salahOnTime', !record.habits.salahOnTime)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all border text-left ${
                  record.habits.salahOnTime
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {record.habits.salahOnTime ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>🕌 সময়মতো সালাত (জামাআত)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateHabit('dhikrQuran', !record.habits.dhikrQuran)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all border text-left ${
                  record.habits.dhikrQuran
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {record.habits.dhikrQuran ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>📿 মাসনুন জিকির / কুরআন তিলাওয়াত</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateHabit('productiveFocus', !record.habits.productiveFocus)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all border text-left ${
                  record.habits.productiveFocus
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {record.habits.productiveFocus ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>💼 কাজ বা পড়াশোনায় একাগ্রতা</span>
              </button>
            </div>
          </div>

          {/* Slip Hazards (If breached or struggled) */}
          {(record.status === 'breached' || record.status === 'struggled') && (
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3">
              <div className="text-xs font-semibold text-rose-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>কী কারণে সেফজোনে টানাপোড়েন বা বিচ্যুতি ঘটেছে?</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SLIP_OPTIONS_BN.map((reason, idx) => {
                  const isSelected = record.slipReasons?.includes(reason);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onToggleSlipReason(reason)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-all border ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-rose-700/60'
                      }`}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Muhaasabah Note */}
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>মুহাসাবা নোট (এই ওয়াক্তের আত্মপর্যালোচনা):</span>
            </label>
            <input
              type="text"
              value={record.notes || ''}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="যেমন: আলহামদুলিল্লাহ পুরো সময় সতর্ক ছিলাম / ইউটিউবে একটু সময় নষ্ট হয়েছিল..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
