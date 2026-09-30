#!/usr/bin/env node

/**
 * DesignForge MCP End-to-End Demo Script
 * Demonstrates an AI Agent autonomously constructing a complete, high-converting
 * Instagram post (1080x1080) with typography, shapes, gradients, badges, and visual validation.
 */

import { MCPToolHandlers } from '../packages/mcp-server/dist/tools/handlers.js';
import { VisualVerificationEngine } from '../packages/browser-agent/dist/verifier.js';
import { globalStore } from '../packages/mcp-server/dist/store.js';

async function runDemo() {
  console.log('================================================================');
  console.log('🚀 DesignForge MCP Autonomous Agent Demo: Instagram Post Creation');
  console.log('================================================================\n');

  // Step 1: Create a new Instagram Square design (1080x1080)
  console.log('Step 1: Calling [create_design] tool...');
  const createRes = await MCPToolHandlers.create_design({
    title: 'Autonomous SaaS Launch Post',
    preset: 'instagram_post',
    backgroundColor: '#0A0E17',
  });
  console.log(`✅ Design created with ID: ${createRes.designId} (${createRes.dimensions.width}x${createRes.dimensions.height}px)\n`);
  const designId = createRes.designId;

  // Step 2: Add ambient gradient backdrop shape
  console.log('Step 2: Calling [add_shape] tool for glowing accent background...');
  const shapeRes = await MCPToolHandlers.add_shape({
    designId,
    shapeType: 'ellipse',
    x: 140,
    y: 80,
    width: 800,
    height: 400,
    fill: '#6366F1',
    opacity: 0.35,
  });
  console.log(`✅ Added ambient shape: ${shapeRes.elementId}\n`);

  // Step 3: Add Badge Pill
  console.log('Step 3: Calling [add_shape] & [add_text] tools for Tag Pill...');
  await MCPToolHandlers.add_shape({
    designId,
    shapeType: 'rect',
    x: 390,
    y: 120,
    width: 300,
    height: 52,
    cornerRadius: 26,
    fill: '#1E293B',
    stroke: '#6366F1',
    strokeWidth: 2,
  });

  await MCPToolHandlers.add_text({
    designId,
    text: '✨ INTRODUCING V3.0',
    fontSize: 18,
    fontWeight: 800,
    x: 400,
    y: 134,
    width: 280,
    textAlign: 'center',
    fill: '#E0E7FF',
    fontFamily: 'Inter',
  });
  console.log('✅ Added badge pill with centered typography\n');

  // Step 4: Add Main High-Impact Headline
  console.log('Step 4: Calling [add_text] for Hero Headline...');
  const headRes = await MCPToolHandlers.add_text({
    designId,
    text: 'The Next Generation of\nDesign Intelligence',
    fontSize: 60,
    fontWeight: 900,
    fontFamily: 'Poppins',
    x: 80,
    y: 220,
    width: 920,
    height: 160,
    textAlign: 'center',
    fill: '#FFFFFF',
    textEffect: 'shadow',
  });
  console.log(`✅ Added headline: ${headRes.elementId}\n`);

  // Step 5: Add Subtitle Body
  console.log('Step 5: Calling [add_text] for Subtitle Body...');
  await MCPToolHandlers.add_text({
    designId,
    text: 'Build vector graphics, decks, and marketing visuals at the speed of thought with autonomous AI agent control.',
    fontSize: 24,
    fontWeight: 400,
    fontFamily: 'Inter',
    x: 140,
    y: 410,
    width: 800,
    height: 80,
    textAlign: 'center',
    fill: '#94A3B8',
  });
  console.log('✅ Added subtitle body text\n');

  // Step 6: Add CTA Button
  console.log('Step 6: Calling [add_shape] & [add_text] for Action CTA...');
  await MCPToolHandlers.add_shape({
    designId,
    shapeType: 'rect',
    x: 360,
    y: 880,
    width: 360,
    height: 68,
    cornerRadius: 34,
    fill: '#6366F1',
  });

  await MCPToolHandlers.add_text({
    designId,
    text: 'Try DesignForge Free →',
    fontSize: 22,
    fontWeight: 800,
    x: 370,
    y: 900,
    width: 340,
    textAlign: 'center',
    fill: '#FFFFFF',
    fontFamily: 'Inter',
  });
  console.log('✅ Added CTA button\n');

  // Step 7: Run Visual Verification Loop
  console.log('Step 7: Running Visual Verification Loop & Health Check...');
  const design = globalStore.getDesign(designId);
  const report = VisualVerificationEngine.verifyDesign(design);
  console.log(`📊 Visual Health Score: ${report.score}/100`);
  console.log(`🛡️ Passed Automated Checks: ${report.passed}`);
  console.log(`⚠️ Issues Detected: ${report.issues.length}\n`);

  // Step 8: Export Design to SVG and JSON
  console.log('Step 8: Calling [export_design] for SVG vector output...');
  const exportSvg = await MCPToolHandlers.export_design({ designId, format: 'svg' });
  const exportJson = await MCPToolHandlers.export_design({ designId, format: 'json' });

  console.log(`✅ SVG Generated (${exportSvg.content.length} characters)`);
  console.log(`✅ JSON Scene Graph Generated (${exportJson.content.length} characters)\n`);

  console.log('================================================================');
  console.log('🎉 DEMO COMPLETE: Autonomous Instagram Post successfully generated via MCP!');
  console.log('================================================================');
}

runDemo().catch((err) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
