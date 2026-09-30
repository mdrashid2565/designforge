import { create } from 'zustand';
import {
  AddElementCommand,
  AddPageCommand,
  ApplyBrandKitCommand,
  BatchCommand,
  BrandKit,
  CanvasElement,
  CommandManager,
  DEFAULT_BRAND_KITS,
  Design,
  DuplicatePageCommand,
  GroupElementsCommand,
  MoveResizeElementCommand,
  Page,
  RemoveElementCommand,
  RemovePageCommand,
  ReorderElementCommand,
  ReorderPagesCommand,
  ResizeDesignCommand,
  ShapeElement,
  ShapeType,
  SnapGuide,
  TEMPLATE_LIBRARY,
  TextElement,
  UngroupElementsCommand,
  UpdateDesignMetaCommand,
  UpdateElementCommand,
  alignElements,
  instantiateTemplate,
} from '@designforge/core';
import { AgentSessionState, AutonomousAgentRunner, VisualVerificationEngine } from '@designforge/browser-agent';
import { Language } from '../lib/i18n';

// Initial default template
const initialDesign = instantiateTemplate('tmpl_saas_launch_insta');
const initialCommandManager = new CommandManager(initialDesign);

export type ModalType =
  | 'export'
  | 'resize'
  | 'templates'
  | 'brand'
  | 'bulk'
  | 'presentation'
  | 'admin'
  | 'command_palette'
  | null;

export interface EditorState {
  design: Design;
  commandManager: CommandManager;
  activePageIndex: number;
  selectedElementIds: string[];
  zoom: number;
  pan: { x: number; y: number };
  activeTab: 'templates' | 'elements' | 'text' | 'uploads' | 'brand' | 'ai' | 'layers' | 'bulk';
  isAgentViewOpen: boolean;
  activeModal: ModalType;
  language: Language;
  theme: 'dark' | 'light';
  snapGuides: SnapGuide[];
  agentSession: AgentSessionState | null;
  agentRunner: AutonomousAgentRunner | null;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;

  // Actions
  setDesign: (design: Design, resetHistory?: boolean) => void;
  setActivePage: (index: number) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setActiveTab: (tab: EditorState['activeTab']) => void;
  setAgentViewOpen: (open: boolean) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  setSnapGuides: (guides: SnapGuide[]) => void;

  // Canvas Manipulations via Command Engine
  executeCommand: (cmd: any) => void;
  undo: () => void;
  redo: () => void;
  revertAISession: () => void;
  addText: (options?: Partial<TextElement>) => void;
  addShape: (shapeType: ShapeType, options?: Partial<ShapeElement>) => void;
  addImage: (src: string, name?: string) => void;
  addChart: (type?: any) => void;
  addTable: () => void;
  addQRCode: (url?: string) => void;
  updateSelectedElement: (updates: Partial<CanvasElement>) => void;
  deleteSelectedElements: () => void;
  duplicateSelectedElements: () => void;
  alignSelected: (action: any) => void;
  bringToFront: () => void;
  sendToBack: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  applyBrandKit: (kit: BrandKit) => void;
  resizeDesign: (width: number, height: number) => void;
  addPage: () => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  reorderPages: (pageOrder: string[]) => void;

