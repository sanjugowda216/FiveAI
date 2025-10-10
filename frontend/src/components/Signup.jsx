import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Signup({ onSignupSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = credential.user;

      const defaultProfile = {
        email: user.email ?? email,
        selectedCourse: "",
        stats: { totalQuestions: 0, correct: 0, streak: 0 },
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), defaultProfile, { merge: true });

      const profileForState = {
        uid: user.uid,
        email: user.email ?? email,
        selectedCourse: "",
        stats: { totalQuestions: 0, correct: 0, streak: 0 },
      };

      if (onSignupSuccess) onSignupSuccess(profileForState);
      setMsg("Account created! 🎉");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <form onSubmit={handleSignup} className="form">
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
      <button type="submit">Sign Up</button>
      {msg && <p className="msg">{msg}</p>}
    </form>
  );
}
