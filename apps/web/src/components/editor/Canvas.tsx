import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { ElementRenderer } from './ElementRenderer';
import { computeSnapGuides, getMultiElementBoundingBox } from '@designforge/core';

export const Canvas: React.FC = () => {
  const {
    design,
    activePageIndex,
    selectedElementIds,
    zoom,
    pan,
    selectElement,
    clearSelection,
    updateSelectedElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    undo,
    redo,
    setSnapGuides,
    snapGuides,
    groupSelected,
    ungroupSelected,
    openModal,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const page = design.pages[activePageIndex] || design.pages[0];

  // Dragging & Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartBounds, setElementStartBounds] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedElements();
      } else if (cmdKey && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) redo();
        else undo();
        e.preventDefault();
      } else if (cmdKey && e.key.toLowerCase() === 'd') {
        duplicateSelectedElements();
        e.preventDefault();
      } else if (cmdKey && e.key.toLowerCase() === 'g') {
        if (e.shiftKey) ungroupSelected();
        else groupSelected();
        e.preventDefault();
      } else if (cmdKey && e.key.toLowerCase() === 'k') {
        openModal('command_palette');
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        updateSelectedElement({ x: (selectedElements[0]?.x || 0) - (e.shiftKey ? 10 : 1) });
      } else if (e.key === 'ArrowRight') {
        updateSelectedElement({ x: (selectedElements[0]?.x || 0) + (e.shiftKey ? 10 : 1) });
      } else if (e.key === 'ArrowUp') {
        updateSelectedElement({ y: (selectedElements[0]?.y || 0) - (e.shiftKey ? 10 : 1) });
      } else if (e.key === 'ArrowDown') {
        updateSelectedElement({ y: (selectedElements[0]?.y || 0) + (e.shiftKey ? 10 : 1) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedElements, duplicateSelectedElements, undo, redo, groupSelected, ungroupSelected, updateSelectedElement, openModal]);

  const selectedElements = page ? page.elements.filter((el) => selectedElementIds.includes(el.id)) : [];
  const selectedBox = getMultiElementBoundingBox(selectedElements);

  // Background styling
  const bgStyle: React.CSSProperties = {
    width: `${page.width}px`,
    height: `${page.height}px`,
    position: 'relative',
    backgroundColor: page.background.type === 'color' ? page.background.color || '#0F172A' : '#0F172A',
    backgroundImage:
      page.background.type === 'gradient' && page.background.gradient
        ? `linear-gradient(${page.background.gradient.angle || 0}deg, ${page.background.gradient.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`
        : undefined,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
  };

  const handleMouseDownElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
    selectElement(id, isMulti);

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    const starts: Record<string, { x: number; y: number; w: number; h: number }> = {};
    const ids = isMulti ? [...selectedElementIds, id] : [id];
    ids.forEach((elId) => {
      const el = page.elements.find((item) => item.id === elId);
      if (el) starts[elId] = { x: el.x, y: el.y, w: el.width, h: el.height };
    });
    setElementStartBounds(starts);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || selectedElements.length === 0) return;

      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;

      const activeEl = selectedElements[0];
      const start = elementStartBounds[activeEl.id];
      if (!start) return;

      let newX = Math.round(start.x + dx);
      let newY = Math.round(start.y + dy);

      // Snap guides calculation
      const snap = computeSnapGuides(
        { ...activeEl, x: newX, y: newY },
        page.elements,
        page.width,
        page.height,
        8
      );
      if (snap.snapX !== undefined) newX = snap.snapX;
      if (snap.snapY !== undefined) newY = snap.snapY;

      setSnapGuides(snap.guides);

      // Update positions
      selectedElements.forEach((el) => {
        const s = elementStartBounds[el.id];
        if (s) {
          el.x = Math.round(s.x + (newX - start.x));
          el.y = Math.round(s.y + (newY - start.y));
        }
      });
      useEditorStore.setState({ design: { ...design } });
    },
    [isDragging, dragStart, zoom, selectedElements, elementStartBounds, page, design, setSnapGuides]
  );

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setSnapGuides([]);
      // Commit state to command manager
      useEditorStore.getState().commandManager.setDesign(design);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={clearSelection}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="flex-1 h-full w-full relative overflow-hidden flex items-center justify-center canvas-grid cursor-default"
    >
      {/* Canvas Paper Page */}
      <div style={bgStyle} className="rounded-lg border border-slate-700/60 overflow-hidden">
        {page.elements.map((element) => (
          <div
            key={element.id}
            onMouseDown={(e) => handleMouseDownElement(e, element.id)}
            className="cursor-move"
          >
            <ElementRenderer
              element={element}
              isSelected={selectedElementIds.includes(element.id)}
            />
          </div>
        ))}

        {/* Selected Elements Bounding Box & Handles */}
        {selectedElements.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${selectedBox.minX}px`,
              top: `${selectedBox.minY}px`,
              width: `${selectedBox.width}px`,
              height: `${selectedBox.height}px`,
              pointerEvents: 'none',
            }}
            className="border-2 border-indigo-500 shadow-sm"
          >
            {/* Corner Resize Handles */}
            <div className="absolute -left-2 -top-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm pointer-events-auto cursor-nwse-resize shadow-md" />
            <div className="absolute -right-2 -top-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm pointer-events-auto cursor-nesw-resize shadow-md" />
            <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm pointer-events-auto cursor-nesw-resize shadow-md" />
            <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm pointer-events-auto cursor-nwse-resize shadow-md" />

            {/* Rotation Handle */}
            <div className="absolute left-1/2 -top-7 -translate-x-1/2 w-4 h-4 bg-indigo-500 border border-white rounded-full pointer-events-auto cursor-grab shadow-md" />
          </div>
        )}

        {/* Dynamic Snap Guidelines */}
        {snapGuides.map((guide, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              ...(guide.type === 'vertical'
                ? { left: `${guide.position}px`, top: 0, bottom: 0, width: '1px' }
                : { top: `${guide.position}px`, left: 0, right: 0, height: '1px' }),
            }}
            className="bg-pink-500 pointer-events-none z-50 shadow-[0_0_8px_#ec4899]"
          />
        ))}
      </div>
    </div>
  );
};
