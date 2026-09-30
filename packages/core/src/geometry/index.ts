import { CanvasElement } from '../types.js';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  label?: string;
  elementsInvolved: string[];
}

export function getElementBoundingBox(element: CanvasElement): BoundingBox {
  const minX = element.x;
  const minY = element.y;
  const maxX = element.x + element.width;
  const maxY = element.y + element.height;
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: element.width,
    height: element.height,
    centerX: element.x + element.width / 2,
    centerY: element.y + element.height / 2,
  };
}

export function getMultiElementBoundingBox(elements: CanvasElement[]): BoundingBox {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

export type AlignmentType =
  | 'align_left'
  | 'align_center'
  | 'align_right'
  | 'align_top'
  | 'align_middle'
  | 'align_bottom'
  | 'distribute_horizontally'
  | 'distribute_vertically';

export function alignElements(
  elements: CanvasElement[],
  alignment: AlignmentType,
  canvasWidth: number,
  canvasHeight: number
): { id: string; x: number; y: number }[] {
  if (elements.length === 0) return [];

  // If only 1 element, align against canvas bounds
  if (elements.length === 1) {
    const el = elements[0];
    let x = el.x;
    let y = el.y;

    switch (alignment) {
      case 'align_left':
        x = 0;
        break;
      case 'align_center':
        x = Math.round((canvasWidth - el.width) / 2);
        break;
      case 'align_right':
        x = canvasWidth - el.width;
        break;
      case 'align_top':
        y = 0;
        break;
      case 'align_middle':
        y = Math.round((canvasHeight - el.height) / 2);
        break;
      case 'align_bottom':
        y = canvasHeight - el.height;
        break;
    }
    return [{ id: el.id, x, y }];
  }

  // Multi-element alignment based on collective bounding box
  const box = getMultiElementBoundingBox(elements);
  const results: { id: string; x: number; y: number }[] = [];

  switch (alignment) {
    case 'align_left':
      return elements.map((e) => ({ id: e.id, x: box.minX, y: e.y }));
    case 'align_center':
      return elements.map((e) => ({ id: e.id, x: Math.round(box.centerX - e.width / 2), y: e.y }));
    case 'align_right':
      return elements.map((e) => ({ id: e.id, x: box.maxX - e.width, y: e.y }));
    case 'align_top':
      return elements.map((e) => ({ id: e.id, x: e.x, y: box.minY }));
    case 'align_middle':
      return elements.map((e) => ({ id: e.id, x: e.x, y: Math.round(box.centerY - e.height / 2) }));
    case 'align_bottom':
      return elements.map((e) => ({ id: e.id, x: e.x, y: box.maxY - e.height }));

    case 'distribute_horizontally': {
      const sorted = [...elements].sort((a, b) => a.x - b.x);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalElementsWidth = sorted.reduce((sum, e) => sum + e.width, 0);
      const span = last.x + last.width - first.x;
      const totalGap = span - totalElementsWidth;
      const gap = totalGap / (sorted.length - 1);

      let currentX = first.x;
      return sorted.map((e) => {
        const res = { id: e.id, x: Math.round(currentX), y: e.y };
        currentX += e.width + gap;
        return res;
      });
    }

    case 'distribute_vertically': {
      const sorted = [...elements].sort((a, b) => a.y - b.y);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalElementsHeight = sorted.reduce((sum, e) => sum + e.height, 0);
      const span = last.y + last.height - first.y;
      const totalGap = span - totalElementsHeight;
      const gap = totalGap / (sorted.length - 1);

      let currentY = first.y;
      return sorted.map((e) => {
        const res = { id: e.id, x: e.x, y: Math.round(currentY) };
        currentY += e.height + gap;
        return res;
      });
    }

    default:
      return elements.map((e) => ({ id: e.id, x: e.x, y: e.y }));
  }
}

export function computeSnapGuides(
  activeElement: CanvasElement,
  otherElements: CanvasElement[],
  canvasWidth: number,
  canvasHeight: number,
  threshold = 6
): { snapX?: number; snapY?: number; guides: SnapGuide[] } {
  const guides: SnapGuide[] = [];
  let snapX: number | undefined;
  let snapY: number | undefined;

  const targetBox = getElementBoundingBox(activeElement);

  // Canvas center & edges
  const vCandidates = [
    { pos: 0, label: 'Canvas Left', ids: ['canvas'] },
    { pos: Math.round(canvasWidth / 2), label: 'Canvas Center X', ids: ['canvas'] },
    { pos: canvasWidth, label: 'Canvas Right', ids: ['canvas'] },
  ];

  const hCandidates = [
    { pos: 0, label: 'Canvas Top', ids: ['canvas'] },
    { pos: Math.round(canvasHeight / 2), label: 'Canvas Center Y', ids: ['canvas'] },
    { pos: canvasHeight, label: 'Canvas Bottom', ids: ['canvas'] },
  ];

  // Element bounds
  for (const other of otherElements) {
    if (other.id === activeElement.id) continue;
    const box = getElementBoundingBox(other);

    vCandidates.push(
      { pos: box.minX, label: `${other.name} Left`, ids: [other.id] },
      { pos: box.centerX, label: `${other.name} Center X`, ids: [other.id] },
      { pos: box.maxX, label: `${other.name} Right`, ids: [other.id] }
    );

    hCandidates.push(
      { pos: box.minY, label: `${other.name} Top`, ids: [other.id] },
      { pos: box.centerY, label: `${other.name} Center Y`, ids: [other.id] },
      { pos: box.maxY, label: `${other.name} Bottom`, ids: [other.id] }
    );
  }

  // Check X snaps (target left, center, right)
  for (const cand of vCandidates) {
    if (Math.abs(targetBox.minX - cand.pos) <= threshold) {
      snapX = cand.pos;
      guides.push({ type: 'vertical', position: cand.pos, label: cand.label, elementsInvolved: cand.ids });
      break;
    }
    if (Math.abs(targetBox.centerX - cand.pos) <= threshold) {
      snapX = cand.pos - targetBox.width / 2;
      guides.push({ type: 'vertical', position: cand.pos, label: cand.label, elementsInvolved: cand.ids });
      break;
    }
    if (Math.abs(targetBox.maxX - cand.pos) <= threshold) {
      snapX = cand.pos - targetBox.width;
      guides.push({ type: 'vertical', position: cand.pos, label: cand.label, elementsInvolved: cand.ids });
      break;
    }
  }

  // Check Y snaps (target top, middle, bottom)
  for (const cand of hCandidates) {
    if (Math.abs(targetBox.minY - cand.pos) <= threshold) {
      snapY = cand.pos;
      guides.push({ type: 'horizontal', position: cand.pos, label: cand.label, elementsInvolved: cand.ids });
      break;
    }
    if (Math.abs(targetBox.centerY - cand.pos) <= threshold) {
      snapY = cand.pos - targetBox.height / 2;
      guides.push({ type: 'horizontal', position: cand.pos, label: cand.label, elementsInvolved: cand.ids });
      break;
    }
    if (Math.abs(targetBox.maxY - cand.pos) <= threshold) {
      snapY = cand.pos - targetBox.height;
      guides.push({ type: 'horizontal', position: cand.pos, label: cand.label, elementsInvolved: cand.ids });
      break;
    }
  }

  return { snapX, snapY, guides };
}
