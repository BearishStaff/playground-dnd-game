'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../store/useGameStore';
import { Role } from '../lib/memoryStore';

export default function Home() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Player');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setCurrentUser = useGameStore((state) => state.setCurrentUser);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        router.push('/game');
      }
    } catch (error) {
      console.error('Failed to join:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-zinc-800">
        <h1 className="text-3xl font-bold mb-6 text-center text-red-500">D&D Tavern</h1>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-400">Character / DM Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
              placeholder="e.g. Aragorn"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-400">Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-red-500 outline-none transition"
            >
              <option value="Player">Party Member</option>
              <option value="DM">Dungeon Master</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Entering Tavern...' : 'Join Game'}
          </button>
        </form>
      </div>
    </main>
  );
}
