import { useState } from "react";
import { signOut } from "firebase/auth";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Courses from "./pages/Courses";
import Practice from "./pages/Practice";
import Stats from "./pages/Stats";
import { auth } from "./firebase";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error while logging out:", err);
    } finally {
      setLoggedIn(false);
      setSelectedCourse("");
      setActivePage("dashboard");
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setActivePage("dashboard");
  };

  const renderContent = () => {
    switch (activePage) {
      case "courses":
        return (
          <Courses
            selectedCourse={selectedCourse}
            onSelectCourse={handleCourseSelect}
          />
        );
      case "practice":
        return (
          <Practice
            selectedCourse={selectedCourse}
            onBackToDashboard={() => setActivePage("dashboard")}
          />
        );
      case "stats":
        return <Stats />;
      case "dashboard":
      default:
        return (
          <Dashboard
            selectedCourse={selectedCourse}
            onStartPractice={() => setActivePage("practice")}
            onSelectCourse={() => setActivePage("courses")}
          />
        );
    }
  };

  return (
    <>
      {!loggedIn ? (
        <div className="login-screen">
          <div className="card">
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
          </div>
        </div>
      ) : (
        <div className="dashboard-shell">
          <Navbar
            activePage={activePage}
            onNavigate={(page) => setActivePage(page)}
            onLogout={handleLogout}
          />
          <main className="dashboard-content">{renderContent()}</main>
        </div>
      )}
    </>
  );
}

export default App;
