import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { exportDesignToJSON, exportDesignToSVG } from '@designforge/core';
import { X, Download, FileText, Image as ImageIcon, Code, Check } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { activeModal, closeModal, design, activePageIndex } = useEditorStore();
  const [format, setFormat] = useState<'png' | 'jpg' | 'svg' | 'pdf' | 'json'>('png');
  const [transparentBg, setTransparentBg] = useState(false);
  const [dpi, setDpi] = useState<number>(300);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  if (activeModal !== 'export') return null;

  const handleDownload = () => {
    setIsExporting(true);
    try {
      if (format === 'json') {
        const json = exportDesignToJSON(design);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${design.title.toLowerCase().replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const svg = exportDesignToSVG(design, activePageIndex);
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${design.title.toLowerCase().replace(/\s+/g, '_')}.${format === 'svg' ? 'svg' : 'svg'}`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setExportedSuccess(true);
      setTimeout(() => {
        setExportedSuccess(false);
        closeModal();
      }, 1500);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative select-none">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Export & Download Design</h3>
        <p className="text-xs text-slate-400 mb-5">
          Select vector or raster export options for publishing and print.
        </p>

        {/* Format Selector */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-semibold text-slate-300 block">File Format</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'png', label: 'PNG', desc: 'High Quality' },
              { id: 'svg', label: 'SVG', desc: 'Vector Scalable' },
              { id: 'pdf', label: 'PDF', desc: 'Print Ready' },
              { id: 'json', label: 'JSON', desc: 'Scene Graph' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFormat(item.id as any)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  format === item.id
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold block">{item.label}</span>
                <span className="text-[9px] text-slate-400">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DPI & Options */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Transparent Background</span>
            <input
              type="checkbox"
              checked={transparentBg}
              onChange={(e) => setTransparentBg(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Resolution (DPI)</span>
            <select
              value={dpi}
              onChange={(e) => setDpi(parseInt(e.target.value, 10))}
              className="bg-slate-800 text-xs text-slate-200 rounded px-2 py-1 border border-slate-700"
            >
              <option value={72}>72 DPI (Screen Standard)</option>
              <option value={150}>150 DPI (Medium Web)</option>
              <option value={300}>300 DPI (High Resolution Print)</option>
            </select>
          </div>
        </div>

        {/* Download Action Button */}
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
        >
          {exportedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Export Complete!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : `Download ${format.toUpperCase()}`}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
