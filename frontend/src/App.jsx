// frontend/src/App.jsx
import { useEffect, useState } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { getTestMessage } from "./utils/api";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

function App() {
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  // 🔹 Load backend test message
  useEffect(() => {
    getTestMessage().then(setMsg);
  }, []);

  // 🔹 Listen for Firebase login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-6">FiveAI 🔥</h1>

      {/* Backend test message */}
      <p className="mb-6 text-xl">{msg || "Loading backend..."}</p>

      {user ? (
        // ✅ What logged-in users see
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome, {user.email}! 🎉
          </h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        // 🧩 What logged-out users see
        <div className="flex flex-col md:flex-row justify-center gap-10">
          <Signup />
          <Login onLoginSuccess={() => setUser(auth.currentUser)} />
        </div>
      )}
    </div>
  );
}

export default App;