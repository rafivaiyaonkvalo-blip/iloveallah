import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, Circle, Trash2, Sparkles, BookOpen, Heart, Dumbbell } from 'lucide-react';
import { DailyPersonalAim } from '../types';

const STORAGE_KEY_AIMS = 'safezone_personal_aims_v1';

const DEFAULT_AIMS: DailyPersonalAim[] = [
  { id: '1', title: '৫ ওয়াক্ত সালাত তাকবীরে উলার সাথে জামাআতে আদায়', category: 'spiritual', completed: false },
  { id: '2', title: 'সকাল ও সন্ধ্যার মাসনুন আজকার সম্পন্ন করা', category: 'spiritual', completed: false },
  { id: '3', title: 'অন্তত ১ রুকু / আধ পারা কুরআন অর্থসহ তিলাওয়াত', category: 'spiritual', completed: false },
  { id: '4', title: 'রাতের একাকী অনর্থক স্ক্রিনটাইম ও সোশ্যাল মিডিয়া বর্জন', category: 'character', completed: false },
  { id: '5', title: 'রাত ১০:৩০ এর মধ্যে শয়ন ও তাহাজ্জুদে উঠার সংকল্প', category: 'health', completed: false }
];

export const AimSection: React.FC = () => {
  const [aims, setAims] = useState<DailyPersonalAim[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AIMS);
      if (saved) return JSON.parse(saved);
      return DEFAULT_AIMS;
    } catch {
      return DEFAULT_AIMS;
    }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'spiritual' | 'study' | 'health' | 'character'>('spiritual');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AIMS, JSON.stringify(aims));
    } catch (e) {
      console.error(e);
    }
  }, [aims]);

  const toggleAim = (id: string) => {
    setAims(aims.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const deleteAim = (id: string) => {
    setAims(aims.filter(a => a.id !== id));
  };

  const handleAddAim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAim: DailyPersonalAim = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      completed: false
    };

    setAims([...aims, newAim]);
    setNewTitle('');
  };

  const completedCount = aims.filter(a => a.completed).length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <span>দৈনিক মূল লক্ষ্য ও সংকল্প (Daily Aims Tracker)</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                {completedCount}/{aims.length} সম্পন্ন
              </span>
            </h3>
            <p className="text-xs text-slate-400">ওয়াক্তের সেফজোনের পাশাপাশি আপনার প্রতিদিনের বিশেষ সংকল্পসমূহ</p>
          </div>
        </div>
      </div>

      {/* Aims List */}
      <div className="space-y-2 mb-4">
        {aims.map((aim) => (
          <div
            key={aim.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              aim.completed
                ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-200 hover:border-slate-700'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleAim(aim.id)}
              className="flex items-center gap-3 text-left flex-1"
            >
              {aim.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <span className={`text-xs sm:text-sm font-medium ${aim.completed ? 'line-through text-slate-400' : ''}`}>
                {aim.title}
              </span>
            </button>

            <button
              onClick={() => deleteAim(aim.id)}
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-2"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Aim Form */}
      <form onSubmit={handleAddAim} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="নতুন কোনো দ্বীনি বা আত্মউন্নয়নমূলক লক্ষ্য যোগ করুন (যেমন: ২ রাকাত সালাতুত দোহা)..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>লক্ষ্য যোগ করুন</span>
        </button>
      </form>
    </div>
  );
};
