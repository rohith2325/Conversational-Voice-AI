import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  inputVolume: number;
  outputVolume: number;
  isActive: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ inputVolume, outputVolume, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Base circle radius
      const baseRadius = 80;
      
      // Determine which volume drives the animation more (model vs user)
      const volume = Math.max(inputVolume, outputVolume);
      
      // Dynamic expansion based on volume
      const expansion = isActive ? (volume / 100) * 80 : 0;
      const radius = baseRadius + expansion;

      // Color transition: Blue (idle/user) -> Purple/Pink (model speaking)
      // If outputVolume is significantly higher, shift to purple
      const isModelSpeaking = outputVolume > 5 && outputVolume > inputVolume;
      
      let r, g, b;
      if (isActive) {
        if (isModelSpeaking) {
           // Purple/Pink for AI
           r = 236; g = 72; b = 153; 
        } else {
           // Blue for User
           r = 59; g = 130; b = 246; 
        }
      } else {
        // Gray for inactive
        r = 75; g = 85; b = 99;
      }

      // Draw Main Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, isActive ? baseRadius + (expansion * 0.5) : baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fill();

      // Draw Ripples if active
      if (isActive && volume > 2) {
        const rippleCount = 3;
        for (let i = 0; i < rippleCount; i++) {
          ctx.beginPath();
          const rippleRadius = radius + (Math.sin(time * 0.1 + i) * 10) + (i * 20);
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 - (i * 0.1)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      time += 1;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [inputVolume, outputVolume, isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={400} 
      className="w-full h-full max-w-[600px] max-h-[400px]"
    />
  );
};

export default Visualizer;