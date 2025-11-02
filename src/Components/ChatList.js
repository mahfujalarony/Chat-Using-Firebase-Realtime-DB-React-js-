import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, database } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (!usersData) {
        setLoading(false);
        return;
      }

      const allOtherUsers = Object.entries(usersData)
        .map(([uid, userData]) => ({ uid, ...userData }))
        .filter((user) => user.uid !== currentUser.uid);

      let listeners = [];

      allOtherUsers.forEach(user => {
        const chatId = getChatId(currentUser.uid, user.uid);
        const chatRef = ref(database, `chats/${chatId}/lastMessage`);

        const listener = onValue(chatRef, (chatSnapshot) => {
          const lastMessage = chatSnapshot.val();
          
          setUsers(currentUsers => {
            const updatedUsers = currentUsers.map(u => {
              if (u.uid === user.uid) {
                return {
                  ...u,
                  lastMessage: lastMessage || null, 
                };
              }
              return u;
            });
            
            return updatedUsers.sort((a, b) => 
              (b.lastMessage?.timestamp || b.createdAt || 0) - 
              (a.lastMessage?.timestamp || a.createdAt || 0)
            );
          });
        });
        listeners.push(listener);
      });

 
      const initialUsers = allOtherUsers.map(user => ({
        ...user,
        lastMessage: null,
      }));
      setUsers(initialUsers);
      setLoading(false);
      return () => {
        unsubscribeUsers();
        listeners.forEach(unsub => unsub());
      };
    });

    return () => unsubscribeUsers();
  }, [currentUser]);

  const handleUserClick = (userUid) => {
    const chatId = getChatId(currentUser.uid, userUid);
    navigate(`/chatroom/${chatId}`);
  };

  return (
    <div className="flex flex-col bg-gray-100 w-full md:w-64 sm:w-72 border-r shadow-md">
      <div className="flex-1 overflow-y-auto">
        {loading ? (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.uid}
              onClick={() => handleUserClick(user.uid)}
              className="flex items-center gap-3 p-3 hover:bg-blue-100 cursor-pointer transition border-b"
            >
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-800">{user.name}</span>
                {user.lastMessage ? (
                  <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                    <p className="truncate pr-2">
                      {user.lastMessage.text}
                    </p>
                    <span className="whitespace-nowrap">
                      {formatTimestamp(user.lastMessage.timestamp)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No messages yet</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-500">No Users Found</p>
        )}
      </div>
    </div>
  );
}

export default ChatList;