  // Agent Operations
  setAgentSession: (session: AgentSessionState | null) => void;
  runAgentPlan: (goal: string, steps: any[]) => Promise<void>;
  pauseAgent: () => void;
  resumeAgent: () => void;
  stopAgent: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => {
  // Subscribe to command manager updates
  initialCommandManager.subscribe((design) => {
    set({
      design,
      canUndo: initialCommandManager.canUndo(),
      canRedo: initialCommandManager.canRedo(),
      historyLength: initialCommandManager.getHistory().length,
    });
  });

  return {
    design: initialDesign,
    commandManager: initialCommandManager,
    activePageIndex: 0,
    selectedElementIds: [],
    zoom: 0.65,
    pan: { x: 0, y: 0 },
    activeTab: 'templates',
    isAgentViewOpen: true,
    activeModal: null,
    language: 'en',
    theme: 'dark',
    snapGuides: [],
    agentSession: {
      sessionId: 'session_demo_init',
      goal: 'Autonomous Visual Optimization',
      status: 'idle',
      startedAt: new Date().toISOString(),
      traces: [
        {
          stepNumber: 1,
          toolName: 'create_design',
          arguments: { title: 'SaaS Launch Hero', width: 1080, height: 1080 },
          result: { success: true, designId: 'design_tmpl_1' },
          timestamp: new Date().toISOString(),
          status: 'success',
          durationMs: 42,
          verificationReport: {
            passed: true,
            score: 100,
            issues: [],
            svgScreenshot: '',
            timestamp: new Date().toISOString(),
          },
        },
      ],
    },
    agentRunner: null,
    canUndo: false,
    canRedo: false,
    historyLength: 0,

    setDesign: (design, resetHistory = false) => {
      const mgr = get().commandManager;
      mgr.setDesign(design, resetHistory);
      set({
        design: mgr.getDesign(),
        activePageIndex: 0,
        selectedElementIds: [],
        canUndo: mgr.canUndo(),
        canRedo: mgr.canRedo(),
      });
    },

    setActivePage: (index) => set({ activePageIndex: index, selectedElementIds: [] }),

    selectElement: (id, multi = false) => {
      set((state) => {
        if (multi) {
          const exists = state.selectedElementIds.includes(id);
          return {
            selectedElementIds: exists
              ? state.selectedElementIds.filter((item) => item !== id)
              : [...state.selectedElementIds, id],
          };
        }
        return { selectedElementIds: [id] };
      });
    },

    clearSelection: () => set({ selectedElementIds: [] }),

    setZoom: (zoom) =>
      set((state) => ({
        zoom: typeof zoom === 'function' ? zoom(state.zoom) : Math.max(0.1, Math.min(3, zoom)),
      })),

    setPan: (pan) => set({ pan }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setAgentViewOpen: (open) => set({ isAgentViewOpen: open }),
    openModal: (modal) => set({ activeModal: modal }),
    closeModal: () => set({ activeModal: null }),
    setLanguage: (lang) => set({ language: lang }),
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          if (next === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
        return { theme: next };
      }),
    setSnapGuides: (guides) => set({ snapGuides: guides }),

    executeCommand: (cmd) => {
      const mgr = get().commandManager;
      mgr.execute(cmd);
      set({
        design: mgr.getDesign(),
        canUndo: mgr.canUndo(),
        canRedo: mgr.canRedo(),
        historyLength: mgr.getHistory().length,
      });
    },

    undo: () => {
      const mgr = get().commandManager;
      mgr.undo();
      set({
        design: mgr.getDesign(),
        canUndo: mgr.canUndo(),
        canRedo: mgr.canRedo(),
      });
    },

    redo: () => {
      const mgr = get().commandManager;
      mgr.redo();
      set({
        design: mgr.getDesign(),
        canUndo: mgr.canUndo(),
        canRedo: mgr.canRedo(),
      });
    },

    revertAISession: () => {
      const mgr = get().commandManager;
      mgr.revertAuthorSession('mcp_agent');
      set({
        design: mgr.getDesign(),
        canUndo: mgr.canUndo(),
        canRedo: mgr.canRedo(),
      });
    },

    addText: (options) => {
      const { design, activePageIndex, executeCommand } = get();
      const page = design.pages[activePageIndex] || design.pages[0];
      const isHindi = options?.language === 'hi' || options?.fontFamily?.includes('Devanagari');

      const textEl: TextElement = {
        id: `el_text_${Date.now()}`,
        type: 'text',
        name: options?.text?.slice(0, 15) || 'Text',
        x: options?.x ?? Math.round((page.width - 500) / 2),
        y: options?.y ?? Math.round(page.height * 0.4),
        width: options?.width ?? 500,
        height: options?.height ?? 80,
        rotation: options?.rotation ?? 0,
        opacity: options?.opacity ?? 1,
        locked: false,
        visible: true,
        zIndex: page.elements.length,
        text: options?.text ?? (isHindi ? 'नया शीर्षक यहाँ लिखें' : 'Add a captivating heading'),
        fontSize: options?.fontSize ?? 42,
        fontFamily: options?.fontFamily ?? (isHindi ? 'Noto Sans Devanagari' : 'Poppins'),
        fontWeight: options?.fontWeight ?? 800,
        textAlign: options?.textAlign ?? 'center',
        fill: options?.fill ?? '#FFFFFF',
        textEffect: options?.textEffect,
        effectColor: options?.effectColor,
        language: options?.language,
      };

      executeCommand(new AddElementCommand(textEl, activePageIndex, { author: 'user' }));
      set({ selectedElementIds: [textEl.id] });
    },

    addShape: (shapeType, options) => {
      const { design, activePageIndex, executeCommand } = get();
      const page = design.pages[activePageIndex] || design.pages[0];

      const shapeEl: ShapeElement = {
        id: `el_shape_${Date.now()}`,
        type: 'shape',
        name: shapeType.toUpperCase(),
        shapeType,
        x: options?.x ?? Math.round((page.width - 240) / 2),
        y: options?.y ?? Math.round((page.height - 240) / 2),
        width: options?.width ?? 240,
        height: options?.height ?? 240,
        rotation: 0,
        opacity: options?.opacity ?? 1,
        locked: false,
        visible: true,
        zIndex: page.elements.length,
        fill: options?.fill ?? '#6366F1',
        stroke: options?.stroke,
        strokeWidth: options?.strokeWidth,
        cornerRadius: options?.cornerRadius ?? (shapeType === 'rect' ? 16 : 0),
        spikes: options?.spikes ?? 5,
      };

      executeCommand(new AddElementCommand(shapeEl, activePageIndex, { author: 'user' }));
      set({ selectedElementIds: [shapeEl.id] });
    },

    addImage: (src, name = 'Image') => {
      const { design, activePageIndex, executeCommand } = get();
      const page = design.pages[activePageIndex] || design.pages[0];

      const imgEl: CanvasElement = {
        id: `el_img_${Date.now()}`,
        type: 'image',
        name,
        src,
        alt: name,
        x: Math.round((page.width - 400) / 2),
        y: Math.round((page.height - 300) / 2),
        width: 400,
        height: 300,
        originalWidth: 800,
        originalHeight: 600,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: page.elements.length,
      } as any;

      executeCommand(new AddElementCommand(imgEl, activePageIndex, { author: 'user' }));
      set({ selectedElementIds: [imgEl.id] });
    },

    addChart: (type = 'bar') => {
      const { design, activePageIndex, executeCommand } = get();
      const page = design.pages[activePageIndex] || design.pages[0];

      const chartEl: CanvasElement = {
        id: `el_chart_${Date.now()}`,
        type: 'chart',
        name: 'Growth Metrics Chart',
        chartType: type,
        x: Math.round((page.width - 600) / 2),
        y: Math.round((page.height - 380) / 2),
        width: 600,
        height: 380,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: page.elements.length,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{ label: 'Revenue ($k)', data: [45, 78, 120, 190, 280, 410], color: '#6366F1' }],
        },
        options: { showLegend: true, showGrid: true },
      } as any;

      executeCommand(new AddElementCommand(chartEl, activePageIndex, { author: 'user' }));
      set({ selectedElementIds: [chartEl.id] });
    },

