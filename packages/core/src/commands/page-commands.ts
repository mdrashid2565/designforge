import { Design, Page } from '../types.js';
import { CommandDiff, ICommand } from './types.js';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class AddPageCommand implements ICommand {
  id: string;
  name = 'add_page';
  description: string;
  timestamp: number;
  author?: string;
  page: Page;
  insertIndex?: number;

  constructor(
    page: Page,
    insertIndex?: number,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_addpage_${page.id}_${Date.now()}`;
    this.page = deepClone(page);
    this.insertIndex = insertIndex;
    this.author = options?.author;
    this.description = options?.description || `Add page '${page.name}'`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    if (this.insertIndex !== undefined && this.insertIndex >= 0 && this.insertIndex <= next.pages.length) {
      next.pages.splice(this.insertIndex, 0, deepClone(this.page));
    } else {
      next.pages.push(deepClone(this.page));
    }
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    const next = deepClone(design);
    if (next.pages.length <= 1) {
      // Don't remove if only 1 page left
      return design;
    }
    next.pages = next.pages.filter((p) => p.id !== this.page.id);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'add_page',
      targetId: this.page.id,
      after: this.page,
      summary: `Added page '${this.page.name}'`,
    };
  }
}

export class RemovePageCommand implements ICommand {
  id: string;
  name = 'remove_page';
  description: string;
  timestamp: number;
  author?: string;
  pageId: string;
  private previousPage?: Page;
  private previousIndex?: number;

  constructor(
    pageId: string,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_rempage_${pageId}_${Date.now()}`;
    this.pageId = pageId;
    this.author = options?.author;
    this.description = options?.description || `Remove page ${pageId}`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    if (design.pages.length <= 1) {
      throw new Error('Cannot delete the only page in a design');
    }
    const next = deepClone(design);
    const index = next.pages.findIndex((p) => p.id === this.pageId);
    if (index === -1) {
      throw new Error(`Page ${this.pageId} not found`);
    }

    this.previousPage = deepClone(next.pages[index]);
    this.previousIndex = index;
    next.pages.splice(index, 1);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.previousPage || this.previousIndex === undefined) return design;
    const next = deepClone(design);
    next.pages.splice(this.previousIndex, 0, deepClone(this.previousPage));
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'remove_page',
      targetId: this.pageId,
      before: this.previousPage,
      summary: `Removed page ${this.pageId}`,
    };
  }
}

export class ReorderPagesCommand implements ICommand {
  id: string;
  name = 'reorder_pages';
  description: string;
  timestamp: number;
  author?: string;
  newPageOrder: string[]; // array of page ids
  private oldPageOrder?: Page[];

  constructor(
    newPageOrder: string[],
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_reorderpages_${Date.now()}`;
    this.newPageOrder = newPageOrder;
    this.author = options?.author;
    this.description = options?.description || 'Reorder pages';
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    this.oldPageOrder = deepClone(next.pages);

    const reordered: Page[] = [];
    for (const id of this.newPageOrder) {
      const page = next.pages.find((p) => p.id === id);
      if (page) reordered.push(page);
    }
    // Include any pages not in newPageOrder at the end
    for (const page of next.pages) {
      if (!reordered.find((p) => p.id === page.id)) {
        reordered.push(page);
      }
    }

    next.pages = reordered;
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.oldPageOrder) return design;
    const next = deepClone(design);
    next.pages = deepClone(this.oldPageOrder);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'reorder_pages',
      targetId: 'pages',
      after: this.newPageOrder,
      summary: `Reordered pages: [${this.newPageOrder.join(', ')}]`,
    };
  }
}

export class DuplicatePageCommand implements ICommand {
  id: string;
  name = 'duplicate_page';
  description: string;
  timestamp: number;
  author?: string;
  sourcePageId: string;
  newPageId: string;

  constructor(
    sourcePageId: string,
    newPageId?: string,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_duppage_${Date.now()}`;
    this.sourcePageId = sourcePageId;
    this.newPageId = newPageId || `page_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.author = options?.author;
    this.description = options?.description || `Duplicate page ${sourcePageId}`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    const sourceIndex = next.pages.findIndex((p) => p.id === this.sourcePageId);
    if (sourceIndex === -1) throw new Error(`Source page ${this.sourcePageId} not found`);

    const source = next.pages[sourceIndex];
    const duplicated: Page = {
      ...deepClone(source),
      id: this.newPageId,
      name: `${source.name} (Copy)`,
      elements: source.elements.map((el) => ({
        ...deepClone(el),
        id: `el_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      })),
    };

    next.pages.splice(sourceIndex + 1, 0, duplicated);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    const next = deepClone(design);
    next.pages = next.pages.filter((p) => p.id !== this.newPageId);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'duplicate_page',
      targetId: this.newPageId,
      summary: `Duplicated page ${this.sourcePageId} to ${this.newPageId}`,
    };
  }
}
