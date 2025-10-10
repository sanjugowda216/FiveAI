import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = credential.user;
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      const defaultStats = { totalQuestions: 0, correct: 0, streak: 0 };
      let profileData;

      if (snapshot.exists()) {
        const data = snapshot.data();
        const mergedProfile = {
          uid: user.uid,
          email: data.email ?? user.email ?? email,
          selectedCourse: data.selectedCourse ?? "",
          stats: data.stats ?? defaultStats,
        };

        const updates = {};
        if (!data.email && user.email) updates.email = user.email;
        if (!data.stats) updates.stats = defaultStats;
        if (Object.keys(updates).length) {
          await setDoc(userRef, updates, { merge: true });
        }

        profileData = mergedProfile;
      } else {
        const defaultProfile = {
          email: user.email ?? email,
          selectedCourse: "",
          stats: defaultStats,
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, defaultProfile);
        profileData = {
          uid: user.uid,
          email: defaultProfile.email,
          selectedCourse: "",
          stats: defaultStats,
        };
      }

      if (onLoginSuccess) onLoginSuccess(profileData);
      setMsg("Login successful! 🎉");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {msg && <p className="msg">{msg}</p>}
    </form>
  );
}
