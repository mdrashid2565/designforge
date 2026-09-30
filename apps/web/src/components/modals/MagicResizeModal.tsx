import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { PRESET_DIMENSIONS } from '@designforge/core';
import { X, Scaling, Smartphone, Video, Layout, FileText, Check } from 'lucide-react';

export const MagicResizeModal: React.FC = () => {
  const { activeModal, closeModal, resizeDesign, design } = useEditorStore();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('instagram_story');

  if (activeModal !== 'resize') return null;

  const handleApplyResize = () => {
    const preset = PRESET_DIMENSIONS.find((p) => p.id === selectedPresetId);
    if (preset) {
      resizeDesign(preset.width, preset.height);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative select-none">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Scaling className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Magic Resize (Multi-Format)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Transform your design across multiple social, presentation, and print aspect ratios with intelligent layout repositioning.
        </p>

        {/* Presets List */}
        <div className="grid grid-cols-2 gap-2.5 max-h-80 overflow-y-auto mb-6 pr-1">
          {PRESET_DIMENSIONS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-500 shadow-md'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{preset.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {preset.width} × {preset.height} px
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleApplyResize}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all"
        >
          Resize Canvas Intelligently →
        </button>
      </div>
    </div>
  );
};
