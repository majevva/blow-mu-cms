import React, { useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { jwtDecode } from 'jwt-decode';
import { AuthContext, AuthStateEnum } from '@/contexts/AuthContext';

interface ChatMessage {
  loginName: string;
  content: string;
  timestamp: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
}

const API_URL = import.meta.env.VITE_API_URL as string;

const ChatBox: React.FC = () => {
  const { auth } = useContext(AuthContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loginName = auth.token
    ? (jwtDecode(auth.token) as { sub: string }).sub
    : null;
  const isSignedIn = auth.state === AuthStateEnum.SIGNED_IN;

  // Fetch message history on mount
  useEffect(() => {
    const historyUrl = API_URL ? API_URL + '/chat/history' : '/chat/history';
    fetch(historyUrl)
      .then((r) => r.json())
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(() => {});
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect/disconnect based on auth state
  useEffect(() => {
    const sockUrl = API_URL ? API_URL + '/ws' : '/ws';
    const client = new Client({
      webSocketFactory: () => new SockJS(sockUrl),
      connectHeaders: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/chat', (frame) => {
          const msg: ChatMessage = JSON.parse(frame.body);
          setMessages((prev) => [...prev.slice(-99), msg]);
        });
        if (isSignedIn) {
          client.publish({ destination: '/app/chat.join' });
        }
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [auth.token]);

  const sendMessage = () => {
    if (!inputValue.trim() || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ content: inputValue.trim() }),
    });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-w-80 flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-primary-800/20 dark:bg-neutral-900/70 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="font-cinzel text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-400">
          Chat
        </span>
        <span className="flex items-center gap-1 text-xs text-neutral-400">
          <span
            className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500 animate-pulse-online' : 'bg-neutral-400'}`}
          />
          {connected ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="flex h-48 flex-col gap-1 overflow-y-auto rounded bg-neutral-100 p-2 dark:bg-neutral-800/50">
        {messages.length === 0 && (
          <p className="m-auto text-xs text-neutral-400">No messages yet.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="text-xs leading-snug">
            {msg.type === 'CHAT' ? (
              <span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  [{msg.loginName}]
                </span>{' '}
                <span className="text-neutral-700 dark:text-neutral-300">{msg.content}</span>
                <span className="ml-1 text-neutral-400">{formatTime(msg.timestamp)}</span>
              </span>
            ) : (
              <span className="italic text-neutral-400">{msg.content}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isSignedIn ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
            placeholder={`${loginName}: ...`}
            className="flex-1 rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 outline-none focus:border-primary-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:border-primary-500"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !inputValue.trim()}
            className="rounded bg-primary-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-primary-500 disabled:opacity-40 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-neutral-400">Log in to chat</p>
      )}
    </div>
  );
};

export default ChatBox;
