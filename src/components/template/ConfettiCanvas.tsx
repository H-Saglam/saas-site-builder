"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiCanvasProps {
  trigger: boolean;
}

export default function ConfettiCanvas({ trigger }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;

    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    intervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      myConfetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      myConfetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      myConfetti.reset();
    };
  }, [trigger]);

  return <canvas ref={canvasRef} className="confetti-canvas" />;
}
