import test from 'node:test';
import assert from 'node:assert';
import {
  AddElementCommand,
  BatchCommand,
  CommandManager,
  DEFAULT_BRAND_KITS,
  MoveResizeElementCommand,
  RemoveElementCommand,
  UpdateElementCommand,
  alignElements,
  applyBrandKitToDesign,
  bulkCreatePages,
  computeSnapGuides,
  exportDesignToJSON,
  exportDesignToSVG,
  importDesignFromJSON,
  instantiateTemplate,
  parseCSV,
  searchTemplates,
  Design,
  TextElement,
  ShapeElement,
} from './index.js';

const mockDesign: Design = {
  id: 'test_design_1',
  title: 'Test Design',
  width: 1080,
  height: 1080,
  unit: 'px',
  dpi: 72,
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: [
    {
      id: 'page_1',
      name: 'Page 1',
      width: 1080,
      height: 1080,
      background: { type: 'color', color: '#FFFFFF' },
      elements: [],
    },
  ],
};

test('Core - CommandManager: Add, Update, Move, Undo, Redo', () => {
  const manager = new CommandManager(mockDesign);

  const textElement: TextElement = {
    id: 'el_text_1',
    type: 'text',
    name: 'Heading',
    x: 100,
    y: 100,
    width: 300,
    height: 50,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    text: 'Hello DesignForge',
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: 700,
    textAlign: 'left',
    fill: '#111827',
  };

  // Add Element
  manager.execute(new AddElementCommand(textElement));
  let state = manager.getDesign();
  assert.strictEqual(state.pages[0].elements.length, 1);
  assert.strictEqual(state.pages[0].elements[0].name, 'Heading');

  // Update Element
  manager.execute(new UpdateElementCommand('el_text_1', { text: 'Updated Text', fontSize: 40 }));
  state = manager.getDesign();
  const updated = state.pages[0].elements[0] as TextElement;
  assert.strictEqual(updated.text, 'Updated Text');
  assert.strictEqual(updated.fontSize, 40);

  // Move Element
  manager.execute(new MoveResizeElementCommand('el_text_1', { x: 200, y: 250 }));
  state = manager.getDesign();
  assert.strictEqual(state.pages[0].elements[0].x, 200);
  assert.strictEqual(state.pages[0].elements[0].y, 250);

  // Undo Move
  manager.undo();
  state = manager.getDesign();
  assert.strictEqual(state.pages[0].elements[0].x, 100);

  // Undo Update
  manager.undo();
  state = manager.getDesign();
  assert.strictEqual((state.pages[0].elements[0] as TextElement).text, 'Hello DesignForge');

  // Redo Update
  manager.redo();
  state = manager.getDesign();
  assert.strictEqual((state.pages[0].elements[0] as TextElement).text, 'Updated Text');
});

test('Core - BatchCommand: Atomic execution and rollback', () => {
  const manager = new CommandManager(mockDesign);

  const el1: ShapeElement = {
    id: 'shape_1',
    type: 'shape',
    name: 'Box 1',
    shapeType: 'rect',
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    fill: '#3B82F6',
  };

  const el2: ShapeElement = {
    id: 'shape_2',
    type: 'shape',
    name: 'Box 2',
    shapeType: 'circle',
    x: 200,
    y: 50,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    fill: '#10B981',
  };

  const batch = new BatchCommand([
    new AddElementCommand(el1),
    new AddElementCommand(el2),
  ]);

  manager.execute(batch);
  let state = manager.getDesign();
  assert.strictEqual(state.pages[0].elements.length, 2);

  manager.undo();
  state = manager.getDesign();
  assert.strictEqual(state.pages[0].elements.length, 0);
});

test('Core - Geometry: Alignment and Snapping calculation', () => {
  const elements: TextElement[] = [
    {
      id: 'e1',
      type: 'text',
      name: 'T1',
      x: 50,
      y: 100,
      width: 100,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      text: 'One',
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 400,
      textAlign: 'left',
      fill: '#000',
    },
    {
      id: 'e2',
      type: 'text',
      name: 'T2',
      x: 300,
      y: 200,
      width: 100,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      text: 'Two',
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 400,
      textAlign: 'left',
      fill: '#000',
    },
  ];

  // Align Left
  const aligned = alignElements(elements, 'align_left', 1080, 1080);
  assert.strictEqual(aligned[0].x, 50);
  assert.strictEqual(aligned[1].x, 50);

  // Snap calculation
  const snapResult = computeSnapGuides(elements[0], elements, 1080, 1080, 10);
  assert.ok(snapResult.guides !== undefined);
});

test('Core - Templates & Bulk Create: CSV Parsing & Placeholder Merge', () => {
  const search = searchTemplates('SaaS');
  assert.ok(search.length > 0);

  const csv = `title,author,discount\n"Big Summer Sale","DesignForge Team","30%"\n"Winter Mega Drop","Studio X","50%"`;
  const rows = parseCSV(csv);
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].title, 'Big Summer Sale');
  assert.strictEqual(rows[1].discount, '50%');

  const instantiated = instantiateTemplate('tmpl_saas_launch_insta');
  assert.ok(instantiated.pages[0].elements.length > 3);

  const bulkResult = bulkCreatePages(instantiated, rows);
  assert.strictEqual(bulkResult.pages.length, 2);
});

test('Core - Export: Standalone SVG and JSON validation', () => {
  const tmpl = instantiateTemplate('tmpl_yt_thumbnail_viral');
  const svg = exportDesignToSVG(tmpl);
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes('</svg>'));
  assert.ok(svg.includes('AI REPLACED'));

  const jsonStr = exportDesignToJSON(tmpl);
  const reImported = importDesignFromJSON(jsonStr);
  assert.strictEqual(reImported.id, tmpl.id);
  assert.strictEqual(reImported.pages.length, tmpl.pages.length);
});
