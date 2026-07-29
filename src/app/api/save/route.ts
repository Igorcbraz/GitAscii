import { NextResponse } from 'next/server';
import { saveProfileConfig } from '@/lib/profileStorage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.username) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
    }

    await saveProfileConfig(body);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save profile config';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
