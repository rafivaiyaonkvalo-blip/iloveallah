import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Bell, 
  BookMarked,
  RotateCcw,
  Search,
  Bookmark,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BookOpen,
  Scroll,
  PenTool,
  SlidersHorizontal
} from 'lucide-react';
import { TipItem, TipPopupFrequency } from '../types';

interface TipsLibrarySectionProps {
  tips: TipItem[];
  favoriteTipIds?: string[];
  frequency: TipPopupFrequency;
  isDark: boolean;
  onAddTip: (text: string, dalil?: string) => void;
  onUpdateTip: (id: string, text: string, dalil?: string) => void;
  onDeleteTip: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onResetDefaults: () => void;
  onChangeFrequency: (freq: TipPopupFrequency) => void;
}

const ITEMS_PER_PAGE = 25;

export const TipsLibrarySection: React.FC<TipsLibrarySectionProps> = ({
  tips,
  favoriteTipIds = [],
  frequency,
  isDark,
  onAddTip,
  onUpdateTip,
  onDeleteTip,
  onToggleFavorite,
  onResetDefaults,
  onChangeFrequency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'custom'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newDalil, setNewDalil] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDalil, setEditDalil] = useState('');

  // Count metrics
  const favoritesCount = useMemo(() => {
    return favoriteTipIds.length;
  }, [favoriteTipIds]);

  const customCount = useMemo(() => {
    return tips.filter(t => !t.id.startsWith('qh-')).length;
  }, [tips]);

  // Filtered tips
  const filteredTips = useMemo(() => {
    let result = tips;

    // Filter mode
    if (filterMode === 'favorites') {
      const favSet = new Set(favoriteTipIds);
      result = result.filter(t => favSet.has(t.id));
    } else if (filterMode === 'custom') {
      result = result.filter(t => !t.id.startsWith('qh-'));
    }

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(t => 
        t.text.toLowerCase().includes(q) ||
        (t.reference && t.reference.toLowerCase().includes(q)) ||
        (t.dalil && t.dalil.toLowerCase().includes(q)) ||
        (t.topic && t.topic.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tips, filterMode, favoriteTipIds, searchQuery]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredTips.length / ITEMS_PER_PAGE));

  // Current page items
  const paginatedTips = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTips.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTips, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleCreateTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddTip(newText.trim(), newDalil.trim() || undefined);
    setNewText('');
    setNewDalil('');
    setIsAddFormOpen(false);
  };

  const startEdit = (tip: TipItem) => {
    setEditingId(tip.id);
    setEditText(tip.text);
    setEditDalil(tip.dalil || '');
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    onUpdateTip(id, editText.trim(), editDalil.trim() || undefined);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditDalil('');
  };

  const handleCopy = (tip: TipItem) => {
    const textToCopy = tip.dalil 
      ? `"${tip.text}" — [${tip.dalil}]` 
      : `"${tip.text}"`;
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(tip.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-6 mb-6 border backdrop-blur-xl transition-all shadow-sm ${
      isDark ? 'glass-card border-white/10 bg-slate-900/70' : 'bg-white border-slate-200 shadow-slate-100'
    }`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-500/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <BookMarked className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2 flex-wrap`}>
              <span>২০০০+ কুরআন ও সহিহ হাদিসের উপদেশ লাইব্রেরি</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-slate-800 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {tips.length} টি সংরক্ষিত
              </span>
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              আমল, তাকওয়া, সালাত, চরিত্র ও আত্মশুদ্ধির সেরা পাথেয়; স্লাইডার ও পপআপে স্বয়ংক্রিয়ভাবে উপস্থাপিত হয়।
            </p>
          </div>
        </div>

        {/* Action: Add custom tip & Restore Defaults */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              isAddFormOpen
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-emerald-500/20' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddFormOpen ? 'ফর্ম বন্ধ' : 'নতুন উপদেশ লিখুন'}</span>
          </button>

          <button
            type="button"
            onClick={onResetDefaults}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
            }`}
            title="২০০০+ মূল ইসলামিক নসিহতসমূহ রিস্টোর করুন"
          >
            <RotateCcw className="w-3 h-3" />
            <span>রিস্টোর</span>
          </button>
        </div>
      </div>

      {/* Add New Tip Form (Expandable) */}
      {isAddFormOpen && (
        <form onSubmit={handleCreateTip} className={`rounded-xl p-4 mb-5 border animate-in fade-in duration-200 ${
          isDark ? 'bg-slate-950/70 border-emerald-500/30' : 'bg-emerald-50/40 border-emerald-200'
        }`}>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            নতুন ব্যক্তিগত উপদেশ বা পছন্দের কোনো হাদিস/আয়াত লিখুন:
          </label>
          
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="উপদেশ বা নসিহতের মূল বাণী লিখুন..."
            rows={2}
            className={`w-full p-2.5 rounded-xl text-xs sm:text-sm border resize-none focus:outline-none transition-all mb-2.5 ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-500' 
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
            }`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <input
              type="text"
              value={newDalil}
              onChange={(e) => setNewDalil(e.target.value)}
              placeholder="দলিল বা রেফারেন্স (ঐচ্ছিক, উদা: সহিহ বুখারি: ৫২)"
              className={`p-2 rounded-xl text-xs border focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={!newText.trim()}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                newText.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* Entrance Popup Frequency Controller */}
      <div className={`rounded-xl p-3 sm:p-3.5 mb-5 border ${
        isDark ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-200/80'
      }`}>
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-500">
          <Bell className="w-3.5 h-3.5" />
          <span>অ্যাপে প্রবেশের সময় নসিহত পপআপ আসার নিয়ম:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChangeFrequency('every_time')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              frequency === 'every_time'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                : isDark 
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/5' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>প্রতিবার অ্যাপে ঢুকলে</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFrequency('once_a_day')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              frequency === 'once_a_day'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                : isDark 
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/5' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>দিনে একবার (সুপারিশকৃত)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFrequency('off')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              frequency === 'off'
                ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
                : isDark 
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/5' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>পপআপ বন্ধ রাখুন</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="mb-4">
        <div className={`relative rounded-xl border flex items-center transition-all ${
          isDark 
            ? 'bg-slate-950/70 border-white/10 focus-within:border-emerald-500' 
            : 'bg-slate-50 border-slate-300 focus-within:border-emerald-600'
        }`}>
          <Search className="w-4 h-4 ml-3 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="কুরআন, হাদিস বা বিষয় লিখে খুঁজুন (উদা: সালাত, ধৈর্য, মা-বাবা, তাওবা, জিকির, আখিরাত)..."
            className={`w-full p-2.5 pl-2.5 text-xs sm:text-sm bg-transparent focus:outline-none ${
              isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="p-1.5 mr-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              title="অনুসন্ধান মুছুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Clean View Tabs: All, Favorites, My Custom (No messy category clutter!) */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setFilterMode('all');
              setCurrentPage(1);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                : isDark ? 'bg-slate-800 text-slate-300 border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>সব নসিহত ({tips.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterMode('favorites');
              setCurrentPage(1);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
              filterMode === 'favorites'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-500/30'
                : isDark ? 'bg-slate-800 text-slate-300 border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>বুকমার্ককৃত ({favoritesCount})</span>
          </button>

          {customCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilterMode('custom');
                setCurrentPage(1);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
                filterMode === 'custom'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-500/30'
                  : isDark ? 'bg-slate-800 text-slate-300 border-white/5' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>আমার নিজস্ব ({customCount})</span>
            </button>
          )}
        </div>

        {/* Results Counter */}
        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>মোট পাওয়া গেছে: <strong className="text-emerald-400 font-mono">{filteredTips.length}</strong> টি</span>
        </div>
      </div>

      {/* Pagination Controls - Top Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mb-3 px-1 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
              title="প্রথম পৃষ্ঠা"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
              title="পূর্ববর্তী পৃষ্ঠা"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className={`text-[11px] font-medium font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            পৃষ্ঠা {currentPage} / {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
              title="পরবর্তী পৃষ্ঠা"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
              title="শেষ পৃষ্ঠা"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tips List */}
      <div className="space-y-3 min-h-[300px]">
        {paginatedTips.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border border-dashed ${
            isDark ? 'border-slate-800 text-slate-500 bg-slate-950/30' : 'border-slate-200 text-slate-400 bg-slate-50/50'
          }`}>
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-400" />
            <p className="text-sm font-semibold mb-1">কোনো উপদেশ পাওয়া যায়নি।</p>
            <p className="text-xs text-slate-500 mb-3">অনুসন্ধান পরিবর্তন করুন অথবা ফিল্টার রিসেট করুন।</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-emerald-500 underline underline-offset-2"
              >
                অনুসন্ধান মুছুন
              </button>
            )}
          </div>
        ) : (
          paginatedTips.map((tip, idx) => {
            const isEditing = editingId === tip.id;
            const isFav = favoriteTipIds.includes(tip.id);
            const isCustom = !tip.id.startsWith('qh-');
            const serialNum = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;

            if (isEditing) {
              return (
                <div 
                  key={tip.id}
                  className={`p-3.5 rounded-2xl border ${
                    isDark ? 'bg-slate-950 border-emerald-500/50' : 'bg-emerald-50/50 border-emerald-300'
                  }`}
                >
                  <label className="text-[11px] font-bold block mb-1">উপদেশ সম্পাদনা:</label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className={`w-full p-2 rounded-lg text-xs border focus:outline-none mb-2 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <input
                    type="text"
                    value={editDalil}
                    onChange={(e) => setEditDalil(e.target.value)}
                    placeholder="দলিল বা রেফারেন্স"
                    className={`w-full p-2 rounded-lg text-xs border focus:outline-none mb-2 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className={`p-1.5 rounded-lg border ${
                        isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                      title="বাতিল"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(tip.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                      title="সংরক্ষণ"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>আপডেট করুন</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={tip.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                  isDark 
                    ? 'bg-slate-950/50 hover:bg-slate-950/80 border-white/5 hover:border-emerald-500/20' 
                    : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200/80 hover:border-emerald-200'
                }`}
              >
                {/* Card Top: Number, Source Badge, and Action Buttons */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                      isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
                    }`}>
                      #{serialNum}
                    </span>

                    {/* Source Pill */}
                    {(tip.source === 'quran' || (tip.reference || tip.dalil)?.includes('সূরা')) ? (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}>
                        <BookOpen className="w-2.5 h-2.5" />
                        <span>আল-কুরআন</span>
                      </span>
                    ) : isCustom ? (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isDark ? 'bg-amber-950/60 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        <PenTool className="w-2.5 h-2.5" />
                        <span>ব্যক্তিগত</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isDark ? 'bg-teal-950/60 text-teal-300 border-teal-500/30' : 'bg-teal-50 text-teal-800 border-teal-300'
                      }`}>
                        <Scroll className="w-2.5 h-2.5" />
                        <span>সহিহ হাদিস</span>
                      </span>
                    )}

                    {(tip.topic || tip.category) && (
                      <span className={`text-[10px] hidden sm:inline ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        • {tip.topic || tip.category}
                      </span>
                    )}
                  </div>

                  {/* Actions: Copy & Bookmark & Custom Actions */}
                  <div className="flex items-center gap-1">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(tip)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        copiedId === tip.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : isDark 
                            ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5' 
                            : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                      title="কপি করুন"
                    >
                      {copiedId === tip.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>

                    {/* Bookmark Button */}
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(tip.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isFav
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : isDark
                              ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
                              : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                        title={isFav ? 'বুকমার্ক থেকে সরান' : 'বুকমার্কে যোগ করুন'}
                      >
                        <Bookmark className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    {/* Edit/Delete for Custom Tips */}
                    {isCustom && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(tip)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDark ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-200'
                          }`}
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTip(tip.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-200'
                          }`}
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Main Tip Text */}
                <p className={`text-xs sm:text-sm leading-relaxed font-medium mb-2.5 ${
                  isDark ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  "{tip.text}"
                </p>

                {/* Dalil / Reference Badge */}
                {(tip.reference || tip.dalil) && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                      isDark 
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      <span className="text-[10px]">📖</span>
                      <span>{tip.reference || tip.dalil}</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls - Bottom Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-500/10 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <ChevronsLeft className="w-3 h-3" />
              <span className="hidden sm:inline">প্রথম পাতা</span>
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
              <span>আগের</span>
            </button>
          </div>

          <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            পৃষ্ঠা {currentPage} এর {totalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <span>পরের</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <span className="hidden sm:inline">শেষ পাতা</span>
              <ChevronsRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
