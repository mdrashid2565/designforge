import { BrandKit, CanvasElement, Design, Page, ShapeElement, TextElement } from '@designforge/core';
import { AIAdapterManager } from '../adapter.js';
import { MagicDesignPrompt } from '../types.js';

export async function generateMagicDesign(
  promptData: MagicDesignPrompt,
  aiManager?: AIAdapterManager
): Promise<Design> {
  const width = promptData.dimensions?.width || 1080;
  const height = promptData.dimensions?.height || 1080;
  const brand = promptData.brandKit;

  const bgPrimary = brand?.palette.background || '#0F172A';
  const textPrimary = brand?.palette.text || '#FFFFFF';
  const accentColor = brand?.palette.accent || '#6366F1';
  const secondaryColor = brand?.palette.secondary || '#EC4899';
  const headingFont = brand?.fonts.heading || 'Poppins';
  const bodyFont = brand?.fonts.body || 'Inter';

  const promptLower = promptData.prompt.toLowerCase();
  const isHindi = promptData.language === 'hi' || /[\u0900-\u097F]/.test(promptData.prompt);

  let title = promptData.prompt.slice(0, 60);
  let subheadline = 'Generated with DesignForge Autonomous AI Engine';
  let badgeText = '✨ AI CREATED';

  if (promptLower.includes('sale') || promptLower.includes('discount') || promptLower.includes('offer')) {
    title = isHindi ? 'महा बचत धमाका ऑफर' : 'EXCLUSIVE FLASH SALE';
    subheadline = isHindi
      ? 'सीमित समय के लिए 50% तक की भारी छूट। अभी ऑर्डर करें!'
      : 'Unlock up to 50% discount on all premium items. Limited time only.';
    badgeText = isHindi ? '🔥 सीमित समय' : '🔥 LIMITED TIME';
  } else if (promptLower.includes('podcast') || promptLower.includes('show') || promptLower.includes('episode')) {
    title = 'EPISODE #42: THE FUTURE OF TECH';
    subheadline = 'Deep dive with industry leaders on AI architectures and autonomous systems.';
    badgeText = '🎙️ NEW EPISODE';
  } else if (promptLower.includes('startup') || promptLower.includes('hiring') || promptLower.includes('team')) {
    title = "WE'RE EXPANDING OUR TEAM";
    subheadline = 'Join our mission to build next-generation creative intelligence platforms.';
    badgeText = '🚀 WE ARE HIRING';
  }

  const elements: CanvasElement[] = [
    // Background Glow Accent
    {
      id: `el_bg_glow_${Date.now()}`,
      type: 'shape',
      name: 'Ambient Glow',
      x: Math.round(width * 0.1),
      y: Math.round(height * 0.1),
      width: Math.round(width * 0.8),
      height: Math.round(height * 0.5),
      rotation: 0,
      opacity: 0.3,
      locked: false,
      visible: true,
      zIndex: 0,
      shapeType: 'ellipse',
      fill: {
        type: 'linear',
        angle: 45,
        stops: [
          { offset: 0, color: accentColor },
          { offset: 1, color: secondaryColor },
        ],
      },
    } as ShapeElement,

    // Badge Pill
    {
      id: `el_badge_${Date.now()}`,
      type: 'shape',
      name: 'Badge Pill',
      x: Math.round((width - 240) / 2),
      y: Math.round(height * 0.12),
      width: 240,
      height: 48,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      shapeType: 'rect',
      cornerRadius: 24,
      fill: '#1E293B',
      stroke: accentColor,
      strokeWidth: 2,
    } as ShapeElement,

    // Badge Text
    {
      id: `el_badge_text_${Date.now()}`,
      type: 'text',
      name: 'Badge Text',
      x: Math.round((width - 220) / 2),
      y: Math.round(height * 0.12 + 12),
      width: 220,
      height: 24,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      text: badgeText,
      fontFamily: bodyFont,
      fontSize: 16,
      fontWeight: 700,
      textAlign: 'center',
      fill: '#E0E7FF',
    } as TextElement,

    // Main Headline
    {
      id: `el_title_${Date.now()}`,
      type: 'text',
      name: 'Main Headline',
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.24),
      width: Math.round(width * 0.84),
      height: Math.round(height * 0.22),
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 3,
      text: title,
      fontFamily: headingFont,
      fontSize: Math.round(width * 0.058),
      fontWeight: 800,
      textAlign: 'center',
      lineHeight: 1.18,
      fill: textPrimary,
      textEffect: 'shadow',
      shadow: { color: 'rgba(0,0,0,0.6)', blur: 16, offsetX: 0, offsetY: 6 },
    } as TextElement,

    // Subtitle
    {
      id: `el_sub_${Date.now()}`,
      type: 'text',
      name: 'Subheadline',
      x: Math.round(width * 0.12),
      y: Math.round(height * 0.5),
      width: Math.round(width * 0.76),
      height: Math.round(height * 0.15),
      rotation: 0,
      opacity: 0.9,
      locked: false,
      visible: true,
      zIndex: 4,
      text: subheadline,
      fontFamily: bodyFont,
      fontSize: Math.round(width * 0.024),
      fontWeight: 400,
      textAlign: 'center',
      lineHeight: 1.45,
      fill: '#94A3B8',
    } as TextElement,

    // Action CTA Button
    {
      id: `el_cta_${Date.now()}`,
      type: 'shape',
      name: 'CTA Button',
      x: Math.round((width - 320) / 2),
      y: Math.round(height * 0.76),
      width: 320,
      height: 64,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 5,
      shapeType: 'rect',
      cornerRadius: 32,
      fill: {
        type: 'linear',
        angle: 90,
        stops: [
          { offset: 0, color: accentColor },
          { offset: 1, color: secondaryColor },
        ],
      },
    } as ShapeElement,

    // Action CTA Text
    {
      id: `el_cta_text_${Date.now()}`,
      type: 'text',
      name: 'CTA Text',
      x: Math.round((width - 300) / 2),
      y: Math.round(height * 0.76 + 18),
      width: 300,
      height: 30,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 6,
      text: isHindi ? 'अभी देखें →' : 'Learn More →',
      fontFamily: bodyFont,
      fontSize: 20,
      fontWeight: 700,
      textAlign: 'center',
      fill: '#FFFFFF',
    } as TextElement,
  ];

  const design: Design = {
    id: `design_ai_${Date.now()}`,
    title: promptData.prompt.slice(0, 40),
    width,
    height,
    unit: 'px',
    dpi: 72,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [
      {
        id: `page_ai_${Date.now()}`,
        name: 'Page 1',
        width,
        height,
        background: {
          type: 'color',
          color: bgPrimary,
        },
        elements,
      },
    ],
  };

  return design;
}
