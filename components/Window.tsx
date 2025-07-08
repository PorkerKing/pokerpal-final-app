"use client";

import React, { useState } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  isActive?: boolean;
  onFocus?: () => void;
}

export default function Window({ 
  id, 
  title, 
  children, 
  onClose, 
  initialPosition = { x: 100, y: 100 },
  isActive = false,
  onFocus 
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onFocus) onFocus();
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 添加全局鼠标事件监听
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (isMinimized) {
    return (
      <div 
        className={`fixed bottom-4 bg-gray-800 rounded-lg p-2 shadow-lg cursor-pointer transition-all z-40
          ${isActive ? 'border-2 border-purple-500' : 'border border-gray-600'}
        `}
        style={{ left: position.x }}
        onClick={handleMinimize}
      >
        <span className="text-white text-sm">{title}</span>
      </div>
    );
  }

  return (
    <div
      className={`fixed bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl transition-all duration-200 z-30
        ${isActive ? 'border-2 border-purple-500' : 'border border-gray-700'}
        ${isMaximized ? 'inset-4 md:inset-8' : 'min-w-80 min-h-96'}
      `}
      style={isMaximized ? {} : { 
        left: Math.max(10, position.x), 
        top: Math.max(10, position.y),
        width: 'min(90vw, 700px)',
        height: 'min(80vh, 600px)',
        maxWidth: '100vw',
        maxHeight: '100vh'
      }}
      onClick={onFocus}
    >
      {/* 窗口标题栏 */}
      <div 
        className="flex items-center justify-between p-3 border-b border-gray-700 cursor-move bg-gray-800/50 rounded-t-lg"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-white font-semibold truncate flex-1 mr-2">{title}</h3>
        
        {/* 窗口控制按钮 */}
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMinimize();
            }}
            className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition-all"
            title="最小化"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMaximize();
            }}
            className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-all"
            title={isMaximized ? "还原" : "最大化"}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 窗口内容 */}
      <div className="overflow-auto" style={{ height: 'calc(100% - 56px)' }}>
        {children}
      </div>
    </div>
  );
}