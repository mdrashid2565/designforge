import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { bulkCreatePages, parseCSV } from '@designforge/core';
import { X, Database, Table, Sparkles, Check } from 'lucide-react';

export const BulkCreateModal: React.FC = () => {
  const { activeModal, closeModal, design, setDesign, activePageIndex } = useEditorStore();
  const [csvText, setCsvText] = useState(
    `title,author,discount,code\n"Summer AI Mega Sale","DesignForge Team","40% OFF","SUMMER40"\n"Autonomous Cloud Launch","Engineering Dept","50% OFF","CLOUD50"\n"Enterprise Design Summit","Product Strategy","Free Pass","VIPPASS"`
  );
  const [createdCount, setCreatedCount] = useState<number | null>(null);

  if (activeModal !== 'bulk') return null;

  const rows = parseCSV(csvText);

  const handleBulkGenerate = () => {
    if (rows.length === 0) return;
    const updated = bulkCreatePages(design, rows, activePageIndex);
    setDesign(updated);
    setCreatedCount(rows.length);
    setTimeout(() => {
      setCreatedCount(null);
      closeModal();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-xl p-6 shadow-2xl relative select-none">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Bulk Create (Data-Driven Merge)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Paste CSV tabular data. Any text containing <code className="text-indigo-400 font-mono">{'{{header}}'}</code> will be dynamically replaced per page.
        </p>

        {/* CSV Editor */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-slate-300">CSV Data Input</label>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full bg-slate-800 text-xs text-slate-200 font-mono p-3 rounded-xl border border-slate-700 outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Parsed Preview Table */}
        <div className="space-y-2 mb-6">
          <span className="text-xs font-semibold text-slate-300 block">
            Parsed Columns ({rows.length} rows to generate):
          </span>
          <div className="max-h-36 overflow-y-auto bg-slate-900/60 rounded-xl border border-slate-800 p-2 text-[11px]">
            {rows.map((row, idx) => (
              <div key={idx} className="flex gap-2 py-1 border-b border-slate-800/60 last:border-0 font-mono text-slate-300">
                <span className="text-slate-500 w-6">#{idx + 1}</span>
                <span className="truncate">{Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(' | ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Action Button */}
        <button
          onClick={handleBulkGenerate}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
        >
          {createdCount ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Created {createdCount} Multi-Page Designs!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate {rows.length} Pages Instantly →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
