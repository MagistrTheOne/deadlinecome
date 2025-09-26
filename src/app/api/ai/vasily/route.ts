import { NextResponse } from 'next/server';
import { askVasily } from '@/lib/ai/vasily-service';

export async function POST(req: Request){
  const { prompt, userId } = await req.json();
  try {
    const out = await askVasily(prompt, { userId, route: 'api/ai/vasily' });
    return NextResponse.json(out);
  } catch (e: any) {
    if (String(e?.message).includes('rate-limited')) return new NextResponse('Too Many Requests', { status: 429 });
    if (String(e?.message).includes('cb-open')) return new NextResponse('Service Unavailable', { status: 503 });
    return new NextResponse('Bad Gateway', { status: 502 });
  }
}
