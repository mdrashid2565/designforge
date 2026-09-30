import React from 'react';
import {
  CanvasElement,
  ChartElement,
  QRCodeElement,
  ShapeElement,
  TableElement,
  TextElement,
} from '@designforge/core';

interface ElementRendererProps {
  element: CanvasElement;
  isSelected?: boolean;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isSelected }) => {
  if (!element.visible) return null;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex ?? 0,
    pointerEvents: element.locked ? 'none' : 'auto',
  };

  switch (element.type) {
    case 'text': {
      const textEl = element as TextElement;
      let textShadow: string | undefined;
      let extraClasses = '';

      if (textEl.textEffect === 'shadow' && textEl.shadow) {
        textShadow = `${textEl.shadow.offsetX}px ${textEl.shadow.offsetY}px ${textEl.shadow.blur}px ${textEl.shadow.color}`;
      } else if (textEl.textEffect === 'neon') {
        textShadow = `0 0 10px ${textEl.effectColor || '#F59E0B'}, 0 0 20px ${textEl.effectColor || '#F59E0B'}`;
      } else if (textEl.textEffect === 'glitch') {
        textShadow = `2px 2px #EC4899, -2px -2px #6366F1`;
      }

      const fillStyle =
        typeof textEl.fill === 'string'
          ? textEl.fill
          : `linear-gradient(${textEl.fill.angle || 0}deg, ${textEl.fill.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`;

      return (
        <div
          style={{
            ...style,
            fontFamily: textEl.fontFamily || 'Inter, sans-serif',
            fontSize: `${textEl.fontSize}px`,
            fontWeight: textEl.fontWeight || 400,
            textAlign: textEl.textAlign || 'left',
            color: typeof textEl.fill === 'string' ? textEl.fill : undefined,
            background: typeof textEl.fill !== 'string' ? fillStyle : undefined,
            WebkitBackgroundClip: typeof textEl.fill !== 'string' ? 'text' : undefined,
            WebkitTextFillColor: typeof textEl.fill !== 'string' ? 'transparent' : undefined,
            lineHeight: textEl.lineHeight || 1.2,
            letterSpacing: textEl.letterSpacing ? `${textEl.letterSpacing}px` : undefined,
            textShadow,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            display: 'flex',
            alignItems:
              textEl.verticalAlign === 'middle'
                ? 'center'
                : textEl.verticalAlign === 'bottom'
                ? 'flex-end'
                : 'flex-start',
          }}
          className={`select-none ${extraClasses}`}
        >
          {textEl.text}
        </div>
      );
    }

    case 'shape': {
      const shapeEl = element as ShapeElement;
      const fillStyle =
        typeof shapeEl.fill === 'string'
          ? shapeEl.fill
          : `linear-gradient(${shapeEl.fill.angle || 0}deg, ${shapeEl.fill.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`;

      if (shapeEl.shapeType === 'circle' || shapeEl.shapeType === 'ellipse') {
        return (
          <div
            style={{
              ...style,
              borderRadius: '50%',
              background: fillStyle,
              border: shapeEl.stroke ? `${shapeEl.strokeWidth || 1}px solid ${shapeEl.stroke}` : undefined,
            }}
          />
        );
      }

      if (shapeEl.shapeType === 'star') {
        return (
          <div style={style}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <polygon
                points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36"
                fill={typeof shapeEl.fill === 'string' ? shapeEl.fill : '#F59E0B'}
                stroke={shapeEl.stroke}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          </div>
        );
      }

      if (shapeEl.shapeType === 'triangle') {
        return (
          <div style={style}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <polygon
                points="50,5 95,95 5,95"
                fill={typeof shapeEl.fill === 'string' ? shapeEl.fill : '#6366F1'}
                stroke={shapeEl.stroke}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          </div>
        );
      }

      // Default Rect
      return (
        <div
          style={{
            ...style,
            borderRadius: `${shapeEl.cornerRadius || 0}px`,
            background: fillStyle,
            border: shapeEl.stroke ? `${shapeEl.strokeWidth || 1}px solid ${shapeEl.stroke}` : undefined,
          }}
        />
      );
    }

    case 'image': {
      const img = element as any;
      return (
        <div style={style} className="overflow-hidden">
          <img
            src={img.src}
            alt={img.alt || ''}
            className="w-full h-full object-cover"
            style={{
              filter: img.filter
                ? `brightness(${img.filter.brightness ?? 100}%) contrast(${img.filter.contrast ?? 100}%) blur(${img.filter.blur ?? 0}px)`
                : undefined,
              transform: img.flipX ? 'scaleX(-1)' : img.flipY ? 'scaleY(-1)' : undefined,
            }}
          />
        </div>
      );
    }

    case 'chart': {
      const chart = element as ChartElement;
      const dataset = chart.data?.datasets[0];
      const maxVal = dataset ? Math.max(...dataset.data, 1) : 100;

      return (
        <div
          style={{
            ...style,
            background: '#131B2E',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '16px',
            boxSizing: 'border-box',
          }}
          className="flex flex-col justify-between"
        >
          <div className="text-xs font-semibold text-slate-300">
            {chart.options?.title || chart.name}
          </div>
          <div className="flex items-end justify-between gap-2 h-4/5 pt-4">
            {dataset?.data.map((val, idx) => {
              const hPct = Math.round((val / maxVal) * 85);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] text-indigo-300 font-bold">{val}</span>
                  <div
                    style={{
                      height: `${hPct}%`,
                      backgroundColor: dataset.color || '#6366F1',
                      borderRadius: '6px 6px 0 0',
                    }}
                    className="w-full transition-all duration-300"
                  />
                  <span className="text-[10px] text-slate-400 truncate max-w-full">
                    {chart.data.labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'table': {
      const table = element as TableElement;
      return (
        <div
          style={{
            ...style,
            background: '#FFFFFF',
            border: `1px solid ${table.cellBorder || '#CBD5E1'}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <table className="w-full h-full border-collapse">
            <tbody>
              {table.cells.map((row, r) => (
                <tr key={r} style={{ background: r === 0 ? table.headerBg || '#F1F5F9' : '#FFFFFF' }}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      style={{
                        border: `1px solid ${table.cellBorder || '#E2E8F0'}`,
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: r === 0 || cell.fontWeight === 'bold' ? 700 : 400,
                        color: r === 0 ? '#0F172A' : '#334155',
                      }}
                    >
                      {cell.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'qrcode': {
      const qr = element as QRCodeElement;
      return (
        <div
          style={{
            ...style,
            background: qr.bgColor || '#FFFFFF',
            borderRadius: '12px',
            padding: '12px',
            boxSizing: 'border-box',
          }}
          className="flex flex-col items-center justify-center border border-slate-700 shadow-lg"
        >
          <svg viewBox="0 0 100 100" width="80%" height="80%">
            <rect x="5" y="5" width="28" height="28" fill={qr.fgColor || '#000'} />
            <rect x="11" y="11" width="16" height="16" fill={qr.bgColor || '#fff'} />
            <rect x="15" y="15" width="8" height="8" fill={qr.fgColor || '#000'} />

            <rect x="67" y="5" width="28" height="28" fill={qr.fgColor || '#000'} />
            <rect x="73" y="11" width="16" height="16" fill={qr.bgColor || '#fff'} />
            <rect x="77" y="15" width="8" height="8" fill={qr.fgColor || '#000'} />

            <rect x="5" y="67" width="28" height="28" fill={qr.fgColor || '#000'} />
            <rect x="11" y="73" width="16" height="16" fill={qr.bgColor || '#fff'} />
            <rect x="15" y="77" width="8" height="8" fill={qr.fgColor || '#000'} />

            <rect x="44" y="44" width="12" height="12" fill={qr.fgColor || '#000'} />
            <rect x="44" y="12" width="12" height="6" fill={qr.fgColor || '#000'} />
            <rect x="12" y="44" width="6" height="12" fill={qr.fgColor || '#000'} />
            <rect x="67" y="44" width="20" height="8" fill={qr.fgColor || '#000'} />
            <rect x="44" y="67" width="8" height="20" fill={qr.fgColor || '#000'} />
          </svg>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 truncate max-w-full">
            {qr.value}
          </span>
        </div>
      );
    }

    default:
      return null;
  }
};
