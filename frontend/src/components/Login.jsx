import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  findCourseByName,
  getCourseById,
  sanitizeFavoriteCourseIds,
} from "../data/apCourses";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [name, setName] = useState("");
  const [tempProfileData, setTempProfileData] = useState(null);

  const normalizeSelectedCourse = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object" && raw.id && raw.name) return raw;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      const fromId = getCourseById(trimmed);
      if (fromId) return { id: fromId.id, name: fromId.name };
      const fromName = findCourseByName(trimmed);
      if (fromName) return { id: fromName.id, name: fromName.name };
      return { id: "", name: trimmed };
    }
    return null;
  };

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
        const normalizedSelection = normalizeSelectedCourse(
          data.selectedCourse
        );
        const favoriteCourses = sanitizeFavoriteCourseIds(
          data.favoriteCourses
        );

        const mergedProfile = {
          uid: user.uid,
          name: data.name || "",
          email: data.email ?? user.email ?? email,
          selectedCourse: normalizedSelection,
          stats: data.stats ?? defaultStats,
          favoriteCourses,
        };

        const updates = {};
        if (!data.email && user.email) updates.email = user.email;
        if (!data.stats) updates.stats = defaultStats;
        if (
          data.selectedCourse === undefined ||
          typeof data.selectedCourse === "string" ||
          (data.selectedCourse &&
            typeof data.selectedCourse === "object" &&
            (!data.selectedCourse.id || !data.selectedCourse.name))
        ) {
          updates.selectedCourse = normalizedSelection;
        }
        if (
          !Array.isArray(data.favoriteCourses) ||
          JSON.stringify(favoriteCourses) !==
            JSON.stringify(data.favoriteCourses ?? [])
        ) {
          updates.favoriteCourses = favoriteCourses;
        }
        if (Object.keys(updates).length) {
          await setDoc(userRef, updates, { merge: true });
        }

        profileData = mergedProfile;
      } else {
        const defaultProfile = {
          name: "",
          email: user.email ?? email,
          selectedCourse: null,
          stats: defaultStats,
          favoriteCourses: [],
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, defaultProfile);
        profileData = {
          uid: user.uid,
          name: "",
          email: defaultProfile.email,
          selectedCourse: null,
          stats: defaultStats,
          favoriteCourses: [],
        };
      }

      // Check if user has a name, if not, prompt for it
      if (!profileData.name || profileData.name.trim() === "") {
        setTempProfileData(profileData);
        setShowNamePrompt(true);
        setMsg("Please enter your name to continue");
      } else {
        if (onLoginSuccess) onLoginSuccess(profileData);
        setMsg("Login successful! 🎉");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      // More specific error messages
      switch (err.code) {
        case 'auth/user-not-found':
          setMsg("No account found with this email address");
          break;
        case 'auth/wrong-password':
          setMsg("Incorrect password");
          break;
        case 'auth/invalid-email':
          setMsg("Invalid email address");
          break;
        default:
          setMsg(err.message || "Login failed. Please try again.");
      }
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg("Please enter your name");
      return;
    }

    try {
      // Update the user's profile with the name
      const userRef = doc(db, "users", tempProfileData.uid);
      await setDoc(userRef, { name: name.trim() }, { merge: true });

      // Update the profile data with the name
      const updatedProfile = { ...tempProfileData, name: name.trim() };

      if (onLoginSuccess) onLoginSuccess(updatedProfile);
      setMsg("Login successful! 🎉");
      setShowNamePrompt(false);
      setName("");
      setEmail("");
      setPassword("");
      setTempProfileData(null);
    } catch (err) {
      setMsg("Failed to save name. Please try again.");
    }
  };

  if (showNamePrompt) {
    return (
      <form onSubmit={handleNameSubmit} className="form">
        <h3 style={{ color: "#0078C8", marginBottom: "1rem", textAlign: "center" }}>
          Welcome! What's your name?
        </h3>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <button type="submit">Continue</button>
        {msg && <p className="msg">{msg}</p>}
      </form>
    );
  }

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
