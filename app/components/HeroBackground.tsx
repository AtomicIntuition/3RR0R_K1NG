'use client';

import { useEffect, useRef, memo } from 'react';

export const HeroBackground = memo(function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let lastTime = 0;
    const fps = 24; // Lower fps for better performance
    const fpsInterval = 1000 / fps;
    let width = 0;
    let height = 0;

    // Pre-computed orb configuration
    const orbs = [
      { x: 0.3, y: 0.3, radius: 0.4, r: 0, g: 255, b: 136, a: 0.10, speed: 0.0003 },
      { x: 0.7, y: 0.6, radius: 0.35, r: 0, g: 255, b: 255, a: 0.06, speed: 0.0004 },
      { x: 0.5, y: 0.8, radius: 0.3, r: 138, g: 43, b: 226, a: 0.06, speed: 0.0002 },
    ];

    const resize = () => {
      // Use lower resolution for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    };

    resize();

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      // Throttle to target fps
      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      time += 1;

      // Clear with background color
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Draw gradient orbs
      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];
        const x = width * (orb.x + Math.sin(time * orb.speed + i) * 0.08);
        const y = height * (orb.y + Math.cos(time * orb.speed * 0.7 + i) * 0.08);
        const radius = Math.min(width, height) * orb.radius;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${orb.r}, ${orb.g}, ${orb.b}, ${orb.a})`);
        gradient.addColorStop(1, 'rgba(10, 10, 15, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Simplified grid with batched drawing
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 100;

      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
});
