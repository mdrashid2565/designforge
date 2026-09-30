import { z } from 'zod';

export const ToolSchemas = {
  // --- DESIGN TOOLS ---
  create_design: z.object({
    title: z.string().describe('Title of the new design'),
    width: z.number().positive().default(1080).describe('Canvas width in pixels'),
    height: z.number().positive().default(1080).describe('Canvas height in pixels'),
    unit: z.enum(['px', 'mm', 'in']).default('px').describe('Measurement unit'),
    preset: z.string().optional().describe('Preset ID e.g. instagram_post, youtube_thumbnail, presentation_16_9, print_a4'),
    backgroundColor: z.string().optional().default('#0F172A').describe('Initial canvas background color hex'),
  }),

  open_design: z.object({
    designId: z.string().describe('The ID of the design to load'),
  }),

  list_designs: z.object({
    limit: z.number().optional().default(20),
  }),

  duplicate_design: z.object({
    designId: z.string().describe('ID of design to clone'),
    newTitle: z.string().optional().describe('Optional new title for duplicated design'),
  }),

  delete_design: z.object({
    designId: z.string().describe('ID of design to delete'),
  }),

  add_page: z.object({
    designId: z.string().describe('Target design ID'),
    name: z.string().optional().default('New Page').describe('Name of the page'),
    backgroundColor: z.string().optional().default('#FFFFFF').describe('Background color'),
  }),

  delete_page: z.object({
    designId: z.string().describe('Target design ID'),
    pageId: z.string().describe('Page ID to delete'),
  }),

  reorder_pages: z.object({
    designId: z.string().describe('Target design ID'),
    pageOrder: z.array(z.string()).describe('Array of page IDs in target order'),
  }),

  // --- ELEMENT TOOLS ---
  add_text: z.object({
    designId: z.string().describe('Target design ID'),
    pageIndex: z.number().optional().default(0),
    text: z.string().describe('Text content'),
    x: z.number().describe('Horizontal position'),
    y: z.number().describe('Vertical position'),
    width: z.number().optional().default(400),
    height: z.number().optional().default(60),
    fontSize: z.number().optional().default(32),
    fontFamily: z.string().optional().default('Inter'),
    fontWeight: z.union([z.number(), z.string()]).optional().default(700),
    textAlign: z.enum(['left', 'center', 'right', 'justify']).optional().default('left'),
    fill: z.string().optional().default('#FFFFFF'),
    textEffect: z.enum(['none', 'shadow', 'lift', 'hollow', 'splice', 'outline', 'echo', 'glitch', 'neon', 'background']).optional(),
    effectColor: z.string().optional(),
    rotation: z.number().optional().default(0),
    language: z.string().optional().describe("Language tag e.g. 'hi' for Hindi"),
  }),

  add_shape: z.object({
    designId: z.string().describe('Target design ID'),
    pageIndex: z.number().optional().default(0),
    shapeType: z.enum(['rect', 'circle', 'ellipse', 'triangle', 'star', 'polygon', 'heart', 'arrow', 'badge', 'cloud', 'speech_bubble']),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    fill: z.string().default('#6366F1'),
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    cornerRadius: z.number().optional(),
    opacity: z.number().optional().default(1),
    rotation: z.number().optional().default(0),
  }),

  add_image: z.object({
    designId: z.string().describe('Target design ID'),
    pageIndex: z.number().optional().default(0),
    src: z.string().describe('Image URL or Data URI'),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    alt: z.string().optional(),
    rotation: z.number().optional().default(0),
  }),

  add_chart: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    chartType: z.enum(['bar', 'column', 'pie', 'doughnut', 'line', 'radar']).default('bar'),
    labels: z.array(z.string()).describe('Chart labels'),
    data: z.array(z.number()).describe('Numerical data points'),
    datasetLabel: z.string().optional().default('Metric'),
    color: z.string().optional().default('#6366F1'),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),

  add_table: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    rows: z.number().min(1),
    cols: z.number().min(1),
    headers: z.array(z.string()).optional(),
    rowsData: z.array(z.array(z.string())).optional(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),

  add_qrcode: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    value: z.string().describe('URL or text payload encoded in QR code'),
    x: z.number(),
    y: z.number(),
    width: z.number().default(150),
    height: z.number().default(150),
    fgColor: z.string().optional().default('#000000'),
    bgColor: z.string().optional().default('#FFFFFF'),
  }),

  update_element: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string().describe('ID of element to update'),
    updates: z.record(z.any()).describe('Key-value pairs of properties to update'),
  }),

  move_resize_rotate: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    rotation: z.number().optional(),
  }),

  delete_element: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string(),
  }),

  group_elements: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementIds: z.array(z.string()).min(2),
  }),

  ungroup_elements: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    groupId: z.string(),
  }),

  set_style: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string(),
    fill: z.union([z.string(), z.any()]).optional(),
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    opacity: z.number().min(0).max(1).optional(),
    blendMode: z.string().optional(),
  }),

  apply_filter: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string(),
    brightness: z.number().optional(),
    contrast: z.number().optional(),
    saturation: z.number().optional(),
    blur: z.number().optional(),
    grayscale: z.number().optional(),
    sepia: z.number().optional(),
  }),

  set_animation: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string(),
    type: z.enum(['fade', 'slide', 'zoom', 'bounce', 'pulse', 'typewriter', 'neon', 'rotate', 'wipe']),
    direction: z.enum(['in', 'out', 'left', 'right', 'top', 'bottom']).optional(),
    duration: z.number().default(0.5),
    delay: z.number().default(0),
    loop: z.boolean().optional(),
  }),

  align_distribute: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementIds: z.array(z.string()),
    action: z.enum([
      'align_left',
      'align_center',
      'align_right',
      'align_top',
      'align_middle',
      'align_bottom',
      'distribute_horizontally',
      'distribute_vertically',
    ]),
  }),

  bring_to_front: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string(),
  }),

  send_to_back: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string(),
  }),

  // --- BATCH / TRANSACTION ---
  apply_operations: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    operations: z.array(
      z.object({
        op: z.string(),
        params: z.record(z.any()),
      })
    ),
  }),

  // --- TEMPLATE & BRAND ---
  search_templates: z.object({
    query: z.string().optional().default(''),
    category: z.string().optional(),
  }),

  apply_template: z.object({
    templateId: z.string(),
    placeholders: z.record(z.string()).optional(),
  }),

  get_brand_kit: z.object({
    brandKitId: z.string().optional().default('brand_aurora_tech'),
  }),

  apply_brand_kit: z.object({
    designId: z.string(),
    brandKitId: z.string(),
  }),

  magic_resize: z.object({
    designId: z.string(),
    targetPreset: z.string().describe('Target preset ID e.g. instagram_story, youtube_thumbnail, print_a4'),
  }),

  // --- ASSETS & GENERATION ---
  upload_asset: z.object({
    name: z.string(),
    url: z.string(),
    category: z.enum(['photos', 'illustrations', 'icons', 'videos', 'audio']).default('photos'),
    tags: z.array(z.string()).optional(),
  }),

  search_assets: z.object({
    query: z.string().optional(),
    category: z.enum(['photos', 'illustrations', 'icons', 'videos', 'audio']).optional(),
  }),

  generate_image: z.object({
    prompt: z.string().describe('Image generation prompt'),
    style: z.string().optional().default('realistic'),
  }),

  remove_background: z.object({
    imageUrl: z.string(),
  }),

  // --- EXPORT & SHARE ---
  export_design: z.object({
    designId: z.string(),
    format: z.enum(['png', 'svg', 'json', 'pdf']),
    pageIndex: z.number().optional().default(0),
  }),

  create_share_link: z.object({
    designId: z.string(),
    permission: z.enum(['view', 'comment', 'edit']).default('view'),
  }),

  publish_website: z.object({
    designId: z.string(),
    slug: z.string().optional(),
  }),

  // --- READ & INSPECTION ---
  get_design_json: z.object({
    designId: z.string(),
  }),

  get_element: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    elementId: z.string(),
  }),

  get_history: z.object({
    designId: z.string(),
  }),

  get_screenshot: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
  }),

  list_fonts: z.object({}),

  list_workspace_members: z.object({}),

  // --- UNDO / REDO / REVERT ---
  undo: z.object({
    designId: z.string(),
  }),

  redo: z.object({
    designId: z.string(),
  }),

  revert_ai_session: z.object({
    designId: z.string(),
  }),

  // --- TEAM / COMMENTS ---
  add_comment: z.object({
    designId: z.string(),
    pageIndex: z.number().optional().default(0),
    x: z.number(),
    y: z.number(),
    content: z.string(),
    author: z.string().optional().default('AI Collaborator'),
  }),

  resolve_comment: z.object({
    designId: z.string(),
    commentId: z.string(),
  }),

  assign_reviewer: z.object({
    designId: z.string(),
    reviewerEmail: z.string(),
  }),

  request_approval: z.object({
    designId: z.string(),
    note: z.string().optional(),
  }),
};
