import { useCallback, useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Courses from "./pages/Courses";
import CourseOptions from "./pages/CourseOptions";
import Practice from "./pages/Practice";
import Stats from "./pages/Stats";
import { auth, db } from "./firebase";
import { findCourseByName, getCourseById } from "./data/apCourses";
import "./App.css";

const DEFAULT_STATS = { totalQuestions: 0, correct: 0, streak: 0 };

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

function App() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (!user) {
        setLoggedIn(false);
        setUserProfile(null);
        setIsLogin(true);
        setIsAuthReady(true);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);
        const fallbackEmail = user.email ?? "";
        let profileData;

        if (snapshot.exists()) {
          const data = snapshot.data();
          const normalizedSelection = normalizeSelectedCourse(data.selectedCourse);

          profileData = {
            uid: user.uid,
            email: data.email ?? fallbackEmail,
            selectedCourse: normalizedSelection,
            stats: data.stats ?? DEFAULT_STATS,
          };

          const updates = {};
          if (!data.email && fallbackEmail) updates.email = fallbackEmail;
          if (!data.stats) updates.stats = DEFAULT_STATS;
          if (
            data.selectedCourse === undefined ||
            typeof data.selectedCourse === "string" ||
            (data.selectedCourse &&
              typeof data.selectedCourse === "object" &&
              (!data.selectedCourse.id || !data.selectedCourse.name))
          ) {
            updates.selectedCourse = normalizedSelection;
          }

          if (Object.keys(updates).length) {
            await setDoc(userRef, updates, { merge: true });
          }
        } else {
          const defaultProfile = {
            email: fallbackEmail,
            selectedCourse: null,
            stats: DEFAULT_STATS,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, defaultProfile);
          profileData = {
            uid: user.uid,
            email: defaultProfile.email,
            selectedCourse: null,
            stats: DEFAULT_STATS,
          };
        }

        if (isMounted) {
          setUserProfile(profileData);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to hydrate profile after auth change:", error);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const selectedCourse = userProfile?.selectedCourse ?? null;

  const handleAuthSuccess = useCallback(
    (profile) => {
      setUserProfile(profile);
      setLoggedIn(true);
      setIsAuthReady(true);
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

  if (!isAuthReady) {
    return (
      <div className="login-screen">
        <div className="card">
          <h1 className="title">FiveAI 🔥</h1>
          <p className="msg">Checking your session…</p>
        </div>
      </div>
    );
  }

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
