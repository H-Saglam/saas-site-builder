"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseAudioPlayerOptions {
  musicUrl: string | null;
  currentSlide: number;
  isFirstTap: boolean;
  volume?: number;
}

export function useAudioPlayer({
  musicUrl,
  currentSlide,
  isFirstTap,
  volume = 0.25,
}: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);

  // Audio element oluştur
  useEffect(() => {
    if (!musicUrl) return;

    const audio = new Audio(musicUrl);
    audio.volume = volume;
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      hasStartedRef.current = false;
    };
  }, [musicUrl, volume]);

  // İlk tıklamada müziği başlat
  useEffect(() => {
    if (!isFirstTap && !hasStartedRef.current && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          hasStartedRef.current = true;
        })
        .catch((err) => {
          console.log("Autoplay prevented:", err);
        });
    }
  }, [isFirstTap]);

  // Son slide'da müziği durdur (replay için)
  useEffect(() => {
    if (currentSlide === 1 && isFirstTap && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      hasStartedRef.current = false;
    }
  }, [currentSlide, isFirstTap]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  return { audioRef, pause, play };
}
