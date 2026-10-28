import React from 'react';
import { X, Heart, Sparkles, RefreshCw, CheckCircle, Shield } from 'lucide-react';
import { DUA_LIST } from '../constants/intervals';

interface TawbahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetMindset: () => void;
}

export const TawbahModal: React.FC<TawbahModalProps> = ({
  isOpen,
  onClose,
  onResetMindset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>তাওবা, ইস্তিগফার ও রিস্টার্ট</span>
            </h3>
            <p className="text-xs text-slate-400">
              হতাশ হবেন না—আল্লাহর রহমত সব পাপের চেয়েও বিশাল
            </p>
          </div>
        </div>

        {/* Motivational Quran / Hadith */}
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 mb-5 text-center">
          <p className="font-arabic text-lg sm:text-xl text-emerald-300 mb-2 leading-relaxed">
            قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا
          </p>
          <p className="text-xs text-slate-300 italic mb-1">
            "বলুন, হে আমার বান্দাগণ! যারা নিজেদের ওপর বাড়াবাড়ি করেছ, তোমরা আল্লাহর রহমত থেকে নিরাশ হয়ো না। নিশ্চয়ই আল্লাহ সমস্ত গুনাহ ক্ষমা করে দেন।"
          </p>
          <span className="text-[11px] text-emerald-400/90 font-medium">সূরা যুমার: ৫৩</span>
        </div>

        {/* 3 Step Action Plan */}
        <div className="space-y-3 mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            তাত্ক্ষণিক ৩টি আমল (স্লিপের পর ঘুরে দাঁড়ানোর উপায়):
          </h4>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              ১
            </div>
            <div>
              <strong className="text-xs text-slate-200 block mb-0.5">ইস্তিগফার ও অনুশোচনা:</strong>
              <p className="text-xs text-slate-400">
                লজ্জিত অন্তরে এখনই ৩ বার বা সাইয়্যিদুল ইস্তিগফার পাঠ করুন। শয়তান যেন আপনাকে অপরাধবোধ দিয়ে আর কাবু না করে।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              ২
            </div>
            <div>
              <strong className="text-xs text-slate-200 block mb-0.5">অজু ও ২ রাকাত সালাতুত তাওবা:</strong>
              <p className="text-xs text-slate-400">
                সম্ভব হলে ঠান্ডা পানি দিয়ে সুন্দর করে অজু করুন এবং নির্জনে ২ রাকাত নফল সালাত আদায় করে সিজদায় ক্ষমা প্রার্থনা করুন।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              ৩
            </div>
            <div>
              <strong className="text-xs text-slate-200 block mb-0.5">একটি নেক আমল বা সদকা:</strong>
              <p className="text-xs text-slate-400">
                রাসূল (সা.) বলেছেন: "মন্দ কাজের পরপরই ভালো কাজ করো, তা মন্দ কাজকে মুছে দেবে।" (তিরমিযি)।
              </p>
            </div>
          </div>
        </div>

        {/* Selected Dua */}
        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            পঠিতব্য মাসনুন দোয়া:
          </h4>
          {DUA_LIST.map((dua, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <p className="font-arabic text-emerald-300 text-sm mb-1 text-right">{dua.arabic}</p>
              <p className="text-slate-300 font-medium mb-0.5">{dua.meaning}</p>
              <span className="text-[10px] text-slate-500">{dua.source}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onResetMindset();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>আমি তাওবা করলাম ও নতুন উদ্যমে সেফজোনে ফিরছি</span>
          </button>
        </div>
      </div>
    </div>
  );
};
