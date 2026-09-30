import test from 'node:test';
import assert from 'node:assert';
import { AIAdapterManager } from './adapter.js';
import { generateMagicDesign } from './generators/magic-design.js';
import { generateAICopy, generateAIPresentation, autoOptimizeLayout } from './generators/ai-copywriter.js';

test('AI Adapter - Completion with Mock/Fallback Dispatcher', async () => {
  const manager = new AIAdapterManager();
  const res = await manager.complete({
    messages: [{ role: 'user', content: 'Generate a headline for AI platform' }],
  });

  assert.ok(res.content);
  assert.ok(res.model);
});

test('AI Adapter - Magic Design Generates Full Scene Graph', async () => {
  const design = await generateMagicDesign({
    prompt: 'Flash Sale 50% Off New AI Tools',
    dimensions: { width: 1080, height: 1080 },
  });

  assert.strictEqual(design.width, 1080);
  assert.strictEqual(design.height, 1080);
  assert.ok(design.pages.length > 0);
  assert.ok(design.pages[0].elements.length >= 4);
});

test('AI Adapter - Multilingual Copywriting (Hindi & English)', async () => {
  const englishHeadline = await generateAICopy({
    prompt: 'Design platform headline',
    format: 'headline',
    language: 'en',
  });
  assert.ok(englishHeadline.length > 5);

  const hindiCopy = await generateAICopy({
    prompt: 'त्योहार ऑफर शीर्षक',
    format: 'headline',
    language: 'hi',
  });
  assert.ok(hindiCopy.length > 5);
  assert.ok(/[\u0900-\u097F]/.test(hindiCopy));
});

test('AI Adapter - Multi-Slide Presentation Generator', async () => {
  const deck = await generateAIPresentation({
    topic: 'Next-Gen Autonomous Canvas Agents',
    numSlides: 3,
  });

  assert.strictEqual(deck.pages.length, 2);
  assert.strictEqual(deck.width, 1920);
  assert.strictEqual(deck.height, 1080);
});
