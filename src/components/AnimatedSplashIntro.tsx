import React, { useEffect, useRef, useState, useMemo } from 'react';

export interface SplashGradient {
  id: string;
  name: string;
  colorCount: number;
  lightColors: string[];
  darkColors: string[];
}

/**
 * 'My Quran' / 'ULS Arabic' Verified 20 Multi-Stop Dynamic Gradient Color Palettes
 * Directly ported from AnimatedSplashScreen.kt in My Quran / ULS Arabic project.
 */
export const SPLASH_CALLIGRAPHY_GRADIENTS: SplashGradient[] = [
  // ==========================================
  // 🎨 2-COLOR GRADIENTS (দ্বৈত রঙের গ্র্যাডিয়েন্ট - 2 Colors)
  // ==========================================
  {
    id: 'gold_amber',
    name: 'Gold & Amber',
    colorCount: 2,
    lightColors: ['#B8860B', '#D4AF37'],
    darkColors: ['#FFD54F', '#FF8F00']
  },
  {
    id: 'emerald_mint',
    name: 'Emerald & Mint',
    colorCount: 2,
    lightColors: ['#0D5C3A', '#00897B'],
    darkColors: ['#00E676', '#1DE9B6']
  },
  {
    id: 'sapphire_cyan',
    name: 'Sapphire & Cyan',
    colorCount: 2,
    lightColors: ['#0D47A1', '#0288D1'],
    darkColors: ['#00B0FF', '#00E5FF']
  },
  {
    id: 'ruby_crimson',
    name: 'Ruby & Crimson',
    colorCount: 2,
    lightColors: ['#880E1C', '#C2185B'],
    darkColors: ['#FF1744', '#FF5252']
  },
  {
    id: 'amethyst_violet',
    name: 'Amethyst & Violet',
    colorCount: 2,
    lightColors: ['#4A148C', '#7B1FA2'],
    darkColors: ['#E040FB', '#7C4DFF']
  },
  {
    id: 'copper_rose',
    name: 'Copper & Rose',
    colorCount: 2,
    lightColors: ['#873E23', '#C05C38'],
    darkColors: ['#FF8A65', '#FFAB91']
  },
  {
    id: 'peacock_teal',
    name: 'Peacock Teal',
    colorCount: 2,
    lightColors: ['#004D40', '#00796B'],
    darkColors: ['#00BFA5', '#64FFDA']
  },

  // ==========================================
  // 🎨 3-COLOR GRADIENTS (ত্রিমুখী রঙের গ্র্যাডিয়েন্ট - 3 Colors)
  // ==========================================
  {
    id: 'imperial_gold',
    name: 'Imperial Gold',
    colorCount: 3,
    lightColors: ['#8D6E16', '#C5A059', '#D4AF37'],
    darkColors: ['#FFECB3', '#FFD54F', '#FF9100']
  },
  {
    id: 'medina_green',
    name: 'Medina Green',
    colorCount: 3,
    lightColors: ['#0A4D2E', '#137A4D', '#00897B'],
    darkColors: ['#B9F6CA', '#00E676', '#00BFA5']
  },
  {
    id: 'deep_ocean',
    name: 'Deep Ocean',
    colorCount: 3,
    lightColors: ['#0D3E78', '#1565C0', '#0097A7'],
    darkColors: ['#80D8FF', '#40C4FF', '#2979FF']
  },
  {
    id: 'sunset_amber',
    name: 'Sunset Amber',
    colorCount: 3,
    lightColors: ['#9E2A2B', '#D84315', '#E65100'],
    darkColors: ['#FFE0B2', '#FF6D00', '#FF1744']
  },
  {
    id: 'spiritual_lavender',
    name: 'Spiritual Lavender',
    colorCount: 3,
    lightColors: ['#4A148C', '#7B1FA2', '#8E24AA'],
    darkColors: ['#F3E5F5', '#E040FB', '#7C4DFF']
  },
  {
    id: 'persian_turquoise',
    name: 'Persian Turquoise',
    colorCount: 3,
    lightColors: ['#004D40', '#00695C', '#00838F'],
    darkColors: ['#A7FFEB', '#1DE9B6', '#00E5FF']
  },
  {
    id: 'moonlight_silver',
    name: 'Moonlight Silver',
    colorCount: 3,
    lightColors: ['#263238', '#37474F', '#455A64'],
    darkColors: ['#FFFFFF', '#ECEFF1', '#90A4AE']
  },

  // ==========================================
  // 🎨 4-COLOR GRADIENTS (চতুর্মুখী রঙের গ্র্যাডিয়েন্ট - 4 Colors)
  // ==========================================
  {
    id: 'grand_royal_gold',
    name: 'Grand Royal Gold',
    colorCount: 4,
    lightColors: ['#795548', '#8D6E16', '#B8860B', '#D4AF37'],
    darkColors: ['#FFF8E1', '#FFD54F', '#FFB300', '#FF6D00']
  },
  {
    id: 'cosmic_aurora',
    name: 'Cosmic Aurora',
    colorCount: 4,
    lightColors: ['#1A237E', '#0D47A1', '#00695C', '#4A148C'],
    darkColors: ['#80D8FF', '#00E676', '#1DE9B6', '#EA80FC']
  },
  {
    id: 'prismatic_flame',
    name: 'Prismatic Flame',
    colorCount: 4,
    lightColors: ['#880E4F', '#B71C1C', '#D84315', '#F57F17'],
    darkColors: ['#FF80AB', '#FF1744', '#FF9100', '#FFD54F']
  },
  {
    id: 'garden_oasis',
    name: 'Garden Oasis',
    colorCount: 4,
    lightColors: ['#004D40', '#1B5E20', '#2E7D32', '#00897B'],
    darkColors: ['#69F0AE', '#00E676', '#1DE9B6', '#00E5FF']
  },
  {
    id: 'crown_jewels',
    name: 'Crown Jewels',
    colorCount: 4,
    lightColors: ['#4A148C', '#880E1C', '#0D47A1', '#00695C'],
    darkColors: ['#E040FB', '#FF4081', '#40C4FF', '#69F0AE']
  },
  {
    id: 'rose_gold_luxury',
    name: 'Rose Gold Luxury',
    colorCount: 4,
    lightColors: ['#4E342E', '#8D6E16', '#A0522D', '#C2185B'],
    darkColors: ['#FFCCBC', '#FFAB91', '#FFD54F', '#FF80AB']
  }
];

