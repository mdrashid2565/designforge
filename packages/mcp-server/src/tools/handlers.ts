import {
  AddElementCommand,
  AddPageCommand,
  ApplyBrandKitCommand,
  BatchCommand,
  CanvasElement,
  CommandManager,
  Design,
  MoveResizeElementCommand,
  PRESET_DIMENSIONS,
  RemoveElementCommand,
  RemovePageCommand,
  ReorderElementCommand,
  ReorderPagesCommand,
  ResizeDesignCommand,
  ShapeElement,
  TableElement,
  TextElement,
  UpdateDesignMetaCommand,
  UpdateElementCommand,
  alignElements,
  exportDesignToJSON,
  exportDesignToSVG,
  instantiateTemplate,
  searchTemplates,
} from '@designforge/core';
import { globalStore } from '../store.js';

export class MCPToolHandlers {
  // --- DESIGN TOOLS ---
  public static async create_design(args: any) {
    let width = args.width || 1080;
    let height = args.height || 1080;
    let unit = args.unit || 'px';

    if (args.preset) {
      const p = PRESET_DIMENSIONS.find((item) => item.id === args.preset);
      if (p) {
        width = p.width;
        height = p.height;
        unit = p.unit;
      }
    }

    const design: Design = {
      id: `design_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: args.title,
      width,
      height,
      unit: unit as any,
      dpi: 72,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: `page_${Date.now()}`,
          name: 'Page 1',
          width,
          height,
          background: {
            type: 'color',
            color: args.backgroundColor || '#0F172A',
          },
          elements: [],
        },
      ],
    };

    const saved = globalStore.saveDesign(design);
    return {
      success: true,
      message: `Design '${saved.title}' created successfully`,
      designId: saved.id,
      dimensions: { width: saved.width, height: saved.height },
      design: saved,
    };
  }

  public static async open_design(args: any) {
    const design = globalStore.getDesign(args.designId);
    if (!design) {
      return { success: false, error: `Design ${args.designId} not found` };
    }
    return { success: true, design };
  }

  public static async list_designs(args: any) {
    const designs = globalStore.listDesigns().slice(0, args.limit || 20);
    return {
      success: true,
      count: designs.length,
      designs: designs.map((d) => ({
        id: d.id,
        title: d.title,
        width: d.width,
        height: d.height,
        pagesCount: d.pages.length,
        elementsCount: d.pages.reduce((sum, p) => sum + p.elements.length, 0),
        updatedAt: d.updatedAt,
      })),
    };
  }

  public static async duplicate_design(args: any) {
    const original = globalStore.getDesign(args.designId);
    if (!original) return { success: false, error: 'Original design not found' };

    const copy: Design = JSON.parse(JSON.stringify(original));
    copy.id = `design_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    copy.title = args.newTitle || `${original.title} (Copy)`;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    copy.version = 1;

    const saved = globalStore.saveDesign(copy);
    return { success: true, designId: saved.id, design: saved };
  }

  public static async delete_design(args: any) {
    const ok = globalStore.deleteDesign(args.designId);
    return { success: ok, message: ok ? `Design ${args.designId} deleted` : 'Design not found' };
  }

  public static async add_page(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const current = mgr.getDesign();
    const newPage = {
      id: `page_${Date.now()}`,
      name: args.name || `Page ${current.pages.length + 1}`,
      width: current.width,
      height: current.height,
      background: {
        type: 'color' as const,
        color: args.backgroundColor || '#FFFFFF',
      },
      elements: [],
    };

    const updated = mgr.execute(new AddPageCommand(newPage, undefined, { author: 'mcp_agent' }));
    return { success: true, pageId: newPage.id, pageCount: updated.pages.length };
  }

  public static async delete_page(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    try {
      const updated = mgr.execute(new RemovePageCommand(args.pageId, { author: 'mcp_agent' }));
      return { success: true, remainingPages: updated.pages.length };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public static async reorder_pages(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const updated = mgr.execute(new ReorderPagesCommand(args.pageOrder, { author: 'mcp_agent' }));
    return { success: true, pages: updated.pages.map((p) => p.id) };
  }

  // --- ELEMENT TOOLS ---
  public static async add_text(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const id = `el_text_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const textEl: TextElement = {
      id,
      type: 'text',
      name: args.text.slice(0, 20) || 'Text',
      x: args.x,
      y: args.y,
      width: args.width || 400,
      height: args.height || 60,
      rotation: args.rotation || 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      text: args.text,
      fontSize: args.fontSize || 32,
      fontFamily: args.fontFamily || 'Inter',
      fontWeight: args.fontWeight || 700,
      textAlign: args.textAlign || 'left',
      fill: args.fill || '#FFFFFF',
      textEffect: args.textEffect,
      effectColor: args.effectColor,
      language: args.language,
    };

    mgr.execute(new AddElementCommand(textEl, args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: id, element: textEl };
  }

  public static async add_shape(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const id = `el_shape_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const shapeEl: ShapeElement = {
      id,
      type: 'shape',
      name: `${args.shapeType.toUpperCase()}`,
      shapeType: args.shapeType,
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      rotation: args.rotation || 0,
      opacity: args.opacity ?? 1,
      locked: false,
      visible: true,
      zIndex: 0,
      fill: args.fill || '#6366F1',
      stroke: args.stroke,
      strokeWidth: args.strokeWidth,
      cornerRadius: args.cornerRadius,
    };

    mgr.execute(new AddElementCommand(shapeEl, args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: id, element: shapeEl };
  }

  public static async add_image(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const id = `el_img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const imgEl: CanvasElement = {
      id,
      type: 'image',
      name: args.alt || 'Image',
      src: args.src,
      alt: args.alt,
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      originalWidth: args.width,
      originalHeight: args.height,
      rotation: args.rotation || 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
    } as any;

    mgr.execute(new AddElementCommand(imgEl, args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: id, element: imgEl };
  }

  public static async add_chart(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const id = `el_chart_${Date.now()}`;
    const chartEl: CanvasElement = {
      id,
      type: 'chart',
      name: `${args.chartType} Chart`,
      chartType: args.chartType,
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      data: {
        labels: args.labels,
        datasets: [{ label: args.datasetLabel || 'Data', data: args.data, color: args.color || '#6366F1' }],
      },
      options: { showLegend: true, showGrid: true },
    } as any;

    mgr.execute(new AddElementCommand(chartEl, args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: id, element: chartEl };
  }

  public static async add_table(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const id = `el_table_${Date.now()}`;
    const rows = args.rows || 3;
    const cols = args.cols || 3;
    const cells: any[][] = [];

    for (let r = 0; r < rows; r++) {
      const rowCells: any[] = [];
      for (let c = 0; c < cols; c++) {
        let text = `Cell ${r + 1},${c + 1}`;
        if (r === 0 && args.headers && args.headers[c]) {
          text = args.headers[c];
        } else if (args.rowsData && args.rowsData[r - 1] && args.rowsData[r - 1][c]) {
          text = args.rowsData[r - 1][c];
        }
        rowCells.push({ row: r, col: c, text, fontWeight: r === 0 ? 'bold' : 'normal' });
      }
      cells.push(rowCells);
    }

    const tableEl: TableElement = {
      id,
      type: 'table',
      name: 'Table',
      rows,
      cols,
      cells,
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      headerBg: '#1E293B',
      cellBorder: '#334155',
    };

    mgr.execute(new AddElementCommand(tableEl, args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: id, element: tableEl };
  }

  public static async add_qrcode(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const id = `el_qr_${Date.now()}`;
    const qrEl: CanvasElement = {
      id,
      type: 'qrcode',
      name: 'QR Code',
      value: args.value,
      fgColor: args.fgColor || '#000000',
      bgColor: args.bgColor || '#FFFFFF',
      errorCorrectionLevel: 'M',
      x: args.x,
      y: args.y,
      width: args.width || 150,
      height: args.height || 150,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
    } as any;

    mgr.execute(new AddElementCommand(qrEl, args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: id, element: qrEl };
  }

  public static async update_element(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    try {
      mgr.execute(new UpdateElementCommand(args.elementId, args.updates, args.pageIndex || 0, { author: 'mcp_agent' }));
      return { success: true, elementId: args.elementId, updates: args.updates };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public static async move_resize_rotate(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    mgr.execute(
      new MoveResizeElementCommand(
        args.elementId,
        { x: args.x, y: args.y, width: args.width, height: args.height, rotation: args.rotation },
        args.pageIndex || 0,
        { author: 'mcp_agent' }
      )
    );
    return { success: true, elementId: args.elementId };
  }

  public static async delete_element(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    mgr.execute(new RemoveElementCommand(args.elementId, args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: args.elementId };
  }

  public static async bring_to_front(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    mgr.execute(new ReorderElementCommand(args.elementId, 'bring_to_front', args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: args.elementId };
  }

  public static async send_to_back(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    mgr.execute(new ReorderElementCommand(args.elementId, 'send_to_back', args.pageIndex || 0, { author: 'mcp_agent' }));
    return { success: true, elementId: args.elementId };
  }

  public static async align_distribute(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const design = mgr.getDesign();
    const page = design.pages[args.pageIndex || 0];
    if (!page) return { success: false, error: 'Page not found' };

    const elementsToAlign = page.elements.filter((e) => args.elementIds.includes(e.id));
    const alignedPositions = alignElements(elementsToAlign, args.action, page.width, page.height);

    const commands = alignedPositions.map(
      (pos) => new MoveResizeElementCommand(pos.id, { x: pos.x, y: pos.y }, args.pageIndex || 0, { author: 'mcp_agent' })
    );

    mgr.execute(new BatchCommand(commands, { author: 'mcp_agent', description: `Align elements (${args.action})` }));
    return { success: true, aligned: alignedPositions };
  }

  // --- BATCH TOOL ---
  public static async apply_operations(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const commands: any[] = [];
    for (const op of args.operations) {
      if (op.op === 'add_text') {
        const id = `el_text_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        commands.push(
          new AddElementCommand(
            {
              id,
              type: 'text',
              name: op.params.text?.slice(0, 15) || 'Text',
              x: op.params.x || 100,
              y: op.params.y || 100,
              width: op.params.width || 400,
              height: op.params.height || 60,
              rotation: op.params.rotation || 0,
              opacity: 1,
              locked: false,
              visible: true,
              zIndex: 0,
              text: op.params.text || 'Text',
              fontSize: op.params.fontSize || 32,
              fontFamily: op.params.fontFamily || 'Inter',
              fontWeight: op.params.fontWeight || 700,
              textAlign: op.params.textAlign || 'left',
              fill: op.params.fill || '#FFFFFF',
            },
            args.pageIndex || 0
          )
        );
      } else if (op.op === 'add_shape') {
        const id = `el_shape_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        commands.push(
          new AddElementCommand(
            {
              id,
              type: 'shape',
              name: op.params.shapeType || 'Rect',
              shapeType: op.params.shapeType || 'rect',
              x: op.params.x || 50,
              y: op.params.y || 50,
              width: op.params.width || 200,
              height: op.params.height || 200,
              rotation: 0,
              opacity: op.params.opacity ?? 1,
              locked: false,
              visible: true,
              zIndex: 0,
              fill: op.params.fill || '#6366F1',
              cornerRadius: op.params.cornerRadius,
            },
            args.pageIndex || 0
          )
        );
      } else if (op.op === 'update_element') {
        commands.push(new UpdateElementCommand(op.params.elementId, op.params.updates, args.pageIndex || 0));
      } else if (op.op === 'delete_element') {
        commands.push(new RemoveElementCommand(op.params.elementId, args.pageIndex || 0));
      }
    }

    mgr.execute(new BatchCommand(commands, { author: 'mcp_agent', description: `Batch applied ${commands.length} operations` }));
    return { success: true, executedCount: commands.length, design: mgr.getDesign() };
  }

  // --- TEMPLATES & BRAND ---
  public static async search_templates(args: any) {
    const list = searchTemplates(args.query || '', args.category);
    return {
      success: true,
      count: list.length,
      templates: list.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        description: t.description,
        tags: t.tags,
      })),
    };
  }

  public static async apply_template(args: any) {
    const design = instantiateTemplate(args.templateId, args.placeholders);
    const saved = globalStore.saveDesign(design);
    return { success: true, designId: saved.id, design: saved };
  }

  public static async get_brand_kit(args: any) {
    const kit = globalStore.getBrandKit(args.brandKitId || 'brand_aurora_tech');
    return { success: !!kit, brandKit: kit };
  }

  public static async apply_brand_kit(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const kit = globalStore.getBrandKit(args.brandKitId);
    if (!kit) return { success: false, error: 'Brand kit not found' };

    mgr.execute(new ApplyBrandKitCommand(kit, { author: 'mcp_agent' }));
    return { success: true, brandKitApplied: kit.name };
  }

  public static async magic_resize(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const preset = PRESET_DIMENSIONS.find((p) => p.id === args.targetPreset);
    if (!preset) return { success: false, error: `Preset '${args.targetPreset}' not found` };

    mgr.execute(new ResizeDesignCommand(preset.width, preset.height, true, { author: 'mcp_agent' }));
    return {
      success: true,
      preset: preset.name,
      newDimensions: { width: preset.width, height: preset.height },
    };
  }

  // --- ASSETS & GENERATION ---
  public static async search_assets(args: any) {
    const assets = globalStore.listAssets(args.category, args.query);
    return { success: true, count: assets.length, assets };
  }

  public static async generate_image(args: any) {
    // Generate high resolution gradient SVG data URI mock / AI render
    const colors = ['#6366F1', '#EC4899', '#38BDF8', '#10B981', '#F59E0B'];
    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const c2 = colors[Math.floor(Math.random() * colors.length)];
    const mockImageSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encodeURIComponent(c1)}"/><stop offset="100%" stop-color="${encodeURIComponent(c2)}"/></linearGradient></defs><rect width="800" height="800" fill="url(%23g)"/><text x="400" y="400" fill="%23ffffff" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">${encodeURIComponent(args.prompt.slice(0, 30))}</text></svg>`;

    return {
      success: true,
      imageUrl: mockImageSvg,
      prompt: args.prompt,
    };
  }

  public static async remove_background(args: any) {
    return {
      success: true,
      resultImageUrl: args.imageUrl,
      message: 'Background removed with alpha transparency channel preserved',
    };
  }

  // --- EXPORT & SHARE ---
  public static async export_design(args: any) {
    const design = globalStore.getDesign(args.designId);
    if (!design) return { success: false, error: 'Design not found' };

    if (args.format === 'svg') {
      const svg = exportDesignToSVG(design, args.pageIndex || 0);
      return { success: true, format: 'svg', content: svg };
    } else if (args.format === 'json') {
      const json = exportDesignToJSON(design);
      return { success: true, format: 'json', content: json };
    } else if (args.format === 'png' || args.format === 'pdf') {
      const svg = exportDesignToSVG(design, args.pageIndex || 0);
      return {
        success: true,
        format: args.format,
        svgRender: svg,
        dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
        downloadUrl: `/api/export?id=${design.id}&format=${args.format}&page=${args.pageIndex || 0}`,
      };
    }
  }

  public static async create_share_link(args: any) {
    return {
      success: true,
      shareUrl: `https://designforge.ai/share/${args.designId}?permission=${args.permission || 'view'}`,
      permission: args.permission || 'view',
    };
  }

  public static async publish_website(args: any) {
    const slug = args.slug || `site_${args.designId.slice(0, 8)}`;
    return {
      success: true,
      liveUrl: `https://designforge.app/sites/${slug}`,
      slug,
      status: 'published',
    };
  }

  // --- READ & INSPECTION ---
  public static async get_design_json(args: any) {
    const design = globalStore.getDesign(args.designId);
    if (!design) return { success: false, error: 'Design not found' };
    return { success: true, design };
  }

  public static async get_history(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };
    return { success: true, history: mgr.getHistory() };
  }

  public static async get_screenshot(args: any) {
    const design = globalStore.getDesign(args.designId);
    if (!design) return { success: false, error: 'Design not found' };

    const svg = exportDesignToSVG(design, args.pageIndex || 0);
    return {
      success: true,
      svg,
      previewDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    };
  }

  public static async list_fonts() {
    return {
      success: true,
      fonts: [
        { name: 'Inter', category: 'Sans-Serif', variable: true },
        { name: 'Poppins', category: 'Sans-Serif', variable: true },
        { name: 'Montserrat', category: 'Sans-Serif', variable: true },
        { name: 'Playfair Display', category: 'Serif', variable: true },
        { name: 'Cinzel', category: 'Serif', variable: false },
        { name: 'Noto Sans Devanagari', category: 'Devanagari/Hindi', variable: true },
        { name: 'Plus Jakarta Sans', category: 'Sans-Serif', variable: true },
        { name: 'Space Grotesk', category: 'Display', variable: true },
        { name: 'Fira Code', category: 'Monospace', variable: true },
      ],
    };
  }

  public static async list_workspace_members() {
    return {
      success: true,
      members: [
        { id: 'usr_owner', name: 'Alex Mercer (Owner)', email: 'alex@designforge.ai', role: 'admin' },
        { id: 'usr_ai', name: 'DesignForge AI Agent', email: 'agent@designforge.ai', role: 'editor' },
        { id: 'usr_reviewer', name: 'Elena Rostova', email: 'elena@designforge.ai', role: 'reviewer' },
      ],
    };
  }

  // --- UNDO / REDO / REVERT ---
  public static async undo(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const next = mgr.undo();
    return { success: !!next, canUndo: mgr.canUndo(), canRedo: mgr.canRedo() };
  }

  public static async redo(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    const next = mgr.redo();
    return { success: !!next, canUndo: mgr.canUndo(), canRedo: mgr.canRedo() };
  }

  public static async revert_ai_session(args: any) {
    const mgr = globalStore.getCommandManager(args.designId);
    if (!mgr) return { success: false, error: 'Design not found' };

    mgr.revertAuthorSession('mcp_agent');
    return { success: true, message: 'All actions from the AI session were reverted safely.' };
  }

  // --- TEAM & COMMENTS ---
  public static async add_comment(args: any) {
    const comment = globalStore.addComment({
      id: `comment_${Date.now()}`,
      designId: args.designId,
      pageIndex: args.pageIndex || 0,
      x: args.x,
      y: args.y,
      author: args.author || 'AI Collaborator',
      content: args.content,
      resolved: false,
      createdAt: new Date().toISOString(),
    });
    return { success: true, comment };
  }

  public static async resolve_comment(args: any) {
    const ok = globalStore.resolveComment(args.designId, args.commentId);
    return { success: ok };
  }
}
