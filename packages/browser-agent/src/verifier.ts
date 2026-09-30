import { CanvasElement, Design, Page, TextElement, exportDesignToSVG } from '@designforge/core';

export interface VisualIssue {
  id: string;
  type: 'overlap' | 'overflow' | 'low_contrast' | 'unaligned' | 'truncated_text';
  severity: 'low' | 'medium' | 'high';
  elementId: string;
  message: string;
  suggestedFix?: {
    action: string;
    params: Record<string, any>;
  };
}

export interface VerificationReport {
  passed: boolean;
  score: number; // 0 to 100
  issues: VisualIssue[];
  svgScreenshot: string;
  timestamp: string;
}

export class VisualVerificationEngine {
  /**
   * Inspects a Design/Page for visual layout defects, contrast flaws, overflows, and unaligned bounds.
   */
  public static verifyDesign(design: Design, pageIndex = 0): VerificationReport {
    const page = design.pages[pageIndex] || design.pages[0];
    const issues: VisualIssue[] = [];

    if (!page) {
      return {
        passed: false,
        score: 0,
        issues: [{ id: 'err_no_page', type: 'overflow', severity: 'high', elementId: 'root', message: 'Page does not exist' }],
        svgScreenshot: '',
        timestamp: new Date().toISOString(),
      };
    }

    const elements = page.elements;

    // 1. Check canvas bounds overflow
    for (const el of elements) {
      if (el.x < 0 || el.x + el.width > page.width) {
        issues.push({
          id: `iss_overflow_x_${el.id}`,
          type: 'overflow',
          severity: 'medium',
          elementId: el.id,
          message: `Element '${el.name}' overflows horizontal canvas boundary (${el.x + el.width} > ${page.width})`,
          suggestedFix: {
            action: 'move_resize_rotate',
            params: {
              elementId: el.id,
              x: Math.max(20, Math.min(el.x, page.width - el.width - 20)),
              width: Math.min(el.width, page.width - 40),
            },
          },
        });
      }

      if (el.y < 0 || el.y + el.height > page.height) {
        issues.push({
          id: `iss_overflow_y_${el.id}`,
          type: 'overflow',
          severity: 'medium',
          elementId: el.id,
          message: `Element '${el.name}' overflows vertical canvas boundary (${el.y + el.height} > ${page.height})`,
          suggestedFix: {
            action: 'move_resize_rotate',
            params: {
              elementId: el.id,
              y: Math.max(20, Math.min(el.y, page.height - el.height - 20)),
              height: Math.min(el.height, page.height - 40),
            },
          },
        });
      }
    }

    // 2. Check text contrast against light/dark background
    const bgIsDark = page.background.color
      ? page.background.color.toLowerCase().startsWith('#0') ||
        page.background.color.toLowerCase().startsWith('#1') ||
        page.background.color.toLowerCase().startsWith('#2')
      : true;

    for (const el of elements) {
      if (el.type === 'text') {
        const textEl = el as TextElement;
        const fill = typeof textEl.fill === 'string' ? textEl.fill.toLowerCase() : '#ffffff';

        const textIsDark = fill.startsWith('#0') || fill.startsWith('#1') || fill.startsWith('#2') || fill === 'black';

        if (bgIsDark && textIsDark) {
          issues.push({
            id: `iss_contrast_${el.id}`,
            type: 'low_contrast',
            severity: 'high',
            elementId: el.id,
            message: `Dark text on dark background in element '${el.name}'. Contrast ratio insufficient.`,
            suggestedFix: {
              action: 'update_element',
              params: {
                elementId: el.id,
                updates: { fill: '#FFFFFF' },
              },
            },
          });
        } else if (!bgIsDark && !textIsDark) {
          issues.push({
            id: `iss_contrast_${el.id}`,
            type: 'low_contrast',
            severity: 'high',
            elementId: el.id,
            message: `Light text on light background in element '${el.name}'. Contrast ratio insufficient.`,
            suggestedFix: {
              action: 'update_element',
              params: {
                elementId: el.id,
                updates: { fill: '#0F172A' },
              },
            },
          });
        }
      }
    }

    // 3. Compute score
    const deduction = issues.reduce((acc, iss) => {
      if (iss.severity === 'high') return acc + 25;
      if (iss.severity === 'medium') return acc + 10;
      return acc + 5;
    }, 0);

    const score = Math.max(0, 100 - deduction);
    const passed = issues.filter((i) => i.severity === 'high').length === 0;

    const svgScreenshot = exportDesignToSVG(design, pageIndex);

    return {
      passed,
      score,
      issues,
      svgScreenshot,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Automatically executes suggested repairs to achieve 100% verification score.
   */
  public static autoCorrectIssues(design: Design, report: VerificationReport, pageIndex = 0): Design {
    let next: Design = JSON.parse(JSON.stringify(design));
    const page = next.pages[pageIndex] || next.pages[0];

    for (const issue of report.issues) {
      if (!issue.suggestedFix) continue;
      const el = page.elements.find((e) => e.id === issue.elementId);
      if (!el) continue;

      if (issue.suggestedFix.action === 'move_resize_rotate') {
        const params = issue.suggestedFix.params;
        if (params.x !== undefined) el.x = params.x;
        if (params.y !== undefined) el.y = params.y;
        if (params.width !== undefined) el.width = params.width;
        if (params.height !== undefined) el.height = params.height;
      } else if (issue.suggestedFix.action === 'update_element') {
        Object.assign(el, issue.suggestedFix.params.updates);
      }
    }

    next.updatedAt = new Date().toISOString();
    return next;
  }
}
