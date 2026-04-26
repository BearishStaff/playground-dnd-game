'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import { DND_CLASSES, CharacterClass } from '../../lib/classData';

// Color utility — maps class color keys to Tailwind classes
function getColorClasses(color: string) {
  const map: Record<string, { ring: string; border: string; bg: string; glow: string; text: string; badge: string }> = {
    red:     { ring: 'ring-red-500/60',     border: 'border-red-500/60',     bg: 'bg-red-500/10',     glow: 'shadow-red-500/20',     text: 'text-red-400',     badge: 'bg-red-500/20 text-red-300' },
    purple:  { ring: 'ring-purple-500/60',  border: 'border-purple-500/60',  bg: 'bg-purple-500/10',  glow: 'shadow-purple-500/20',  text: 'text-purple-400',  badge: 'bg-purple-500/20 text-purple-300' },
    yellow:  { ring: 'ring-yellow-500/60',  border: 'border-yellow-500/60',  bg: 'bg-yellow-500/10',  glow: 'shadow-yellow-500/20',  text: 'text-yellow-400',  badge: 'bg-yellow-500/20 text-yellow-300' },
    green:   { ring: 'ring-green-500/60',   border: 'border-green-500/60',   bg: 'bg-green-500/10',   glow: 'shadow-green-500/20',   text: 'text-green-400',   badge: 'bg-green-500/20 text-green-300' },
    orange:  { ring: 'ring-orange-500/60',  border: 'border-orange-500/60',  bg: 'bg-orange-500/10',  glow: 'shadow-orange-500/20',  text: 'text-orange-400',  badge: 'bg-orange-500/20 text-orange-300' },
    cyan:    { ring: 'ring-cyan-500/60',    border: 'border-cyan-500/60',    bg: 'bg-cyan-500/10',    glow: 'shadow-cyan-500/20',    text: 'text-cyan-400',    badge: 'bg-cyan-500/20 text-cyan-300' },
    amber:   { ring: 'ring-amber-500/60',   border: 'border-amber-500/60',   bg: 'bg-amber-500/10',   glow: 'shadow-amber-500/20',   text: 'text-amber-400',   badge: 'bg-amber-500/20 text-amber-300' },
    emerald: { ring: 'ring-emerald-500/60', border: 'border-emerald-500/60', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
    zinc:    { ring: 'ring-zinc-400/60',    border: 'border-zinc-400/60',    bg: 'bg-zinc-400/10',    glow: 'shadow-zinc-400/20',    text: 'text-zinc-300',    badge: 'bg-zinc-400/20 text-zinc-200' },
    rose:    { ring: 'ring-rose-500/60',    border: 'border-rose-500/60',    bg: 'bg-rose-500/10',    glow: 'shadow-rose-500/20',    text: 'text-rose-400',    badge: 'bg-rose-500/20 text-rose-300' },
    violet:  { ring: 'ring-violet-500/60',  border: 'border-violet-500/60',  bg: 'bg-violet-500/10',  glow: 'shadow-violet-500/20',  text: 'text-violet-400',  badge: 'bg-violet-500/20 text-violet-300' },
    blue:    { ring: 'ring-blue-500/60',    border: 'border-blue-500/60',    bg: 'bg-blue-500/10',    glow: 'shadow-blue-500/20',    text: 'text-blue-400',    badge: 'bg-blue-500/20 text-blue-300' },
  };
  return map[color] ?? map.zinc;
}

export default function SelectClass() {
  const router = useRouter();
  const pendingName = useGameStore((s) => s.pendingName);
  const clearPendingName = useGameStore((s) => s.clearPendingName);
  const setCurrentUser = useGameStore((s) => s.setCurrentUser);

  const currentUser = useGameStore((s) => s.currentUser);

  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [selectedSubclass, setSelectedSubclass] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only redirect if there's no pending name AND user hasn't already joined
    if (!pendingName && !currentUser) {
      router.push('/');
    }
  }, [pendingName, currentUser, router]);

  const handleConfirm = async () => {
    if (!selectedClass || !selectedSubclass || !pendingName) return;
    setLoading(true);
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pendingName,
          role: 'Player',
          characterClass: selectedClass.name,
          subclass: selectedSubclass,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        clearPendingName();
        router.push('/game');
      }
    } catch (error) {
      console.error('Failed to join:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!pendingName) return null;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-red-900/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-amber-900/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4 inline-flex items-center gap-1 cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
            Choose Your Class
          </h1>
          <p className="text-zinc-500 mt-2">
            Welcome, <span className="text-zinc-300 font-medium">{pendingName}</span>. Select a class and subclass for your adventure.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Class Grid */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Classes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {DND_CLASSES.map((cls) => {
                const colors = getColorClasses(cls.color);
                const isSelected = selectedClass?.name === cls.name;
                return (
                  <button
                    key={cls.name}
                    onClick={() => {
                      setSelectedClass(cls);
                      setSelectedSubclass(null);
                    }}
                    className={`
                      group relative p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer
                      ${isSelected
                        ? `${colors.border} ${colors.bg} ring-2 ${colors.ring} shadow-lg ${colors.glow}`
                        : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900/90'
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">{cls.icon}</div>
                    <div className={`text-sm font-semibold ${isSelected ? colors.text : 'text-zinc-200 group-hover:text-white'}`}>
                      {cls.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {cls.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subclass Panel */}
          <div className="lg:sticky lg:top-10 self-start">
            {selectedClass ? (
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl">{selectedClass.icon}</span>
                  <div>
                    <h2 className={`text-xl font-bold ${getColorClasses(selectedClass.color).text}`}>
                      {selectedClass.name}
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  {selectedClass.description}
                </p>

                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Choose Subclass
                </h3>
                <div className="space-y-2">
                  {selectedClass.subclasses.map((sub) => {
                    const colors = getColorClasses(selectedClass.color);
                    const isSubSelected = selectedSubclass === sub.name;
                    return (
                      <button
                        key={sub.name}
                        onClick={() => setSelectedSubclass(sub.name)}
                        className={`
                          w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer
                          ${isSubSelected
                            ? `${colors.border} ${colors.bg} ring-1 ${colors.ring}`
                            : 'border-zinc-800/60 bg-zinc-800/30 hover:border-zinc-700 hover:bg-zinc-800/60'
                          }
                        `}
                      >
                        <div className={`text-sm font-semibold ${isSubSelected ? colors.text : 'text-zinc-200'}`}>
                          {sub.name}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                          {sub.description}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Confirm button */}
                <button
                  onClick={handleConfirm}
                  disabled={!selectedSubclass || loading}
                  className={`
                    w-full mt-6 py-3.5 rounded-xl font-bold transition-all duration-200 cursor-pointer
                    ${selectedSubclass
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/30 hover:shadow-red-900/50'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }
                    disabled:opacity-50
                  `}
                >
                  {loading
                    ? 'Joining...'
                    : selectedSubclass
                      ? `Join as ${selectedClass.name} →`
                      : 'Select a subclass first'
                  }
                </button>
              </div>
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-4 opacity-30">⚔️</div>
                <p className="text-zinc-500 text-sm">
                  Select a class from the grid to view subclasses
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
