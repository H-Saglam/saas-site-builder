"use client";

import { useEffect, useRef } from "react";

const COLORS_DARK = [
  "rgba(244, 63, 94, 0.35)",   // rose-500
  "rgba(244, 63, 94, 0.15)",   // rose-500 low
  "rgba(161, 161, 170, 0.25)", // zinc-400
];

class Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  color: string;
  opacity: number;
  fadeSpeed: number;

  constructor(width: number, height: number, colors: string[]) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 4 + 2;
    this.speedY = Math.random() * 0.5 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.opacity = Math.random() * 0.4 + 0.2;
    this.fadeSpeed = Math.random() * 0.01 + 0.005;
  }

  update(width: number, height: number) {
    this.y -= this.speedY;
    this.x += this.speedX;

    this.opacity += this.fadeSpeed;
    if (this.opacity >= 0.7 || this.opacity <= 0.1) {
      this.fadeSpeed *= -1;
    }

    if (this.y < -10) {
      this.y = height + 10;
      this.x = Math.random() * width;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function init() {
      resize();
      particles = [];
      const count = window.innerWidth < 768 ? 40 : 100;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas!.width, canvas!.height, COLORS_DARK));
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.update(canvas!.width, canvas!.height);
        p.draw(ctx!);
      }
      animationId = requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
