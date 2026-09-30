import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { DEFAULT_BRAND_KITS } from '@designforge/core';
import { X, Palette, Check, Sparkles } from 'lucide-react';

export const BrandKitModal: React.FC = () => {
  const { activeModal, closeModal, applyBrandKit } = useEditorStore();

  if (activeModal !== 'brand') return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative select-none">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Brand Kit Library & Tokens</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Maintain unified typography, color rules, and brand logos across your workspace.
        </p>

        {/* Brand Kits Grid */}
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto mb-6 pr-1">
          {DEFAULT_BRAND_KITS.map((kit) => (
            <div
              key={kit.id}
              className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{kit.name}</span>
                <button
                  onClick={() => {
                    applyBrandKit(kit);
                    closeModal();
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-2">
                {Object.entries(kit.palette).map(([name, color]) => {
                  if (typeof color !== 'string') return null;
                  return (
                    <div
                      key={name}
                      style={{ backgroundColor: color }}
                      title={`${name}: ${color}`}
                      className="w-7 h-7 rounded-lg border border-slate-700 shadow-sm"
                    />
                  );
                })}
              </div>

              {/* Typography */}
              <div className="text-xs text-slate-300">
                <div>Heading: <strong className="text-white">{kit.fonts.heading}</strong></div>
                <div>Body: <strong className="text-white">{kit.fonts.body}</strong></div>
              </div>

              {/* Voice */}
              <p className="text-[11px] text-slate-400 italic">"{kit.brandVoice}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
