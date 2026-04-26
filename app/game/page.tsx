'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import { getPusherClient } from '../../lib/pusher';

export default function Game() {
  const router = useRouter();
  const { currentUser, users, messages, setUsers, setMessages, addMessage, clearCurrentUser } = useGameStore();
  const [inputValue, setInputValue] = useState('');
  const [selectedDice, setSelectedDice] = useState<number>(20);
  const [diceMenuOpen, setDiceMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const diceMenuRef = useRef<HTMLDivElement>(null);

  const DICE_OPTIONS = [4, 6, 8, 10, 12, 20] as const;

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }

    // Fetch initial state
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setMessages(data.messages || []);
      });

    // Connect to Pusher
    const pusher = getPusherClient();
    const channel = pusher.subscribe('dnd-game');

    channel.bind('user_joined', () => {
      // Fetch fresh state to be safe, or just append
      fetch('/api/state')
        .then((res) => res.json())
        .then((stateData) => setUsers(stateData.users || []));
    });

    channel.bind('user_left', () => {
      fetch('/api/state')
        .then((res) => res.json())
        .then((stateData) => setUsers(stateData.users || []));
    });

    channel.bind('user_kicked', (payload: any) => {
      // If this client is the one being kicked, redirect to home
      if (payload.userId === currentUser?.id) {
        clearCurrentUser();
        router.push('/');
      } else {
        // Refresh roster for everyone else
        fetch('/api/state')
          .then((res) => res.json())
          .then((stateData) => setUsers(stateData.users || []));
      }
    });

    channel.bind('new_message', (payload: any) => {
      addMessage(payload);
    });

    return () => {
      pusher.unsubscribe('dnd-game');
    };
  }, [currentUser, router, setUsers, setMessages, addMessage, clearCurrentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        // use navigator.sendBeacon for reliable delivery during unload
        navigator.sendBeacon('/api/leave', JSON.stringify({ userId: currentUser.id }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentUser) return;

    const content = inputValue;
    setInputValue('');

    await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
      }),
    });
  };

  const handleRollDice = async (sides: number) => {
    if (!currentUser) return;
    const roll = Math.floor(Math.random() * sides) + 1;
    await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: `🎲 ${currentUser.name} roll 1d${sides} got {{${roll}}}`,
      }),
    });
    setDiceMenuOpen(false);
  };

  // Close dice menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (diceMenuRef.current && !diceMenuRef.current.contains(e.target as Node)) {
        setDiceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKick = async (targetUserId: string) => {
    if (!currentUser) return;
    await fetch('/api/kick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requesterId: currentUser.id,
        targetUserId,
      }),
    });
  };

  const isDM = currentUser?.role === 'DM';

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">Party Roster</h2>
          <p className="text-xs text-zinc-500 mt-1">{users.length} adventurer{users.length !== 1 ? 's' : ''} in the tavern</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-3">
            {users.map((user, i) => (
              <li key={i} className="flex items-center justify-between group p-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-zinc-200 truncate">
                    {user.role === 'DM' ? '👑 ' : ''}{user.name}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className={`text-xs w-max px-2 py-0.5 rounded ${
                      user.role === 'DM'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {user.role === 'DM' ? 'Dungeon Master' : user.role}
                    </span>
                    {user.characterClass && (
                      <span className="text-xs bg-red-500/15 text-red-300 px-2 py-0.5 rounded">
                        {user.characterClass}
                      </span>
                    )}
                  </div>
                  {user.subclass && (
                    <span className="text-xs text-zinc-500 mt-1 truncate">
                      {user.subclass}
                    </span>
                  )}
                </div>
                {isDM && user.id !== currentUser.id && (
                  <button
                    onClick={() => handleKick(user.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 bg-red-950/50 hover:bg-red-900/50 border border-red-800/50 px-2 py-1 rounded transition-all shrink-0 ml-2"
                    title={`Kick ${user.name}`}
                  >
                    Kick
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-zinc-800 text-sm text-zinc-400">
          <div>Logged in as <span className="font-bold text-zinc-200">{currentUser.name}</span></div>
          {currentUser.characterClass && (
            <div className="text-xs text-zinc-500 mt-1">
              {currentUser.characterClass}{currentUser.subclass ? ` · ${currentUser.subclass}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md">
          <h1 className="text-lg font-semibold">Tavern Chat</h1>
          <div className="relative" ref={diceMenuRef}>
            <button 
              onClick={() => setDiceMenuOpen(!diceMenuOpen)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <span>🎲</span>
              <span>Roll 1d{selectedDice}</span>
              <svg className={`w-3 h-3 transition-transform ${diceMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {diceMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 min-w-[160px]">
                {DICE_OPTIONS.map((sides) => (
                  <button
                    key={sides}
                    onClick={() => {
                      setSelectedDice(sides);
                      handleRollDice(sides);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-700 transition-colors flex items-center justify-between ${
                      selectedDice === sides ? 'text-amber-400 bg-zinc-700/50' : 'text-zinc-200'
                    }`}
                  >
                    <span>1d{sides}</span>
                    <span className="text-zinc-500 text-xs">1–{sides}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser.id;
            const isRoll = msg.content.includes(' roll 1d') && msg.content.includes('got {{');
            const isDMMessage = msg.senderRole === 'DM';

            // Parse roll messages to highlight the point
            const renderContent = () => {
              if (isRoll) {
                const match = msg.content.match(/^(.+?) roll (1d\d+) got \{\{(\d+)\}\}$/);
                if (match) {
                  const [, rollerName, diceType, point] = match;
                  return (
                    <span>
                      {rollerName} roll {diceType} got{' '}
                      <span className="inline-block font-black text-lg px-2 py-0.5 rounded-lg bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/40 animate-bounce" style={{ animationDuration: '0.6s', animationIterationCount: 1 }}>
                        {point}
                      </span>
                    </span>
                  );
                }
              }
              return msg.content;
            };

            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className={`text-xs mb-1 ml-1 flex items-center gap-1.5 ${
                  isDMMessage 
                    ? 'text-amber-400 font-bold' 
                    : 'text-zinc-500'
                }`}>
                  {isDMMessage && <span className="text-amber-400">👑</span>}
                  {msg.senderName}
                  {isDMMessage && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                      DM
                    </span>
                  )}
                </span>
                <div 
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                    isRoll 
                      ? 'bg-gradient-to-r from-amber-900/60 to-orange-900/40 text-amber-100 border border-amber-600/50 shadow-lg shadow-amber-900/30'
                      : isDMMessage
                        ? 'bg-gradient-to-br from-amber-900/40 to-yellow-900/30 text-amber-100 border border-amber-600/40 shadow-lg shadow-amber-900/20' + (isMe ? ' rounded-br-none' : ' rounded-bl-none')
                        : isMe 
                          ? 'bg-red-600 text-white rounded-br-none' 
                          : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {renderContent()}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your action or speak..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