    addTable: () => {
      const { design, activePageIndex, executeCommand } = get();
      const page = design.pages[activePageIndex] || design.pages[0];

      const tableEl: CanvasElement = {
        id: `el_table_${Date.now()}`,
        type: 'table',
        name: 'Feature Matrix Table',
        rows: 4,
        cols: 3,
        cells: [
          [
            { row: 0, col: 0, text: 'Feature', fontWeight: 'bold' },
            { row: 0, col: 1, text: 'DesignForge Pro', fontWeight: 'bold' },
            { row: 0, col: 2, text: 'Competitors', fontWeight: 'bold' },
          ],
          [
            { row: 1, col: 0, text: 'MCP AI Control' },
            { row: 1, col: 1, text: 'Full Protocol' },
            { row: 1, col: 2, text: 'None' },
          ],
          [
            { row: 2, col: 0, text: '60fps Engine' },
            { row: 2, col: 1, text: 'Vector + WebGL' },
            { row: 2, col: 2, text: 'Standard DOM' },
          ],
          [
            { row: 3, col: 0, text: 'Visual Verification' },
            { row: 3, col: 1, text: 'Self-Healing Loop' },
            { row: 3, col: 2, text: 'Manual Only' },
          ],
        ],
        x: Math.round((page.width - 550) / 2),
        y: Math.round((page.height - 280) / 2),
        width: 550,
        height: 280,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: page.elements.length,
        headerBg: '#1E293B',
        cellBorder: '#334155',
      } as any;

      executeCommand(new AddElementCommand(tableEl, activePageIndex, { author: 'user' }));
      set({ selectedElementIds: [tableEl.id] });
    },

