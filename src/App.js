import ChatDeshboard from './Components/ChatDeshboard';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase';
import { SignIn } from './Components/auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatRoom from './Components/ChatRoom';
import Nav from './Components/Nav';
import ChatList from './Components/ChatList';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        {!user ? (
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="bg-white shadow-lg rounded-xl p-10 flex flex-col items-center space-y-6">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Welcome to ChatApp
                  </h1>
                  <p className="text-gray-500 text-center">
                    Please sign in with Google to continue
                  </p>
                  <SignIn />
                </div>
              </div>
            }
          />
        ) : (
          <>
            <Route
              path="/"
              element={
                <div>
                  <div className="hidden md:block">
                    <ChatDeshboard />
                  </div>
                  <div className="md:hidden">
                    <ChatList />
                  </div>
                </div>
              }
            />
            <Route
              path="/chatroom/:chatId"
              element={
                <div>
                  <div className="md:hidden">
                    <ChatRoom />
                  </div>
                  <div className="hidden md:block">
                    <ChatDeshboard />
                  </div>
                </div>
              }
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
