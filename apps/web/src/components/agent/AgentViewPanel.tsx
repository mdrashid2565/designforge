import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { translations } from '../../lib/i18n';
import {
  Bot,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { generateAICopy } from '@designforge/ai-adapter';

export const AgentViewPanel: React.FC = () => {
  const {
    agentSession,
    language,
    pauseAgent,
    resumeAgent,
    stopAgent,
    revertAISession,
    runAgentPlan,
    design,
  } = useEditorStore();

  const t = translations[language];
  const [expandedTrace, setExpandedTrace] = useState<number | null>(null);
  const [inputTask, setInputTask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const traces = agentSession?.traces || [];
  const latestVerification = traces[traces.length - 1]?.verificationReport;
  const score = latestVerification?.score ?? 100;
  const issues = latestVerification?.issues ?? [];

  const handleRunCustomTask = async () => {
    if (!inputTask.trim()) return;
    setIsSubmitting(true);
    try {
      const taskLower = inputTask.toLowerCase();
      if (taskLower.includes('cta') || taskLower.includes('button')) {
        await runAgentPlan(inputTask, [
          {
            toolName: 'add_shape',
            args: (id: string) => ({
              designId: id,
              shapeType: 'rect',
              x: Math.round((design.width - 320) / 2),
              y: Math.round(design.height * 0.8),
              width: 320,
              height: 64,
              fill: '#EC4899',
              cornerRadius: 32,
            }),
          },
          {
            toolName: 'add_text',
            args: (id: string) => ({
              designId: id,
              text: 'Claim Offer Now →',
              fontSize: 22,
              fontWeight: 800,
              x: Math.round((design.width - 300) / 2),
              y: Math.round(design.height * 0.8 + 18),
              fill: '#FFFFFF',
              textAlign: 'center',
            }),
          },
        ]);
      } else {
        await runAgentPlan(inputTask, [
          {
            toolName: 'add_text',
            args: (id: string) => ({
              designId: id,
              text: inputTask,
              fontSize: 48,
              fontWeight: 800,
              x: Math.round(design.width * 0.1),
              y: Math.round(design.height * 0.3),
              fill: '#FFFFFF',
              textAlign: 'center',
            }),
          },
        ]);
      }
      setInputTask('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-80 bg-dark-sidebar border-l border-dark-border flex flex-col h-full select-none z-20">
      {/* Header */}
      <div className="p-3.5 border-b border-dark-border flex items-center justify-between bg-dark-card/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{t.agentView}</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${agentSession?.status === 'running' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              {agentSession?.status || 'idle'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {agentSession?.status === 'running' ? (
            <button
              onClick={pauseAgent}
              title={t.pauseAgent}
              className="p-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded border border-amber-500/30"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={resumeAgent}
              title={t.resumeAgent}
              className="p-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded border border-emerald-500/30"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={stopAgent}
            title={t.stopAgent}
            className="p-1.5 bg-slate-800 text-slate-400 hover:text-red-400 rounded border border-slate-700"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Health Score Gauge */}
      <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t.visualScore}</div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{score}% Validated</span>
              {issues.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {issues.length} auto-corrected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Revert AI Session Button */}
        <button
          onClick={revertAISession}
          title={t.revertAISession}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-pink-400" />
          <span>Revert</span>
        </button>
      </div>

      {/* Execution Trace Stream Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Real-time MCP Trace</span>

        {traces.length === 0 ? (
          <div className="text-xs text-slate-500 p-4 text-center">
            No agent actions recorded yet. Issue a command below to trigger the autonomous loop.
          </div>
        ) : (
          traces.map((trace) => {
            const isExpanded = expandedTrace === trace.stepNumber;
            return (
              <div
                key={trace.stepNumber}
                className="bg-slate-800/50 rounded-xl border border-slate-700/60 overflow-hidden text-xs"
              >
                <div
                  onClick={() => setExpandedTrace(isExpanded ? null : trace.stepNumber)}
                  className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="font-mono text-indigo-300 font-bold block">
                        {trace.stepNumber}. {trace.toolName}
                      </span>
                      <span className="text-[10px] text-slate-400">{trace.durationMs}ms</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </div>

                {/* Expanded Input / Output Details */}
                {isExpanded && (
                  <div className="p-2.5 bg-slate-900/70 border-t border-slate-800 font-mono text-[10px] text-slate-300 space-y-1.5">
                    <div>
                      <span className="text-slate-500 block">Arguments:</span>
                      <pre className="text-pink-300 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(trace.arguments, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Result Diff:</span>
                      <pre className="text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(trace.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Autonomous Instruction Input Box */}
      <div className="p-3 border-t border-dark-border bg-dark-card/60">
        <div className="relative">
          <input
            type="text"
            placeholder="Instruct AI agent to modify canvas..."
            value={inputTask}
            onChange={(e) => setInputTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunCustomTask()}
            className="w-full bg-slate-800 text-xs text-slate-100 pl-3 pr-8 py-2 rounded-lg border border-slate-700 outline-none focus:border-pink-500"
          />
          <button
            disabled={isSubmitting || !inputTask.trim()}
            onClick={handleRunCustomTask}
            className="absolute right-1.5 top-1.5 p-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white rounded transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
