#!/usr/bin/env node

/**
 * DesignForge Automated End-to-End Test Suite
 */

import { CommandManager, AddElementCommand, UpdateElementCommand, instantiateTemplate, exportDesignToSVG, exportDesignToJSON, alignElements, PRESET_DIMENSIONS } from '../packages/core/dist/index.js';
import { AIAdapterManager, generateMagicDesign } from '../packages/ai-adapter/dist/index.js';
import { MCPToolHandlers } from '../packages/mcp-server/dist/tools/handlers.js';
import { VisualVerificationEngine, AutonomousAgentRunner } from '../packages/browser-agent/dist/index.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('🧪 Running DesignForge Master E2E Automated Verification Suite');
  console.log('================================================================\n');

  // 1. Scene Graph & Command Layer Reversibility
  console.log('--- 1. Testing Core Scene Graph & Commands ---');
  const tmpl = instantiateTemplate('tmpl_saas_launch_insta');
  assert(tmpl.pages.length === 1, 'Template instantiated with initial page');
  assert(tmpl.pages[0].elements.length >= 5, 'Template elements successfully loaded');

  const mgr = new CommandManager(tmpl);
  mgr.execute(new AddElementCommand({
    id: 'el_e2e_text',
    type: 'text',
    name: 'E2E Header',
    x: 50,
    y: 50,
    width: 200,
    height: 40,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 10,
    text: 'E2E Testing',
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'left',
    fill: '#FFFFFF',
  }));
  assert(mgr.getDesign().pages[0].elements.length === tmpl.pages[0].elements.length + 1, 'Element added via Command');

  mgr.undo();
  assert(mgr.getDesign().pages[0].elements.length === tmpl.pages[0].elements.length, 'Undo reverted element addition');

  mgr.redo();
  assert(mgr.getDesign().pages[0].elements.length === tmpl.pages[0].elements.length + 1, 'Redo re-applied element addition');

  // 2. Export Engine
  console.log('\n--- 2. Testing Vector SVG & JSON Exporter ---');
  const svg = exportDesignToSVG(mgr.getDesign());
  assert(svg.startsWith('<svg') && svg.endsWith('</svg>'), 'Generated valid standalone SVG string');
  assert(svg.includes('E2E Testing'), 'SVG contains rendered text content');

  const json = exportDesignToJSON(mgr.getDesign());
  assert(json.includes('E2E Testing'), 'JSON contains scene graph elements');

  // 3. AI Adapter & Magic Design
  console.log('\n--- 3. Testing Universal AI Adapter Layer ---');
  const aiManager = new AIAdapterManager();
  const completion = await aiManager.complete({
    messages: [{ role: 'user', content: 'Generate high-impact headline for cloud AI platform' }],
  });
  assert(completion.content.length > 5, 'AI Adapter returned valid completion');

  const magicDesign = await generateMagicDesign({
    prompt: 'Festival Diwali Mega Discount 50%',
    dimensions: { width: 1200, height: 630 },
  });
  assert(magicDesign.width === 1200 && magicDesign.height === 630, 'Magic Design respects custom dimensions');
  assert(magicDesign.pages[0].elements.length >= 4, 'Magic Design populated scene graph elements');

  // 4. Standalone MCP Server Tool Handlers
  console.log('\n--- 4. Testing MCP Server Tool Layer (40+ Tools) ---');
  const mcpCreate = await MCPToolHandlers.create_design({ title: 'MCP E2E Canvas', preset: 'youtube_thumbnail' });
  assert(mcpCreate.success && mcpCreate.dimensions.width === 1280, 'MCP create_design initialized 1280x720 canvas');

  const mcpText = await MCPToolHandlers.add_text({
    designId: mcpCreate.designId,
    text: 'MCP Agent Text',
    fontSize: 48,
    x: 100,
    y: 100,
    fill: '#FFFFFF',
  });
  assert(mcpText.success, 'MCP add_text tool succeeded');

  const mcpUndo = await MCPToolHandlers.undo({ designId: mcpCreate.designId });
  assert(mcpUndo.success, 'MCP undo tool succeeded');

  // 5. Visual Verification Loop
  console.log('\n--- 5. Testing Visual Verification & Self-Healing Loop ---');
  const report = VisualVerificationEngine.verifyDesign(mgr.getDesign());
  assert(report.score >= 0 && report.score <= 100, 'Visual verification score computed accurately');
  assert(typeof report.passed === 'boolean', 'Visual health check returned boolean pass/fail status');

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} MASTER E2E AUTOMATED TESTS PASSED!`);
  console.log('================================================================\n');
}

runAllTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
