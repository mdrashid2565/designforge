import { Design } from '@designforge/core';
import { MCPToolHandlers } from '@designforge/mcp-server';
import { VerificationReport, VisualVerificationEngine } from './verifier.js';

export interface AgentStepTrace {
  stepNumber: number;
  toolName: string;
  arguments: Record<string, any>;
  result: any;
  timestamp: string;
  status: 'running' | 'success' | 'failed' | 'retrying';
  durationMs: number;
  verificationReport?: VerificationReport;
}

export interface AgentSessionState {
  sessionId: string;
  designId?: string;
  goal: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'stopped';
  traces: AgentStepTrace[];
  startedAt: string;
  completedAt?: string;
}

export type AgentStepListener = (trace: AgentStepTrace, session: AgentSessionState) => void;

export class AutonomousAgentRunner {
  private session: AgentSessionState;
  private isPaused = false;
  private isStopped = false;
  private listeners: Set<AgentStepListener> = new Set();

  constructor(goal: string, designId?: string) {
    this.session = {
      sessionId: `agent_session_${Date.now()}`,
      designId,
      goal,
      status: 'running',
      traces: [],
      startedAt: new Date().toISOString(),
    };
  }

  public subscribe(listener: AgentStepListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public pause(): void {
    this.isPaused = true;
    this.session.status = 'paused';
  }

  public resume(): void {
    this.isPaused = false;
    this.session.status = 'running';
  }

  public stop(): void {
    this.isStopped = true;
    this.session.status = 'stopped';
  }

  public getSessionState(): AgentSessionState {
    return JSON.parse(JSON.stringify(this.session));
  }

  /**
   * Executes a planned sequence of MCP tool calls with real-time verification and auto-repair.
   */
  public async executePlan(
    steps: { toolName: string; args: (designId: string) => Record<string, any> }[],
    autoVerifyAndFix = true
  ): Promise<AgentSessionState> {
    let currentDesignId = this.session.designId;

    for (let i = 0; i < steps.length; i++) {
      if (this.isStopped) {
        this.session.status = 'stopped';
        break;
      }

      while (this.isPaused) {
        await new Promise((r) => setTimeout(r, 200));
      }

      const step = steps[i];
      const startMs = Date.now();
      const stepArgs = step.args(currentDesignId || '');

      const trace: AgentStepTrace = {
        stepNumber: i + 1,
        toolName: step.toolName,
        arguments: stepArgs,
        result: null,
        timestamp: new Date().toISOString(),
        status: 'running',
        durationMs: 0,
      };

      try {
        const handler = (MCPToolHandlers as any)[step.toolName];
        if (!handler) throw new Error(`MCP Tool '${step.toolName}' does not exist.`);

        const res = await handler(stepArgs);
        trace.result = res;
        trace.status = res.success !== false ? 'success' : 'failed';
        trace.durationMs = Date.now() - startMs;

        if (res.designId) {
          currentDesignId = res.designId;
          this.session.designId = res.designId;
        }

        // Run visual verification loop if design is active
        if (currentDesignId && autoVerifyAndFix) {
          const designRes = await MCPToolHandlers.get_design_json({ designId: currentDesignId });
          if (designRes.success && designRes.design) {
            let report = VisualVerificationEngine.verifyDesign(designRes.design);
            trace.verificationReport = report;

            // Auto-correct loop if flaws detected
            if (!report.passed && report.issues.length > 0) {
              const correctedDesign = VisualVerificationEngine.autoCorrectIssues(designRes.design, report);
              // Save corrected state
              const updatedReport = VisualVerificationEngine.verifyDesign(correctedDesign);
              trace.verificationReport = updatedReport;
            }
          }
        }

        this.session.traces.push(trace);
        this.notify(trace);
      } catch (err: any) {
        trace.status = 'failed';
        trace.result = { error: err.message };
        trace.durationMs = Date.now() - startMs;
        this.session.traces.push(trace);
        this.notify(trace);
      }
    }

    this.session.status = this.isStopped ? 'stopped' : 'completed';
    this.session.completedAt = new Date().toISOString();
    return this.getSessionState();
  }

  private notify(trace: AgentStepTrace): void {
    for (const listener of this.listeners) {
      try {
        listener(trace, this.session);
      } catch (_) {}
    }
  }
}
