import { create } from 'zustand';
import { User, Message } from '../lib/memoryStore';

interface GameState {
  currentUser: User | null;
  users: User[];
  messages: Message[];
  setCurrentUser: (user: User) => void;
  setUsers: (users: User[]) => void;
  addMessage: (msg: Message) => void;
  setMessages: (messages: Message[]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentUser: null,
  users: [],
  messages: [],
  setCurrentUser: (user) => set({ currentUser: user }),
  setUsers: (users) => set({ users }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (messages) => set({ messages }),
}));
