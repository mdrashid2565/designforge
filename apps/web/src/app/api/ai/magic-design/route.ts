import { NextRequest, NextResponse } from 'next/server';
import { generateMagicDesign } from '@designforge/ai-adapter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const design = await generateMagicDesign(body);
    return NextResponse.json(design);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
