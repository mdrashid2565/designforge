import {
  BrandKit,
  CanvasElement,
  CommandManager,
  DEFAULT_BRAND_KITS,
  Design,
  TEMPLATE_LIBRARY,
  instantiateTemplate,
} from '@designforge/core';

export interface CanvasComment {
  id: string;
  designId: string;
  pageIndex: number;
  x: number;
  y: number;
  author: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  replies?: { id: string; author: string; content: string; createdAt: string }[];
}

export interface StockAsset {
  id: string;
  name: string;
  category: 'photos' | 'illustrations' | 'icons' | 'videos' | 'audio';
  url: string;
  thumbnailUrl: string;
  tags: string[];
}

export class MCPDesignStore {
  private designs: Map<string, { design: Design; manager: CommandManager }> = new Map();
  private brandKits: Map<string, BrandKit> = new Map();
  private comments: Map<string, CanvasComment[]> = new Map();
  private assets: StockAsset[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Seed default brand kits
    for (const b of DEFAULT_BRAND_KITS) {
      this.brandKits.set(b.id, b);
    }

    // Seed stock assets
    this.assets = [
      {
        id: 'asset_tech_bg_1',
        name: 'Abstract Dark Cyber Gradient',
        category: 'photos',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366F1"/><stop offset="100%" stop-color="%23EC4899"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g)"/></svg>',
        thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%236366F1"><rect width="100" height="100"/></svg>',
        tags: ['technology', 'abstract', 'gradient', 'purple', 'ai'],
      },
      {
        id: 'asset_icon_sparkles',
        name: 'Sparkles AI Icon',
        category: 'icons',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23F59E0B" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        thumbnailUrl: '',
        tags: ['icon', 'ai', 'magic', 'star', 'sparkle'],
      },
      {
        id: 'asset_icon_check',
        name: 'Shield Verified Icon',
        category: 'icons',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%2310B981" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
        thumbnailUrl: '',
        tags: ['icon', 'security', 'check', 'verified'],
      },
    ];

    // Seed default designs from template library
    for (const tmpl of TEMPLATE_LIBRARY) {
      const design = instantiateTemplate(tmpl.id);
      this.saveDesign(design);
    }
  }

  public saveDesign(design: Design): Design {
    let entry = this.designs.get(design.id);
    if (!entry) {
      const manager = new CommandManager(design);
      this.designs.set(design.id, { design, manager });
    } else {
      entry.manager.setDesign(design);
      entry.design = entry.manager.getDesign();
    }
    return this.getDesign(design.id)!;
  }

  public getDesign(id: string): Design | undefined {
    const entry = this.designs.get(id);
    return entry ? entry.manager.getDesign() : undefined;
  }

  public getCommandManager(id: string): CommandManager | undefined {
    const entry = this.designs.get(id);
    return entry ? entry.manager : undefined;
  }

  public listDesigns(): Design[] {
    return Array.from(this.designs.values()).map((e) => e.manager.getDesign());
  }

  public deleteDesign(id: string): boolean {
    return this.designs.delete(id);
  }

  public getBrandKit(id: string): BrandKit | undefined {
    return this.brandKits.get(id);
  }

  public listBrandKits(): BrandKit[] {
    return Array.from(this.brandKits.values());
  }

  public saveBrandKit(kit: BrandKit): BrandKit {
    this.brandKits.set(kit.id, kit);
    return kit;
  }

  public addComment(comment: CanvasComment): CanvasComment {
    const list = this.comments.get(comment.designId) || [];
    list.push(comment);
    this.comments.set(comment.designId, list);
    return comment;
  }

  public getComments(designId: string): CanvasComment[] {
    return this.comments.get(designId) || [];
  }

  public resolveComment(designId: string, commentId: string): boolean {
    const list = this.comments.get(designId);
    if (!list) return false;
    const c = list.find((item) => item.id === commentId);
    if (c) {
      c.resolved = true;
      return true;
    }
    return false;
  }

  public listAssets(category?: string, query?: string): StockAsset[] {
    let res = this.assets;
    if (category && category !== 'all') {
      res = res.filter((a) => a.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      res = res.filter((a) => a.name.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)));
    }
    return res;
  }

  public addAsset(asset: StockAsset): StockAsset {
    this.assets.push(asset);
    return asset;
  }
}

export const globalStore = new MCPDesignStore();
