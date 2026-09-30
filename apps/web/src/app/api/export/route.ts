import { NextRequest, NextResponse } from 'next/server';
import { globalStore } from '@designforge/mcp-server';
import { exportDesignToJSON, exportDesignToSVG } from '@designforge/core';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const format = searchParams.get('format') || 'svg';
  const page = parseInt(searchParams.get('page') || '0', 10);

  if (!id) return NextResponse.json({ error: 'Missing design ID' }, { status: 400 });

  const design = globalStore.getDesign(id);
  if (!design) return NextResponse.json({ error: 'Design not found' }, { status: 404 });

  if (format === 'json') {
    return new NextResponse(exportDesignToJSON(design), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${design.title}.json"`,
      },
    });
  }

  const svg = exportDesignToSVG(design, page);
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="${design.title}.svg"`,
    },
  });
}
