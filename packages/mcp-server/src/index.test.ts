import test from 'node:test';
import assert from 'node:assert';
import { MCPToolHandlers } from './tools/handlers.js';
import { listMCPResources, readMCPResource } from './resources.js';
import { listMCPPrompts, getMCPPrompt } from './prompts.js';

test('MCP Server - Create Design, Add Elements, Reorder, Undo & Redo', async () => {
  // 1. Create Design
  const createRes = await MCPToolHandlers.create_design({
    title: 'MCP Autonomous Post',
    width: 1080,
    height: 1080,
    unit: 'px',
  });
  assert.strictEqual(createRes.success, true);
  const designId = createRes.designId;

  // 2. Add Shape Backdrop
  const shapeRes = await MCPToolHandlers.add_shape({
    designId,
    shapeType: 'rect',
    x: 0,
    y: 0,
    width: 1080,
    height: 1080,
    fill: '#0F172A',
  });
  assert.strictEqual(shapeRes.success, true);
  const shapeId = shapeRes.elementId;

  // 3. Add Headline Text
  const textRes = await MCPToolHandlers.add_text({
    designId,
    text: 'Built with MCP Agent Control',
    fontSize: 54,
    x: 100,
    y: 150,
    fill: '#FFFFFF',
    fontFamily: 'Poppins',
  });
  assert.strictEqual(textRes.success, true);
  const textId = textRes.elementId;

  // 4. Update Text
  const updateRes = await MCPToolHandlers.update_element({
    designId,
    elementId: textId,
    updates: { text: 'Updated Autonomous Headline' },
  });
  assert.strictEqual(updateRes.success, true);

  // 5. Move Shape
  const moveRes = await MCPToolHandlers.move_resize_rotate({
    designId,
    elementId: shapeId,
    x: 10,
    y: 10,
  });
  assert.strictEqual(moveRes.success, true);

  // 6. Undo Move
  const undoRes = await MCPToolHandlers.undo({ designId });
  assert.strictEqual(undoRes.success, true);

  // 7. Get Screenshot (SVG)
  const snapRes = await MCPToolHandlers.get_screenshot({ designId });
  assert.strictEqual(snapRes.success, true);
  assert.ok(snapRes.svg && snapRes.svg.includes('<svg'));

  // 8. Export Design
  const exportRes = await MCPToolHandlers.export_design({ designId, format: 'json' });
  assert.strictEqual(exportRes?.success, true);
  assert.ok(exportRes?.content && exportRes.content.includes('Autonomous'));
});

test('MCP Server - Resources and Prompts Discovery', async () => {
  const resources = listMCPResources();
  assert.ok(resources.length > 0);
  assert.ok(resources.some((r) => r.uri.startsWith('design://')));

  const firstDesignUri = resources.find((r) => r.uri.startsWith('design://'))!.uri;
  const content = readMCPResource(firstDesignUri);
  assert.strictEqual(content.contents[0].uri, firstDesignUri);

  const prompts = listMCPPrompts();
  assert.ok(prompts.length >= 3);

  const p1 = getMCPPrompt('create_viral_youtube_thumbnail', { topic: 'Autonomous AI' });
  assert.ok(p1.messages[0].content.text.includes('Autonomous AI'));
});
