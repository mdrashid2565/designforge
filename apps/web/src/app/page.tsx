'use client';

import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { TopNav } from '../components/editor/TopNav';
import { LeftSidebar } from '../components/editor/LeftSidebar';
import { Canvas } from '../components/editor/Canvas';
import { InspectorPanel } from '../components/editor/InspectorPanel';
import { BottomBar } from '../components/editor/BottomBar';
import { AgentViewPanel } from '../components/agent/AgentViewPanel';
import { ExportModal } from '../components/modals/ExportModal';
import { MagicResizeModal } from '../components/modals/MagicResizeModal';
import { PresentationModal } from '../components/modals/PresentationModal';
import { BrandKitModal } from '../components/modals/BrandKitModal';
import { BulkCreateModal } from '../components/modals/BulkCreateModal';
import { CommandPalette } from '../components/modals/CommandPalette';
import { AdminModal } from '../components/modals/AdminModal';

export default function StudioPage() {
  const { isAgentViewOpen } = useEditorStore();

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-dark-bg text-slate-100">
      {/* Top Navigation Bar */}
      <TopNav />

      {/* Main Studio Middle Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Navigation and Tool Panel */}
        <LeftSidebar />

        {/* Center Interactive Vector Canvas */}
        <Canvas />

        {/* Context Properties Inspector */}
        <InspectorPanel />

        {/* Live Autonomous AI Agent View Panel */}
        {isAgentViewOpen && <AgentViewPanel />}
      </div>

      {/* Bottom Multi-Page & Zoom Controls Bar */}
      <BottomBar />

      {/* Active Modals */}
      <ExportModal />
      <MagicResizeModal />
      <PresentationModal />
      <BrandKitModal />
      <BulkCreateModal />
      <CommandPalette />
      <AdminModal />
    </main>
  );
}
