import { NextResponse } from 'next/server';
import { snapshot } from '@/src/lib/ai/core/metrics/metrics';
export async function GET(){ return NextResponse.json(snapshot()); }