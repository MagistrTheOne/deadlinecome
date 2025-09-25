"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({ count = 20, className }: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/20 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `float ${3 + particle.speed * 2}s ease-in-out infinite`,
            animationDelay: `${particle.speed}s`,
          }}
        />
      ))}
    </div>
  );
}

interface GlowEffectProps {
  children: React.ReactNode;
  intensity?: "low" | "medium" | "high";
  color?: "blue" | "purple" | "green" | "pink";
  className?: string;
}

export function GlowEffect({ 
  children, 
  intensity = "medium", 
  color = "blue", 
  className 
}: GlowEffectProps) {
  const intensityClasses = {
    low: "shadow-lg",
    medium: "shadow-xl",
    high: "shadow-2xl"
  };

  const colorClasses = {
    blue: "shadow-blue-500/20",
    purple: "shadow-purple-500/20",
    green: "shadow-green-500/20",
    pink: "shadow-pink-500/20"
  };

  return (
    <div 
      className={cn(
        "relative",
        intensityClasses[intensity],
        colorClasses[color],
        className
      )}
    >
      {children}
    </div>
  );
}

interface PulseAnimationProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export function PulseAnimation({ 
  children, 
  duration = 2, 
  className 
}: PulseAnimationProps) {
  return (
    <div 
      className={cn("animate-pulse", className)}
      style={{ animationDuration: `${duration}s` }}
    >
      {children}
    </div>
  );
}

interface SlideInAnimationProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}

export function SlideInAnimation({ 
  children, 
  direction = "up", 
  delay = 0,
  className 
}: SlideInAnimationProps) {
  const directionClasses = {
    up: "animate-slide-in-up",
    down: "animate-slide-in-down",
    left: "animate-slide-in-left",
    right: "animate-slide-in-right"
  };

  return (
    <div 
      className={cn(directionClasses[direction], className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TypewriterEffect({ 
  text, 
  speed = 100, 
  className 
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

interface MorphingBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function MorphingBackground({ children, className }: MorphingBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Анимированные градиенты */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x" />
      <div className="absolute inset-0 bg-gradient-to-tl from-green-500/10 via-yellow-500/10 to-red-500/10 animate-gradient-y" />
      
      {/* Содержимое */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface HoverGlowProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverGlow({ children, className }: HoverGlowProps) {
  return (
    <div 
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:scale-105",
        className
      )}
    >
      {children}
    </div>
  );
}

// CSS анимации (добавить в globals.css)
export const animationStyles = `
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes gradient-x {
  0%, 100% { transform: translateX(0%); }
  50% { transform: translateX(100%); }
}

@keyframes gradient-y {
  0%, 100% { transform: translateY(0%); }
  50% { transform: translateY(100%); }
}

@keyframes slide-in-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-down {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-left {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-slide-in-up {
  animation: slide-in-up 0.6s ease-out;
}

.animate-slide-in-down {
  animation: slide-in-down 0.6s ease-out;
}

.animate-slide-in-left {
  animation: slide-in-left 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slide-in-right 0.6s ease-out;
}

.animate-gradient-x {
  animation: gradient-x 8s ease infinite;
}

.animate-gradient-y {
  animation: gradient-y 8s ease infinite;
}
`;
