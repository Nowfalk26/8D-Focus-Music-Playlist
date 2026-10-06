import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SongManagement from "./components/SongManagement";
import CategoryManagement from "./components/CategoryManagement";
import UserManagement from "./components/UserManagement";

export default function App() {
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authChecked, setAuthChecked] = useState(false);

  // Check saved session on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    const savedUser = localStorage.getItem("adminUser");

    if (savedToken && savedUser) {
      try {
        setAdminUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      }
    }
    setAuthChecked(true);
  }, []);

  const handleLoginSuccess = (userData) => {
    setAdminUser(userData);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminUser(null);
  };

  if (!authChecked) {
    return null; // Brief initial session check
  }

  // If not logged in as Admin, render Login screen
  if (!adminUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      user={adminUser}
      onLogout={handleLogout}
    >
      {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}

      {activeTab === "songs" && <SongManagement />}

      {activeTab === "categories" && <CategoryManagement />}

      {activeTab === "users" && <UserManagement currentAdmin={adminUser} />}
    </Layout>
  );
}
