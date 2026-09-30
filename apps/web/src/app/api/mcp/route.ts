import { NextRequest, NextResponse } from 'next/server';
import { MCPToolHandlers } from '@designforge/mcp-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, params } = body;

    const handler = (MCPToolHandlers as any)[tool];
    if (!handler) {
      return NextResponse.json({ error: `Tool '${tool}' not found` }, { status: 404 });
    }

    const result = await handler(params || {});
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
