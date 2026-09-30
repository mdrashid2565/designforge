import { exportDesignToJSON } from '@designforge/core';
import { globalStore } from './store.js';

export function listMCPResources() {
  const designs = globalStore.listDesigns();
  const brandKits = globalStore.listBrandKits();

  const resources = [
    ...designs.map((d) => ({
      uri: `design://${d.id}`,
      name: `Design: ${d.title}`,
      description: `Complete JSON scene graph for design '${d.title}' (${d.width}x${d.height}px, ${d.pages.length} pages)`,
      mimeType: 'application/json',
    })),
    ...brandKits.map((b) => ({
      uri: `brand://${b.id}`,
      name: `Brand Kit: ${b.name}`,
      description: `Typography, color palette, and assets for '${b.name}'`,
      mimeType: 'application/json',
    })),
  ];

  return resources;
}

export function readMCPResource(uri: string): { contents: { uri: string; mimeType: string; text: string }[] } {
  if (uri.startsWith('design://')) {
    const id = uri.replace('design://', '');
    const design = globalStore.getDesign(id);
    if (!design) throw new Error(`Design resource '${uri}' not found`);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: exportDesignToJSON(design),
        },
      ],
    };
  }

  if (uri.startsWith('brand://')) {
    const id = uri.replace('brand://', '');
    const kit = globalStore.getBrandKit(id);
    if (!kit) throw new Error(`Brand kit resource '${uri}' not found`);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(kit, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unsupported URI schema: ${uri}`);
}
