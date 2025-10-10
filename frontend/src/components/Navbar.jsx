import React from "react";

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "courses", label: "AP Courses" },
  { id: "stats", label: "My Stats" },
  { id: "practice", label: "Practice" },
];

export default function Navbar({ activePage, onNavigate, onLogout }) {
  return (
    <header style={styles.container}>
      <div style={styles.inner}>
        <button style={styles.brand} onClick={() => onNavigate("dashboard")}>
          FiveAI 🔥
        </button>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.link,
                ...(activePage === item.id ? styles.activeLink : {}),
              }}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
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
  brand: {
    background: "none",
    border: "none",
    color: "#0078C8",
    fontSize: "1.25rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  nav: {
    display: "flex",
    gap: "1.5rem",
  },
  link: {
    background: "none",
    border: "none",
    color: "#4B5563",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    paddingBottom: "0.25rem",
    borderBottom: "2px solid transparent",
    transition: "color 0.2s ease, border-color 0.2s ease",
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