    addQRCode: (url = 'https://designforge.ai') => {
      const { design, activePageIndex, executeCommand } = get();
      const page = design.pages[activePageIndex] || design.pages[0];

      const qrEl: CanvasElement = {
        id: `el_qr_${Date.now()}`,
        type: 'qrcode',
        name: 'QR Code Promo',
        value: url,
        fgColor: '#000000',
        bgColor: '#FFFFFF',
        errorCorrectionLevel: 'M',
        x: Math.round((page.width - 160) / 2),
        y: Math.round((page.height - 160) / 2),
        width: 160,
        height: 160,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: page.elements.length,
      } as any;

      executeCommand(new AddElementCommand(qrEl, activePageIndex, { author: 'user' }));
      set({ selectedElementIds: [qrEl.id] });
    },

    updateSelectedElement: (updates) => {
      const { selectedElementIds, activePageIndex, executeCommand } = get();
      if (selectedElementIds.length === 0) return;

      const cmds = selectedElementIds.map(
        (id) => new UpdateElementCommand(id, updates, activePageIndex, { author: 'user' })
      );
      if (cmds.length === 1) {
        executeCommand(cmds[0]);
      } else {
        executeCommand(new BatchCommand(cmds, { author: 'user', description: 'Update multiple elements' }));
      }
    },

    deleteSelectedElements: () => {
      const { selectedElementIds, activePageIndex, executeCommand } = get();
      if (selectedElementIds.length === 0) return;

      const cmds = selectedElementIds.map(
        (id) => new RemoveElementCommand(id, activePageIndex, { author: 'user' })
      );
      executeCommand(new BatchCommand(cmds, { author: 'user', description: 'Delete elements' }));
      set({ selectedElementIds: [] });
    },

