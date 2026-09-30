import { NextRequest, NextResponse } from 'next/server';
import { generateAICopy } from '@designforge/ai-adapter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const copy = await generateAICopy(body);
    return NextResponse.json({ copy });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
