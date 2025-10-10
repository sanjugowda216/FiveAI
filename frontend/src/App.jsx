import { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import APCourse from "./components/APCourse";
import "./App.css";
<APCourse onSelectCourse={(course) => console.log("Selected:", course)} />

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  return (
    <div className="app-container">
      <div className="card">
        {!loggedIn ? (
          <>
            <h1 className="title">FiveAI 🔥</h1>
            {isLogin ? (
              <Login onLoginSuccess={() => setLoggedIn(true)} />
            ) : (
              <Signup onSignupSuccess={() => setLoggedIn(true)} />
            )}
            <p className="switch">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <span onClick={() => setIsLogin(false)}>Sign Up</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span onClick={() => setIsLogin(true)}>Login</span>
                </>
              )}
            </p>
          </>
        ) : !selectedCourse ? (
          <APCourse onSelectCourse={(course) => setSelectedCourse(course)} />
        ) : (
          <h2>Welcome! You selected: {selectedCourse}</h2>
        )}
      </div>
    </div>
  );
}

export default App;
