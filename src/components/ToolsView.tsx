import React, { useState, useEffect } from 'react';
import { ShieldAlert, Heart, BookOpen, Activity, AlertOctagon, RotateCcw, Link2, X } from 'lucide-react';

interface ToolsViewProps {
  isDark: boolean;
  onReturn: () => void;
}

const SURVIVAL_LINKS = [
  { title: 'পর্ণ আসক্তি থেকে মুক্তির উপায় - শায়খ আহমাদুল্লাহ', url: 'https://www.youtube.com/watch?v=F5x5dM2q_4Q' },
  { title: 'চোখের জিনা থেকে বাঁচার উপায় - মিজানুর রহমান আজহারী', url: 'https://www.youtube.com/watch?v=r303W52C9nQ' },
  { title: 'হতাশা ও দুশ্চিন্তা থেকে মুক্তির দোয়া', url: 'https://www.youtube.com/watch?v=n83b_T4zNFE' },
  { title: 'Easypeasy Method (পর্ণমুক্তির গাইডবুক)', url: 'https://easypeasymethod.org/' }
];

const EMERGENCY_VERSES = [
  "নিশ্চয় যারা মুমিন পুরুষ ও নারীদেরকে প্রলুব্ধ করেছে (ফিতনায় ফেলেছে), তারপর তওবা করেনি, তাদের জন্য রয়েছে জাহান্নামের আজাব এবং তাদের জন্য রয়েছে দহন যন্ত্রণা। (সূরা বুরুজ: ১০)",
  "কিয়ামতের দিন অপরাধী চাইবে, যদি সে তার সন্তান, তার স্ত্রী ও তার ভাই এবং পৃথিবীতে যারা আছে সবার বিনিময়ে হলেও নিজেকে বাঁচাতে পারত! কিন্তু না, কখনোই নয়। নিশ্চয় তা লেলিহান শিখা। (সূরা মা'আরিজ)",
  "আর যে ব্যক্তি তার রবের সামনে দাঁড়ানোর ভয় করেছে এবং নিজেকে কুপ্রবৃত্তি থেকে বিরত রেখেছে, নিশ্চয় জান্নাতই হবে তার আবাস। (সূরা আন-নাযিআত: ৪০-৪১)",
  "আল্লাহ কি দেখেন না? (সূরা আলাক: ১৪) - এই এক লাইনটিই কি গুনাহ ছাড়ার জন্য যথেষ্ট নয়?",
  "রাসূলুল্লাহ ﷺ বলেছেন, চোখের ব্যভিচার হলো হারাম দৃষ্টি দেওয়া। অন্তর কেবল কামনা করে, আর লজ্জাস্থান তা বাস্তবায়ন করে। (বুখারি)"
];

