import { z } from 'zod';

export const GradientFillSchema = z.object({
  type: z.enum(['linear', 'radial']),
  angle: z.number().optional(),
  stops: z.array(
    z.object({
      offset: z.number().min(0).max(1),
      color: z.string(),
      opacity: z.number().min(0).max(1).optional(),
    })
  ),
});

export const FillTypeSchema = z.union([z.string(), GradientFillSchema]);

export const ElementAnimationSchema = z.object({
  type: z.enum(['fade', 'slide', 'zoom', 'bounce', 'pulse', 'typewriter', 'neon', 'rotate', 'wipe']),
  direction: z.enum(['in', 'out', 'left', 'right', 'top', 'bottom']).optional(),
  duration: z.number().min(0.1).default(0.5),
  delay: z.number().min(0).default(0),
  loop: z.boolean().optional(),
  easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'spring']).optional(),
});

export const BaseElementSchema = z.object({
  id: z.string(),
  type: z.enum([
    'text',
    'shape',
    'line',
    'image',
    'video',
    'audio',
    'chart',
    'table',
    'qrcode',
    'frame',
    'embed',
    'group',
  ]),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(1),
  height: z.number().min(1),
  rotation: z.number().default(0),
  scaleX: z.number().default(1).optional(),
  scaleY: z.number().default(1).optional(),
  opacity: z.number().min(0).max(1).default(1),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
  zIndex: z.number().default(0),
  blendMode: z
    .enum([
      'normal',
      'multiply',
      'screen',
      'overlay',
      'darken',
      'lighten',
      'color-dodge',
      'color-burn',
      'hard-light',
      'soft-light',
      'difference',
      'exclusion',
    ])
    .optional(),
  animation: ElementAnimationSchema.optional(),
  linkUrl: z.string().optional(),
  customData: z.record(z.any()).optional(),
});

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().min(6).default(24),
  fontWeight: z.union([z.number(), z.string()]).default(400),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  fill: FillTypeSchema.default('#111827'),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  letterSpacing: z.number().optional(),
  lineHeight: z.number().optional(),
  shadow: z
    .object({
      color: z.string(),
      blur: z.number(),
      offsetX: z.number(),
      offsetY: z.number(),
    })
    .optional(),
  textEffect: z
    .enum(['none', 'shadow', 'lift', 'hollow', 'splice', 'outline', 'echo', 'glitch', 'neon', 'background'])
    .optional(),
  effectColor: z.string().optional(),
  effectIntensity: z.number().optional(),
  curved: z
    .object({
      radius: z.number(),
      angle: z.number(),
    })
    .optional(),
  rtl: z.boolean().optional(),
  language: z.string().optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
});

export const ShapeElementSchema = BaseElementSchema.extend({
  type: z.literal('shape'),
  shapeType: z.enum([
    'rect',
    'circle',
    'ellipse',
    'triangle',
    'star',
    'polygon',
    'heart',
    'arrow',
    'badge',
    'cloud',
    'speech_bubble',
  ]),
  fill: FillTypeSchema.default('#3B82F6'),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  strokeDashArray: z.array(z.number()).optional(),
  cornerRadius: z.number().optional(),
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  innerRadius: z.number().optional(),
  spikes: z.number().optional(),
});

export const LineElementSchema = BaseElementSchema.extend({
  type: z.literal('line'),
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  stroke: z.string().default('#000000'),
  strokeWidth: z.number().default(2),
  strokeStyle: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
  startMarker: z.enum(['none', 'arrow', 'circle', 'bar']).optional(),
  endMarker: z.enum(['none', 'arrow', 'circle', 'bar']).optional(),
  curved: z.boolean().optional(),
  controlX: z.number().optional(),
  controlY: z.number().optional(),
});

