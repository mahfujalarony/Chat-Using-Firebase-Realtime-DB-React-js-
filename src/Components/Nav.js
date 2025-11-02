import React from 'react'
import { auth } from '../config/firebase'
import { SignIn, SignOutButton } from './auth'
import { useAuthState } from 'react-firebase-hooks/auth'

const Nav = () => {
  const [user, loading] = useAuthState(auth)

  if (loading) return null

  return (
    <div className=' top-0 h-16 w-full bg-gray-300 flex items-center justify-between px-4 shadow'>
       <img width="34" height="34" src="https://img.icons8.com/fluency/48/filled-chat.png" alt="filled-chat"/>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="h-10 w-10 rounded-full border border-gray-500"
            />
            <SignOutButton />
          </>
        ) : (
          <SignIn />
        )}
      </div>
    </div>
  )
}

export default Nav
