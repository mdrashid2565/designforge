import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { translations } from '../../lib/i18n';
import {
  LayoutTemplate,
  Shapes,
  Type,
  UploadCloud,
  Palette,
  Sparkles,
  Layers,
  Database,
  Search,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  BarChart3,
  Table as TableIcon,
  QrCode,
  Image as ImageIcon,
  Star,
  Circle,
  Square,
  Triangle,
  ArrowRight,
} from 'lucide-react';
import { DEFAULT_BRAND_KITS, TEMPLATE_LIBRARY, searchTemplates } from '@designforge/core';
import { generateAICopy, generateMagicDesign } from '@designforge/ai-adapter';

export const LeftSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    language,
    design,
    activePageIndex,
    setDesign,
    addText,
    addShape,
    addImage,
    addChart,
    addTable,
    addQRCode,
    applyBrandKit,
    selectedElementIds,
    selectElement,
    updateSelectedElement,
    deleteSelectedElements,
    openModal,
    runAgentPlan,
  } = useEditorStore();

  const t = translations[language];
  const [templateSearch, setTemplateSearch] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const page = design.pages[activePageIndex] || design.pages[0];
  const filteredTemplates = searchTemplates(templateSearch);

  const handleGenerateMagicDesign = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    try {
      const generated = await generateMagicDesign({
        prompt: aiPrompt,
        dimensions: { width: design.width, height: design.height },
        language,
      });
      setDesign(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const navItems = [
    { id: 'templates', label: t.templates, icon: LayoutTemplate },
    { id: 'elements', label: t.elements, icon: Shapes },
    { id: 'text', label: t.text, icon: Type },
    { id: 'uploads', label: t.uploads, icon: UploadCloud },
    { id: 'brand', label: t.brandKit, icon: Palette },
    { id: 'ai', label: t.aiMagic, icon: Sparkles },
    { id: 'layers', label: t.layers, icon: Layers },
    { id: 'bulk', label: t.bulkCreate, icon: Database },
  ] as const;

  return (
    <div className="flex h-full select-none z-20">
      {/* Primary Vertical Icon Bar */}
      <aside className="w-16 bg-dark-sidebar border-r border-dark-border flex flex-col items-center py-3 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Sub-Panel Content Drawer */}
      <div className="w-80 bg-dark-card border-r border-dark-border flex flex-col h-full overflow-hidden">
        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="p-4 flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-100 mb-3">{t.templates}</h3>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search 1,000+ templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full bg-slate-800/80 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-lg border border-slate-700/60 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setDesign(tmpl.design)}
                  className="p-3 bg-slate-800/40 hover:bg-slate-800/90 rounded-xl border border-slate-700/50 cursor-pointer transition-all hover:scale-[1.01] hover:border-indigo-500/60"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{tmpl.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{tmpl.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ELEMENTS & SHAPES TAB */}
        {activeTab === 'elements' && (
          <div className="p-4 flex flex-col h-full overflow-y-auto space-y-4">
            <h3 className="text-sm font-bold text-slate-100">{t.elements}</h3>

            {/* Geometric Shapes */}
            <div>
              <span className="text-xs font-semibold text-slate-400 mb-2 block">{t.shapes}</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => addShape('rect')}
                  className="p-3 bg-slate-800/50 hover:bg-indigo-600/30 rounded-lg border border-slate-700 flex flex-col items-center justify-center gap-1 group"
                >
                  <Square className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-slate-300">Rect</span>
                </button>
                <button
                  onClick={() => addShape('circle')}
                  className="p-3 bg-slate-800/50 hover:bg-indigo-600/30 rounded-lg border border-slate-700 flex flex-col items-center justify-center gap-1 group"
                >
                  <Circle className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-slate-300">Circle</span>
                </button>
                <button
                  onClick={() => addShape('triangle')}
                  className="p-3 bg-slate-800/50 hover:bg-indigo-600/30 rounded-lg border border-slate-700 flex flex-col items-center justify-center gap-1 group"
                >
                  <Triangle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-slate-300">Triangle</span>
                </button>
                <button
                  onClick={() => addShape('star')}
                  className="p-3 bg-slate-800/50 hover:bg-indigo-600/30 rounded-lg border border-slate-700 flex flex-col items-center justify-center gap-1 group"
                >
                  <Star className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-slate-300">Star</span>
                </button>
              </div>
            </div>

            {/* Interactive Data & Tools */}
            <div>
              <span className="text-xs font-semibold text-slate-400 mb-2 block">Data & Widgets</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => addChart('bar')}
                  className="p-3 bg-slate-800/50 hover:bg-indigo-600/30 rounded-lg border border-slate-700 flex flex-col items-center justify-center gap-1"
                >
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span className="text-[9px] text-slate-300">{t.charts}</span>
                </button>
                <button
                  onClick={addTable}
                  className="p-3 bg-slate-800/50 hover:bg-indigo-600/30 rounded-lg border border-slate-700 flex flex-col items-center justify-center gap-1"
                >
                  <TableIcon className="w-5 h-5 text-emerald-400" />
                  <span className="text-[9px] text-slate-300">{t.tables}</span>
                </button>
                <button
                  onClick={() => addQRCode('https://designforge.ai')}
                  className="p-3 bg-slate-800/50 hover:bg-indigo-600/30 rounded-lg border border-slate-700 flex flex-col items-center justify-center gap-1"
                >
                  <QrCode className="w-5 h-5 text-pink-400" />
                  <span className="text-[9px] text-slate-300">{t.qrCode}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TEXT & TYPOGRAPHY TAB */}
        {activeTab === 'text' && (
          <div className="p-4 flex flex-col h-full overflow-y-auto space-y-3">
            <h3 className="text-sm font-bold text-slate-100">{t.text}</h3>

            <button
              onClick={() => addText({ fontSize: 64, fontWeight: 900, fontFamily: 'Poppins' })}
              className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700"
            >
              <span className="text-xl font-extrabold text-white block">Add a Heading</span>
              <span className="text-[10px] text-slate-400">Poppins 64px • 900 Bold</span>
            </button>

            <button
              onClick={() => addText({ fontSize: 32, fontWeight: 600, fontFamily: 'Inter' })}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700"
            >
              <span className="text-sm font-semibold text-slate-200 block">Add a Subheading</span>
              <span className="text-[10px] text-slate-400">Inter 32px • 600 Semibold</span>
            </button>

            <button
              onClick={() => addText({ fontSize: 18, fontWeight: 400, fontFamily: 'Inter' })}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-slate-700"
            >
              <span className="text-xs text-slate-300 block">Add a little bit of body text</span>
              <span className="text-[10px] text-slate-400">Inter 18px • Regular</span>
            </button>

            {/* Hindi / Devanagari Preset */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-amber-400 mb-1.5 block">हिंदी / Devanagari Typography</span>
              <button
                onClick={() =>
                  addText({
                    text: 'भव्य दीपोत्सव एवं महा बचत ऑफर',
                    fontSize: 48,
                    fontWeight: 800,
                    fontFamily: 'Noto Sans Devanagari',
                    language: 'hi',
                  })
                }
                className="w-full py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-left border border-amber-500/30"
              >
                <span className="text-sm font-bold text-amber-300 block font-heading">
                  भव्य मुख्य शीर्षक जोड़ें
                </span>
                <span className="text-[10px] text-amber-400/80">Noto Sans Devanagari • 48px</span>
              </button>
            </div>
          </div>
        )}

        {/* BRAND KIT TAB */}
        {activeTab === 'brand' && (
          <div className="p-4 flex flex-col h-full overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">{t.brandKit}</h3>
              <button
                onClick={() => openModal('brand')}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Manage
              </button>
            </div>

            {DEFAULT_BRAND_KITS.map((kit) => (
              <div
                key={kit.id}
                className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{kit.name}</span>
                  <button
                    onClick={() => applyBrandKit(kit)}
                    className="text-[11px] font-bold px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Apply to Canvas
                  </button>
                </div>

                {/* Color swatches */}
                <div className="flex items-center gap-1.5">
                  <div
                    style={{ backgroundColor: kit.palette.primary }}
                    className="w-6 h-6 rounded-full border border-slate-700 shadow-sm"
                  />
                  <div
                    style={{ backgroundColor: kit.palette.secondary }}
                    className="w-6 h-6 rounded-full border border-slate-700 shadow-sm"
                  />
                  <div
                    style={{ backgroundColor: kit.palette.accent }}
                    className="w-6 h-6 rounded-full border border-slate-700 shadow-sm"
                  />
                  <div
                    style={{ backgroundColor: kit.palette.background }}
                    className="w-6 h-6 rounded-full border border-slate-700 shadow-sm"
                  />
                  <div
                    style={{ backgroundColor: kit.palette.text }}
                    className="w-6 h-6 rounded-full border border-slate-700 shadow-sm"
                  />
                </div>

                <div className="text-[10px] text-slate-400">
                  Fonts: <strong className="text-slate-300">{kit.fonts.heading}</strong> + {kit.fonts.body}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI MAGIC TOOLS TAB */}
        {activeTab === 'ai' && (
          <div className="p-4 flex flex-col h-full overflow-y-auto space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-bold text-slate-100">Magic Design AI</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Generative Prompt</label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Launching a high-performance vector graphics AI tool with 50% early bird coupon..."
                className="w-full bg-slate-800 text-xs text-slate-100 p-2.5 rounded-lg border border-slate-700 outline-none focus:border-pink-500 resize-none"
              />
              <button
                disabled={isGeneratingAI}
                onClick={handleGenerateMagicDesign}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingAI ? 'Synthesizing...' : t.generateBtn}</span>
              </button>
            </div>

            {/* Quick Agent Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block">Autonomous Workflows</span>
              <button
                onClick={() =>
                  runAgentPlan('Generate YouTube Viral Thumbnail', [
                    { toolName: 'add_shape', args: (id: string) => ({ designId: id, shapeType: 'rect', x: 0, y: 0, width: 1280, height: 720, fill: '#090D16' }) },
                    { toolName: 'add_text', args: (id: string) => ({ designId: id, text: 'VIRAL AI REVOLUTION', fontSize: 72, x: 80, y: 160, fill: '#FACC15' }) },
                    { toolName: 'add_text', args: (id: string) => ({ designId: id, text: 'Full MCP Server Control Layer', fontSize: 28, x: 80, y: 280, fill: '#38BDF8' }) },
                  ])
                }
                className="w-full text-left p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg text-xs text-slate-300 font-medium border border-slate-700/60"
              >
                ⚡ Autonomous YouTube Thumbnail
              </button>

              <button
                onClick={() =>
                  runAgentPlan('Multi-Slide Pitch Deck', [
                    { toolName: 'add_text', args: (id: string) => ({ designId: id, text: 'Series A Investor Deck', fontSize: 54, x: 100, y: 150, fill: '#FFFFFF' }) },
                    { toolName: 'add_chart', args: (id: string) => ({ designId: id, chartType: 'bar', labels: ['Q1', 'Q2', 'Q3', 'Q4'], data: [120, 310, 680, 1420], x: 100, y: 280, width: 500, height: 300 }) },
                  ])
                }
                className="w-full text-left p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg text-xs text-slate-300 font-medium border border-slate-700/60"
              >
                📊 Generate Growth Traction Deck
              </button>
            </div>
          </div>
        )}

        {/* LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="p-4 flex flex-col h-full overflow-hidden">
            <h3 className="text-sm font-bold text-slate-100 mb-3">{t.layers}</h3>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {[...page.elements].reverse().map((el) => {
                const isSelected = selectedElementIds.includes(el.id);
                return (
                  <div
                    key={el.id}
                    onClick={() => selectElement(el.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-600/30 border border-indigo-500' : 'bg-slate-800/40 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold text-slate-200 truncate max-w-[140px]">{el.name}</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          el.visible = !el.visible;
                          useEditorStore.setState({ design: { ...design } });
                        }}
                        className="p-1 hover:text-white"
                      >
                        {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          el.locked = !el.locked;
                          useEditorStore.setState({ design: { ...design } });
                        }}
                        className="p-1 hover:text-white"
                      >
                        {el.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BULK CREATE TAB */}
        {activeTab === 'bulk' && (
          <div className="p-4 flex flex-col h-full overflow-y-auto space-y-3">
            <h3 className="text-sm font-bold text-slate-100">{t.bulkCreate}</h3>
            <p className="text-xs text-slate-400">
              Generate hundreds of localized or customized designs from CSV datasets in seconds.
            </p>
            <button
              onClick={() => openModal('bulk')}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/20"
            >
              Open Bulk CSV Creator →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
