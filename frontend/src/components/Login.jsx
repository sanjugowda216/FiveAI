import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ✅ 1. Attempt Firebase login
      await signInWithEmailAndPassword(auth, email, password);

      // ✅ 2. Let App.jsx know login succeeded
      if (onLoginSuccess) onLoginSuccess();

      // ✅ 3. Optional feedback for user
      setMsg("Login successful! 🎉");

      // ✅ 4. Optional: clear fields
      setEmail("");
      setPassword("");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Login
        </button>
      </form>
      <p className="mt-2">{msg}</p>
    </div>
  );
}