import { CanvasElement, Design, GroupElement, Page } from '../types.js';
import { CommandDiff, ICommand } from './types.js';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class GroupElementsCommand implements ICommand {
  id: string;
  name = 'group_elements';
  description: string;
  timestamp: number;
  author?: string;
  pageIdOrIndex: string | number;
  elementIds: string[];
  groupId: string;
  private previousElements?: CanvasElement[];

  constructor(
    elementIds: string[],
    pageIdOrIndex: string | number = 0,
    options?: { author?: string; description?: string; groupId?: string }
  ) {
    this.id = `cmd_group_${Date.now()}`;
    this.elementIds = elementIds;
    this.pageIdOrIndex = pageIdOrIndex;
    this.groupId = options?.groupId || `group_${Date.now()}`;
    this.author = options?.author;
    this.description = options?.description || `Group ${elementIds.length} elements`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    let page: Page | undefined =
      typeof this.pageIdOrIndex === 'number' ? next.pages[this.pageIdOrIndex] : next.pages.find((p) => p.id === this.pageIdOrIndex);
    if (!page && next.pages.length > 0) page = next.pages[0];
    if (!page) throw new Error('Page not found');

    this.previousElements = deepClone(page.elements);

    const elementsToGroup = page.elements.filter((e) => this.elementIds.includes(e.id));
    if (elementsToGroup.length < 2) {
      throw new Error('At least 2 elements required to group');
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elementsToGroup.forEach((el) => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });

    const groupElement: GroupElement = {
      id: this.groupId,
      type: 'group',
      name: `Group (${elementsToGroup.length})`,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: page.elements.length,
      childrenIds: this.elementIds,
    };

    page.elements.push(groupElement);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.previousElements) return design;
    const next = deepClone(design);
    let page = typeof this.pageIdOrIndex === 'number' ? next.pages[this.pageIdOrIndex] : next.pages.find((p) => p.id === this.pageIdOrIndex);
    if (!page && next.pages.length > 0) page = next.pages[0];
    if (page) {
      page.elements = deepClone(this.previousElements);
    }
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'group_elements',
      targetId: this.groupId,
      summary: `Grouped elements [${this.elementIds.join(', ')}] into ${this.groupId}`,
    };
  }
}

export class UngroupElementsCommand implements ICommand {
  id: string;
  name = 'ungroup_elements';
  description: string;
  timestamp: number;
  author?: string;
  pageIdOrIndex: string | number;
  groupId: string;
  private previousElements?: CanvasElement[];

  constructor(
    groupId: string,
    pageIdOrIndex: string | number = 0,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_ungroup_${groupId}_${Date.now()}`;
    this.groupId = groupId;
    this.pageIdOrIndex = pageIdOrIndex;
    this.author = options?.author;
    this.description = options?.description || `Ungroup ${groupId}`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    let page = typeof this.pageIdOrIndex === 'number' ? next.pages[this.pageIdOrIndex] : next.pages.find((p) => p.id === this.pageIdOrIndex);
    if (!page && next.pages.length > 0) page = next.pages[0];
    if (!page) throw new Error('Page not found');

    const groupIndex = page.elements.findIndex((e) => e.id === this.groupId && e.type === 'group');
    if (groupIndex === -1) {
      throw new Error(`Group ${this.groupId} not found`);
    }

    this.previousElements = deepClone(page.elements);
    page.elements.splice(groupIndex, 1);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.previousElements) return design;
    const next = deepClone(design);
    let page = typeof this.pageIdOrIndex === 'number' ? next.pages[this.pageIdOrIndex] : next.pages.find((p) => p.id === this.pageIdOrIndex);
    if (!page && next.pages.length > 0) page = next.pages[0];
    if (page) {
      page.elements = deepClone(this.previousElements);
    }
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'ungroup_elements',
      targetId: this.groupId,
      summary: `Ungrouped ${this.groupId}`,
    };
  }
}
