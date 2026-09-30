import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { translations, Language } from '../../lib/i18n';
import {
  Sparkles,
  Undo2,
  Redo2,
  Maximize2,
  Share2,
  Download,
  Scaling,
  Globe,
  Bot,
  Sun,
  Moon,
  Command,
  LayoutDashboard,
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const {
    design,
    executeCommand,
    canUndo,
    canRedo,
    undo,
    redo,
    openModal,
    language,
    setLanguage,
    theme,
    toggleTheme,
    isAgentViewOpen,
    setAgentViewOpen,
  } = useEditorStore();

  const t = translations[language];

  return (
    <header className="h-14 bg-dark-sidebar border-b border-dark-border px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand + Title + Undo/Redo */}
      <div className="flex items-center gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => openModal('admin')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              DesignForge
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO AI
              </span>
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-slate-800" />

        {/* Design Title */}
        <input
          type="text"
          value={design.title}
          onChange={(e) => {
            design.title = e.target.value;
            useEditorStore.setState({ design: { ...design } });
          }}
          className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-800 text-sm font-semibold text-slate-200 px-2.5 py-1 rounded transition-colors outline-none focus:ring-1 focus:ring-indigo-500 max-w-[220px] truncate"
        />

        {/* Dimension pill */}
        <button
          onClick={() => openModal('resize')}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-indigo-400 bg-slate-800/40 hover:bg-slate-800 rounded border border-slate-700/50 transition-colors"
        >
          <Scaling className="w-3.5 h-3.5" />
          <span>{design.width} × {design.height} px</span>
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title={`${t.undo} (Cmd+Z)`}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title={`${t.redo} (Cmd+Shift+Z)`}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={() => openModal('command_palette')}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-colors"
      >
        <Command className="w-3.5 h-3.5 text-indigo-400" />
        <span>Type <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-900 rounded font-mono">⌘K</kbd> to run any tool...</span>
      </button>

      {/* Right: Agent Toggle, Language, Presentation, Export */}
      <div className="flex items-center gap-2">
        {/* Language Picker */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none border border-slate-700 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Live Agent View Toggle Button */}
        <button
          onClick={() => setAgentViewOpen(!isAgentViewOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isAgentViewOpen
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Bot className="w-4 h-4 text-pink-400" />
          <span>{t.agentView}</span>
        </button>

        {/* Present Button */}
        <button
          onClick={() => openModal('presentation')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>{t.present}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => openModal('export')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t.share}</span>
        </button>

        {/* Export Button (Primary CTA) */}
        <button
          onClick={() => openModal('export')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.export}</span>
        </button>
      </div>
    </header>
  );
};
