import React, { useState, useEffect, useRef } from 'react';
import { auth, database } from '../config/firebase';
import { ref, onValue, serverTimestamp, push, update } from 'firebase/database';
import { useParams } from 'react-router-dom';

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessages] = useState('');
  const { chatId } = useParams();
  const messageRef = useRef(null);
  const messagesRef = ref(database, `chats/${chatId}/messages`);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgArray = Object.entries(data)
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => a.createdAt - b.createdAt);
        setMessages(msgArray);
      } else {
        setMessages([]);
      }
    });

    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const messageData = {
      text: newMessage,
      uid: currentUser.uid,
      name: currentUser.displayName,
      photoURL: currentUser.photoURL,
      createdAt: serverTimestamp(),
    };

    const updates = {};
    const newMessageKey = push(ref(database, `chats/${chatId}/messages`)).key;

    updates[`/chats/${chatId}/messages/${newMessageKey}`] = messageData;
    updates[`/chats/${chatId}/lastMessage`] = {
      text: newMessage,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
    };

    await update(ref(database), updates);

    setNewMessages('');
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <img
              src="/no_chat.png"
              alt="No chat"
              className="w-48 h-48 opacity-70 mb-4"
            />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation </p>
          </div>
        )}

        <div ref={messageRef} />
      </div>

      <div className="border-t bg-white p-3 sticky bottom-0">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessages(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const { text, name, photoURL, uid } = message;
  const isCurrentUser = uid === auth.currentUser?.uid;

  return (
    <div
      className={`flex items-end gap-2 ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isCurrentUser && (
        <img
          src={photoURL || '/default-avatar.png'}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}

      <div
        className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
          isCurrentUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <p className="text-xs font-semibold text-gray-600 mb-1">{name}</p>
        )}
        <p>{text}</p>
      </div>
    </div>
  );
}

export default ChatRoom;
