import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/courses", label: "AP Courses" },
  { path: "/calendar", label: "Study Calendar" },
  { path: "/stats", label: "My Stats" },
  { path: "/practice", label: "Practice" },
];

export default function Navbar({ onLogout }) {
  const location = useLocation();

  return (
    <header style={styles.container}>
      <div style={styles.inner}>
        <NavLink to="/dashboard" style={styles.brandContainer}>
          <div style={styles.brandIcon}>✋</div>
          <span style={styles.brandText}>FiveAI</span>
        </NavLink>
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/practice" &&
                location.pathname.startsWith("/practice"));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  ...styles.link,
                  ...(isActive ? styles.activeLink : {}),
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button style={styles.logout} onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  container: {
    width: "100%",
    padding: "1rem 0",
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  inner: {
    width: "100%",
    maxWidth: "960px",
    margin: "0 auto",
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
  },
  brandIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    background: "linear-gradient(135deg, #0078C8 0%, #266fb5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    color: "#fff",
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(0, 120, 200, 0.3)",
  },
  brandText: {
    color: "#0078C8",
    fontSize: "1.25rem",
    fontWeight: 700,
  },
  nav: {
    display: "flex",
    gap: "1.5rem",
  },
  link: {
    color: "#4B5563",
    fontSize: "1rem",
    fontWeight: 600,
    paddingBottom: "0.25rem",
    borderBottom: "2px solid transparent",
    transition: "color 0.2s ease, border-color 0.2s ease",
    textDecoration: "none",
  },
  activeLink: {
    color: "#0078C8",
    borderBottomColor: "#0078C8",
  },
  logout: {
    padding: "0.5rem 1rem",
    backgroundColor: "#FF5A5F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.5rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};
