'use client';

import { useEffect, useRef } from 'react';

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let lastTime = 0;
    const fps = 30; // Cap at 30fps for performance
    const fpsInterval = 1000 / fps;

    const resize = () => {
      // Use device pixel ratio but cap it for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Gradient orbs configuration - simplified
    const orbs = [
      { x: 0.3, y: 0.3, radius: 0.4, color: 'rgba(0, 255, 136, 0.12)', speed: 0.0003 },
      { x: 0.7, y: 0.6, radius: 0.35, color: 'rgba(0, 255, 255, 0.08)', speed: 0.0004 },
      { x: 0.5, y: 0.8, radius: 0.3, color: 'rgba(138, 43, 226, 0.08)', speed: 0.0002 },
    ];

    const width = window.innerWidth;
    const height = window.innerHeight;

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      // Throttle to target fps
      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      time += 1;

      // Clear with background color
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Draw gradient orbs (simplified - no per-pixel noise)
      orbs.forEach((orb, i) => {
        const x = width * (orb.x + Math.sin(time * orb.speed + i) * 0.1);
        const y = height * (orb.y + Math.cos(time * orb.speed * 0.8 + i) * 0.1);
        const radius = Math.min(width, height) * orb.radius;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(10, 10, 10, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      // Simplified grid - draw fewer lines
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 80;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
