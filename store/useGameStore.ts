import { create } from 'zustand';
import { User, Message } from '../lib/memoryStore';

interface GameState {
  currentUser: User | null;
  users: User[];
  messages: Message[];
  pendingName: string | null;
  setCurrentUser: (user: User) => void;
  clearCurrentUser: () => void;
  setUsers: (users: User[]) => void;
  addMessage: (msg: Message) => void;
  setMessages: (messages: Message[]) => void;
  setPendingName: (name: string) => void;
  clearPendingName: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentUser: null,
  users: [],
  messages: [],
  pendingName: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),
  setUsers: (users) => set({ users }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  setPendingName: (name) => set({ pendingName: name }),
  clearPendingName: () => set({ pendingName: null }),
}));
