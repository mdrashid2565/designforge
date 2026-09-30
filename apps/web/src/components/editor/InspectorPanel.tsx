import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { TextElement, ShapeElement } from '@designforge/core';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const {
    design,
    activePageIndex,
    selectedElementIds,
    updateSelectedElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    alignSelected,
    bringToFront,
    sendToBack,
  } = useEditorStore();

  const page = design.pages[activePageIndex] || design.pages[0];
  const selectedElements = page.elements.filter((el) => selectedElementIds.includes(el.id));
  const activeEl = selectedElements[0];

  if (!activeEl) {
    return (
      <aside className="w-72 bg-dark-card border-l border-dark-border p-4 flex flex-col justify-between text-slate-400 select-none">
        <div>
          <span className="text-xs font-bold text-slate-300 block mb-1">Canvas Inspector</span>
          <p className="text-xs text-slate-500">Select any element on the canvas to customize typography, colors, effects, and layout.</p>
        </div>

        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-[11px] space-y-1.5 text-slate-400">
          <div className="font-semibold text-slate-300">Keyboard Shortcuts</div>
          <div><kbd className="px-1 py-0.5 bg-slate-900 rounded font-mono">⌘Z</kbd> Undo</div>
          <div><kbd className="px-1 py-0.5 bg-slate-900 rounded font-mono">⌘⇧Z</kbd> Redo</div>
          <div><kbd className="px-1 py-0.5 bg-slate-900 rounded font-mono">⌘D</kbd> Duplicate</div>
          <div><kbd className="px-1 py-0.5 bg-slate-900 rounded font-mono">⌘K</kbd> Command Palette</div>
        </div>
      </aside>
    );
  }

  const isText = activeEl.type === 'text';
  const textEl = isText ? (activeEl as TextElement) : null;
  const isShape = activeEl.type === 'shape';
  const shapeEl = isShape ? (activeEl as ShapeElement) : null;
  const currentFill = (activeEl as any).fill;

  return (
    <aside className="w-72 bg-dark-card border-l border-dark-border p-4 flex flex-col h-full overflow-y-auto space-y-4 select-none z-20">
      {/* Top Header & Quick Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="text-xs font-bold text-slate-200 capitalize">{activeEl.name}</span>
        <div className="flex items-center gap-1 text-slate-400">
          <button onClick={duplicateSelectedElements} title="Duplicate (Cmd+D)" className="p-1 hover:text-white rounded">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={deleteSelectedElements} title="Delete (Del)" className="p-1 hover:text-red-400 rounded">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Position & Size */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Dimensions & Transform</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-500">X Position</label>
            <input
              type="number"
              value={activeEl.x}
              onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-800 p-1.5 rounded border border-slate-700 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500">Y Position</label>
            <input
              type="number"
              value={activeEl.y}
              onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-800 p-1.5 rounded border border-slate-700 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500">Width</label>
            <input
              type="number"
              value={activeEl.width}
              onChange={(e) => updateSelectedElement({ width: parseInt(e.target.value, 10) || 10 })}
              className="w-full bg-slate-800 p-1.5 rounded border border-slate-700 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500">Height</label>
            <input
              type="number"
              value={activeEl.height}
              onChange={(e) => updateSelectedElement({ height: parseInt(e.target.value, 10) || 10 })}
              className="w-full bg-slate-800 p-1.5 rounded border border-slate-700 text-slate-200 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Typography Controls */}
      {isText && textEl && (
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Typography & Fonts</span>

          {/* Font Family */}
          <div>
            <label className="text-[10px] text-slate-500">Font Family</label>
            <select
              value={textEl.fontFamily || 'Inter'}
              onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
              className="w-full bg-slate-800 text-xs text-slate-200 p-1.5 rounded border border-slate-700 cursor-pointer"
            >
              <option value="Inter">Inter (Sans)</option>
              <option value="Poppins">Poppins (Modern Bold)</option>
              <option value="Montserrat">Montserrat (Geometric)</option>
              <option value="Playfair Display">Playfair Display (Serif)</option>
              <option value="Cinzel">Cinzel (Luxury Serif)</option>
              <option value="Noto Sans Devanagari">Noto Sans Devanagari (हिंदी)</option>
              <option value="Space Grotesk">Space Grotesk (Tech)</option>
              <option value="Fira Code">Fira Code (Mono)</option>
            </select>
          </div>

          {/* Size & Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500">Font Size</label>
              <input
                type="number"
                value={textEl.fontSize}
                onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value, 10) || 12 })}
                className="w-full bg-slate-800 p-1.5 rounded border border-slate-700 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Font Weight</label>
              <select
                value={textEl.fontWeight}
                onChange={(e) => updateSelectedElement({ fontWeight: parseInt(e.target.value, 10) || 400 })}
                className="w-full bg-slate-800 text-xs text-slate-200 p-1.5 rounded border border-slate-700 cursor-pointer"
              >
                <option value={400}>Regular (400)</option>
                <option value={600}>Semibold (600)</option>
                <option value={700}>Bold (700)</option>
                <option value={800}>Extra Bold (800)</option>
                <option value={900}>Black (900)</option>
              </select>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Text Align</label>
            <div className="flex bg-slate-800 rounded p-1 gap-1 border border-slate-700">
              <button
                onClick={() => updateSelectedElement({ textAlign: 'left' })}
                className={`flex-1 p-1 rounded flex justify-center ${textEl.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateSelectedElement({ textAlign: 'center' })}
                className={`flex-1 p-1 rounded flex justify-center ${textEl.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateSelectedElement({ textAlign: 'right' })}
                className={`flex-1 p-1 rounded flex justify-center ${textEl.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text Effects */}
          <div>
            <label className="text-[10px] text-slate-500">Text Effect</label>
            <select
              value={textEl.textEffect || 'none'}
              onChange={(e) => updateSelectedElement({ textEffect: e.target.value as any })}
              className="w-full bg-slate-800 text-xs text-slate-200 p-1.5 rounded border border-slate-700 cursor-pointer"
            >
              <option value="none">None</option>
              <option value="shadow">Drop Shadow</option>
              <option value="neon">Neon Glow</option>
              <option value="glitch">Glitch Effect</option>
            </select>
          </div>
        </div>
      )}

      {/* Fill & Color Controls */}
      <div className="pt-2 border-t border-slate-800">
        <label className="text-[10px] text-slate-500 block mb-1">Fill Color / Accent</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={typeof currentFill === 'string' ? currentFill : '#6366F1'}
            onChange={(e) => updateSelectedElement({ fill: e.target.value })}
            className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={typeof currentFill === 'string' ? currentFill : '#6366F1'}
            onChange={(e) => updateSelectedElement({ fill: e.target.value })}
            className="flex-1 bg-slate-800 text-xs font-mono text-slate-200 p-1.5 rounded border border-slate-700 uppercase"
          />
        </div>
      </div>

      {/* Alignment Tools */}
      <div className="pt-2 border-t border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Canvas Alignment</span>
        <div className="grid grid-cols-3 gap-1">
          <button onClick={() => alignSelected('align_left')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300">Left</button>
          <button onClick={() => alignSelected('align_center')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300">Center</button>
          <button onClick={() => alignSelected('align_right')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300">Right</button>
          <button onClick={() => alignSelected('align_top')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300">Top</button>
          <button onClick={() => alignSelected('align_middle')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300">Middle</button>
          <button onClick={() => alignSelected('align_bottom')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300">Bottom</button>
        </div>
      </div>

      {/* Layer Hierarchy Ordering */}
      <div className="pt-2 border-t border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Layer Arrangement</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={bringToFront}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 flex items-center justify-center gap-1"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>To Front</span>
          </button>
          <button
            onClick={sendToBack}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 flex items-center justify-center gap-1"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>To Back</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
