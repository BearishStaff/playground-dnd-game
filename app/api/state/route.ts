import { NextResponse } from 'next/server';
import { memoryStore } from '../../../lib/memoryStore';

export async function GET() {
  return NextResponse.json({
    users: await memoryStore.getUsers(),
    messages: await memoryStore.getMessages(),
  });
}
