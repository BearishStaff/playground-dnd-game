import { NextResponse } from 'next/server';
import { memoryStore } from '../../../lib/memoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requesterId, targetUserId } = body;

    if (!requesterId || !targetUserId) {
      return NextResponse.json({ error: 'Missing requesterId or targetUserId' }, { status: 400 });
    }

    // Verify the requester is a DM
    const users = await memoryStore.getUsers();
    const requester = users.find((u) => u.id === requesterId);

    if (!requester || requester.role !== 'DM') {
      return NextResponse.json({ error: 'Only the DM can kick players' }, { status: 403 });
    }

    const target = users.find((u) => u.id === targetUserId);
    if (!target) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Remove the user and broadcast a kick event
    await memoryStore.removeUser(targetUserId);

    // Send a dedicated kick event so the kicked client knows to redirect
    await memoryStore.broadcast({
      type: 'user_kicked',
      payload: { userId: targetUserId, userName: target.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to kick user' }, { status: 500 });
  }
}
