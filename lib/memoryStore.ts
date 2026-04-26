export type Role = 'DM' | 'Player';

export interface User {
  id: string;
  name: string;
  role: Role;
  characterClass?: string;
  subclass?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: Role;
  content: string;
  timestamp: number;
}

import { pusherServer } from './pusher';
import { createClient } from 'redis';

// Initialize Redis client
const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function getRedisClient() {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export const memoryStore = {
  async addUser(user: User) {
    const redis = await getRedisClient();
    await redis.rPush('dnd:users', JSON.stringify(user));
    await this.broadcast({ type: 'user_joined', payload: user });
  },
  async getUsers(): Promise<User[]> {
    const redis = await getRedisClient();
    const usersStr = await redis.lRange('dnd:users', 0, -1);
    return usersStr.map((u) => JSON.parse(u)) as User[];
  },
  async removeUser(userId: string) {
    const redis = await getRedisClient();
    const usersStr = await redis.lRange('dnd:users', 0, -1);
    const users = usersStr.map((u) => JSON.parse(u)) as User[];
    const userToRemove = users.find(u => u.id === userId);
    
    if (userToRemove) {
      // Remove from redis list by value
      await redis.lRem('dnd:users', 0, JSON.stringify(userToRemove));
      await this.broadcast({ type: 'user_left', payload: { userId } });
    }
  },
  async addMessage(msg: Message) {
    const redis = await getRedisClient();
    await redis.rPush('dnd:messages', JSON.stringify(msg));
    
    // Keep only last 100 messages to prevent memory leak
    const len = await redis.lLen('dnd:messages');
    if (len > 100) {
      await redis.lPop('dnd:messages');
    }
    await this.broadcast({ type: 'new_message', payload: msg });
  },
  async getMessages(): Promise<Message[]> {
    const redis = await getRedisClient();
    const messagesStr = await redis.lRange('dnd:messages', 0, -1);
    return messagesStr.map((m) => JSON.parse(m)) as Message[];
  },
  async broadcast(data: any) {
    try {
      await pusherServer.trigger('dnd-game', data.type, data.payload);
    } catch (e) {
      console.error('Pusher error:', e);
    }
  },
};
