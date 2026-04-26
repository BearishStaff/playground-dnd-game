import { NextResponse } from 'next/server';
import { memoryStore } from '../../../lib/memoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.userId) {
      await memoryStore.removeUser(body.userId);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to leave' }, { status: 500 });
  }
}
