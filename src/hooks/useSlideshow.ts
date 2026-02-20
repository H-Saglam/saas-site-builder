"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSlideshowOptions {
  totalSlides: number;
  onSlideChange?: (slideIndex: number) => void;
}

export function useSlideshow({ totalSlides, onSlideChange }: UseSlideshowOptions) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFirstTap, setIsFirstTap] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const showSlide = useCallback(
    (n: number) => {
      if (n < 1 || n > totalSlides) return;
      setCurrentSlide(n);
      onSlideChange?.(n);
    },
    [totalSlides, onSlideChange]
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = Math.min(prev + 1, totalSlides);
      onSlideChange?.(next);
      return next;
    });
  }, [totalSlides, onSlideChange]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = Math.max(prev - 1, 1);
      onSlideChange?.(next);
      return next;
    });
  }, [onSlideChange]);

  const handleFirstTap = useCallback(() => {
    setIsFirstTap(false);
  }, []);

  // Click handler — ekranın sol %20'si geri, sağ %80'i ileri
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" || target.closest("button")) return;

      if (isFirstTap && currentSlide === 1) {
        handleFirstTap();
        return; // İlk tıklama sadece müziği başlatır
      }

      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width ?? window.innerWidth;
      const x = e.clientX - (rect?.left ?? 0);

      if (x < width * 0.2) {
        prevSlide();
      } else {
        nextSlide();
      }
    },
    [isFirstTap, currentSlide, handleFirstTap, prevSlide, nextSlide]
  );

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (isFirstTap && currentSlide === 1) {
          handleFirstTap();
          return;
        }
        nextSlide();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFirstTap, currentSlide, handleFirstTap, nextSlide, prevSlide]);

  // Touch/Swipe handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX.current;

      if (isFirstTap && currentSlide === 1) {
        handleFirstTap();
        return;
      }

      if (diff < -50) nextSlide();
      if (diff > 50) prevSlide();
    },
    [isFirstTap, currentSlide, handleFirstTap, nextSlide, prevSlide]
  );

  // Replay fonksiyonu
  const replay = useCallback(() => {
    setCurrentSlide(1);
    setIsFirstTap(true);
    onSlideChange?.(1);
  }, [onSlideChange]);

  return {
    currentSlide,
    isFirstTap,
    showSlide,
    nextSlide,
    prevSlide,
    handleClick,
    handleTouchStart,
    handleTouchEnd,
    replay,
    containerRef,
  };
}
