import React, { useState, useMemo, useEffect } from 'react';
import { 
  Delete, 
  Cpu, 
  Zap, 
  Layers, 
  ArrowRightLeft, 
  Atom, 
  Binary, 
  LineChart, 
  Coins,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Clock,
  History,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Wifi,
  BatteryCharging,
  Signal,
  FlaskConical,
  Calculator as CalcIcon,
  BarChart2,
  BookOpen,
  Sigma,
  Grid
} from 'lucide-react';
import { PERIODIC_TABLE, ChemicalElement } from '../utils/calcData/periodicTable';
import { SCIENTIFIC_FORMULAS, ScientificFormula } from '../utils/calcData/formulas';
import { EXTENDED_CONSTANTS_LIST, ScientificConstant } from '../utils/calcData/constants';
import { 
  calculate2x2Determinant, 
  calculateDatasetStatistics, 
  calculateGCD, 
  calculateLCM, 
  isPrimeNumber, 
  calculatePermutation, 
  calculateCombination 
} from '../utils/calcData/matrixStats';

interface CalculatorDisguiseProps {
  secretPin?: string;
  onUnlock: () => void;
  isDark?: boolean;
}

type TabMode = 'calc' | 'formulas' | 'periodic' | 'converter' | 'constants' | 'matrix_stats' | 'programmer' | 'graph' | 'finance';
type AngleMode = 'DEG' | 'RAD';

interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const CalculatorDisguise: React.FC<CalculatorDisguiseProps> = ({
  secretPin = '313',
  onUnlock,
  isDark = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('calc');
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [isSecond, setIsSecond] = useState<boolean>(false);
  const [isHyp, setIsHyp] = useState<boolean>(false);
  const [isSciExpanded, setIsSciExpanded] = useState<boolean>(true);
  const [memory, setMemory] = useState<number>(0);
  const [lastAns, setLastAns] = useState<number>(0);
  const [isResult, setIsResult] = useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Sound preference state
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sz_calc_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Real-time phone clock display in status bar
  const [statusTime, setStatusTime] = useState<string>('12:00');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setStatusTime(`${hh}:${mm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculation History State (Strictly excludes secret PIN 313 from ever being stored or displayed)
  const [historyItems, setHistoryItems] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sz_calc_history');
      if (!saved) return [];
      const parsed: CalculationHistoryItem[] = JSON.parse(saved);
      // Clean out any past history item containing 313 or secret PIN
      const clean = parsed.filter(
        (item) =>
          !item.expression.includes('313') &&
          !item.result.includes('313')
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem('sz_calc_history', JSON.stringify(clean));
      }
      return clean;
    } catch {
      return [];
    }
  });

  const saveToHistory = (expr: string, res: string) => {
    // Secret PIN 313 must NEVER be stored in calculator history
    if (
      expr.includes('313') ||
      res.includes('313') ||
      expr.trim() === '313' ||
      res.trim() === '313'
    ) {
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem: CalculationHistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      expression: expr,
      result: res,
      timestamp: timeStr,
    };
    const updated = [newItem, ...historyItems.filter((i) => !i.expression.includes('313') && !i.result.includes('313')).slice(0, 29)];
    setHistoryItems(updated);
    try {
      localStorage.setItem('sz_calc_history', JSON.stringify(updated));
    } catch {}
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem('sz_calc_history');
    } catch {}
  };

  // Unit Converter States
  const [convCategory, setConvCategory] = useState<'currency' | 'length' | 'mass' | 'temp' | 'data' | 'speed' | 'time' | 'pressure' | 'energy'>('currency');
  const [convFrom, setConvFrom] = useState<string>('USD');
  const [convTo, setConvTo] = useState<string>('BDT');
  const [convInput, setConvInput] = useState<string>('100');

  // Search & Filter States
  const [formulaSearch, setFormulaSearch] = useState<string>('');
  const [formulaCat, setFormulaCat] = useState<string>('All');
  const [elementSearch, setElementSearch] = useState<string>('');
  const [elementCat, setElementCat] = useState<string>('All');
  const [constSearch, setConstSearch] = useState<string>('');
  const [constCat, setConstCat] = useState<string>('All');

  // Matrix & Stats States
  const [statsInput, setStatsInput] = useState<string>('12, 24, 38, 45, 62, 78, 90');
  const [matrixA, setMatrixA] = useState<number[][]>([[4, 2], [3, 5]]);
  const [ntNumA, setNtNumA] = useState<string>('48');
  const [ntNumB, setNtNumB] = useState<string>('18');

  // Graph function selection
  const [graphFunc, setGraphFunc] = useState<string>('sin(x)');

  // Finance calculator states
  const [loanPrincipal, setLoanPrincipal] = useState<string>('100000');
  const [loanRate, setLoanRate] = useState<string>('9.5');
  const [loanMonths, setLoanMonths] = useState<string>('24');

  // ----------------------------------------------------
  // HAPTIC & AUDIO SYNTHESIZER ENGINE (Web Audio API)
  // ----------------------------------------------------
  const playClickSound = (type: 'num' | 'op' | 'equals' | 'clear' = 'num') => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'num') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.035);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'op') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'equals') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.setValueAtTime(880, now + 0.03);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'clear') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {}

    // Tactile vibration on mobile devices
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(type === 'equals' ? 18 : 8);
      }
    } catch {}
  };

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    try {
      localStorage.setItem('sz_calc_sound', JSON.stringify(next));
    } catch {}
  };

  // ----------------------------------------------------
  // ADVANCED MATHEMATICAL EVALUATOR
  // ----------------------------------------------------
  const evaluateMath = (expr: string): string => {
    try {
      let s = expr.trim();
      if (!s) return '0';

      // Replace visual symbols
      s = s
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'Math.PI')
        .replace(/φ/g, '1.618033988749895');

      // Factorial: n!
      s = s.replace(/(\d+(\.\d+)?)!/g, '__fact($1)');

      // Constants
      s = s.replace(/\be\b/g, 'Math.E');

      // Angle modes for trig functions
      if (angleMode === 'DEG') {
        s = s
          .replace(/sin\(/g, '__sinD(')
          .replace(/cos\(/g, '__cosD(')
          .replace(/tan\(/g, '__tanD(')
          .replace(/asin\(/g, '__asinD(')
          .replace(/acos\(/g, '__acosD(')
          .replace(/atan\(/g, '__atanD(');
      } else {
        s = s
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/asin\(/g, 'Math.asin(')
          .replace(/acos\(/g, 'Math.acos(')
          .replace(/atan\(/g, 'Math.atan(');
      }

      s = s
        .replace(/sinh\(/g, 'Math.sinh(')
        .replace(/cosh\(/g, 'Math.cosh(')
        .replace(/tanh\(/g, 'Math.tanh(')
        .replace(/asinh\(/g, 'Math.asinh(')
        .replace(/acosh\(/g, 'Math.acosh(')
        .replace(/atanh\(/g, 'Math.atanh(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/∛\(/g, 'Math.cbrt(')
        .replace(/\^/g, '**');

      const helpers = {
        __fact: (n: number) => {
          if (n < 0 || Math.floor(n) !== n) return NaN;
          if (n > 170) return Infinity;
          let r = 1;
          for (let i = 2; i <= n; i++) r *= i;
          return r;
        },
        __sinD: (deg: number) => Math.sin((deg * Math.PI) / 180),
        __cosD: (deg: number) => Math.cos((deg * Math.PI) / 180),
        __tanD: (deg: number) => Math.tan((deg * Math.PI) / 180),
        __asinD: (v: number) => (Math.asin(v) * 180) / Math.PI,
        __acosD: (v: number) => (Math.acos(v) * 180) / Math.PI,
        __atanD: (v: number) => (Math.atan(v) * 180) / Math.PI,
      };

      const fn = new Function(
        'Math',
        '__fact',
        '__sinD',
        '__cosD',
        '__tanD',
        '__asinD',
        '__acosD',
        '__atanD',
        `'use strict'; return (${s});`
      );

      const res = fn(
        Math,
        helpers.__fact,
        helpers.__sinD,
        helpers.__cosD,
        helpers.__tanD,
        helpers.__asinD,
        helpers.__acosD,
        helpers.__atanD
      );

      if (typeof res !== 'number' || isNaN(res) || !isFinite(res)) {
        return 'Syntax Error';
      }

      const rounded = Number(res.toFixed(10));
      return String(rounded);
    } catch {
      return 'Syntax Error';
    }
  };

  const appendToken = (token: string, isFunc: boolean = false) => {
    playClickSound('op');
    if (isResult || display === 'Syntax Error' || display === '0') {
      if (isFunc) {
        setDisplay(token + '(');
      } else {
        setDisplay(token);
      }
      setIsResult(false);
    } else {
      if (isFunc) {
        setDisplay((prev) => prev + token + '(');
      } else {
        setDisplay((prev) => prev + token);
      }
    }
    setIsSecond(false);
  };

  const handleDigit = (d: string) => {
    playClickSound('num');
    if (isResult || display === '0' || display === 'Syntax Error') {
      setDisplay(d);
      setIsResult(false);
    } else {
      setDisplay((prev) => prev + d);
    }
    setIsSecond(false);
  };

  const handleDecimal = () => {
    playClickSound('num');
    if (isResult || display === 'Syntax Error') {
      setDisplay('0.');
      setIsResult(false);
    } else {
      const parts = display.split(/[-+×÷(]/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes('.')) {
        setDisplay((prev) => prev + '.');
      }
    }
  };

  const handleOperator = (op: string) => {
    playClickSound('op');
    if (display === 'Syntax Error') return;
    setDisplay((prev) => prev + op);
    setIsResult(false);
  };

  const handleClear = () => {
    playClickSound('clear');
    setDisplay('0');
    setExpression('');
    setIsResult(false);
    setIsSecond(false);
  };

  const handleBackspace = () => {
    playClickSound('clear');
    if (isResult || display === 'Syntax Error') {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay((prev) => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEquals = () => {
    playClickSound('equals');
    const trimmed = display.trim();

    // Secret PIN check (permanently fixed to 313 - cannot be changed):
    if (trimmed === '313' || trimmed === secretPin) {
      setIsUnlocking(true);
      setTimeout(() => {
        onUnlock();
      }, 350);
      return;
    }

    const currentExpr = display;
    const result = evaluateMath(display);
    setExpression(currentExpr + ' =');
    setDisplay(result);
    setIsResult(true);

    if (result !== 'Syntax Error') {
      saveToHistory(currentExpr, result);
    }

    const numeric = parseFloat(result);
    if (!isNaN(numeric)) {
      setLastAns(numeric);
    }
  };

  const handleCopyDisplay = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {}
  };

  // Memory Actions
  const handleMemoryAdd = () => {
    playClickSound('op');
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setMemory((prev) => prev + val);
      setIsResult(true);
    }
  };

  const handleMemorySub = () => {
    playClickSound('op');
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setMemory((prev) => prev - val);
      setIsResult(true);
    }
  };

  const handleMemoryRecall = () => {
    playClickSound('op');
    setDisplay(String(memory));
    setIsResult(true);
  };

  const handleMemoryClear = () => {
    playClickSound('clear');
    setMemory(0);
  };

  // ----------------------------------------------------
  // UNIT & CURRENCY CONVERTER ENGINE (100+ Units)
  // ----------------------------------------------------
  const conversionResult = useMemo(() => {
    const val = parseFloat(convInput) || 0;

    if (convCategory === 'currency') {
      const toUSD: Record<string, number> = {
        USD: 1,
        BDT: 0.0083, // 1 USD ~ 120 BDT
        EUR: 1.08,
        GBP: 1.28,
        SAR: 0.27,  // 1 USD ~ 3.75 SAR
        AED: 0.272,
        INR: 0.012,
        JPY: 0.0067,
        CAD: 0.74,
        AUD: 0.65,
        MYR: 0.23,
      };
      const fromRate = toUSD[convFrom] || 1;
      const toRate = toUSD[convTo] || 1;
      const inUSD = val * fromRate;
      return Number((inUSD / toRate).toFixed(4));
    }

    if (convCategory === 'length') {
      const toMeters: Record<string, number> = {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        um: 0.000001,
        nm: 1e-9,
        mi: 1609.344,
        yd: 0.9144,
        ft: 0.3048,
        in: 0.0254,
        nmi: 1852,
      };
      const meters = val * (toMeters[convFrom] || 1);
      return Number((meters / (toMeters[convTo] || 1)).toFixed(6));
    }

    if (convCategory === 'mass') {
      const toKg: Record<string, number> = {
        kg: 1,
        g: 0.001,
        mg: 0.000001,
        ug: 1e-9,
        lb: 0.45359237,
        oz: 0.0283495,
        ton: 1000,
        carat: 0.0002,
      };
      const kg = val * (toKg[convFrom] || 1);
      return Number((kg / (toKg[convTo] || 1)).toFixed(6));
    }

    if (convCategory === 'temp') {
      let c = val;
      if (convFrom === 'F') c = ((val - 32) * 5) / 9;
      if (convFrom === 'K') c = val - 273.15;
      let res = c;
      if (convTo === 'F') res = (c * 9) / 5 + 32;
      if (convTo === 'K') res = c + 273.15;
      return Number(res.toFixed(2));
    }

    if (convCategory === 'pressure') {
      const toPa: Record<string, number> = {
        Pa: 1,
        kPa: 1000,
        bar: 100000,
        psi: 6894.76,
        atm: 101325,
        mmHg: 133.322,
      };
      const pa = val * (toPa[convFrom] || 1);
      return Number((pa / (toPa[convTo] || 1)).toFixed(4));
    }

    if (convCategory === 'energy') {
      const toJoule: Record<string, number> = {
        J: 1,
        kJ: 1000,
        cal: 4.184,
        kcal: 4184,
        Wh: 3600,
        kWh: 3600000,
        eV: 1.602176634e-19,
        BTU: 1055.06,
      };
      const j = val * (toJoule[convFrom] || 1);
      return Number((j / (toJoule[convTo] || 1)).toFixed(6));
    }

    if (convCategory === 'data') {
      const toBytes: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1048576,
        GB: 1073741824,
        TB: 1099511627776,
      };
      const bytes = val * (toBytes[convFrom] || 1);
      return Number((bytes / (toBytes[convTo] || 1)).toFixed(6));
    }

    if (convCategory === 'speed') {
      const toMps: Record<string, number> = {
        ms: 1,
        kmh: 0.277778,
        mph: 0.44704,
        knot: 0.514444,
        mach: 343,
      };
      const mps = val * (toMps[convFrom] || 1);
      return Number((mps / (toMps[convTo] || 1)).toFixed(4));
    }

    if (convCategory === 'time') {
      const toSec: Record<string, number> = {
        s: 1,
        min: 60,
        hr: 3600,
        day: 86400,
        wk: 604800,
        yr: 31536000,
      };
      const sec = val * (toSec[convFrom] || 1);
      return Number((sec / (toSec[convTo] || 1)).toFixed(6));
    }

    return 0;
  }, [convCategory, convFrom, convTo, convInput]);

  // Programmer values
  const programmerValues = useMemo(() => {
    const num = parseInt(display, 10);
    if (isNaN(num)) return { hex: '0', dec: '0', oct: '0', bin: '0' };
    return {
      hex: (num >>> 0).toString(16).toUpperCase(),
      dec: String(num),
      oct: (num >>> 0).toString(8),
      bin: (num >>> 0).toString(2).padStart(8, '0'),
    };
  }, [display]);

  // Finance EMI calculation
  const loanEmi = useMemo(() => {
    const P = parseFloat(loanPrincipal) || 0;
    const r = (parseFloat(loanRate) || 0) / 12 / 100;
    const n = parseFloat(loanMonths) || 1;
    if (P <= 0 || r <= 0 || n <= 0) return { emi: 0, total: 0, interest: 0 };
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;
    return {
      emi: Math.round(emi),
      total: Math.round(total),
      interest: Math.round(interest),
    };
  }, [loanPrincipal, loanRate, loanMonths]);

  // Filtered Formulas
  const filteredFormulas = useMemo(() => {
    return SCIENTIFIC_FORMULAS.filter((f) => {
      const matchCat = formulaCat === 'All' || f.category === formulaCat;
      const matchSearch =
        !formulaSearch.trim() ||
        f.name.toLowerCase().includes(formulaSearch.toLowerCase()) ||
        f.formula.toLowerCase().includes(formulaSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(formulaSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [formulaCat, formulaSearch]);

  // Filtered Elements
  const filteredElements = useMemo(() => {
    return PERIODIC_TABLE.filter((el) => {
      const matchCat = elementCat === 'All' || el.category === elementCat;
      const matchSearch =
        !elementSearch.trim() ||
        el.name.toLowerCase().includes(elementSearch.toLowerCase()) ||
        el.symbol.toLowerCase().includes(elementSearch.toLowerCase()) ||
        String(el.number).includes(elementSearch);
      return matchCat && matchSearch;
    });
  }, [elementCat, elementSearch]);

  // Filtered Constants
  const filteredConstants = useMemo(() => {
    return EXTENDED_CONSTANTS_LIST.filter((c) => {
      const matchCat = constCat === 'All' || c.category === constCat;
      const matchSearch =
        !constSearch.trim() ||
        c.name.toLowerCase().includes(constSearch.toLowerCase()) ||
        c.symbol.toLowerCase().includes(constSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(constSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [constCat, constSearch]);

  // Statistics calculation
  const computedStats = useMemo(() => {
    const nums = statsInput
      .split(/[,;\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    return calculateDatasetStatistics(nums);
  }, [statsInput]);

  // 2x2 Determinant
  const det2x2 = useMemo(() => {
    return calculate2x2Determinant(matrixA);
  }, [matrixA]);

  // Format large numbers with commas if it's a pure number
  const formattedDisplay = useMemo(() => {
    if (/^-?\d+(\.\d+)?$/.test(display)) {
      const parts = display.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return display;
  }, [display]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-center items-center transition-all duration-300 safe-app-container select-none ${
        isUnlocking ? 'opacity-0 scale-95 transition-all duration-300' : 'opacity-100 scale-100'
      } bg-gradient-to-b from-[#0a0f18] via-slate-950 to-black text-white font-sans`}
    >
      {/* Flagship Space-Black Titanium Bezel Frame */}
      <div
        className="w-full max-w-sm rounded-[42px] p-4 sm:p-5 flex flex-col gap-3 border transition-all relative overflow-hidden backdrop-blur-3xl bg-gradient-to-b from-[#0f172a]/95 via-[#090d16]/98 to-[#020617] border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(16,185,129,0.08)] ring-1 ring-white/10"
      >
        {/* Subtle Ambient Refraction Glare */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-emerald-500/15 via-teal-500/20 to-cyan-500/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-bl-full" />

        {/* 1. REALISTIC PHONE STATUS BAR & CAMERA NOTCH */}
        <div className="flex items-center justify-between px-2 pt-0.5 select-none relative z-10 text-[11px] font-mono text-slate-400 font-semibold">
          <span>{statusTime}</span>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-white/10 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/20 relative flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-emerald-500/80" />
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          </div>

          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-0.5 text-[10px] text-emerald-400">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>98%</span>
            </div>
          </div>
        </div>

        {/* 2. BRANDING & PRO HEADER */}
        <div className="flex items-center justify-between px-1 relative z-10 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[12px] sm:text-[13px] font-black tracking-wider uppercase bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  POWERFUL CLOUD AI CALCULATOR
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-xs">
                  500+ PRO
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1">
                <span>SCIENTIFIC STEM SUITE</span> • <span className="text-cyan-400 font-bold">CLOUD AI ENGINE</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSound}
              title={isSoundEnabled ? "Sound enabled" : "Muted"}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isSoundEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title="Calculation History"
              className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                isHistoryOpen
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              {historyItems.length > 0 && (
                <span className="text-[9px] font-mono px-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  {historyItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. FEATURE MODE TABS (Scrollable Luxury Metallic Pills with Badges) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar select-none text-[11px] font-bold font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('calc')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'calc'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 font-black shadow-md shadow-emerald-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Scientific</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formulas')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'formulas'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-300 font-black shadow-md shadow-indigo-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Formulas (130+)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('periodic')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'periodic'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-300 font-black shadow-md shadow-rose-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <FlaskConical className="w-3 h-3" />
            <span>Elements (118)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'converter'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 border-cyan-300 font-black shadow-md shadow-cyan-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Converter (100+)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix_stats')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'matrix_stats'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 font-black shadow-md shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Stats & Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('constants')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'constants'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 border-yellow-300 font-black shadow-md shadow-yellow-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Atom className="w-3 h-3" />
            <span>Constants (50+)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('programmer')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'programmer'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-slate-950 border-purple-300 font-black shadow-md shadow-purple-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Binary className="w-3 h-3" />
            <span>Programmer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'graph'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 border-teal-300 font-black shadow-md shadow-teal-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <LineChart className="w-3 h-3" />
            <span>Graph</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 border ${
              activeTab === 'finance'
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-slate-950 border-rose-300 font-black shadow-md shadow-rose-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Coins className="w-3 h-3" />
            <span>Finance</span>
          </button>
        </div>

        {/* 4. HISTORY SLIDE-OVER DRAWER */}
        {isHistoryOpen && (
          <div className="p-3.5 rounded-3xl bg-slate-900/95 border border-cyan-500/30 backdrop-blur-xl animate-fadeIn space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-300">
                  Calculation History
                </span>
              </div>
              <div className="flex items-center gap-2">
                {historyItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {historyItems.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500 font-mono">
                No calculation history recorded yet.
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar font-mono">
                {historyItems.filter((item) => !item.expression.includes('313') && !item.result.includes('313')).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setDisplay(item.result);
                      setIsResult(true);
                      setIsHistoryOpen(false);
                      playClickSound('num');
                    }}
                    className="p-2 rounded-xl bg-black/50 hover:bg-slate-800/80 border border-white/5 flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block group-hover:text-slate-300">
                        {item.expression} =
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                        {item.result}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: SCIENTIFIC CALCULATOR MAIN DISPLAY & KEYPAD */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'calc' && (
          <>
            {/* OLED Deep-Black Curved Display Screen with Glass Reflection */}
            <div
              className="rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between min-h-[116px] border relative overflow-hidden transition-all bg-gradient-to-b from-[#02050b] via-[#040913] to-[#010307] border-white/10 shadow-[inset_0_2px_14px_rgba(0,0,0,0.95)]"
            >
              {/* Glass Glare Highlight */}
              <div className="absolute -top-12 -left-12 w-40 h-28 bg-white/[0.04] rotate-45 pointer-events-none rounded-full blur-xl" />

              {/* Status Indicators Pill Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono tracking-wider mb-1 select-none font-bold relative z-10">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound('op');
                      setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG');
                    }}
                    className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all border ${
                      angleMode === 'DEG'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                    }`}
                  >
                    {angleMode}
                  </button>

                  {isSecond && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                      2ND
                    </span>
                  )}

                  {isHyp && (
                    <span className="px-2 py-0.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold">
                      HYP
                    </span>
                  )}

                  {memory !== 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                      M
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyDisplay}
                    title="Copy Result"
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSciExpanded(!isSciExpanded)}
                    title={isSciExpanded ? "Collapse Scientific Keys" : "Expand Scientific Keys"}
                    className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400 hover:text-white bg-white/5 border border-white/10 cursor-pointer flex items-center gap-0.5"
                  >
                    <span>{isSciExpanded ? 'Sci' : 'Basic'}</span>
                    {isSciExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                  </button>
                </div>
              </div>

              {/* Expression line */}
              <div className="text-xs sm:text-sm font-mono tracking-wide h-5 overflow-x-auto whitespace-nowrap scrollbar-none text-right transition-all text-slate-400 relative z-10">
                {expression || '\u00A0'}
              </div>

              {/* Main digital readout */}
              <div
                className={`font-mono font-black tracking-tight text-right overflow-x-auto whitespace-nowrap scrollbar-none transition-all relative z-10 ${
                  display.length > 14
                    ? 'text-xl sm:text-2xl'
                    : display.length > 9
                    ? 'text-2xl sm:text-3xl'
                    : 'text-3xl sm:text-4xl'
                } text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.18)]`}
              >
                {formattedDisplay}
              </div>
            </div>

            {/* EXPANDABLE SCIENTIFIC KEYPAD DECK (Row 1 to 3) */}
            {isSciExpanded && (
              <div className="space-y-1.5 animate-fadeIn">
                {/* Deck Row 1: Mode & Memory */}
                <div className="grid grid-cols-6 gap-1.5 text-[11px] font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound('op');
                      setIsSecond(!isSecond);
                    }}
                    className={`h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border ${
                      isSecond
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30 font-black'
                        : 'bg-white/5 hover:bg-white/10 text-amber-300 border-white/10'
                    }`}
                  >
                    2nd
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound('op');
                      setIsHyp(!isHyp);
                    }}
                    className={`h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border ${
                      isHyp
                        ? 'bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/30 font-black'
                        : 'bg-white/5 hover:bg-white/10 text-pink-300 border-white/10'
                    }`}
                  >
                    hyp
                  </button>

                  <button
                    type="button"
                    onClick={handleMemoryRecall}
                    title="Memory Recall"
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-white/5 hover:bg-white/10 text-purple-300 border-white/10"
                  >
                    MR
                  </button>

                  <button
                    type="button"
                    onClick={handleMemoryAdd}
                    title="Memory Add"
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-white/5 hover:bg-white/10 text-purple-300 border-white/10"
                  >
                    M+
                  </button>

                  <button
                    type="button"
                    onClick={handleMemorySub}
                    title="Memory Subtract"
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-white/5 hover:bg-white/10 text-purple-300 border-white/10"
                  >
                    M-
                  </button>

                  <button
                    type="button"
                    onClick={handleMemoryClear}
                    title="Memory Clear"
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-white/5 hover:bg-white/10 text-purple-300 border-white/10"
                  >
                    MC
                  </button>
                </div>

                {/* Deck Row 2: Trig & Exponents */}
                <div className="grid grid-cols-6 gap-1.5 text-xs font-mono font-semibold">
                  <button
                    type="button"
                    onClick={() =>
                      appendToken(
                        isHyp ? (isSecond ? 'asinh' : 'sinh') : isSecond ? 'asin' : 'sin',
                        true
                      )
                    }
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/90 hover:bg-slate-800 text-teal-300 border-white/10"
                  >
                    {isHyp ? (isSecond ? 'asinh' : 'sinh') : isSecond ? 'sin⁻¹' : 'sin'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      appendToken(
                        isHyp ? (isSecond ? 'acosh' : 'cosh') : isSecond ? 'acos' : 'cos',
                        true
                      )
                    }
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/90 hover:bg-slate-800 text-teal-300 border-white/10"
                  >
                    {isHyp ? (isSecond ? 'acosh' : 'cosh') : isSecond ? 'cos⁻¹' : 'cos'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      appendToken(
                        isHyp ? (isSecond ? 'atanh' : 'tanh') : isSecond ? 'atan' : 'tan',
                        true
                      )
                    }
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/90 hover:bg-slate-800 text-teal-300 border-white/10"
                  >
                    {isHyp ? (isSecond ? 'atanh' : 'tanh') : isSecond ? 'tan⁻¹' : 'tan'}
                  </button>

                  <button
                    type="button"
                    onClick={() => appendToken(isSecond ? '10^' : 'log', true)}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/90 hover:bg-slate-800 text-sky-300 border-white/10"
                  >
                    {isSecond ? '10ˣ' : 'log'}
                  </button>

                  <button
                    type="button"
                    onClick={() => appendToken(isSecond ? 'e^' : 'ln', true)}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/90 hover:bg-slate-800 text-sky-300 border-white/10"
                  >
                    {isSecond ? 'eˣ' : 'ln'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOperator('^')}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border-white/10"
                  >
                    xʸ
                  </button>
                </div>

                {/* Deck Row 3: Roots, Powers, Constants */}
                <div className="grid grid-cols-6 gap-1.5 text-xs font-mono font-semibold">
                  <button
                    type="button"
                    onClick={() => appendToken(isSecond ? '∛' : '√', true)}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border-white/10"
                  >
                    {isSecond ? '∛' : '√'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOperator(isSecond ? '^3' : '^2')}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border-white/10"
                  >
                    {isSecond ? 'x³' : 'x²'}
                  </button>

                  <button
                    type="button"
                    onClick={() => appendToken('(')}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-white/10"
                  >
                    (
                  </button>

                  <button
                    type="button"
                    onClick={() => appendToken(')')}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-white/10"
                  >
                    )
                  </button>

                  <button
                    type="button"
                    onClick={() => appendToken(isSecond ? 'φ' : 'π')}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/70 hover:bg-slate-800 text-amber-300 border-white/10"
                  >
                    {isSecond ? 'φ' : 'π'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOperator('!')}
                    className="h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border bg-slate-900/70 hover:bg-slate-800 text-amber-300 border-white/10"
                  >
                    x!
                  </button>
                </div>
              </div>
            )}

            {/* PRIMARY KEYPAD (Tactile 3D Depth, Apple/Casio Style) */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-lg font-bold">
              {/* Row 1: AC, DEL, %, ÷ */}
              <button
                type="button"
                onClick={handleClear}
                title="All Clear"
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border text-sm font-black font-mono bg-gradient-to-b from-rose-500/25 to-rose-600/30 hover:from-rose-500/35 hover:to-rose-600/40 text-rose-300 border-rose-500/40 shadow-md shadow-rose-950/40"
              >
                AC
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                title="Delete"
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border text-sm font-mono bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-white/10 shadow-sm"
              >
                <Delete className="w-4 h-4 mr-1" />
                <span>DEL</span>
              </button>

              <button
                type="button"
                onClick={() => handleOperator('%')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border text-base font-bold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-white/10 shadow-sm"
              >
                %
              </button>

              <button
                type="button"
                onClick={() => handleOperator('÷')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border text-2xl font-bold bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-600/30"
              >
                ÷
              </button>

              {/* Row 2: 7, 8, 9, × */}
              <button
                type="button"
                onClick={() => handleDigit('7')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                7
              </button>

              <button
                type="button"
                onClick={() => handleDigit('8')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                8
              </button>

              <button
                type="button"
                onClick={() => handleDigit('9')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                9
              </button>

              <button
                type="button"
                onClick={() => handleOperator('×')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border text-2xl font-bold bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-600/30"
              >
                ×
              </button>

              {/* Row 3: 4, 5, 6, - */}
              <button
                type="button"
                onClick={() => handleDigit('4')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                4
              </button>

              <button
                type="button"
                onClick={() => handleDigit('5')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                5
              </button>

              <button
                type="button"
                onClick={() => handleDigit('6')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                6
              </button>

              <button
                type="button"
                onClick={() => handleOperator('-')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border text-2xl font-bold bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-600/30"
              >
                −
              </button>

              {/* Row 4: 1, 2, 3, + */}
              <button
                type="button"
                onClick={() => handleDigit('1')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                1
              </button>

              <button
                type="button"
                onClick={() => handleDigit('2')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                2
              </button>

              <button
                type="button"
                onClick={() => handleDigit('3')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                3
              </button>

              <button
                type="button"
                onClick={() => handleOperator('+')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border text-2xl font-bold bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-600/30"
              >
                +
              </button>

              {/* Row 5: 0, ., Ans, = */}
              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleDecimal}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border bg-gradient-to-b from-slate-900 to-slate-950 hover:bg-slate-850 text-white border-white/10 shadow-md shadow-black/60 text-2xl"
              >
                .
              </button>

              <button
                type="button"
                onClick={() => appendToken('Ans')}
                title="Previous Answer"
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer border text-xs font-mono font-bold bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 border-emerald-500/30"
              >
                Ans
              </button>

              <button
                type="button"
                onClick={handleEquals}
                className="h-12 sm:h-13 rounded-2xl flex items-center justify-center font-black text-2xl active:scale-[0.95] active:translate-y-0.5 transition-all cursor-pointer bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 shadow-lg shadow-emerald-500/40 border border-emerald-300/60 font-mono"
              >
                =
              </button>
            </div>
          </>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: 130+ SCIENTIFIC FORMULA BANK */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'formulas' && (
          <div className="flex flex-col gap-2.5 min-h-[380px] animate-fadeIn">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formulaSearch}
                onChange={(e) => setFormulaSearch(e.target.value)}
                placeholder="Search 130+ physics, chem & math formulas..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-white outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px] font-mono font-bold">
              {['All', 'Mechanics', 'Electromagnetism', 'Thermodynamics', 'Optics & Waves', 'Modern Physics', 'Chemistry', 'Geometry & Math'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormulaCat(c)}
                  className={`px-2 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    formulaCat === c
                      ? 'bg-indigo-500 text-white border-indigo-400 font-extrabold shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Formulas List */}
            <div className="flex-1 max-h-[310px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {filteredFormulas.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-white/10 flex flex-col gap-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{f.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {f.category}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-300">{f.formula}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDisplay(f.expression);
                        setActiveTab('calc');
                        playClickSound('num');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30 cursor-pointer active:scale-95"
                    >
                      Solve In Calc
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-snug">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: COMPLETE 118 CHEMICAL PERIODIC TABLE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'periodic' && (
          <div className="flex flex-col gap-2.5 min-h-[380px] animate-fadeIn">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={elementSearch}
                onChange={(e) => setElementSearch(e.target.value)}
                placeholder="Search 118 elements by name, symbol, or atomic #..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-white outline-none focus:border-rose-500/50"
              />
            </div>

            {/* Elements Grid */}
            <div className="flex-1 max-h-[330px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
              {filteredElements.map((el) => (
                <div
                  key={el.number}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-300 font-mono font-black flex flex-col items-center justify-center leading-none">
                      <span className="text-[8px] text-slate-400 font-normal">{el.number}</span>
                      <span className="text-xs">{el.symbol}</span>
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-white leading-snug">{el.name}</h5>
                        <span className="text-[8px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 font-mono">
                          {el.category}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400">
                        Atomic Mass: <span className="text-rose-300 font-bold">{el.atomicMass} u</span> • Period {el.period}, Group {el.group}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDisplay(String(el.atomicMass));
                      setActiveTab('calc');
                      playClickSound('num');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30 cursor-pointer active:scale-95"
                  >
                    Insert
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: ADVANCED UNIT & CURRENCY CONVERTER */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'converter' && (
          <div className="flex flex-col gap-3 min-h-[380px] animate-fadeIn">
            {/* Category selector */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-bold font-mono">
              {[
                { id: 'currency', label: 'Currency' },
                { id: 'length', label: 'Length' },
                { id: 'mass', label: 'Weight' },
                { id: 'temp', label: 'Temp' },
                { id: 'energy', label: 'Energy' },
                { id: 'pressure', label: 'Pressure' },
                { id: 'data', label: 'Storage' },
                { id: 'speed', label: 'Speed' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    playClickSound('op');
                    setConvCategory(c.id as any);
                    if (c.id === 'currency') { setConvFrom('USD'); setConvTo('BDT'); }
                    if (c.id === 'length') { setConvFrom('m'); setConvTo('ft'); }
                    if (c.id === 'mass') { setConvFrom('kg'); setConvTo('lb'); }
                    if (c.id === 'temp') { setConvFrom('C'); setConvTo('F'); }
                    if (c.id === 'energy') { setConvFrom('J'); setConvTo('cal'); }
                    if (c.id === 'pressure') { setConvFrom('bar'); setConvTo('psi'); }
                    if (c.id === 'data') { setConvFrom('MB'); setConvTo('GB'); }
                    if (c.id === 'speed') { setConvFrom('kmh'); setConvTo('mph'); }
                  }}
                  className={`py-1.5 px-1 rounded-xl text-center border cursor-pointer transition-all ${
                    convCategory === c.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-sm'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Input Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">From Value</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={convInput}
                  onChange={(e) => setConvInput(e.target.value)}
                  className="flex-1 bg-black/60 px-3 py-2 rounded-xl font-mono text-lg font-bold border border-white/10 text-white outline-none"
                />
                <select
                  value={convFrom}
                  onChange={(e) => setConvFrom(e.target.value)}
                  className="bg-slate-800 text-cyan-300 font-mono font-bold px-3 py-2 rounded-xl border border-white/10 outline-none cursor-pointer"
                >
                  {convCategory === 'currency' && (
                    <>
                      <option value="USD">USD ($)</option>
                      <option value="BDT">BDT (৳)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="SAR">SAR (﷼)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                      <option value="MYR">MYR (RM)</option>
                    </>
                  )}
                  {convCategory === 'length' && (
                    <>
                      <option value="m">Meter (m)</option>
                      <option value="km">Kilometer (km)</option>
                      <option value="cm">Centimeter (cm)</option>
                      <option value="mm">Millimeter (mm)</option>
                      <option value="um">Micrometer (µm)</option>
                      <option value="nm">Nanometer (nm)</option>
                      <option value="mi">Mile (mi)</option>
                      <option value="yd">Yard (yd)</option>
                      <option value="ft">Foot (ft)</option>
                      <option value="in">Inch (in)</option>
                      <option value="nmi">Nautical Mile</option>
                    </>
                  )}
                  {convCategory === 'mass' && (
                    <>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="mg">Milligram (mg)</option>
                      <option value="ug">Microgram (µg)</option>
                      <option value="lb">Pound (lb)</option>
                      <option value="oz">Ounce (oz)</option>
                      <option value="ton">Metric Ton (t)</option>
                      <option value="carat">Carat (ct)</option>
                    </>
                  )}
                  {convCategory === 'temp' && (
                    <>
                      <option value="C">Celsius (°C)</option>
                      <option value="F">Fahrenheit (°F)</option>
                      <option value="K">Kelvin (K)</option>
                    </>
                  )}
                  {convCategory === 'pressure' && (
                    <>
                      <option value="bar">Bar (bar)</option>
                      <option value="psi">PSI (lb/in²)</option>
                      <option value="kPa">Kilopascal (kPa)</option>
                      <option value="Pa">Pascal (Pa)</option>
                      <option value="atm">Atmosphere (atm)</option>
                      <option value="mmHg">mmHg (Torr)</option>
                    </>
                  )}
                  {convCategory === 'energy' && (
                    <>
                      <option value="J">Joule (J)</option>
                      <option value="kJ">Kilojoule (kJ)</option>
                      <option value="cal">Calorie (cal)</option>
                      <option value="kcal">Kilocalorie (kcal)</option>
                      <option value="kWh">Kilowatt-hour (kWh)</option>
                      <option value="eV">Electron-volt (eV)</option>
                      <option value="BTU">BTU</option>
                    </>
                  )}
                  {convCategory === 'data' && (
                    <>
                      <option value="B">Bytes (B)</option>
                      <option value="KB">Kilobytes (KB)</option>
                      <option value="MB">Megabytes (MB)</option>
                      <option value="GB">Gigabytes (GB)</option>
                      <option value="TB">Terabytes (TB)</option>
                    </>
                  )}
                  {convCategory === 'speed' && (
                    <>
                      <option value="kmh">km/h</option>
                      <option value="ms">m/s</option>
                      <option value="mph">mph</option>
                      <option value="knot">Knots</option>
                      <option value="mach">Mach</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Output Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col gap-2">
              <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider">Converted Result</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-black/70 px-3 py-2 rounded-xl font-mono text-xl font-black border border-cyan-500/20 text-cyan-300 overflow-x-auto whitespace-nowrap">
                  {conversionResult}
                </div>
                <select
                  value={convTo}
                  onChange={(e) => setConvTo(e.target.value)}
                  className="bg-slate-800 text-cyan-300 font-mono font-bold px-3 py-2 rounded-xl border border-white/10 outline-none cursor-pointer"
                >
                  {convCategory === 'currency' && (
                    <>
                      <option value="BDT">BDT (৳)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="SAR">SAR (﷼)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                      <option value="MYR">MYR (RM)</option>
                    </>
                  )}
                  {convCategory === 'length' && (
                    <>
                      <option value="m">Meter (m)</option>
                      <option value="km">Kilometer (km)</option>
                      <option value="cm">Centimeter (cm)</option>
                      <option value="mm">Millimeter (mm)</option>
                      <option value="um">Micrometer (µm)</option>
                      <option value="nm">Nanometer (nm)</option>
                      <option value="mi">Mile (mi)</option>
                      <option value="yd">Yard (yd)</option>
                      <option value="ft">Foot (ft)</option>
                      <option value="in">Inch (in)</option>
                      <option value="nmi">Nautical Mile</option>
                    </>
                  )}
                  {convCategory === 'mass' && (
                    <>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="mg">Milligram (mg)</option>
                      <option value="ug">Microgram (µg)</option>
                      <option value="lb">Pound (lb)</option>
                      <option value="oz">Ounce (oz)</option>
                      <option value="ton">Metric Ton (t)</option>
                      <option value="carat">Carat (ct)</option>
                    </>
                  )}
                  {convCategory === 'temp' && (
                    <>
                      <option value="C">Celsius (°C)</option>
                      <option value="F">Fahrenheit (°F)</option>
                      <option value="K">Kelvin (K)</option>
                    </>
                  )}
                  {convCategory === 'pressure' && (
                    <>
                      <option value="bar">Bar (bar)</option>
                      <option value="psi">PSI (lb/in²)</option>
                      <option value="kPa">Kilopascal (kPa)</option>
                      <option value="Pa">Pascal (Pa)</option>
                      <option value="atm">Atmosphere (atm)</option>
                      <option value="mmHg">mmHg (Torr)</option>
                    </>
                  )}
                  {convCategory === 'energy' && (
                    <>
                      <option value="J">Joule (J)</option>
                      <option value="kJ">Kilojoule (kJ)</option>
                      <option value="cal">Calorie (cal)</option>
                      <option value="kcal">Kilocalorie (kcal)</option>
                      <option value="kWh">Kilowatt-hour (kWh)</option>
                      <option value="eV">Electron-volt (eV)</option>
                      <option value="BTU">BTU</option>
                    </>
                  )}
                  {convCategory === 'data' && (
                    <>
                      <option value="B">Bytes (B)</option>
                      <option value="KB">Kilobytes (KB)</option>
                      <option value="MB">Megabytes (MB)</option>
                      <option value="GB">Gigabytes (GB)</option>
                      <option value="TB">Terabytes (TB)</option>
                    </>
                  )}
                  {convCategory === 'speed' && (
                    <>
                      <option value="kmh">km/h</option>
                      <option value="ms">m/s</option>
                      <option value="mph">mph</option>
                      <option value="knot">Knots</option>
                      <option value="mach">Mach</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDisplay(String(conversionResult));
                setActiveTab('calc');
                playClickSound('equals');
              }}
              className="w-full py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <span>Send Value to Scientific Calculator</span>
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: MATRIX, VECTOR & DATA STATISTICS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'matrix_stats' && (
          <div className="flex flex-col gap-3 min-h-[380px] animate-fadeIn font-mono text-xs">
            {/* Descriptive Statistics */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sigma className="w-3.5 h-3.5" />
                  <span>Descriptive Statistics</span>
                </span>
                <span className="text-[10px] text-slate-400">Comma Separated Data</span>
              </div>

              <input
                type="text"
                value={statsInput}
                onChange={(e) => setStatsInput(e.target.value)}
                placeholder="10, 15, 22, 35, 40..."
                className="w-full bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 text-white font-bold outline-none"
              />

              {computedStats && (
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <div className="p-1.5 rounded-lg bg-black/40 flex justify-between">
                    <span className="text-slate-400">Mean (x̄):</span>
                    <span className="text-emerald-400 font-bold">{computedStats.mean}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 flex justify-between">
                    <span className="text-slate-400">Median:</span>
                    <span className="text-emerald-400 font-bold">{computedStats.median}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 flex justify-between">
                    <span className="text-slate-400">Std Dev (σ):</span>
                    <span className="text-cyan-400 font-bold">{computedStats.stdev}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 flex justify-between">
                    <span className="text-slate-400">Variance:</span>
                    <span className="text-cyan-400 font-bold">{computedStats.variance}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 flex justify-between">
                    <span className="text-slate-400">Sum (Σx):</span>
                    <span className="text-white font-bold">{computedStats.sum}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 flex justify-between">
                    <span className="text-slate-400">Count (N):</span>
                    <span className="text-white font-bold">{computedStats.count}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2x2 Matrix Determinant */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5" />
                  <span>2x2 Matrix Determinant</span>
                </span>
                <span className="text-emerald-400 font-black">Det = {det2x2}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-[200px] mx-auto">
                <input
                  type="number"
                  value={matrixA[0][0]}
                  onChange={(e) => setMatrixA([[parseFloat(e.target.value) || 0, matrixA[0][1]], matrixA[1]])}
                  className="bg-black/60 p-2 rounded-xl text-center font-bold border border-white/10 text-white outline-none"
                />
                <input
                  type="number"
                  value={matrixA[0][1]}
                  onChange={(e) => setMatrixA([[matrixA[0][0], parseFloat(e.target.value) || 0], matrixA[1]])}
                  className="bg-black/60 p-2 rounded-xl text-center font-bold border border-white/10 text-white outline-none"
                />
                <input
                  type="number"
                  value={matrixA[1][0]}
                  onChange={(e) => setMatrixA([matrixA[0], [parseFloat(e.target.value) || 0, matrixA[1][1]]])}
                  className="bg-black/60 p-2 rounded-xl text-center font-bold border border-white/10 text-white outline-none"
                />
                <input
                  type="number"
                  value={matrixA[1][1]}
                  onChange={(e) => setMatrixA([matrixA[0], [matrixA[1][0], parseFloat(e.target.value) || 0]])}
                  className="bg-black/60 p-2 rounded-xl text-center font-bold border border-white/10 text-white outline-none"
                />
              </div>
            </div>

            {/* Number Theory (GCD, LCM, Prime) */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
              <span className="text-amber-400 font-bold block">Number Theory (GCD, LCM, Prime)</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={ntNumA}
                  onChange={(e) => setNtNumA(e.target.value)}
                  className="flex-1 bg-black/60 p-1.5 rounded-xl text-center font-bold border border-white/10 text-white outline-none"
                  placeholder="A"
                />
                <input
                  type="number"
                  value={ntNumB}
                  onChange={(e) => setNtNumB(e.target.value)}
                  className="flex-1 bg-black/60 p-1.5 rounded-xl text-center font-bold border border-white/10 text-white outline-none"
                  placeholder="B"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                <div className="p-1.5 rounded-lg bg-black/40 text-center">
                  <span className="text-slate-400 block text-[9px]">GCD(A,B)</span>
                  <span className="text-emerald-400 font-bold">{calculateGCD(parseFloat(ntNumA)||0, parseFloat(ntNumB)||0)}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-black/40 text-center">
                  <span className="text-slate-400 block text-[9px]">LCM(A,B)</span>
                  <span className="text-cyan-400 font-bold">{calculateLCM(parseFloat(ntNumA)||0, parseFloat(ntNumB)||0)}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-black/40 text-center">
                  <span className="text-slate-400 block text-[9px]">A is Prime?</span>
                  <span className={isPrimeNumber(parseFloat(ntNumA)||0) ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {isPrimeNumber(parseFloat(ntNumA)||0) ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: 50+ SCIENTIFIC CONSTANTS LIBRARY */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'constants' && (
          <div className="flex flex-col gap-2.5 min-h-[380px] animate-fadeIn">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={constSearch}
                onChange={(e) => setConstSearch(e.target.value)}
                placeholder="Search 50+ universal, nuclear & astro constants..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-white outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px] font-mono font-bold">
              {['All', 'Universal', 'Atomic & Nuclear', 'Electromagnetic', 'Physico-Chemical', 'Astrophysics', 'Mathematics'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConstCat(c)}
                  className={`px-2 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    constCat === c
                      ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-extrabold shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Scrollable List */}
            <div className="flex-1 max-h-[320px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
              {filteredConstants.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-mono font-bold flex items-center justify-center text-xs">
                      {c.symbol}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white leading-snug">{c.name}</h5>
                      <p className="text-[10px] font-mono text-slate-400">
                        {c.value} <span className="text-slate-500">{c.unit}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDisplay(c.value);
                      setActiveTab('calc');
                      playClickSound('num');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-[10px] font-mono font-bold border border-yellow-500/30 cursor-pointer active:scale-95"
                  >
                    Insert
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: PROGRAMMER BITWISE (HEX, DEC, OCT, BIN) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'programmer' && (
          <div className="flex flex-col gap-3 min-h-[380px] animate-fadeIn">
            {/* Live Radix Values */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900/90 border border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                <span className="text-purple-400 font-bold">HEX</span>
                <span className="text-white font-extrabold">{programmerValues.hex}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                <span className="text-emerald-400 font-bold">DEC</span>
                <span className="text-white font-extrabold">{programmerValues.dec}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                <span className="text-amber-400 font-bold">OCT</span>
                <span className="text-white font-extrabold">{programmerValues.oct}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40">
                <span className="text-cyan-400 font-bold">BIN</span>
                <span className="text-white font-extrabold text-[11px] tracking-widest">{programmerValues.bin}</span>
              </div>
            </div>

            {/* Bitwise Operations Toolbar */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
              {[
                { label: 'AND (&)', op: ' & ' },
                { label: 'OR (|)', op: ' | ' },
                { label: 'XOR (^)', op: ' ^ ' },
                { label: 'LSH (<<)', op: ' << ' },
                { label: 'RSH (>>)', op: ' >> ' },
                { label: 'NOT (~)', op: '~' },
              ].map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    handleOperator(btn.op);
                    setActiveTab('calc');
                  }}
                  className="py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 cursor-pointer active:scale-95 transition-all text-center"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 text-center font-mono pt-2">
              Bitwise operations execute against 64-bit precision integers.
            </p>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 8: DYNAMIC FUNCTION GRAPHING VISUALIZER */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'graph' && (
          <div className="flex flex-col gap-2.5 min-h-[380px] animate-fadeIn">
            {/* Function preset pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono font-bold">
              {['sin(x)', 'cos(x)', 'tan(x)', 'x^2', 'x^3', 'sqrt(x)', 'ln(x)'].map((fn) => (
                <button
                  key={fn}
                  type="button"
                  onClick={() => {
                    setGraphFunc(fn);
                    playClickSound('op');
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    graphFunc === fn
                      ? 'bg-teal-500 text-slate-950 border-teal-400 font-extrabold shadow-sm'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {fn}
                </button>
              ))}
            </div>

            {/* SVG Graph Canvas with Axis Grid */}
            <div className="relative w-full h-56 rounded-2xl bg-black border border-teal-500/30 overflow-hidden shadow-inner flex items-center justify-center">
              <svg className="w-full h-full" viewBox="-100 -50 200 100">
                <line x1="-100" y1="0" x2="100" y2="0" stroke="#334155" strokeWidth="0.8" />
                <line x1="0" y1="-50" x2="0" y2="50" stroke="#334155" strokeWidth="0.8" />
                <line x1="-50" y1="-50" x2="-50" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="50" y1="-50" x2="50" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="-100" y1="-25" x2="100" y2="-25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="-100" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Plot Curve */}
                <path
                  d={(() => {
                    const points: string[] = [];
                    for (let px = -95; px <= 95; px += 2) {
                      const x = px / 15;
                      let y = 0;
                      if (graphFunc === 'sin(x)') y = Math.sin(x);
                      else if (graphFunc === 'cos(x)') y = Math.cos(x);
                      else if (graphFunc === 'tan(x)') y = Math.tan(x);
                      else if (graphFunc === 'x^2') y = x * x * 0.3;
                      else if (graphFunc === 'x^3') y = x * x * x * 0.1;
                      else if (graphFunc === 'sqrt(x)') y = x >= 0 ? Math.sqrt(x) * 3 : 0;
                      else if (graphFunc === 'ln(x)') y = x > 0 ? Math.log(x) * 3 : 0;

                      const py = -y * 20;
                      if (isFinite(py) && Math.abs(py) <= 50) {
                        points.push(`${px},${py}`);
                      }
                    }
                    return 'M ' + points.join(' L ');
                  })()}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-teal-950/80 border border-teal-500/40 text-teal-300 font-mono text-[10px] font-bold">
                f(x) = {graphFunc}
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 font-mono">
              2D Cartesian Real-time Function Analysis Engine
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 9: FINANCE & LOAN EMI CALCULATOR */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'finance' && (
          <div className="flex flex-col gap-3 min-h-[380px] animate-fadeIn font-mono text-xs">
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/90 border border-white/10">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Loan Principal Amount</label>
                <input
                  type="number"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(e.target.value)}
                  className="w-full bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 text-white font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Interest Rate (%/yr)</label>
                  <input
                    type="number"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    className="w-full bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 text-white font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    value={loanMonths}
                    onChange={(e) => setLoanMonths(e.target.value)}
                    className="w-full bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 text-white font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Monthly EMI</span>
                <span className="text-base font-extrabold text-rose-300">
                  ৳ {loanEmi.emi.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Interest</span>
                <span className="font-bold text-white">৳ {loanEmi.interest.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span className="text-slate-300 font-bold">Total Payment</span>
                <span className="font-extrabold text-emerald-400">৳ {loanEmi.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorDisguise;
