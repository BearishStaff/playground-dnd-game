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
  const setPendingName = useGameStore((state) => state.setPendingName);
  const setCurrentUser = useGameStore((state) => state.setCurrentUser);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (role === 'Player') {
      // Store name in zustand and go to class selection
      setPendingName(name.trim());
      router.push('/select-class');
    } else {
      // DM joins directly
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
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 bg-zinc-900/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-800/80">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐉</div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
            D&D Tavern
          </h1>
          <p className="text-sm text-zinc-500 mt-2">Enter the realm of adventure</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label htmlFor="name-input" className="block text-sm font-medium mb-1.5 text-zinc-400">
              Character / DM Name
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-zinc-800/70 border border-zinc-700/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-zinc-600"
              placeholder="e.g. Aragorn"
              required
            />
          </div>

          <div>
            <label htmlFor="role-select" className="block text-sm font-medium mb-1.5 text-zinc-400">
              Role
            </label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full p-3.5 rounded-xl bg-zinc-800/70 border border-zinc-700/50 focus:border-red-500 outline-none transition-all cursor-pointer"
            >
              <option value="Player">Party Member</option>
              <option value="DM">Dungeon Master</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 cursor-pointer"
          >
            {loading ? 'Entering Tavern...' : role === 'Player' ? 'Choose Your Class →' : 'Join as Dungeon Master'}
          </button>
        </form>
      </div>
    </main>
  );
}
