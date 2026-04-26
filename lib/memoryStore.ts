export type Role = 'DM' | 'Player';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

import { pusherServer } from './pusher';

// In-memory state (Note: in serverless, this may reset on cold boots)
const globalState: {
  users: User[];
  messages: Message[];
} = {
  users: [],
  messages: [],
};

export const memoryStore = {
  addUser(user: User) {
    globalState.users.push(user);
    this.broadcast({ type: 'user_joined', payload: user });
  },
  getUsers() {
    return globalState.users;
  },
  addMessage(msg: Message) {
    globalState.messages.push(msg);
    // Keep only last 100 messages to prevent memory leak
    if (globalState.messages.length > 100) {
      globalState.messages.shift();
    }
    this.broadcast({ type: 'new_message', payload: msg });
  },
  getMessages() {
    return globalState.messages;
  },
  async broadcast(data: any) {
    try {
      await pusherServer.trigger('dnd-game', data.type, data.payload);
    } catch (e) {
      console.error('Pusher error:', e);
    }
  },
};
