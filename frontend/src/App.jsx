// frontend/src/App.jsx
import { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./App.css";

function App() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">FiveAI</h1>

        {showLogin ? <Login onLoginSuccess={() => {}} /> : <Signup />}

        <div className="switch">
          {showLogin ? (
            <span onClick={() => setShowLogin(false)}>Go to Sign Up</span>
          ) : (
            <span onClick={() => setShowLogin(true)}>Go to Login</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
