// frontend/src/App.jsx
import Login from "./components/Login";
import { useEffect, useState } from "react";
import { getTestMessage } from "./utils/api";
import Signup from "./components/Signup";
//import Login from "./components/Login";
import './App.css';

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getTestMessage().then(setMsg);
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-6">FiveAI 🔥</h1>

      {/* Backend test message */}
      <p className="mb-6 text-xl">{msg || "Loading backend..."}</p>

      {/* Signup & Login */}
      <div className="mb-10">
        <Signup />
      </div>
      <div>
        <Login />
      </div>
    </div>
  );
}

export default App;
