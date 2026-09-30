import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { translations } from '../../lib/i18n';
import {
  Plus,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Film,
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const {
    design,
    activePageIndex,
    setActivePage,
    addPage,
    duplicatePage,
    deletePage,
    zoom,
    setZoom,
    language,
  } = useEditorStore();

  const t = translations[language];

  return (
    <footer className="h-14 bg-dark-sidebar border-t border-dark-border px-4 flex items-center justify-between z-30 select-none">
      {/* Multi-Page Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
          <Film className="w-3.5 h-3.5 text-indigo-400" />
          <span>Pages ({design.pages.length}):</span>
        </span>

        {design.pages.map((p, idx) => {
          const isActive = idx === activePageIndex;
          return (
            <div
              key={p.id}
              onClick={() => setActivePage(idx)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{idx + 1}. {p.name}</span>
              {design.pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(p.id);
                  }}
                  className="p-0.5 hover:text-red-300 rounded ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Page Button */}
        <button
          onClick={addPage}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addPage}</span>
        </button>
      </div>

      {/* Zoom & Canvas Transform Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-semibold text-slate-300 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoom(0.65)}
          className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded border border-slate-700"
          title="Fit to Screen"
        >
          Fit
        </button>
      </div>
    </footer>
  );
};
