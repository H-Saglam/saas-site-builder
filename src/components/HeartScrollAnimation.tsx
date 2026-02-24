"use client";

import { useState, useEffect } from "react";

const LINES_DARK = [
  { color: "rgba(147, 51, 234, 0.20)", height: "2vmax", delay: "0s",   speed: "9s"  },
  { color: "rgba(162, 56, 232, 0.24)", height: "5vmax", delay: "0.5s", speed: "10s" },
  { color: "rgba(186, 66, 214, 0.30)", height: "9vmax", delay: "1.0s", speed: "8s"  },
  { color: "rgba(192, 70, 229, 0.20)", height: "3vmax", delay: "1.5s", speed: "11s" },
  { color: "rgba(167, 62, 222, 0.18)", height: "6vmax", delay: "2.0s", speed: "9s"  },
  { color: "rgba(183, 72, 220, 0.15)", height: "4vmax", delay: "2.5s", speed: "10s" },
  { color: "rgba(176, 78, 226, 0.24)", height: "7vmax", delay: "3.0s", speed: "8s"  },
  { color: "rgba(172, 92, 232, 0.12)", height: "2vmax", delay: "3.5s", speed: "11s" },
];

const LINES_LIGHT = [
  { color: "rgba(59, 130, 246, 0.20)", height: "2vmax", delay: "0s",   speed: "9s"  },
  { color: "rgba(99, 102, 241, 0.24)", height: "5vmax", delay: "0.5s", speed: "10s" },
  { color: "rgba(129, 140, 248, 0.26)", height: "9vmax", delay: "1.0s", speed: "8s"  },
  { color: "rgba(139, 92, 246, 0.18)", height: "3vmax", delay: "1.5s", speed: "11s" },
  { color: "rgba(59, 130, 246, 0.16)", height: "6vmax", delay: "2.0s", speed: "9s"  },
  { color: "rgba(96, 165, 250, 0.14)", height: "4vmax", delay: "2.5s", speed: "10s" },
  { color: "rgba(139, 92, 246, 0.22)", height: "7vmax", delay: "3.0s", speed: "8s"  },
  { color: "rgba(99, 102, 241, 0.12)", height: "2vmax", delay: "3.5s", speed: "11s" },
];

const STRIPE_HEIGHT = "32%";
const STRIPE_TOP = "34%";

export default function DiagonalLinesBackground() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => {
      setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const lines = isDark ? LINES_DARK : LINES_LIGHT;
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center"
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
              className="absolute left-0 right-0 rounded-full"
              style={{
                top: STRIPE_TOP,
                height: STRIPE_HEIGHT,
                backgroundColor: line.color,
                boxShadow: `0 0 12px ${line.color}, 0 0 28px ${line.color}`,
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
