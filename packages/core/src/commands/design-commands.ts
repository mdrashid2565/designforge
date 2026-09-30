import { BrandKit, Design } from '../types.js';
import { CommandDiff, ICommand } from './types.js';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class ResizeDesignCommand implements ICommand {
  id: string;
  name = 'resize_design';
  description: string;
  timestamp: number;
  author?: string;
  newWidth: number;
  newHeight: number;
  smartScale: boolean;
  private oldWidth?: number;
  private oldHeight?: number;
  private oldPages?: any[];

  constructor(
    newWidth: number,
    newHeight: number,
    smartScale: boolean = true,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_resize_${Date.now()}`;
    this.newWidth = newWidth;
    this.newHeight = newHeight;
    this.smartScale = smartScale;
    this.author = options?.author;
    this.description = options?.description || `Resize design to ${newWidth}x${newHeight}`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    this.oldWidth = next.width;
    this.oldHeight = next.height;
    this.oldPages = deepClone(next.pages);

    const scaleX = this.newWidth / next.width;
    const scaleY = this.newHeight / next.height;

    next.width = this.newWidth;
    next.height = this.newHeight;

    if (this.smartScale) {
      for (const page of next.pages) {
        page.width = this.newWidth;
        page.height = this.newHeight;

        for (const element of page.elements) {
          element.x = Math.round(element.x * scaleX);
          element.y = Math.round(element.y * scaleY);
          element.width = Math.max(10, Math.round(element.width * scaleX));
          element.height = Math.max(10, Math.round(element.height * scaleY));

          if (element.type === 'text') {
            const fontScale = (scaleX + scaleY) / 2;
            element.fontSize = Math.max(8, Math.round(element.fontSize * fontScale));
          }
        }
      }
    } else {
      for (const page of next.pages) {
        page.width = this.newWidth;
        page.height = this.newHeight;
      }
    }

    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.oldWidth || !this.oldHeight || !this.oldPages) return design;
    const next = deepClone(design);
    next.width = this.oldWidth;
    next.height = this.oldHeight;
    next.pages = deepClone(this.oldPages);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'resize_design',
      targetId: 'design',
      before: { width: this.oldWidth, height: this.oldHeight },
      after: { width: this.newWidth, height: this.newHeight },
      summary: `Resized canvas from ${this.oldWidth}x${this.oldHeight} to ${this.newWidth}x${this.newHeight}`,
    };
  }
}

export class UpdateDesignMetaCommand implements ICommand {
  id: string;
  name = 'update_design_meta';
  description: string;
  timestamp: number;
  author?: string;
  updates: { title?: string; unit?: 'px' | 'mm' | 'in'; dpi?: number; metadata?: any };
  private oldMeta?: any;

  constructor(
    updates: { title?: string; unit?: 'px' | 'mm' | 'in'; dpi?: number; metadata?: any },
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_meta_${Date.now()}`;
    this.updates = deepClone(updates);
    this.author = options?.author;
    this.description = options?.description || 'Update design metadata';
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    this.oldMeta = {
      title: next.title,
      unit: next.unit,
      dpi: next.dpi,
      metadata: deepClone(next.metadata),
    };

    if (this.updates.title) next.title = this.updates.title;
    if (this.updates.unit) next.unit = this.updates.unit;
    if (this.updates.dpi) next.dpi = this.updates.dpi;
    if (this.updates.metadata) {
      next.metadata = { ...next.metadata, ...this.updates.metadata };
    }

    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.oldMeta) return design;
    const next = deepClone(design);
    next.title = this.oldMeta.title;
    next.unit = this.oldMeta.unit;
    next.dpi = this.oldMeta.dpi;
    next.metadata = deepClone(this.oldMeta.metadata);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'update_design_meta',
      targetId: 'design',
      before: this.oldMeta,
      after: this.updates,
      summary: `Updated design metadata`,
    };
  }
}

export class ApplyBrandKitCommand implements ICommand {
  id: string;
  name = 'apply_brand_kit';
  description: string;
  timestamp: number;
  author?: string;
  brandKit: BrandKit;
  private oldState?: Design;

  constructor(
    brandKit: BrandKit,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_brand_${Date.now()}`;
    this.brandKit = deepClone(brandKit);
    this.author = options?.author;
    this.description = options?.description || `Apply brand kit '${brandKit.name}'`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    this.oldState = deepClone(design);
    next.brandKitId = this.brandKit.id;

    for (const page of next.pages) {
      if (page.background.type === 'color' && this.brandKit.palette.background) {
        page.background.color = this.brandKit.palette.background;
      }

      for (const el of page.elements) {
        if (el.type === 'text') {
          if (el.fontSize >= 32 && this.brandKit.fonts.heading) {
            el.fontFamily = this.brandKit.fonts.heading;
          } else if (el.fontSize >= 20 && this.brandKit.fonts.subheading) {
            el.fontFamily = this.brandKit.fonts.subheading;
          } else if (this.brandKit.fonts.body) {
            el.fontFamily = this.brandKit.fonts.body;
          }

          if (typeof el.fill === 'string') {
            el.fill = this.brandKit.palette.text || '#111827';
          }
        } else if (el.type === 'shape') {
          if (typeof el.fill === 'string') {
            el.fill = this.brandKit.palette.primary || '#3B82F6';
          }
        }
      }
    }

    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.oldState) return design;
    return deepClone(this.oldState);
  }

  getDiff(): CommandDiff {
    return {
      type: 'apply_brand_kit',
      targetId: this.brandKit.id,
      summary: `Applied brand kit '${this.brandKit.name}'`,
    };
  }
}
