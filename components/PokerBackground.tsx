"use client";

import { Spade, Diamond, Heart, Club } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CardShape {
  id: number;
  type: 'spade' | 'diamond' | 'heart' | 'club';
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  duration: number;
}

export function PokerBackground() {
  const [shapes, setShapes] = useState<CardShape[]>([]);

  useEffect(() => {
    // 生成随机扑克牌花色
    const generateShapes = () => {
      const newShapes: CardShape[] = [];
      const types: CardShape['type'][] = ['spade', 'diamond', 'heart', 'club'];
      
      // 生成 12-16 个随机分布的花色
      const count = Math.floor(Math.random() * 5) + 12;
      
      for (let i = 0; i < count; i++) {
        newShapes.push({
          id: i,
          type: types[Math.floor(Math.random() * types.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 40 + 30, // 30-70px
          rotation: Math.random() * 360,
          opacity: Math.random() * 0.15 + 0.05, // 0.05-0.2
          duration: Math.random() * 20 + 10, // 10-30s
        });
      }
      
      setShapes(newShapes);
    };

    generateShapes();
    
    // 每隔一段时间重新生成，创造动态效果
    const interval = setInterval(generateShapes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: CardShape['type']) => {
    switch (type) {
      case 'spade':
        return Spade;
      case 'diamond':
        return Diamond;
      case 'heart':
        return Heart;
      case 'club':
        return Club;
    }
  };

  const getColor = (type: CardShape['type']) => {
    switch (type) {
      case 'spade':
      case 'club':
        return 'text-zinc-400';
      case 'diamond':
      case 'heart':
        return 'text-red-500';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 渐变背景层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D0F18] via-[#0D0F18] to-purple-950/20" />
      
      {/* 扑克牌花色层 */}
      {shapes.map((shape) => {
        const Icon = getIcon(shape.type);
        const color = getColor(shape.type);
        
        return (
          <div
            key={shape.id}
            className="absolute animate-float"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              transform: `rotate(${shape.rotation}deg)`,
              animation: `float ${shape.duration}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <Icon
              className={`${color} blur-sm`}
              style={{
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                opacity: shape.opacity,
                filter: 'blur(1px)',
                shapeRendering: 'geometricPrecision',
              }}
            />
          </div>
        );
      })}
      
      {/* 额外的装饰效果 */}
      <div className="absolute inset-0">
        {/* 左上角聚光灯效果 */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        
        {/* 右下角聚光灯效果 */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation));
          }
          50% {
            transform: translateY(-20px) rotate(calc(var(--rotation) + 10deg));
          }
        }
      `}</style>
    </div>
  );
}