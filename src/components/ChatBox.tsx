'use client'
import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, Phone } from 'lucide-react'
import { useSocket } from './SocketProvider'

interface ChatMessage {
  senderId: string;
  senderRole: 'user' | 'partner';
  text: string;
  timestamp: string;
}

interface ChatBoxProps {
  role: 'user' | 'partner';
  rideId: string;
  partnerName?: string;
  isOpenDefault?: boolean;
  variant?: 'floating' | 'inline';
}

export default function ChatBox({ role, rideId, partnerName, isOpenDefault = false, variant = 'floating' }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(variant === 'inline' ? true : isOpenDefault);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isInline = variant === 'inline';

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!socket) return;

    // Load local storage chat history
    const historyKey = `chat_${rideId}`;
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) { }
    }

    const messageHandler = (data: ChatMessage & { targetRideId: string }) => {
      if (data.targetRideId === rideId) {
        setMessages(prev => {
          const updated = [...prev, data];
          localStorage.setItem(historyKey, JSON.stringify(updated));
          return updated;
        });

        if (data.senderRole !== role && !isOpen && !isInline) {
          setIsOpen(true);
        }
      }
    };

    socket.on('receive_message', messageHandler);
    return () => { socket.off('receive_message', messageHandler); };
  }, [socket, rideId, role, isOpen, isInline]);

  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText.trim();
    if (!textToSend || !socket) return;

    const msgPayload = {
      targetRideId: rideId,
      senderId: socket.id || role,
      senderRole: role,
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', msgPayload);
    if (!customText) setInputText('');
  };

  const opponentName = role === 'user' ? (partnerName || 'Partner') : (partnerName || 'Rider');

  const chatContent = (
    <div className={`${isInline ? 'w-full h-full border-t border-gray-100' : 'bg-white rounded-t-3xl rounded-bl-3xl rounded-br-md shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 w-[320px] md:w-[360px] mb-4'} flex flex-col overflow-hidden transform transition-all`}>

      {!isInline && (
        <div className="bg-[#0A0A0A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">{opponentName}</h3>
              <p className="text-xs text-green-400 font-medium">Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className={`flex-1 bg-[#F9FAFB] p-4 overflow-y-auto flex flex-col gap-3 ${!isInline ? 'h-[300px]' : ''}`}>
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center opacity-60">
            <MessageSquare size={32} className="mb-2" />
            <p className="text-sm font-medium">Coordinate your ride with {opponentName}</p>
            <div className="mt-4 px-6 py-3 bg-blue-50 text-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
              Default: "Hello! I am ready for the ride."
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderRole === role;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-black text-white rounded-br-sm' : 'bg-white border border-gray-200 text-black rounded-bl-sm shadow-sm'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 font-medium ${isMe ? 'text-white/50 text-right' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="bg-white px-3 py-2 border-t border-gray-50 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
        {(role === 'user' ? [
          "Where are you?", "On my way!", "Wait 2 mins", "Okay, thanks!"
        ] : [
          "I've arrived!", "I'm near you", "Stuck in traffic", "Waiting at pickup"
        ]).map((text, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(undefined, text)}
            className="px-4 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-gray-700 text-[11px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 border border-gray-200/50"
          >
            {text}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="bg-white p-3 border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm outline-none focus:border-black transition-colors select-text"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 transition-colors shrink-0 hover:bg-gray-900 active:scale-95"
        >
          <Send size={16} className="-ml-0.5" />
        </button>
      </form>
    </div>
  );

  if (isInline) return chatContent;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? chatContent : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black hover:bg-gray-900 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 relative"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  )
}
