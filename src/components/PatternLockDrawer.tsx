import React, { useState, useRef } from 'react';
import { RotateCcw, ShieldCheck, Hash, Touchpad } from 'lucide-react';

interface PatternLockDrawerProps {
  patternSequence: number[];
  onChangePattern: (sequence: number[]) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PatternLockDrawer: React.FC<PatternLockDrawerProps> = ({
  patternSequence,
  onChangePattern,
  readOnly = false,
  size = 'md',
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3x3 Grid dots coordinates (percentage based: x, y in %)
  const DOTS = [
    { id: 1, x: 20, y: 20, label: '1' },
    { id: 2, x: 50, y: 20, label: '2' },
    { id: 3, x: 80, y: 20, label: '3' },
    { id: 4, x: 20, y: 50, label: '4' },
    { id: 5, x: 50, y: 50, label: '5' },
    { id: 6, x: 80, y: 50, label: '6' },
    { id: 7, x: 20, y: 80, label: '7' },
    { id: 8, x: 50, y: 80, label: '8' },
    { id: 9, x: 80, y: 80, label: '9' },
  ];

  const handleDotClick = (dotId: number) => {
    if (readOnly) return;
    if (patternSequence.includes(dotId)) {
      // If clicked on last dot, remove it; if clicked in middle, do nothing or keep
      if (patternSequence[patternSequence.length - 1] === dotId) {
        onChangePattern(patternSequence.slice(0, -1));
      }
    } else {
      onChangePattern([...patternSequence, dotId]);
    }
  };

  const handleTouchStart = (dotId: number) => {
    if (readOnly) return;
    setIsDrawing(true);
    if (!patternSequence.includes(dotId)) {
      onChangePattern([dotId]);
    }
  };

  const addDotByCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current || readOnly) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;

    // Find nearest dot within threshold distance (~15%)
    const foundDot = DOTS.find((dot) => {
      const dx = dot.x - xPct;
      const dy = dot.y - yPct;
      return Math.sqrt(dx * dx + dy * dy) < 16;
    });

    if (foundDot && !patternSequence.includes(foundDot.id)) {
      onChangePattern([...patternSequence, foundDot.id]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing || readOnly) return;
    const touch = e.touches[0];
    if (touch) {
      addDotByCoordinates(touch.clientX, touch.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || readOnly) return;
    addDotByCoordinates(e.clientX, e.clientY);
  };

  const handleEndDrawing = () => {
    setIsDrawing(false);
  };

  const clearPattern = () => {
    if (!readOnly) {
      onChangePattern([]);
    }
  };

  // Dimensions based on size prop
  const containerSizeClass =
    size === 'sm'
      ? 'w-36 h-36'
      : size === 'lg'
      ? 'w-72 h-72'
      : 'w-56 h-56';

  const dotDiameterClass =
    size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';

  return (
    <div className="flex flex-col items-center select-none">
      <div
        ref={containerRef}
        className={`relative ${containerSizeClass} bg-slate-900 rounded-2xl p-3 shadow-inner border border-slate-700 touch-none flex items-center justify-center`}
        onMouseDown={(e) => {
          if (!readOnly) setIsDrawing(true);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEndDrawing}
        onMouseLeave={handleEndDrawing}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEndDrawing}
      >
        {/* SVG Canvas for Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {patternSequence.map((dotId, index) => {
            if (index === 0) return null;
            const prevDot = DOTS.find((d) => d.id === patternSequence[index - 1]);
            const currentDot = DOTS.find((d) => d.id === dotId);
            if (!prevDot || !currentDot) return null;

            return (
              <line
                key={`line-${index}`}
                x1={`${prevDot.x}%`}
                y1={`${prevDot.y}%`}
                x2={`${currentDot.x}%`}
                y2={`${currentDot.y}%`}
                stroke="#3b82f6"
                strokeWidth={size === 'sm' ? '3' : '4'}
                strokeLinecap="round"
                strokeDasharray="none"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* 9 Grid Dots */}
        {DOTS.map((dot) => {
          const selectedIndex = patternSequence.indexOf(dot.id);
          const isSelected = selectedIndex !== -1;
          const isFirst = selectedIndex === 0;
          const isLast = selectedIndex === patternSequence.length - 1 && patternSequence.length > 1;

          return (
            <button
              key={dot.id}
              type="button"
              disabled={readOnly}
              onClick={() => handleDotClick(dot.id)}
              onTouchStart={() => handleTouchStart(dot.id)}
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute z-20 rounded-full flex items-center justify-center font-bold transition-all duration-150 ${dotDiameterClass} ${
                isSelected
                  ? isFirst
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-110 shadow-lg'
                    : isLast
                    ? 'bg-amber-500 text-white ring-4 ring-amber-500/30 scale-110 shadow-lg'
                    : 'bg-blue-500 text-white ring-4 ring-blue-500/30 scale-105 shadow-md'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
            >
              {isSelected ? selectedIndex + 1 : dot.label}
            </button>
          );
        })}
      </div>

      {/* Pattern Sequence Description */}
      <div className="mt-2.5 text-center w-full">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
          <Touchpad className="w-3.5 h-3.5 text-blue-600" />
          <span>ลำดับการวาด (1-9):</span>
        </div>
        <div className="mt-1 font-mono text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg inline-block min-w-[140px]">
          {patternSequence.length > 0
            ? patternSequence.join(' ➔ ')
            : 'ยังไม่ได้วาดรหัส'}
        </div>

        {!readOnly && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={clearPattern}
              disabled={patternSequence.length === 0}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md border border-slate-200 flex items-center gap-1 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างรหัสวาด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
