import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { FcGoogle } from 'react-icons/fc';

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = ref(database, 'users/' + user.uid);
      await set(userRef, {
        uid: user.uid,
        name: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
      });

      console.log("User signed in:", user.displayName);
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center justify-center space-x-2 px-6 py-3 border rounded-lg shadow hover:bg-gray-100 transition duration-200"
    >
      <FcGoogle size={24} />
      <span className="font-medium text-gray-700">Sign in with Google</span>
    </button>
  );
}

function SignOutButton() {
  return (
    auth.currentUser && (
      <button
        onClick={() => signOut(auth)}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
      >
        Sign Out
      </button>
    )
  );
}

export { SignIn, SignOutButton };
