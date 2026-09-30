import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { X, ShieldCheck, Zap, CreditCard, BarChart2, Check, Users } from 'lucide-react';

export const AdminModal: React.FC = () => {
  const { activeModal, closeModal } = useEditorStore();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');

  if (activeModal !== 'admin') return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative select-none">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Workspace Admin & AI Usage</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Manage team member permissions, AI credits balance, and subscription plans.
        </p>

        {/* Usage & Metering Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">AI Generation Credits</span>
            <span className="text-xl font-extrabold text-white mt-1 block">8,450 / 10,000</span>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full w-[84%]" />
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">MCP Tools Executions</span>
            <span className="text-xl font-extrabold text-white mt-1 block">1,248 Calls</span>
            <span className="text-[10px] text-emerald-400 mt-1 block">99.8% Success Rate</span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Active Team Seats</span>
            <span className="text-xl font-extrabold text-white mt-1 block">5 Members</span>
            <span className="text-[10px] text-indigo-400 mt-1 block">RBAC Admin & Reviewers</span>
          </div>
        </div>

        {/* Subscription Plans */}
        <span className="text-xs font-bold text-slate-300 block mb-3">Subscription Plans</span>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              id: 'free',
              name: 'Starter Free',
              price: '$0',
              period: '/mo',
              features: ['500 AI Credits / mo', 'Standard Export (72 DPI)', 'Single User'],
            },
            {
              id: 'pro',
              name: 'Pro Creator',
              price: '$19',
              period: '/mo',
              features: ['10,000 AI Credits / mo', 'Full MCP Server Control', 'Magic Resize & Bulk Create', 'Print PDF/X & 300 DPI'],
              badge: 'POPULAR',
            },
            {
              id: 'enterprise',
              name: 'Enterprise Team',
              price: '$79',
              period: '/mo',
              features: ['Unlimited AI Agent Calls', 'Custom LLM API Keys', 'Yjs Real-Time Sync', 'SLA + Dedicated Support'],
            },
          ].map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`p-4 rounded-xl border cursor-pointer relative transition-all ${
                selectedPlan === plan.id
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 right-3 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-sm">
                  {plan.badge}
                </span>
              )}
              <div className="text-xs font-bold text-white mb-1">{plan.name}</div>
              <div className="text-xl font-extrabold text-white mb-3">
                {plan.price} <span className="text-xs font-normal text-slate-400">{plan.period}</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Current active plan: <strong className="text-white">Pro Creator (Annual Billing)</strong></span>
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
