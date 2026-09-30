import test from 'node:test';
import assert from 'node:assert';
import { AutonomousAgentRunner } from './agent-runner.js';
import { VisualVerificationEngine } from './verifier.js';
import { instantiateTemplate } from '@designforge/core';

test('Browser Agent - Visual Verification Engine identifies layout & contrast flaws', () => {
  const tmpl = instantiateTemplate('tmpl_saas_launch_insta');
  // Inject low contrast text
  tmpl.pages[0].elements.push({
    id: 'bad_contrast_el',
    type: 'text',
    name: 'Bad Text',
    x: 50,
    y: 50,
    width: 200,
    height: 40,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 10,
    text: 'Invisible dark text',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 700,
    textAlign: 'left',
    fill: '#0F172A', // same dark as background
  });

  const report = VisualVerificationEngine.verifyDesign(tmpl);
  assert.strictEqual(report.passed, false);
  assert.ok(report.issues.some((i) => i.type === 'low_contrast'));

  const fixed = VisualVerificationEngine.autoCorrectIssues(tmpl, report);
  const fixedReport = VisualVerificationEngine.verifyDesign(fixed);
  assert.strictEqual(fixedReport.passed, true);
});

test('Browser Agent - Autonomous Agent Runner executes multi-step plan with trace logs', async () => {
  const runner = new AutonomousAgentRunner('Build an AI launch banner');
  let tracesCount = 0;

  runner.subscribe(() => {
    tracesCount++;
  });

  const finalSession = await runner.executePlan([
    {
      toolName: 'create_design',
      args: () => ({ title: 'Autonomous Launch Post', width: 1080, height: 1080 }),
    },
    {
      toolName: 'add_shape',
      args: (id) => ({ designId: id, shapeType: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: '#0F172A' }),
    },
    {
      toolName: 'add_text',
      args: (id) => ({ designId: id, text: 'Agent Controlled Canvas', fontSize: 60, x: 100, y: 200, fill: '#FFFFFF' }),
    },
  ]);

  assert.strictEqual(finalSession.status, 'completed');
  assert.strictEqual(finalSession.traces.length, 3);
  assert.ok(tracesCount >= 3);
  assert.ok(finalSession.designId);
});
