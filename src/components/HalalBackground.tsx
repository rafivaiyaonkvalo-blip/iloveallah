import React, { useState, useEffect } from 'react';
import { HALAL_SCENES, HalalScene, shuffleScenes } from '../utils/backgroundImages';

interface HalalBackgroundProps {
  isDark: boolean;
}

export const HalalBackground: React.FC<HalalBackgroundProps> = ({ isDark }) => {
  // Shuffled infinite pool
  const [scenes, setScenes] = useState<HalalScene[]>(() => shuffleScenes(HALAL_SCENES));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dual-layer state for butter-smooth crossfade
  const [activeUrl, setActiveUrl] = useState<string>(scenes[0]?.url || '');
  const [nextUrl, setNextUrl] = useState<string>('');
  const [isFading, setIsFading] = useState(false);

  // Preload upcoming image to guarantee instant, zero-flicker transitions
  const preloadImage = (url: string) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  };

  // Next unique scene handler (infinite loop: reshuffles when exhausted)
  const goToNext = () => {
    let nextIdx = currentIndex + 1;
    let pool = scenes;
    if (nextIdx >= scenes.length) {
      pool = shuffleScenes(HALAL_SCENES);
      setScenes(pool);
      nextIdx = 0;
    }
    const targetScene = pool[nextIdx];
    triggerTransition(targetScene.url, nextIdx);
  };

  // Smooth crossfade transition trigger
  const triggerTransition = (targetUrl: string, newIdx: number) => {
    if (targetUrl === activeUrl) return;
    setNextUrl(targetUrl);
    setIsFading(true);

    const timer = setTimeout(() => {
      setActiveUrl(targetUrl);
      setCurrentIndex(newIdx);
      setIsFading(false);
    }, 1500); // 1.5s smooth crossfade

    return () => clearTimeout(timer);
  };

  // Preload upcoming images in the background ahead of time
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % scenes.length;
    const nextNextIdx = (currentIndex + 2) % scenes.length;
    preloadImage(scenes[nextIdx]?.url);
    preloadImage(scenes[nextNextIdx]?.url);
  }, [currentIndex, scenes]);

  // Infinite auto-rotator timer (changes every 7 seconds as requested)
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 7000); // "একটু পর পর চেঞ্জ হয়" -> every 7 seconds

    return () => clearInterval(interval);
  }, [currentIndex, scenes, activeUrl]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Layer 1: Active Image (Full Quality, Crisp & Clear) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out transform scale-100"
        style={{
          backgroundImage: `url("${activeUrl}")`,
          willChange: 'transform'
        }}
      />

      {/* Layer 2: Next Image Cross-Fading In */}
      {nextUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out ${
            isFading ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url("${nextUrl}")`,
            willChange: 'opacity'
          }}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* ----------------------------------------------------------------- */}
      {/* CRYSTAL-CLEAR AMBIENT OVERLAY (HIGH CONTRAST & LEGIBILITY) */}
      {/* ----------------------------------------------------------------- */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark
            ? 'bg-slate-950/50' // Strong contrast so text stands out cleanly
            : 'bg-slate-950/30' // Daylight legibility
        }`}
      />

      {/* Soft gradient edge vignette for subtle elegance without obscuring the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />
    </div>
  );
};
