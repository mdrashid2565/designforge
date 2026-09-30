import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import {
  Search,
  Sparkles,
  Download,
  Scaling,
  Maximize2,
  Plus,
  Type,
  Square,
  BarChart3,
  QrCode,
  Palette,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    activeModal,
    closeModal,
    openModal,
    addText,
    addShape,
    addChart,
    addQRCode,
    undo,
    redo,
    revertAISession,
    setAgentViewOpen,
  } = useEditorStore();

  const [query, setQuery] = useState('');

  if (activeModal !== 'command_palette') return null;

  const actions = [
    { id: 'add_text', title: 'Add Heading Text', icon: Type, category: 'Elements', run: () => addText() },
    { id: 'add_rect', title: 'Add Rectangle Shape', icon: Square, category: 'Elements', run: () => addShape('rect') },
    { id: 'add_chart', title: 'Add Growth Bar Chart', icon: BarChart3, category: 'Elements', run: () => addChart('bar') },
    { id: 'add_qr', title: 'Add Dynamic QR Code', icon: QrCode, category: 'Elements', run: () => addQRCode() },
    { id: 'export', title: 'Export Design (PNG / SVG / PDF)', icon: Download, category: 'File', run: () => openModal('export') },
    { id: 'resize', title: 'Magic Resize to Social / Print', icon: Scaling, category: 'Tools', run: () => openModal('resize') },
    { id: 'present', title: 'Start Fullscreen Presentation', icon: Maximize2, category: 'View', run: () => openModal('presentation') },
    { id: 'agent_view', title: 'Toggle AI Agent View Panel', icon: Sparkles, category: 'AI', run: () => setAgentViewOpen(true) },
    { id: 'revert_ai', title: 'Revert Entire AI Session', icon: Sparkles, category: 'AI', run: () => revertAISession() },
    { id: 'brand_kit', title: 'Open Brand Kit Manager', icon: Palette, category: 'Brand', run: () => openModal('brand') },
    { id: 'undo', title: 'Undo Last Action', icon: Sparkles, category: 'Edit', run: () => undo() },
    { id: 'redo', title: 'Redo Action', icon: Sparkles, category: 'Edit', run: () => redo() },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden select-none">
        {/* Search Input */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search commands, tools, or elements..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder-slate-500"
          />
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    action.run();
                    closeModal();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer text-xs text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">{action.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-800">
                    {action.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
