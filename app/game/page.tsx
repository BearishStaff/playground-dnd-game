'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import { getPusherClient } from '../../lib/pusher';

export default function Game() {
  const router = useRouter();
  const { currentUser, users, messages, setUsers, setMessages, addMessage, clearCurrentUser } = useGameStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleRollDice = async () => {
    if (!currentUser) return;
    const roll = Math.floor(Math.random() * 20) + 1;
    await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: `rolled a d20 and got: **${roll}**`,
      }),
    });
  };

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
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-red-500">Party Roster</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-3">
            {users.map((user, i) => (
              <li key={i} className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-200">{user.name}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-800 w-max px-2 py-0.5 rounded mt-1">
                    {user.role}
                  </span>
                </div>
                {isDM && (
                  <button
                    onClick={() => handleKick(user.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 bg-red-950/50 hover:bg-red-900/50 border border-red-800/50 px-2 py-1 rounded transition-all"
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
          Logged in as <span className="font-bold text-zinc-200">{currentUser.name}</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md">
          <h1 className="text-lg font-semibold">Tavern Chat</h1>
          <button 
            onClick={handleRollDice}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Roll d20
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser.id;
            const isRoll = msg.content.includes('rolled a d20');
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-zinc-500 mb-1 ml-1">{msg.senderName}</span>
                <div 
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isRoll 
                      ? 'bg-amber-900/50 text-amber-200 border border-amber-700/50 italic'
                      : isMe 
                        ? 'bg-red-600 text-white rounded-br-none' 
                        : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {msg.content}
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