const TOTAL_FRAMES = 86;
const FPS_INTERVAL = 30; // 30ms * 86 frames = 2.58s

export interface AnimatedSplashIntroProps {
  onFinish?: () => void;
  onClosing?: () => void;
  darkMode?: boolean;
}

/**
 * Animated Arabic Calligraphy Motion Graphics Splash Screen
 * Exact replication of ULS Arabic / My Quran intro animation
 */
export const AnimatedSplashIntro: React.FC<AnimatedSplashIntroProps> = ({
  onFinish,
  onClosing,
  darkMode = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const finishTriggeredRef = useRef<boolean>(false);
  const frameImagesRef = useRef<HTMLImageElement[]>([]);

  // Random gradient chosen per launch session from the 20 verified options
  const selectedGradient = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * SPLASH_CALLIGRAPHY_GRADIENTS.length);
    return SPLASH_CALLIGRAPHY_GRADIENTS[randomIndex];
  }, []);

  // Gradient colors based on current mode
  const gradientColors = darkMode ? selectedGradient.darkColors : selectedGradient.lightColors;

  // Background color: Deep Obsidian (#0A0D12) in Dark Mode, Pure White (#FFFFFF) in Light Mode
  const bgColor = darkMode ? '#0A0D12' : '#FFFFFF';

  // Finish splash handler (with 250ms smooth fade out transition)
  const finishSplash = () => {
    if (finishTriggeredRef.current) return;
    finishTriggeredRef.current = true;
    setIsClosing(true);
    if (typeof onClosing === 'function') {
      onClosing();
    }
    setTimeout(() => {
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, 250);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-resolution 1080x540 canvas buffer for razor-sharp rendering on Retina and AMOLED displays
    canvas.width = 1080;
    canvas.height = 540;

    let currentFrame = 1;
    let isMounted = true;
    let animTimer: number | null = null;

    // Render a given image frame with BlendMode.SrcIn linear gradient shader
    const renderFrame = (img: HTMLImageElement) => {
      if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Clear background
      ctx.clearRect(0, 0, w, h);

      // 2. Draw base transparent calligraphy frame
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0, w, h);

      // 3. Apply Multi-stop Linear Gradient (BlendMode.SrcIn)
      ctx.globalCompositeOperation = 'source-in';
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      const totalStops = gradientColors.length;
      gradientColors.forEach((color, idx) => {
        const stop = totalStops > 1 ? idx / (totalStops - 1) : 0;
        gradient.addColorStop(stop, color);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // 4. Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
    };

    // Preload frames progressively
    const images: HTMLImageElement[] = [];
    frameImagesRef.current = images;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/intro_frames/frame_${frameNum}.png`;
      images.push(img);

      // Render frame 1 immediately at 0ms once loaded
      if (i === 1) {
        img.onload = () => {
          if (isMounted && currentFrame === 1) {
            renderFrame(img);
          }
        };
      }
    }

    // Exactly 3.0s total active duration: 2,580ms drawing + 420ms completion hold
    let lastTime = performance.now();

    const playLoop = (now: number) => {
      if (!isMounted || finishTriggeredRef.current) return;

      const elapsed = now - lastTime;
      if (elapsed >= FPS_INTERVAL) {
        lastTime = now - (elapsed % FPS_INTERVAL);

        const img = images[currentFrame - 1];
        if (img && img.complete) {
          renderFrame(img);
        }

        if (currentFrame < TOTAL_FRAMES) {
          currentFrame++;
          animTimer = requestAnimationFrame(playLoop);
        } else {
          // Frame 86 reached: hold completed calligraphy to hit exactly 3.0s total
          setTimeout(() => {
            if (isMounted && !finishTriggeredRef.current) {
              finishSplash();
            }
          }, 420);
        }
      } else {
        animTimer = requestAnimationFrame(playLoop);
      }
    };

    animTimer = requestAnimationFrame(playLoop);

    return () => {
      isMounted = false;
      if (animTimer !== null) cancelAnimationFrame(animTimer);
    };
  }, [gradientColors]);

  return (
    <div
      onClick={finishSplash}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '-webkit-fill-available',
        zIndex: 9999999,
        backgroundColor: bgColor,
        opacity: isClosing ? 0 : 1,
        transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      className="flex items-center justify-center cursor-pointer select-none overflow-hidden touch-none m-0 p-4"
    >
      <div className="relative flex items-center justify-center w-full max-w-sm mx-auto">
        {/* Soft Ambient Radial Glow matching the active calligraphy palette */}
        <div 
          className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full blur-2xl opacity-20 dark:opacity-30 pointer-events-none transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${gradientColors[0]} 0%, transparent 70%)` }}
        />

        {/* Delicate Calligraphy Motion Graphics Canvas (Refined Compact Sizing) */}
        <div className="relative w-full max-w-[220px] sm:max-w-[260px] aspect-[2/1] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_2px_16px_rgba(255,215,0,0.20)]"
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedSplashIntro;