export const ToolsView: React.FC<ToolsViewProps> = ({ isDark, onReturn }) => {
  const [globalTasbeeh, setGlobalTasbeeh] = useState(0);
  const [todayTasbeeh, setTodayTasbeeh] = useState(0);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [panicVerse, setPanicVerse] = useState('');

  // Load Tasbeeh stats
  useEffect(() => {
    try {
      const savedGlobal = localStorage.getItem('sz_global_tasbeeh');
      if (savedGlobal) setGlobalTasbeeh(parseInt(savedGlobal, 10));

      const today = new Date().toISOString().split('T')[0];
      const savedTodayStr = localStorage.getItem('sz_today_tasbeeh');
      if (savedTodayStr) {
        const parsed = JSON.parse(savedTodayStr);
        if (parsed.date === today) {
          setTodayTasbeeh(parsed.count);
        }
      }
    } catch {}
  }, []);

  const handleTasbeehTap = () => {
    // Vibrate device if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if ((globalTasbeeh + 1) % 33 === 0) {
        navigator.vibrate([100, 50, 100]); // stronger pattern every 33
      } else {
        navigator.vibrate(30); // light haptic
      }
    }

    const newGlobal = globalTasbeeh + 1;
    const newToday = todayTasbeeh + 1;
    setGlobalTasbeeh(newGlobal);
    setTodayTasbeeh(newToday);

    try {
      localStorage.setItem('sz_global_tasbeeh', newGlobal.toString());
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('sz_today_tasbeeh', JSON.stringify({ date: today, count: newToday }));
    } catch {}
  };

  const handlePanic = () => {
    const randomVerse = EMERGENCY_VERSES[Math.floor(Math.random() * EMERGENCY_VERSES.length)];
    setPanicVerse(randomVerse);
    setIsPanicModalOpen(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center safe-app-container antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300 relative ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="w-full max-w-lg sm:max-w-xl animate-fadeIn p-4 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">আত্মশুদ্ধি ও রেসকিউ</h1>
          </div>
          <button
            onClick={onReturn}
            className={`p-2 rounded-xl transition-all border active:scale-95 cursor-pointer ${
              isDark 
                ? 'bg-slate-900 border-white/10 text-slate-300 hover:text-white' 
                : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PANIC BUTTON */}
        <div className={`p-5 rounded-3xl border text-center shadow-lg transition-all ${
          isDark 
            ? 'bg-rose-950/40 border-rose-900/60 shadow-rose-900/20' 
            : 'bg-rose-50 border-rose-200 shadow-rose-200/50'
        }`}>
          <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
            নফসের ধোঁকা বা গুনাহের ইচ্ছা হলে?
          </h2>
          <button
            onClick={handlePanic}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg sm:text-xl flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <AlertOctagon className="w-8 h-8 mb-1 animate-pulse" />
            <span>আমাকে বাঁচাও (Panic)</span>
          </button>
          <p className={`text-xs mt-3 opacity-80 ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
            প্রচণ্ড প্ররোচনা (Urge) আসলে সাথে সাথে চাপুন
          </p>
        </div>

        {/* TASBEEH COUNTER */}
        <div className={`p-6 rounded-3xl border flex flex-col items-center transition-all ${
          isDark 
            ? 'bg-slate-900/80 border-white/10 shadow-black/40' 
            : 'bg-white border-slate-300 shadow-slate-200'
        }`}>
          <div className="w-full flex items-center justify-between mb-6">
            <div>
              <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>আজকের জিকির</span>
              <span className={`text-2xl font-black ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{todayTasbeeh.toLocaleString('bn-BD')}</span>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>সর্বমোট জিকির</span>
              <span className={`text-2xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{globalTasbeeh.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          <button
            onClick={handleTasbeehTap}
            className={`w-40 h-40 rounded-full flex items-center justify-center border-[6px] transition-all cursor-pointer select-none active:scale-95 ${
              isDark 
                ? 'bg-slate-800 border-teal-500/30 text-white shadow-[0_0_30px_rgba(20,184,166,0.15)] active:bg-teal-900' 
                : 'bg-slate-50 border-teal-500 text-slate-800 shadow-[0_0_30px_rgba(20,184,166,0.3)] active:bg-teal-50'
            }`}
          >
            <span className="text-xl font-black opacity-40 select-none pointer-events-none">Tap</span>
          </button>
          <p className={`text-xs mt-6 text-center font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            যেকোনো সময় জিকির বা দরুদ পড়তে এখানে ট্যাপ করুন।<br/>(প্রতি ৩৩ বারে ভাইব্রেট করবে)
          </p>
        </div>

        {/* SURVIVAL KIT / LINKS */}
        <div className={`p-5 rounded-3xl border transition-all ${
          isDark 
            ? 'bg-slate-900/80 border-white/10 shadow-black/40' 
            : 'bg-white border-slate-300 shadow-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
            <h3 className="font-bold">সারভাইভাল কিট (Survival Kit)</h3>
          </div>
          <div className="space-y-2.5">
            {SURVIVAL_LINKS.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-sky-500/50' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-sky-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-sky-900/50 text-sky-400' : 'bg-sky-100 text-sky-600'
                }`}>
                  <Link2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">{link.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onReturn}
          className="w-full mt-4 mb-10 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-all cursor-pointer"
        >
          ট্র্যাকারে ফিরে যান
        </button>

      </div>

      {/* PANIC MODAL */}
      {isPanicModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-6 text-center border-2 border-rose-500/50 shadow-[0_0_50px_rgba(225,29,72,0.2)] ${
            isDark ? 'bg-slate-950' : 'bg-white'
          }`}>
            <AlertOctagon className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-black text-rose-600 dark:text-rose-500 mb-4">
              থামুন! আল্লাহ দেখছেন!
            </h2>
            <p className={`text-base font-semibold leading-relaxed mb-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {panicVerse}
            </p>
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${
              isDark ? 'bg-rose-950 text-rose-300' : 'bg-rose-50 text-rose-700'
            }`}>
              সাথে সাথে ফোনটি লক করে দিন এবং একবার অযু করে আসুন অথবা ২ রাকাত সালাত আদায় করুন।
            </div>
            <button
              onClick={() => setIsPanicModalOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
            >
              আমি আল্লাহর কাছে আশ্রয় চাই (বের হোন)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
