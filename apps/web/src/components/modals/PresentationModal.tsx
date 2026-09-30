import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { ElementRenderer } from '../editor/ElementRenderer';
import { X, ChevronLeft, ChevronRight, Clock, FileText } from 'lucide-react';

export const PresentationModal: React.FC = () => {
  const { activeModal, closeModal, design } = useEditorStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (activeModal !== 'presentation') return;
    const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== 'presentation') return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlideIndex((idx) => Math.min(design.pages.length - 1, idx + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((idx) => Math.max(0, idx - 1));
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, design.pages.length, closeModal]);

  if (activeModal !== 'presentation') return null;

  const page = design.pages[currentSlideIndex] || design.pages[0];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between select-none">
      {/* Top Slide Control Bar */}
      <div className="h-12 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-sm">{design.title}</span>
          <span className="text-slate-500">•</span>
          <span>Slide {currentSlideIndex + 1} of {design.pages.length}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-1.5 rounded flex items-center gap-1 ${showNotes ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>

          <button
            onClick={closeModal}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
        <div
          style={{
            width: `${page.width}px`,
            height: `${page.height}px`,
            backgroundColor: page.background.type === 'color' ? page.background.color || '#0F172A' : '#0F172A',
            backgroundImage:
              page.background.type === 'gradient' && page.background.gradient
                ? `linear-gradient(${page.background.gradient.angle || 0}deg, ${page.background.gradient.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`
                : undefined,
            transform: `scale(${Math.min((window.innerWidth - 100) / page.width, (window.innerHeight - 150) / page.height)})`,
            transformOrigin: 'center center',
          }}
          className="relative shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
        >
          {page.elements.map((el) => (
            <ElementRenderer key={el.id} element={el} />
          ))}
        </div>

        {/* Presenter Notes Overlay */}
        {showNotes && (
          <div className="absolute right-6 bottom-6 w-80 p-4 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl text-xs text-slate-200">
            <span className="font-bold text-white block mb-1">Speaker Notes:</span>
            <p className="text-slate-400">{page.notes || 'No speaker notes for this slide.'}</p>
          </div>
        )}
      </div>

      {/* Bottom Floating Navigation Controls */}
      <div className="h-16 flex items-center justify-center gap-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-900">
        <button
          disabled={currentSlideIndex === 0}
          onClick={() => setCurrentSlideIndex((idx) => Math.max(0, idx - 1))}
          className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold text-slate-300">
          {currentSlideIndex + 1} / {design.pages.length}
        </span>

        <button
          disabled={currentSlideIndex === design.pages.length - 1}
          onClick={() => setCurrentSlideIndex((idx) => Math.min(design.pages.length - 1, idx + 1))}
          className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
