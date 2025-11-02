import React from 'react';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';


const ChatDeshboard = () => {
  return (
    <div className='flex h-[85vh]'>     
      <ChatList />  
      <ChatRoom />
    </div>
  )
}

export default ChatDeshboard
