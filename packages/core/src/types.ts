/**
 * DesignForge Core Scene Graph & Domain Types
 */

export type ElementType =
  | 'text'
  | 'shape'
  | 'line'
  | 'image'
  | 'video'
  | 'audio'
  | 'chart'
  | 'table'
  | 'qrcode'
  | 'frame'
  | 'embed'
  | 'group';

export type ShapeType =
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'polygon'
  | 'heart'
  | 'arrow'
  | 'badge'
  | 'cloud'
  | 'speech_bubble';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export type TextEffect =
  | 'none'
  | 'shadow'
  | 'lift'
  | 'hollow'
  | 'splice'
  | 'outline'
  | 'echo'
  | 'glitch'
  | 'neon'
  | 'background';

export interface GradientFill {
  type: 'linear' | 'radial';
  angle?: number;
  stops: { offset: number; color: string; opacity?: number }[];
}

export type FillType = string | GradientFill;

export interface ElementAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'pulse' | 'typewriter' | 'neon' | 'rotate' | 'wipe';
  direction?: 'in' | 'out' | 'left' | 'right' | 'top' | 'bottom';
  duration: number; // in seconds
  delay: number; // in seconds
  loop?: boolean;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
}

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  scaleX?: number;
  scaleY?: number;
  opacity: number; // 0 to 1
  locked: boolean;
  visible: boolean;
  zIndex: number;
  blendMode?: BlendMode;
  animation?: ElementAnimation;
  linkUrl?: string;
  customData?: Record<string, any>;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle?: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fill: FillType;
  stroke?: string;
  strokeWidth?: number;
  letterSpacing?: number;
  lineHeight?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  textEffect?: TextEffect;
  effectColor?: string;
  effectIntensity?: number;
  curved?: {
    radius: number;
    angle: number;
  };
  rtl?: boolean;
  language?: string; // e.g. 'hi' for Hindi / Devanagari
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: FillType;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  cornerRadius?: number;
  points?: { x: number; y: number }[];
  innerRadius?: number; // for star/polygon
  spikes?: number; // for star
}

export interface LineElement extends BaseElement {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  startMarker?: 'none' | 'arrow' | 'circle' | 'bar';
  endMarker?: 'none' | 'arrow' | 'circle' | 'bar';
  curved?: boolean;
  controlX?: number;
  controlY?: number;
}

export interface ImageFilter {
  brightness?: number; // 0 to 200, 100 is normal
  contrast?: number; // 0 to 200, 100 is normal
  saturation?: number; // 0 to 200, 100 is normal
  blur?: number; // in pixels
  grayscale?: number; // 0 to 100
  sepia?: number; // 0 to 100
  hueRotate?: number; // 0 to 360 deg
  invert?: number; // 0 to 100
  duotone?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  originalWidth: number;
  originalHeight: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filter?: ImageFilter;
  maskShape?: ShapeType | string; // SVG path or shape
  flipX?: boolean;
  flipY?: boolean;
}

export interface VideoElement extends BaseElement {
  type: 'video';
  src: string;
  poster?: string;
  duration: number; // in seconds
  startTime: number;
  endTime: number;
  volume: number; // 0 to 1
  loop: boolean;
  autoplay: boolean;
  speed: number;
  fit: 'cover' | 'contain' | 'fill';
}

export interface AudioElement extends BaseElement {
  type: 'audio';
  src: string;
  title: string;
  duration: number;
  volume: number;
  loop: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    backgroundColor?: string[];
  }[];
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'column' | 'pie' | 'doughnut' | 'line' | 'radar';
  data: ChartData;
  options: {
    showLegend?: boolean;
    showGrid?: boolean;
    title?: string;
    palette?: string[];
  };
}

export interface TableCell {
  row: number;
  col: number;
  text: string;
  fill?: string;
  textColor?: string;
  fontWeight?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  cells: TableCell[][];
  columnWidths?: number[];
  rowHeights?: number[];
  headerBg?: string;
  cellBorder?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface QRCodeElement extends BaseElement {
  type: 'qrcode';
  value: string;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logoSrc?: string;
}

export interface FrameElement extends BaseElement {
  type: 'frame';
  frameType: 'circle' | 'arch' | 'macbook' | 'iphone' | 'browser' | 'polaroid' | 'stamp';
  imageSrc?: string;
  clipPath?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface EmbedElement extends BaseElement {
  type: 'embed';
  embedType: 'youtube' | 'map' | 'lottie' | 'html';
  embedUrl: string;
}

export interface GroupElement extends BaseElement {
  type: 'group';
  childrenIds: string[];
}

export type CanvasElement =
  | TextElement
  | ShapeElement
  | LineElement
  | ImageElement
  | VideoElement
  | AudioElement
  | ChartElement
  | TableElement
  | QRCodeElement
  | FrameElement
  | EmbedElement
  | GroupElement;

export interface PageBackground {
  type: 'color' | 'gradient' | 'image' | 'pattern';
  color?: string;
  gradient?: GradientFill;
  imageSrc?: string;
  patternName?: string;
  opacity?: number;
}

export interface PageTransition {
  type: 'none' | 'fade' | 'slide' | 'wipe' | 'zoom' | 'flip' | 'dissolve';
  duration: number; // in seconds
}

export interface Page {
  id: string;
  name: string;
  width: number;
  height: number;
  background: PageBackground;
  elements: CanvasElement[];
  duration?: number; // for presentation / video (in seconds)
  transition?: PageTransition;
  notes?: string; // presenter notes
}

export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  additional?: string[];
}

export interface BrandFonts {
  heading: string;
  subheading: string;
  body: string;
}

export interface BrandLogo {
  id: string;
  name: string;
  url: string;
  isPrimary?: boolean;
}

export interface BrandKit {
  id: string;
  name: string;
  palette: BrandPalette;
  fonts: BrandFonts;
  logos: BrandLogo[];
  brandVoice?: string;
  lockedTemplates?: string[];
}

export interface DesignMetadata {
  aspectRatio?: string;
  category?: string;
  printBleedMm?: number;
  cropMarks?: boolean;
  tags?: string[];
  author?: string;
  isTemplate?: boolean;
  templateCategory?: string;
}

export interface Design {
  id: string;
  title: string;
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
  dpi: number;
  pages: Page[];
  brandKitId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  metadata?: DesignMetadata;
}

export interface PresetDimension {
  id: string;
  name: string;
  category: 'social' | 'presentation' | 'print' | 'video' | 'marketing' | 'custom';
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
  dpi?: number;
  icon?: string;
}
