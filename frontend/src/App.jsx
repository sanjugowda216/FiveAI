import { useCallback, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Courses from "./pages/Courses";
import CourseOptions from "./pages/CourseOptions";
import Practice from "./pages/Practice";
import Stats from "./pages/Stats";
import { auth, db } from "./firebase";
import { getCourseById } from "./data/apCourses";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const selectedCourse = userProfile?.selectedCourse ?? null;

  const handleAuthSuccess = useCallback(
    (profile) => {
      setUserProfile(profile);
      setLoggedIn(true);
      navigate("/dashboard", { replace: true });
    },
    [navigate]
  );

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error while logging out:", err);
    } finally {
      setLoggedIn(false);
      setUserProfile(null);
      setIsLogin(true);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const syncCourseSelection = useCallback(
    async (course, { persist = true } = {}) => {
      if (!course) return;

      const nextSelection = { id: course.id, name: course.name };
      setUserProfile((prev) =>
        prev ? { ...prev, selectedCourse: nextSelection } : prev
      );

      if (
        persist &&
        userProfile?.uid &&
        userProfile?.selectedCourse?.id !== course.id
      ) {
        try {
          await updateDoc(doc(db, "users", userProfile.uid), {
            selectedCourse: nextSelection,
          });
        } catch (err) {
          console.error("Failed to update selected course:", err);
        }
      }
    },
    [userProfile?.uid, userProfile?.selectedCourse?.id]
  );

  const handleFeaturedCourseOpen = useCallback(
    async (course) => {
      await syncCourseSelection(course);
      navigate(`/course/${course.id}`);
    },
    [navigate, syncCourseSelection]
  );

  const handleCourseSelectFromGrid = useCallback(
    async (course) => {
      await syncCourseSelection(course);
      navigate(`/course/${course.id}`);
    },
    [navigate, syncCourseSelection]
  );

  const practiceFallbackCourse = useMemo(() => {
    if (!selectedCourse?.id) return null;
    return getCourseById(selectedCourse.id) ?? selectedCourse;
  }, [selectedCourse]);

  if (!loggedIn) {
    return (
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
    );
  }

  return (
    <div className="dashboard-shell">
      <Navbar onLogout={handleLogout} />
      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                userEmail={userProfile?.email}
                selectedCourse={selectedCourse}
                onStartPractice={() => {
                  const course = practiceFallbackCourse;
                  if (course?.id) {
                    navigate(`/practice/${course.id}`);
                  } else {
                    navigate("/courses");
                  }
                }}
                onBrowseCourses={() => navigate("/courses")}
                onOpenCourse={handleFeaturedCourseOpen}
              />
            }
          />
          <Route
            path="/courses"
            element={
              <Courses
                selectedCourse={selectedCourse}
                onSelectCourse={handleCourseSelectFromGrid}
              />
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <CourseOptions
                userProfile={userProfile}
                onSelectCourse={syncCourseSelection}
              />
            }
          />
          <Route
            path="/practice"
            element={
              <Practice
                selectedCourse={selectedCourse}
                onEnsureCourseSelection={(course) =>
                  syncCourseSelection(course, { persist: false })
                }
                onBackToDashboard={() => navigate("/dashboard")}
              />
            }
          />
          <Route
            path="/practice/:courseId"
            element={
              <Practice
                selectedCourse={selectedCourse}
                onEnsureCourseSelection={(course) => syncCourseSelection(course)}
                onBackToDashboard={() => navigate("/dashboard")}
              />
            }
          />
          <Route path="/stats" element={<Stats stats={userProfile?.stats} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
