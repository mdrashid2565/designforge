import { CopywritingPrompt, PresentationGenPrompt } from '../types.js';
import { Design, Page, ShapeElement, TextElement } from '@designforge/core';

export async function generateAICopy(prompt: CopywritingPrompt): Promise<string> {
  const isHindi = prompt.language === 'hi';
  const query = prompt.prompt.toLowerCase();

  if (isHindi) {
    if (query.includes('headline') || query.includes('शीर्षक')) {
      return 'असीमित संभावनाओं का नया युग: आपकी रचनात्मकता, AI की गति';
    }
    if (query.includes('cta') || query.includes('बटन')) {
      return 'मुफ़्त शुरुआत करें →';
    }
    return 'डिज़ाइनफ़ोर्ज के साथ आप कुछ ही सेकंड में विश्वस्तरीय ग्राफ़िक्स, प्रस्तुतियाँ और सोशल मीडिया पोस्ट तैयार कर सकते हैं।';
  }

  if (prompt.format === 'headline') {
    return 'Empower Your Vision With Autonomous Design Intelligence';
  }
  if (prompt.format === 'cta') {
    return 'Get Started For Free →';
  }
  if (prompt.format === 'tagline') {
    return 'From Concept to Canvas in Seconds';
  }
  if (prompt.format === 'bullet_points') {
    return '• 10x faster production cycle\n• Seamless brand kit enforcement\n• Multi-platform Magic Resize in 1-click\n• Collaborative CRDT canvas';
  }

  return 'Elevate your brand with lightning-fast generative layout intelligence, real-time collaboration, and professional vector tools designed for modern creators.';
}

