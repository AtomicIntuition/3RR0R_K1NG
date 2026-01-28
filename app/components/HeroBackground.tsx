'use client';

import { useEffect, useRef } from 'react';

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Gradient orbs configuration
    const orbs = [
      { x: 0.3, y: 0.3, radius: 0.4, color: [0, 255, 136], speed: 0.0003 }, // Terminal green
      { x: 0.7, y: 0.6, radius: 0.35, color: [0, 255, 255], speed: 0.0004 }, // Cyan
      { x: 0.5, y: 0.8, radius: 0.3, color: [138, 43, 226], speed: 0.0002 }, // Purple
    ];

    const animate = () => {
      time += 1;
      ctx.fillStyle = 'rgb(10, 10, 10)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient orbs
      orbs.forEach((orb, i) => {
        const x = canvas.width * (orb.x + Math.sin(time * orb.speed + i) * 0.1);
        const y = canvas.height * (orb.y + Math.cos(time * orb.speed * 0.8 + i) * 0.1);
        const radius = Math.min(canvas.width, canvas.height) * orb.radius;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${orb.color.join(',')}, 0.15)`);
        gradient.addColorStop(0.5, `rgba(${orb.color.join(',')}, 0.05)`);
        gradient.addColorStop(1, 'rgba(10, 10, 10, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Add subtle noise/grain overlay
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 8;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);

      // Add grid lines
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 60;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

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
