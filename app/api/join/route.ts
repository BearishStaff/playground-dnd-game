import { NextResponse } from 'next/server';
import { memoryStore } from '../../../lib/memoryStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, characterClass, subclass } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    const newUser = {
      id: Math.random().toString(36).substring(7),
      name,
      role,
      ...(characterClass && { characterClass }),
      ...(subclass && { subclass }),
    };

    await memoryStore.addUser(newUser);

    return NextResponse.json({ user: newUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