export const ImageFilterSchema = z.object({
  brightness: z.number().optional(),
  contrast: z.number().optional(),
  saturation: z.number().optional(),
  blur: z.number().optional(),
  grayscale: z.number().optional(),
  sepia: z.number().optional(),
  hueRotate: z.number().optional(),
  invert: z.number().optional(),
  duotone: z
    .object({
      primaryColor: z.string(),
      secondaryColor: z.string(),
    })
    .optional(),
});

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
  originalWidth: z.number().default(800),
  originalHeight: z.number().default(600),
  crop: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  filter: ImageFilterSchema.optional(),
  maskShape: z.string().optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
});

export const ChartDataSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(
    z.object({
      label: z.string(),
      data: z.array(z.number()),
      color: z.string().optional(),
      backgroundColor: z.array(z.string()).optional(),
    })
  ),
});

export const ChartElementSchema = BaseElementSchema.extend({
  type: z.literal('chart'),
  chartType: z.enum(['bar', 'column', 'pie', 'doughnut', 'line', 'radar']),
  data: ChartDataSchema,
  options: z.object({
    showLegend: z.boolean().optional(),
    showGrid: z.boolean().optional(),
    title: z.string().optional(),
    palette: z.array(z.string()).optional(),
  }),
});

export const TableCellSchema = z.object({
  row: z.number(),
  col: z.number(),
  text: z.string(),
  fill: z.string().optional(),
  textColor: z.string().optional(),
  fontWeight: z.union([z.string(), z.number()]).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
});

export const TableElementSchema = BaseElementSchema.extend({
  type: z.literal('table'),
  rows: z.number().min(1),
  cols: z.number().min(1),
  cells: z.array(z.array(TableCellSchema)),
  columnWidths: z.array(z.number()).optional(),
  rowHeights: z.array(z.number()).optional(),
  headerBg: z.string().optional(),
  cellBorder: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
});

export const QRCodeElementSchema = BaseElementSchema.extend({
  type: z.literal('qrcode'),
  value: z.string(),
  fgColor: z.string().default('#000000'),
  bgColor: z.string().default('#FFFFFF'),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  logoSrc: z.string().optional(),
});

export const FrameElementSchema = BaseElementSchema.extend({
  type: z.literal('frame'),
  frameType: z.enum(['circle', 'arch', 'macbook', 'iphone', 'browser', 'polaroid', 'stamp']),
  imageSrc: z.string().optional(),
  clipPath: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
});

export const CanvasElementSchema = z.discriminatedUnion('type', [
  TextElementSchema,
  ShapeElementSchema,
  LineElementSchema,
  ImageElementSchema,
  ChartElementSchema,
  TableElementSchema,
  QRCodeElementSchema,
  FrameElementSchema,
  BaseElementSchema.extend({
    type: z.enum(['video', 'audio', 'embed', 'group']),
  }).passthrough(),
]);

export const PageBackgroundSchema = z.object({
  type: z.enum(['color', 'gradient', 'image', 'pattern']),
  color: z.string().optional(),
  gradient: GradientFillSchema.optional(),
  imageSrc: z.string().optional(),
  patternName: z.string().optional(),
  opacity: z.number().optional(),
});

export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  width: z.number(),
  height: z.number(),
  background: PageBackgroundSchema,
  elements: z.array(CanvasElementSchema),
  duration: z.number().optional(),
  transition: z
    .object({
      type: z.enum(['none', 'fade', 'slide', 'wipe', 'zoom', 'flip', 'dissolve']),
      duration: z.number(),
    })
    .optional(),
  notes: z.string().optional(),
});

export const DesignSchema = z.object({
  id: z.string(),
  title: z.string(),
  width: z.number(),
  height: z.number(),
  unit: z.enum(['px', 'mm', 'in']).default('px'),
  dpi: z.number().default(72),
  pages: z.array(PageSchema),
  brandKitId: z.string().optional(),
  version: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z
    .object({
      aspectRatio: z.string().optional(),
      category: z.string().optional(),
      printBleedMm: z.number().optional(),
      cropMarks: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      author: z.string().optional(),
      isTemplate: z.boolean().optional(),
      templateCategory: z.string().optional(),
    })
    .optional(),
});