    duplicateSelectedElements: () => {
      const { design, selectedElementIds, activePageIndex, executeCommand } = get();
      const page = design.pages[activePageIndex];
      if (!page || selectedElementIds.length === 0) return;

      const newIds: string[] = [];
      const cmds: any[] = [];

      for (const id of selectedElementIds) {
        const el = page.elements.find((e) => e.id === id);
        if (el) {
          const clone: CanvasElement = JSON.parse(JSON.stringify(el));
          clone.id = `el_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          clone.x += 30;
          clone.y += 30;
          clone.name = `${el.name} (Copy)`;
          newIds.push(clone.id);
          cmds.push(new AddElementCommand(clone, activePageIndex, { author: 'user' }));
        }
      }

      executeCommand(new BatchCommand(cmds, { author: 'user', description: 'Duplicate elements' }));
      set({ selectedElementIds: newIds });
    },

    alignSelected: (action) => {
      const { design, selectedElementIds, activePageIndex, executeCommand } = get();
      const page = design.pages[activePageIndex];
      if (!page || selectedElementIds.length === 0) return;

      const elements = page.elements.filter((e) => selectedElementIds.includes(e.id));
      const aligned = alignElements(elements, action, page.width, page.height);

      const cmds = aligned.map(
        (pos) => new MoveResizeElementCommand(pos.id, { x: pos.x, y: pos.y }, activePageIndex, { author: 'user' })
      );
      executeCommand(new BatchCommand(cmds, { author: 'user', description: `Align elements (${action})` }));
    },

    bringToFront: () => {
      const { selectedElementIds, activePageIndex, executeCommand } = get();
      if (selectedElementIds.length === 0) return;
      executeCommand(new ReorderElementCommand(selectedElementIds[0], 'bring_to_front', activePageIndex, { author: 'user' }));
    },

    sendToBack: () => {
      const { selectedElementIds, activePageIndex, executeCommand } = get();
      if (selectedElementIds.length === 0) return;
      executeCommand(new ReorderElementCommand(selectedElementIds[0], 'send_to_back', activePageIndex, { author: 'user' }));
    },

    groupSelected: () => {
      const { selectedElementIds, activePageIndex, executeCommand } = get();
      if (selectedElementIds.length < 2) return;
      const groupId = `group_${Date.now()}`;
      executeCommand(new GroupElementsCommand(selectedElementIds, activePageIndex, { author: 'user', groupId }));
      set({ selectedElementIds: [groupId] });
    },

    ungroupSelected: () => {
      const { selectedElementIds, activePageIndex, executeCommand } = get();
      if (selectedElementIds.length === 0) return;
      executeCommand(new UngroupElementsCommand(selectedElementIds[0], activePageIndex, { author: 'user' }));
      set({ selectedElementIds: [] });
    },

    applyBrandKit: (kit) => {
      const { executeCommand } = get();
      executeCommand(new ApplyBrandKitCommand(kit, { author: 'user' }));
    },

    resizeDesign: (width, height) => {
      const { executeCommand } = get();
      executeCommand(new ResizeDesignCommand(width, height, true, { author: 'user' }));
    },

    addPage: () => {
      const { design, executeCommand } = get();
      const newPage: Page = {
        id: `page_${Date.now()}`,
        name: `Page ${design.pages.length + 1}`,
        width: design.width,
        height: design.height,
        background: { type: 'color', color: '#0F172A' },
        elements: [],
      };
      executeCommand(new AddPageCommand(newPage, undefined, { author: 'user' }));
      set({ activePageIndex: design.pages.length });
    },

    duplicatePage: (pageId) => {
      const { executeCommand } = get();
      executeCommand(new DuplicatePageCommand(pageId, undefined, { author: 'user' }));
    },

    deletePage: (pageId) => {
      const { design, activePageIndex, executeCommand } = get();
      if (design.pages.length <= 1) return;
      executeCommand(new RemovePageCommand(pageId, { author: 'user' }));
      set({ activePageIndex: Math.max(0, activePageIndex - 1) });
    },

    reorderPages: (pageOrder) => {
      const { executeCommand } = get();
      executeCommand(new ReorderPagesCommand(pageOrder, { author: 'user' }));
    },

    setAgentSession: (session) => set({ agentSession: session }),

    runAgentPlan: async (goal, steps) => {
      const runner = new AutonomousAgentRunner(goal, get().design.id);
      set({ agentRunner: runner, isAgentViewOpen: true });

      runner.subscribe((trace, session) => {
        set({ agentSession: session });
        // Refresh canvas state as agent executes
        if (session.designId) {
          const mgr = get().commandManager;
          // Apply changes reactively
        }
      });

      const finalState = await runner.executePlan(steps, true);
      set({ agentSession: finalState });
    },

    pauseAgent: () => get().agentRunner?.pause(),
    resumeAgent: () => get().agentRunner?.resume(),
    stopAgent: () => get().agentRunner?.stop(),
  };
});