export async function generateAIPresentation(prompt: PresentationGenPrompt): Promise<Design> {
  const brand = prompt.brandKit;
  const numSlides = Math.max(2, Math.min(10, prompt.numSlides || 3));
  const bg = brand?.palette.background || '#090D1A';
  const primary = brand?.palette.primary || '#6366F1';
  const textClr = brand?.palette.text || '#FFFFFF';

  const pages: Page[] = [];

  // Slide 1: Cover
  pages.push({
    id: `slide_1_${Date.now()}`,
    name: '1. Cover Slide',
    width: 1920,
    height: 1080,
    duration: 10,
    background: { type: 'color', color: bg },
    elements: [
      {
        id: `el_s1_pill_${Date.now()}`,
        type: 'shape',
        name: 'Topic Tag',
        x: 160,
        y: 200,
        width: 260,
        height: 44,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 0,
        shapeType: 'rect',
        cornerRadius: 22,
        fill: '#1E293B',
        stroke: primary,
        strokeWidth: 2,
      } as ShapeElement,
      {
        id: `el_s1_pill_t_${Date.now()}`,
        type: 'text',
        name: 'Topic Tag Text',
        x: 170,
        y: 211,
        width: 240,
        height: 24,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 1,
        text: 'KEYNOTE PRESENTATION',
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 700,
        textAlign: 'center',
        fill: '#CBD5E1',
      } as TextElement,
      {
        id: `el_s1_title_${Date.now()}`,
        type: 'text',
        name: 'Slide Title',
        x: 160,
        y: 280,
        width: 1400,
        height: 180,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 2,
        text: prompt.topic,
        fontFamily: 'Poppins',
        fontSize: 72,
        fontWeight: 800,
        textAlign: 'left',
        lineHeight: 1.15,
        fill: textClr,
      } as TextElement,
      {
        id: `el_s1_desc_${Date.now()}`,
        type: 'text',
        name: 'Slide Desc',
        x: 160,
        y: 500,
        width: 1100,
        height: 80,
        rotation: 0,
        opacity: 0.85,
        locked: false,
        visible: true,
        zIndex: 3,
        text: 'A strategic overview of emerging trends, opportunities, and execution roadmap.',
        fontFamily: 'Inter',
        fontSize: 26,
        fontWeight: 400,
        textAlign: 'left',
        fill: '#94A3B8',
      } as TextElement,
    ],
  });

  // Slide 2: Pillars / Core Concepts
  if (numSlides >= 2) {
    pages.push({
      id: `slide_2_${Date.now()}`,
      name: '2. Strategic Pillars',
      width: 1920,
      height: 1080,
      duration: 10,
      background: { type: 'color', color: bg },
      elements: [
        {
          id: `el_s2_title_${Date.now()}`,
          type: 'text',
          name: 'Section Title',
          x: 160,
          y: 120,
          width: 1200,
          height: 60,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 0,
          text: 'Key Pillars of Growth & Execution',
          fontFamily: 'Poppins',
          fontSize: 48,
          fontWeight: 800,
          textAlign: 'left',
          fill: textClr,
        } as TextElement,
        // Card 1
        {
          id: `el_s2_card1_${Date.now()}`,
          type: 'shape',
          name: 'Pillar Card 1',
          x: 160,
          y: 260,
          width: 480,
          height: 480,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 1,
          shapeType: 'rect',
          cornerRadius: 20,
          fill: '#131B2E',
          stroke: '#334155',
          strokeWidth: 2,
        } as ShapeElement,
        {
          id: `el_s2_card1_t_${Date.now()}`,
          type: 'text',
          name: 'Pillar 1 Title',
          x: 200,
          y: 300,
          width: 400,
          height: 50,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 2,
          text: '01. Speed & Precision',
          fontFamily: 'Poppins',
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'left',
          fill: primary,
        } as TextElement,
        {
          id: `el_s2_card1_b_${Date.now()}`,
          type: 'text',
          name: 'Pillar 1 Body',
          x: 200,
          y: 370,
          width: 400,
          height: 200,
          rotation: 0,
          opacity: 0.85,
          locked: false,
          visible: true,
          zIndex: 3,
          text: 'Accelerate visual workflows by 10x through seamless AI tools, reusable components, and instant template instantiations.',
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: 400,
          textAlign: 'left',
          lineHeight: 1.5,
          fill: '#CBD5E1',
        } as TextElement,
        // Card 2
        {
          id: `el_s2_card2_${Date.now()}`,
          type: 'shape',
          name: 'Pillar Card 2',
          x: 720,
          y: 260,
          width: 480,
          height: 480,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 4,
          shapeType: 'rect',
          cornerRadius: 20,
          fill: '#131B2E',
          stroke: '#334155',
          strokeWidth: 2,
        } as ShapeElement,
        {
          id: `el_s2_card2_t_${Date.now()}`,
          type: 'text',
          name: 'Pillar 2 Title',
          x: 760,
          y: 300,
          width: 400,
          height: 50,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 5,
          text: '02. Brand Consistency',
          fontFamily: 'Poppins',
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'left',
          fill: '#10B981',
        } as TextElement,
        {
          id: `el_s2_card2_b_${Date.now()}`,
          type: 'text',
          name: 'Pillar 2 Body',
          x: 760,
          y: 370,
          width: 400,
          height: 200,
          rotation: 0,
          opacity: 0.85,
          locked: false,
          visible: true,
          zIndex: 6,
          text: 'Lock color palettes, custom fonts, typography tokens, and layout guidelines across distributed teams.',
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: 400,
          textAlign: 'left',
          lineHeight: 1.5,
          fill: '#CBD5E1',
        } as TextElement,
        // Card 3
        {
          id: `el_s2_card3_${Date.now()}`,
          type: 'shape',
          name: 'Pillar Card 3',
          x: 1280,
          y: 260,
          width: 480,
          height: 480,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 7,
          shapeType: 'rect',
          cornerRadius: 20,
          fill: '#131B2E',
          stroke: '#334155',
          strokeWidth: 2,
        } as ShapeElement,
        {
          id: `el_s2_card3_t_${Date.now()}`,
          type: 'text',
          name: 'Pillar 3 Title',
          x: 1320,
          y: 300,
          width: 400,
          height: 50,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 8,
          text: '03. Agentic Automation',
          fontFamily: 'Poppins',
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'left',
          fill: '#EC4899',
        } as TextElement,
        {
          id: `el_s2_card3_b_${Date.now()}`,
          type: 'text',
          name: 'Pillar 3 Body',
          x: 1320,
          y: 370,
          width: 400,
          height: 200,
          rotation: 0,
          opacity: 0.85,
          locked: false,
          visible: true,
          zIndex: 9,
          text: 'Leverage MCP tools and AI agents to generate variations, format sizes, and localize content automatically.',
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: 400,
          textAlign: 'left',
          lineHeight: 1.5,
          fill: '#CBD5E1',
        } as TextElement,
      ],
    });
  }

  return {
    id: `deck_ai_${Date.now()}`,
    title: prompt.topic,
    width: 1920,
    height: 1080,
    unit: 'px',
    dpi: 72,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages,
  };
}

export function autoOptimizeLayout(design: Design, pageIndex = 0): Design {
  const next: Design = JSON.parse(JSON.stringify(design));
  const page = next.pages[pageIndex] || next.pages[0];
  if (!page) return design;

  // Center loose text elements and ensure clear padding
  for (const el of page.elements) {
    if (el.type === 'text') {
      const textEl = el as TextElement;
      if (textEl.width > page.width * 0.7) {
        textEl.x = Math.round((page.width - textEl.width) / 2);
        textEl.textAlign = 'center';
      }
      // Ensure text is readable against dark/light backgrounds
      if (page.background.color === '#FFFFFF' && typeof textEl.fill === 'string' && textEl.fill.startsWith('#FFF')) {
        textEl.fill = '#0F172A';
      }
    }
  }

  next.updatedAt = new Date().toISOString();
  next.version += 1;
  return next;
}
