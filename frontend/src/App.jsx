import { useState } from "react";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Courses from "./pages/Courses";
import Practice from "./pages/Practice";
import Stats from "./pages/Stats";
import { auth, db } from "./firebase";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  const selectedCourse = userProfile?.selectedCourse ?? "";

  const handleAuthSuccess = (profile) => {
    setUserProfile(profile);
    setLoggedIn(true);
    setActivePage("dashboard");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error while logging out:", err);
    } finally {
      setLoggedIn(false);
      setUserProfile(null);
      setActivePage("dashboard");
    }
  };

  const handleCourseSelect = async (course) => {
    if (!userProfile?.uid) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        selectedCourse: course,
      });
    } catch (err) {
      console.error("Failed to update selected course:", err);
    }

    setUserProfile((prev) =>
      prev ? { ...prev, selectedCourse: course } : prev
    );
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
        return <Stats stats={userProfile?.stats} />;
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
              <Login onLoginSuccess={handleAuthSuccess} />
            ) : (
              <Signup onSignupSuccess={handleAuthSuccess} />
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
