import { CanvasElement, Design, Page } from '../types.js';
import { CommandDiff, ICommand } from './types.js';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function findPageAndElement(design: Design, pageIdOrIndex: string | number, elementId: string) {
  let page: Page | undefined;
  if (typeof pageIdOrIndex === 'number') {
    page = design.pages[pageIdOrIndex];
  } else {
    page = design.pages.find((p) => p.id === pageIdOrIndex);
  }
  if (!page && design.pages.length > 0) {
    page = design.pages[0];
  }
  const elementIndex = page ? page.elements.findIndex((e) => e.id === elementId) : -1;
  const element = page && elementIndex !== -1 ? page.elements[elementIndex] : undefined;
  return { page, elementIndex, element };
}

export class AddElementCommand implements ICommand {
  id: string;
  name = 'add_element';
  description: string;
  timestamp: number;
  author?: string;
  pageIdOrIndex: string | number;
  element: CanvasElement;

  constructor(
    element: CanvasElement,
    pageIdOrIndex: string | number = 0,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_add_${element.id}_${Date.now()}`;
    this.element = deepClone(element);
    this.pageIdOrIndex = pageIdOrIndex;
    this.author = options?.author;
    this.description = options?.description || `Add element '${element.name}' (${element.type})`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    let page: Page | undefined;
    if (typeof this.pageIdOrIndex === 'number') {
      page = next.pages[this.pageIdOrIndex];
    } else {
      page = next.pages.find((p) => p.id === this.pageIdOrIndex);
    }
    if (!page && next.pages.length > 0) {
      page = next.pages[0];
    }
    if (!page) {
      throw new Error(`Page not found: ${this.pageIdOrIndex}`);
    }

    // Set z-index if not explicitly set
    if (this.element.zIndex === undefined || this.element.zIndex === 0) {
      this.element.zIndex = page.elements.length;
    }

    page.elements.push(deepClone(this.element));
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    const next = deepClone(design);
    let page: Page | undefined;
    if (typeof this.pageIdOrIndex === 'number') {
      page = next.pages[this.pageIdOrIndex];
    } else {
      page = next.pages.find((p) => p.id === this.pageIdOrIndex);
    }
    if (!page && next.pages.length > 0) {
      page = next.pages[0];
    }
    if (page) {
      page.elements = page.elements.filter((e) => e.id !== this.element.id);
    }
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'add_element',
      targetId: this.element.id,
      after: this.element,
      summary: `Added ${this.element.type} '${this.element.name}'`,
    };
  }
}

export class RemoveElementCommand implements ICommand {
  id: string;
  name = 'remove_element';
  description: string;
  timestamp: number;
  author?: string;
  pageIdOrIndex: string | number;
  elementId: string;
  private previousElement?: CanvasElement;
  private previousIndex?: number;

  constructor(
    elementId: string,
    pageIdOrIndex: string | number = 0,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_rem_${elementId}_${Date.now()}`;
    this.elementId = elementId;
    this.pageIdOrIndex = pageIdOrIndex;
    this.author = options?.author;
    this.description = options?.description || `Remove element ${elementId}`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    const { page, elementIndex, element } = findPageAndElement(next, this.pageIdOrIndex, this.elementId);
    if (!page || !element) {
      throw new Error(`Element ${this.elementId} not found in page`);
    }

    this.previousElement = deepClone(element);
    this.previousIndex = elementIndex;
    page.elements.splice(elementIndex, 1);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.previousElement) return design;
    const next = deepClone(design);
    let page: Page | undefined;
    if (typeof this.pageIdOrIndex === 'number') {
      page = next.pages[this.pageIdOrIndex];
    } else {
      page = next.pages.find((p) => p.id === this.pageIdOrIndex);
    }
    if (!page && next.pages.length > 0) {
      page = next.pages[0];
    }
    if (page) {
      const idx = this.previousIndex !== undefined ? this.previousIndex : page.elements.length;
      page.elements.splice(idx, 0, deepClone(this.previousElement));
    }
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'remove_element',
      targetId: this.elementId,
      before: this.previousElement,
      summary: `Removed element ${this.elementId}`,
    };
  }
}

export class UpdateElementCommand implements ICommand {
  id: string;
  name = 'update_element';
  description: string;
  timestamp: number;
  author?: string;
  pageIdOrIndex: string | number;
  elementId: string;
  updates: Partial<CanvasElement>;
  private previousState?: Partial<CanvasElement>;

