import { Design } from '../types.js';
import { TEMPLATE_LIBRARY, TemplateDefinition } from './template-library.js';

export * from './template-library.js';

export function getTemplatesByCategory(category?: string): TemplateDefinition[] {
  if (!category || category === 'all') return TEMPLATE_LIBRARY;
  return TEMPLATE_LIBRARY.filter((t) => t.category === category);
}

export function searchTemplates(query: string, category?: string): TemplateDefinition[] {
  const normalized = query.toLowerCase().trim();
  let list = TEMPLATE_LIBRARY;
  if (category && category !== 'all') {
    list = list.filter((t) => t.category === category);
  }
  if (!normalized) return list;

  return list.filter((t) => {
    return (
      t.title.toLowerCase().includes(normalized) ||
      t.description.toLowerCase().includes(normalized) ||
      t.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  });
}

export function instantiateTemplate(templateId: string, placeholders?: Record<string, string>): Design {
  const template = TEMPLATE_LIBRARY.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const designCopy: Design = JSON.parse(JSON.stringify(template.design));
  designCopy.id = `design_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  designCopy.createdAt = new Date().toISOString();
  designCopy.updatedAt = new Date().toISOString();
  designCopy.version = 1;

  if (placeholders) {
    for (const page of designCopy.pages) {
      for (const el of page.elements) {
        if (el.type === 'text') {
          for (const [key, val] of Object.entries(placeholders)) {
            el.text = el.text.replace(new RegExp(`{{${key}}}`, 'g'), val);
          }
        }
      }
    }
  }

  return designCopy;
}
