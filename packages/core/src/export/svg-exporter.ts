import { CanvasElement, ChartElement, Design, GradientFill, Page, QRCodeElement, ShapeElement, TableCell, TableElement, TextElement } from '../types.js';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderGradientDef(id: string, gradient: GradientFill): string {
  if (gradient.type === 'radial') {
    const stops = gradient.stops
      .map((s) => `<stop offset="${s.offset * 100}%" stop-color="${s.color}" stop-opacity="${s.opacity ?? 1}"/>`)
      .join('');
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`;
  } else {
    const angle = gradient.angle || 0;
    const rad = (angle * Math.PI) / 180;
    const x1 = Math.round(50 - Math.cos(rad) * 50);
    const y1 = Math.round(50 - Math.sin(rad) * 50);
    const x2 = Math.round(50 + Math.cos(rad) * 50);
    const y2 = Math.round(50 + Math.sin(rad) * 50);
    const stops = gradient.stops
      .map((s) => `<stop offset="${s.offset * 100}%" stop-color="${s.color}" stop-opacity="${s.opacity ?? 1}"/>`)
      .join('');
    return `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
  }
}

function renderShape(el: ShapeElement, defs: string[]): string {
  let fillAttr = 'fill="none"';
  if (typeof el.fill === 'string') {
    fillAttr = `fill="${el.fill}"`;
  } else if (el.fill && typeof el.fill === 'object') {
    const gradId = `grad_${el.id}`;
    defs.push(renderGradientDef(gradId, el.fill));
    fillAttr = `fill="url(#${gradId})"`;
  }

  const strokeAttr = el.stroke ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
  const dashAttr = el.strokeDashArray ? `stroke-dasharray="${el.strokeDashArray.join(' ')}"` : '';

  switch (el.shapeType) {
    case 'circle': {
      const r = Math.min(el.width, el.height) / 2;
      return `<circle cx="${el.x + r}" cy="${el.y + r}" r="${r}" ${fillAttr} ${strokeAttr} ${dashAttr}/>`;
    }
    case 'ellipse': {
      const rx = el.width / 2;
      const ry = el.height / 2;
      return `<ellipse cx="${el.x + rx}" cy="${el.y + ry}" rx="${rx}" ry="${ry}" ${fillAttr} ${strokeAttr} ${dashAttr}/>`;
    }
    case 'triangle': {
      const points = `${el.x + el.width / 2},${el.y} ${el.x + el.width},${el.y + el.height} ${el.x},${el.y + el.height}`;
      return `<polygon points="${points}" ${fillAttr} ${strokeAttr} ${dashAttr}/>`;
    }
    case 'star': {
      const spikes = el.spikes || 5;
      const outerR = Math.min(el.width, el.height) / 2;
      const innerR = outerR * 0.45;
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      let pts: string[] = [];
      let step = Math.PI / spikes;
      let rot = (Math.PI / 2) * 3;

      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerR;
        let y = cy + Math.sin(rot) * outerR;
        pts.push(`${x},${y}`);
        rot += step;
        x = cx + Math.cos(rot) * innerR;
        y = cy + Math.sin(rot) * innerR;
        pts.push(`${x},${y}`);
        rot += step;
      }
      return `<polygon points="${pts.join(' ')}" ${fillAttr} ${strokeAttr} ${dashAttr}/>`;
    }
    case 'rect':
    default: {
      const rx = el.cornerRadius || 0;
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ry="${rx}" ${fillAttr} ${strokeAttr} ${dashAttr}/>`;
    }
  }
}

function renderText(el: TextElement, defs: string[]): string {
  let fillAttr = `fill="${typeof el.fill === 'string' ? el.fill : '#000000'}"`;
  if (typeof el.fill === 'object') {
    const gradId = `grad_${el.id}`;
    defs.push(renderGradientDef(gradId, el.fill));
    fillAttr = `fill="url(#${gradId})"`;
  }

  const lines = el.text.split('\n');
  const fontSize = el.fontSize || 24;
  const lineHeight = (el.lineHeight || 1.2) * fontSize;
  const fontWeight = el.fontWeight || 400;
  const fontFamily = el.fontFamily || 'Inter, sans-serif';

  let textAnchor = 'start';
  let posX = el.x;
  if (el.textAlign === 'center') {
    textAnchor = 'middle';
    posX = el.x + el.width / 2;
  } else if (el.textAlign === 'right') {
    textAnchor = 'end';
    posX = el.x + el.width;
  }

  let filterAttr = '';
  if (el.shadow) {
    const filterId = `shadow_${el.id}`;
    defs.push(`
      <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="${el.shadow.offsetX}" dy="${el.shadow.offsetY}" stdDeviation="${el.shadow.blur / 2}" flood-color="${el.shadow.color}"/>
      </filter>
    `);
    filterAttr = `filter="url(#${filterId})"`;
  }

  const tspans = lines
    .map((line, idx) => {
      const dy = idx === 0 ? fontSize : lineHeight;
      return `<tspan x="${posX}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');

  return `
    <text x="${posX}" y="${el.y}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="${textAnchor}" ${fillAttr} ${filterAttr} letter-spacing="${el.letterSpacing || 0}">
      ${tspans}
    </text>
  `;
}

function renderChart(el: ChartElement): string {
  const { data, chartType, width, height, x, y } = el;
  const labels = data.labels;
  const dataset = data.datasets[0];
  if (!dataset || !dataset.data.length) return '';

  const maxVal = Math.max(...dataset.data, 1);
  const barCount = dataset.data.length;
  const gap = 12;
  const barWidth = (width - gap * (barCount + 1)) / barCount;
  const baseColor = dataset.color || '#6366F1';

  let svgContent = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" fill="#131B2E" stroke="#334155" stroke-width="1"/>`;

  dataset.data.forEach((val, i) => {
    const barHeight = (val / maxVal) * (height - 80);
    const barX = x + gap + i * (barWidth + gap);
    const barY = y + height - 40 - barHeight;

    svgContent += `
      <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="6" fill="${baseColor}"/>
      <text x="${barX + barWidth / 2}" y="${y + height - 15}" fill="#94A3B8" font-size="12" font-family="Inter, sans-serif" text-anchor="middle">${escapeXml(labels[i] || '')}</text>
      <text x="${barX + barWidth / 2}" y="${barY - 8}" fill="#FFFFFF" font-size="11" font-weight="bold" font-family="Inter, sans-serif" text-anchor="middle">${val}</text>
    `;
  });

  return svgContent;
}

function renderTable(el: TableElement): string {
  const { x, y, width, height, rows, cols, cells, headerBg, cellBorder } = el;
  const colWidth = width / cols;
  const rowHeight = height / rows;
  let svg = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#FFFFFF" stroke="${cellBorder || '#CBD5E1'}" stroke-width="1"/>`;

  for (let r = 0; r < rows; r++) {
    const isHeader = r === 0;
    const bg = isHeader ? headerBg || '#F1F5F9' : '#FFFFFF';
    svg += `<rect x="${x}" y="${y + r * rowHeight}" width="${width}" height="${rowHeight}" fill="${bg}"/>`;

    for (let c = 0; c < cols; c++) {
      const cell: TableCell = cells[r] && cells[r][c] ? cells[r][c] : { row: r, col: c, text: '' };
      const cellX = x + c * colWidth;
      const cellY = y + r * rowHeight;
      const fontWt = isHeader || cell.fontWeight === 'bold' ? 'bold' : 'normal';

      svg += `
        <rect x="${cellX}" y="${cellY}" width="${colWidth}" height="${rowHeight}" fill="none" stroke="${cellBorder || '#E2E8F0'}" stroke-width="1"/>
        <text x="${cellX + 10}" y="${cellY + rowHeight / 2 + 5}" font-family="Inter, sans-serif" font-size="13" font-weight="${fontWt}" fill="${isHeader ? '#0F172A' : '#334155'}">
          ${escapeXml(cell.text || '')}
        </text>
      `;
    }
  }

  return svg;
}

function renderQRCode(el: QRCodeElement): string {
  const { x, y, width, height, fgColor, bgColor } = el;
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="8"/>
      <!-- QR Corner 1 -->
      <rect x="10" y="10" width="30" height="30" fill="${fgColor}"/>
      <rect x="16" y="16" width="18" height="18" fill="${bgColor}"/>
      <rect x="20" y="20" width="10" height="10" fill="${fgColor}"/>
      <!-- QR Corner 2 -->
      <rect x="${width - 40}" y="10" width="30" height="30" fill="${fgColor}"/>
      <rect x="${width - 34}" y="16" width="18" height="18" fill="${bgColor}"/>
      <rect x="${width - 30}" y="20" width="10" height="10" fill="${fgColor}"/>
      <!-- QR Corner 3 -->
      <rect x="10" y="${height - 40}" width="30" height="30" fill="${fgColor}"/>
      <rect x="16" y="${height - 34}" width="18" height="18" fill="${bgColor}"/>
      <rect x="20" y="${height - 30}" width="10" height="10" fill="${fgColor}"/>
      <!-- Center pattern -->
      <rect x="${width / 2 - 10}" y="${height / 2 - 10}" width="20" height="20" fill="${fgColor}"/>
    </g>
  `;
}

export function exportPageToSVG(page: Page, options?: { includeBleed?: boolean; bleedMm?: number }): string {
  const defs: string[] = [];
  let elementsSvg = '';

  // Background
  let bgSvg = '';
  if (page.background.type === 'color' && page.background.color) {
    bgSvg = `<rect width="${page.width}" height="${page.height}" fill="${page.background.color}"/>`;
  } else if (page.background.type === 'gradient' && page.background.gradient) {
    const bgGradId = `bg_grad_${page.id}`;
    defs.push(renderGradientDef(bgGradId, page.background.gradient));
    bgSvg = `<rect width="${page.width}" height="${page.height}" fill="url(#${bgGradId})"/>`;
  }

  // Sort by zIndex
  const sorted = [...page.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const el of sorted) {
    if (!el.visible) continue;
    let elOutput = '';

    switch (el.type) {
      case 'shape':
        elOutput = renderShape(el as ShapeElement, defs);
        break;
      case 'text':
        elOutput = renderText(el as TextElement, defs);
        break;
      case 'chart':
        elOutput = renderChart(el as ChartElement);
        break;
      case 'table':
        elOutput = renderTable(el as TableElement);
        break;
      case 'qrcode':
        elOutput = renderQRCode(el as QRCodeElement);
        break;
      case 'image':
        elOutput = `<image href="${(el as any).src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" opacity="${el.opacity ?? 1}"/>`;
        break;
      default:
        break;
    }

    if (elOutput) {
      if (el.rotation && el.rotation !== 0) {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        elementsSvg += `<g transform="rotate(${el.rotation} ${cx} ${cy})">${elOutput}</g>\n`;
      } else {
        elementsSvg += `${elOutput}\n`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${page.width} ${page.height}" width="${page.width}" height="${page.height}">
      <defs>
        ${defs.join('\n')}
      </defs>
      ${bgSvg}
      ${elementsSvg}
    </svg>
  `.trim();
}

export function exportDesignToSVG(design: Design, pageIndex = 0): string {
  const page = design.pages[pageIndex] || design.pages[0];
  if (!page) throw new Error('No pages found in design');
  return exportPageToSVG(page);
}