  constructor(
    elementId: string,
    updates: Partial<CanvasElement>,
    pageIdOrIndex: string | number = 0,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_upd_${elementId}_${Date.now()}`;
    this.elementId = elementId;
    this.updates = deepClone(updates);
    this.pageIdOrIndex = pageIdOrIndex;
    this.author = options?.author;
    this.description = options?.description || `Update element ${elementId}`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    const { page, element } = findPageAndElement(next, this.pageIdOrIndex, this.elementId);
    if (!page || !element) {
      throw new Error(`Element ${this.elementId} not found`);
    }

    // Save previous state for undo
    this.previousState = {};
    for (const key of Object.keys(this.updates) as (keyof CanvasElement)[]) {
      (this.previousState as any)[key] = deepClone(element[key]);
    }

    Object.assign(element, this.updates);
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.previousState) return design;
    const next = deepClone(design);
    const { element } = findPageAndElement(next, this.pageIdOrIndex, this.elementId);
    if (element) {
      Object.assign(element, this.previousState);
    }
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'update_element',
      targetId: this.elementId,
      before: this.previousState,
      after: this.updates,
      summary: `Updated element ${this.elementId} properties: ${Object.keys(this.updates).join(', ')}`,
    };
  }
}

export class MoveResizeElementCommand implements ICommand {
  id: string;
  name = 'move_resize_element';
  description: string;
  timestamp: number;
  author?: string;
  pageIdOrIndex: string | number;
  elementId: string;
  newTransform: { x: number; y: number; width?: number; height?: number; rotation?: number };
  private oldTransform?: { x: number; y: number; width?: number; height?: number; rotation?: number };

  constructor(
    elementId: string,
    newTransform: { x: number; y: number; width?: number; height?: number; rotation?: number },
    pageIdOrIndex: string | number = 0,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_tr_${elementId}_${Date.now()}`;
    this.elementId = elementId;
    this.newTransform = newTransform;
    this.pageIdOrIndex = pageIdOrIndex;
    this.author = options?.author;
    this.description = options?.description || `Transform element ${elementId}`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    const { element } = findPageAndElement(next, this.pageIdOrIndex, this.elementId);
    if (!element) {
      throw new Error(`Element ${this.elementId} not found`);
    }

    this.oldTransform = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
    };

    element.x = this.newTransform.x;
    element.y = this.newTransform.y;
    if (this.newTransform.width !== undefined) element.width = this.newTransform.width;
    if (this.newTransform.height !== undefined) element.height = this.newTransform.height;
    if (this.newTransform.rotation !== undefined) element.rotation = this.newTransform.rotation;

    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.oldTransform) return design;
    const next = deepClone(design);
    const { element } = findPageAndElement(next, this.pageIdOrIndex, this.elementId);
    if (element) {
      element.x = this.oldTransform.x;
      element.y = this.oldTransform.y;
      if (this.oldTransform.width !== undefined) element.width = this.oldTransform.width;
      if (this.oldTransform.height !== undefined) element.height = this.oldTransform.height;
      if (this.oldTransform.rotation !== undefined) element.rotation = this.oldTransform.rotation;
    }
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'move_resize_element',
      targetId: this.elementId,
      before: this.oldTransform,
      after: this.newTransform,
      summary: `Moved/resized ${this.elementId} to (${this.newTransform.x}, ${this.newTransform.y})`,
    };
  }
}

export type ZOrderAction = 'bring_to_front' | 'send_to_back' | 'bring_forward' | 'send_backward';

export class ReorderElementCommand implements ICommand {
  id: string;
  name = 'reorder_element';
  description: string;
  timestamp: number;
  author?: string;
  pageIdOrIndex: string | number;
  elementId: string;
  action: ZOrderAction;
  private oldElementsOrder?: CanvasElement[];

  constructor(
    elementId: string,
    action: ZOrderAction,
    pageIdOrIndex: string | number = 0,
    options?: { author?: string; description?: string }
  ) {
    this.id = `cmd_reorder_${elementId}_${Date.now()}`;
    this.elementId = elementId;
    this.action = action;
    this.pageIdOrIndex = pageIdOrIndex;
    this.author = options?.author;
    this.description = options?.description || `${action.replace(/_/g, ' ')} for ${elementId}`;
    this.timestamp = Date.now();
  }

  execute(design: Design): Design {
    const next = deepClone(design);
    const { page, elementIndex } = findPageAndElement(next, this.pageIdOrIndex, this.elementId);
    if (!page || elementIndex === -1) {
      throw new Error(`Element ${this.elementId} not found`);
    }

    this.oldElementsOrder = deepClone(page.elements);
    const element = page.elements[elementIndex];
    page.elements.splice(elementIndex, 1);

    if (this.action === 'bring_to_front') {
      page.elements.push(element);
    } else if (this.action === 'send_to_back') {
      page.elements.unshift(element);
    } else if (this.action === 'bring_forward') {
      const newIdx = Math.min(page.elements.length, elementIndex + 1);
      page.elements.splice(newIdx, 0, element);
    } else if (this.action === 'send_backward') {
      const newIdx = Math.max(0, elementIndex - 1);
      page.elements.splice(newIdx, 0, element);
    }

    // Re-index zIndex
    page.elements.forEach((el, idx) => {
      el.zIndex = idx;
    });

    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  undo(design: Design): Design {
    if (!this.oldElementsOrder) return design;
    const next = deepClone(design);
    let page: Page | undefined;
    if (typeof this.pageIdOrIndex === 'number') {
      page = next.pages[this.pageIdOrIndex];
    } else {
      page = next.pages.find((p) => p.id === this.pageIdOrIndex);
    }
    if (page) {
      page.elements = deepClone(this.oldElementsOrder);
    }
    next.updatedAt = new Date().toISOString();
    next.version += 1;
    return next;
  }

  getDiff(): CommandDiff {
    return {
      type: 'reorder_element',
      targetId: this.elementId,
      summary: `${this.action.replace(/_/g, ' ')} on ${this.elementId}`,
    };
  }
}
