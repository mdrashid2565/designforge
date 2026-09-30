import { BrandKit, Design } from '../types.js';

export const DEFAULT_BRAND_KITS: BrandKit[] = [
  {
    id: 'brand_aurora_tech',
    name: 'Aurora Modern Tech',
    palette: {
      primary: '#6366F1', // Indigo
      secondary: '#8B5CF6', // Purple
      accent: '#EC4899', // Pink
      background: '#0F172A', // Slate 900
      text: '#F8FAFC', // Slate 50
      additional: ['#38BDF8', '#10B981', '#F59E0B'],
    },
    fonts: {
      heading: 'Poppins',
      subheading: 'Inter',
      body: 'Inter',
    },
    logos: [
      {
        id: 'logo_aurora_dark',
        name: 'Aurora Tech Logo (Dark)',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" rx="8" fill="%236366F1"/><text x="60" y="25" fill="%23ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">AURORA</text></svg>',
        isPrimary: true,
      },
    ],
    brandVoice: 'Futuristic, bold, confident, clear, and high-impact.',
  },
  {
    id: 'brand_emerald_growth',
    name: 'Emerald Ventures',
    palette: {
      primary: '#059669', // Emerald
      secondary: '#10B981',
      accent: '#F59E0B', // Amber
      background: '#FFFFFF',
      text: '#1E293B',
      additional: ['#D1FAE5', '#34D399', '#065F46'],
    },
    fonts: {
      heading: 'Montserrat',
      subheading: 'Plus Jakarta Sans',
      body: 'Inter',
    },
    logos: [
      {
        id: 'logo_emerald',
        name: 'Emerald Logo',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" rx="8" fill="%23059669"/><text x="60" y="25" fill="%23ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">EMERALD</text></svg>',
        isPrimary: true,
      },
    ],
    brandVoice: 'Professional, trustworthy, sustainable, and data-driven.',
  },
  {
    id: 'brand_crimson_luxe',
    name: 'Crimson & Gold Luxury',
    palette: {
      primary: '#E11D48', // Rose
      secondary: '#F59E0B', // Amber Gold
      accent: '#BE185D',
      background: '#18181B', // Zinc 900
      text: '#FFFBEB',
      additional: ['#881337', '#FEF3C7', '#450A0A'],
    },
    fonts: {
      heading: 'Playfair Display',
      subheading: 'Cinzel',
      body: 'Lato',
    },
    logos: [
      {
        id: 'logo_crimson',
        name: 'Crimson Luxe Crest',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" rx="8" fill="%23E11D48"/><text x="60" y="25" fill="%23ffffff" font-family="serif" font-size="16" font-weight="bold" text-anchor="middle">CRIMSON</text></svg>',
        isPrimary: true,
      },
    ],
    brandVoice: 'Sophisticated, elegant, premium, exclusive, and evocative.',
  },
];

export function applyBrandKitToDesign(design: Design, brandKit: BrandKit): Design {
  const next: Design = JSON.parse(JSON.stringify(design));
  next.brandKitId = brandKit.id;

  for (const page of next.pages) {
    if (page.background.type === 'color' && brandKit.palette.background) {
      page.background.color = brandKit.palette.background;
    }

    for (const el of page.elements) {
      if (el.type === 'text') {
        if (el.fontSize >= 32 && brandKit.fonts.heading) {
          el.fontFamily = brandKit.fonts.heading;
        } else if (el.fontSize >= 20 && brandKit.fonts.subheading) {
          el.fontFamily = brandKit.fonts.subheading;
        } else if (brandKit.fonts.body) {
          el.fontFamily = brandKit.fonts.body;
        }

        if (typeof el.fill === 'string') {
          el.fill = brandKit.palette.text || '#111827';
        }
      } else if (el.type === 'shape') {
        if (typeof el.fill === 'string') {
          el.fill = brandKit.palette.primary || '#3B82F6';
        }
      }
    }
  }

  next.updatedAt = new Date().toISOString();
  next.version += 1;
  return next;
}
