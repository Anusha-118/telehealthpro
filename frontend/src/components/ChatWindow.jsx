import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { MessageSquare, Send, X, ShieldAlert } from 'lucide-react';

const ChatWindow = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [otherUserId, setOtherUserId] = useState(null);
  const [otherUserName, setOtherUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // 1. Establish Socket Connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const socket = io(socketUrl);
      socketRef.current = socket;

      // Register user with Socket signaling server
      socket.emit('register', user.id);

      // Listen to incoming messages
      socket.on('receive_message', (msg) => {
        // Only append message if it is from the currently active chat partner
        const isFromPartner = msg.sender_id === otherUserId || msg.receiver_id === otherUserId;
        if (isFromPartner) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      // Listen to push notifications for custom events
      socket.on('push_notification', (notif) => {
        // Dispatch simple browser notifications or custom toast triggers
        const pushEvent = new CustomEvent('socket_notification', { detail: notif });
        window.dispatchEvent(pushEvent);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user, otherUserId]);

  // 2. Listen to custom open chat event triggers from Appointment Cards
  useEffect(() => {
    const handleOpenChat = async (e) => {
      const { otherUserId: peerId, otherUserName: peerName } = e.detail;
      setOtherUserId(parseInt(peerId));
      setOtherUserName(peerName);
      setIsOpen(true);
      setMessages([]);

      // Fetch chat history
      try {
        const res = await api.get(`/chat/history/${peerId}`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err.message);
      }
    };

    window.addEventListener('open_chat', handleOpenChat);
    return () => window.removeEventListener('open_chat', handleOpenChat);
  }, []);

  // 3. Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;

    // Send via socket
    socketRef.current.emit('send_message', {
      senderId: user.id,
      receiverId: otherUserId,
      message: text.trim()
    });

    // Optimistically add to message log (if socket doesn't loopback)
    const optimisticMsg = {
      message_id: Date.now(),
      sender_id: user.id,
      receiver_id: otherUserId,
      message: text.trim(),
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] glass-panel bg-white dark:bg-darkBg-light rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-750 flex flex-col justify-between overflow-hidden transition-all duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-primary-500 to-primary-650 px-5 py-4 text-white">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
            {otherUserName.replace('Dr. ', '').charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-extrabold text-sm truncate max-w-[160px]">{otherUserName}</h4>
            <p className="text-xxs text-primary-100 font-semibold uppercase tracking-wider">Active Chat</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-darkBg-deep/20">
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xxs text-amber-700 dark:text-amber-400 flex items-start space-x-1.5 leading-relaxed font-semibold">
          <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Consultations chat is active. Prescribed treatments or advice will be updated officially in the reports summary panel.</span>
        </div>

        {messages.map((msg) => {
          const isOwn = msg.sender_id === user.id;
          return (
            <div key={msg.message_id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                isOwn
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-800 text-slate-805 dark:text-slate-100 border border-slate-150/40 dark:border-slate-700/40 rounded-bl-none'
              }`}>
                <p>{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-darkBg-light flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-darkBg-deep text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
          placeholder="Type message..."
        />
        <button
          type="submit"
          className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-sm transition-colors hover-scale"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
