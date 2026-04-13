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
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const isInline = variant === 'inline';
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isOpponentTyping]);

  useEffect(() => {
    if (!socket) return;
    
    const historyKey = `chat_${rideId}`;
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch(e) {}
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

    const typingHandler = (data: { rideId: string, role: string, isTyping: boolean }) => {
        if (data.rideId === rideId && data.role !== role) {
            setIsOpponentTyping(data.isTyping);
        }
    };

    socket.on('receive_message', messageHandler);
    socket.on('receive_typing', typingHandler);
    return () => { 
        socket.off('receive_message', messageHandler); 
        socket.off('receive_typing', typingHandler);
    };
  }, [socket, rideId, role, isOpen, isInline]);

  const handleTyping = (text: string) => {
      setInputText(text);
      if (!socket) return;

      // Only emit typing start if we weren't already typing
      if (text.length > 0 && !inputText) {
          socket.emit('is_typing', { rideId, role, isTyping: true });
      } else if (text.length === 0) {
          socket.emit('is_typing', { rideId, role, isTyping: false });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
          socket.emit('is_typing', { rideId, role, isTyping: false });
      }, 3000);
  };

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
    socket.emit('is_typing', { rideId, role, isTyping: false });
    
    // Clear input local state
    if (!customText) {
        setInputText('');
    }
  };

  const opponentName = role === 'user' ? (partnerName || 'Partner') : (partnerName || 'Rider');

  const chatContent = (
    <div className={`${isInline ? 'w-full border-t border-gray-100 flex-1' : 'bg-white rounded-t-3xl rounded-bl-3xl rounded-br-md shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 w-[320px] md:w-[360px] mb-4'} flex flex-col overflow-hidden`}>
      
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
      <div className={`flex-1 bg-[#F9FAFB] p-4 ${isInline ? 'min-h-[250px]' : 'h-[300px]'} overflow-y-auto flex flex-col gap-3 relative`}>
         {messages.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center opacity-60">
              <MessageSquare size={32} className="mb-2" />
              <p className="text-sm font-medium">Coordinate your ride with {opponentName}</p>
           </div>
         ) : (
           messages.map((msg, idx) => {
              const isMe = msg.senderRole === role;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-black text-white rounded-br-sm' : 'bg-white border border-gray-200 text-black rounded-bl-sm shadow-sm'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end text-white/50' : 'text-gray-400'}`}>
                         <p className="text-[10px] font-medium">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                         {isMe && <div className="text-[10px]">✓</div>}
                      </div>
                   </div>
                </div>
              );
           })
         )}
         
         {isOpponentTyping && (
           <div className="flex justify-start animate-pulse">
              <div className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                    {opponentName} is typing...
                 </p>
              </div>
           </div>
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
              type="button"
              onClick={() => handleSendMessage(undefined, text)}
              className="px-4 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-gray-700 text-[11px] font-bold rounded-full transition-all whitespace-nowrap shrink-0 border border-gray-200/50"
           >
              {text}
           </button>
         ))}
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-gray-100 flex items-center gap-2">
         <input 
            type="text" 
            value={inputText}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleSendMessage();
                }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm outline-none focus:border-black transition-colors"
         />
         <button 
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 transition-colors shrink-0 hover:bg-gray-900 active:scale-95"
         >
            <Send size={16} className="-ml-0.5" />
         </button>
      </div>
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
