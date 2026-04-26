import { NextResponse } from 'next/server';
import { memoryStore } from '../../../lib/memoryStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderId, senderName, content } = body;

    if (!senderId || !senderName || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Look up the sender's role from the user list
    const users = await memoryStore.getUsers();
    const sender = users.find((u) => u.id === senderId);

    const newMessage = {
      id: Math.random().toString(36).substring(7),
      senderId,
      senderName,
      senderRole: sender?.role,
      content,
      timestamp: Date.now(),
    };

    await memoryStore.addMessage(newMessage);

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
