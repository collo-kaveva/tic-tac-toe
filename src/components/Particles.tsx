import type { CSSProperties } from "react";
import { Particle } from "../game/types";

interface ParticlesProps {
  particles: Particle[];
}

export function Particles({ particles }: ParticlesProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={
            {
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              ["--dx" as string]: `${p.dx}px`,
              ["--dy" as string]: `${p.dy}px`,
              ["--rot" as string]: `${p.rot}deg`,
              ["--life" as string]: `${p.life}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function spawnBurst(
  x: number,
  y: number,
  colors: string[],
  count = 18
): Particle[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 40 + Math.random() * 120;
    return {
      id: now + i + Math.random(),
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 20,
      rot: (Math.random() - 0.5) * 720,
      size: 4 + Math.random() * 7,
      color: colors[i % colors.length],
      life: 500 + Math.random() * 500,
    };
  });
}

export function spawnConfetti(width: number, height: number, count = 40): Particle[] {
  const colors = ["#22f0ff", "#ff2bd6", "#b8ff3c", "#ffc14a", "#ffffff"];
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const x = Math.random() * width;
    const y = height * 0.25 + Math.random() * height * 0.2;
    return {
      id: now + i + Math.random() * 1000,
      x,
      y,
      dx: (Math.random() - 0.5) * 160,
      dy: 80 + Math.random() * 220,
      rot: (Math.random() - 0.5) * 900,
      size: 5 + Math.random() * 8,
      color: colors[i % colors.length],
      life: 700 + Math.random() * 700,
    };
  });
}
