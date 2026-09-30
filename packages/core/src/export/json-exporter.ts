import { DesignSchema } from '../schema.js';
import { Design } from '../types.js';

export function exportDesignToJSON(design: Design, pretty = true): string {
  // Validate against Zod schema
  const parsed = DesignSchema.parse(design);
  return JSON.stringify(parsed, null, pretty ? 2 : undefined);
}

export function importDesignFromJSON(jsonString: string): Design {
  const obj = JSON.parse(jsonString);
  const validated = DesignSchema.parse(obj);
  return validated as Design;
}
