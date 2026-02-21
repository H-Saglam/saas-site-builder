"use client";

import { useEffect, useState } from "react";

const lines = [
  { color: "rgba(255, 228, 230, 0.25)", height: "2vmax", delay: "0s",   speed: "9s"  },
  { color: "rgba(253, 164, 175, 0.30)", height: "5vmax", delay: "0.5s", speed: "10s" },
  { color: "rgba(251, 113, 133, 0.40)", height: "9vmax", delay: "1.0s", speed: "8s"  },
  { color: "rgba(225, 29, 72, 0.25)",   height: "3vmax", delay: "1.5s", speed: "11s" },
  { color: "rgba(190, 18, 60, 0.20)",   height: "6vmax", delay: "2.0s", speed: "9s"  },
  { color: "rgba(253, 164, 175, 0.18)", height: "4vmax", delay: "2.5s", speed: "10s" },
  { color: "rgba(251, 113, 133, 0.30)", height: "7vmax", delay: "3.0s", speed: "8s"  },
  { color: "rgba(255, 228, 230, 0.15)", height: "2vmax", delay: "3.5s", speed: "11s" },
];

export default function DiagonalLinesBackground() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const vh = window.innerHeight;
          const progress = 1 - Math.min(Math.max((window.scrollY - vh * 0.4) / (vh * 0.4), 0), 1);
          setOpacity(progress);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-300"
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="absolute w-[200vmax] h-[200vmax] -rotate-45 flex flex-col justify-center gap-[1.5vmax]">
        {lines.map((line, i) => (
          <div
            key={i}
            className="relative w-full"
            style={{ height: line.height }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: line.color,
                animation: `slide-wipe ${line.speed} ease-in-out ${line.delay} infinite`,
                transform: "scaleX(0)",
                opacity: 0,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
