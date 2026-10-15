import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Login from "./components/Login";
import HomeScreen from "./components/HomeScreen";
import Studio8D from "./components/Studio8D";
import MusicLibrary from "./components/MusicLibrary";
import Dashboard from "./components/Dashboard";
import SongManagement from "./components/SongManagement";
import CategoryManagement from "./components/CategoryManagement";
import UserManagement from "./components/UserManagement";
import TasteProfileScreen from "./components/TasteProfileScreen";
import OrbitStageScreen from "./components/OrbitStageScreen";
import { PlayerProvider } from "./context/PlayerContext";

export default function App() {
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // Default to Flow 8D Home from Stitch
  const [libraryCategory, setLibraryCategory] = useState("All");
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
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdminUser(null);
    setActiveTab("home");
  };

  const handleNavigate = (tab, category = null) => {
    if (category) {
      setLibraryCategory(category);
    }
    setActiveTab(tab);
  };

  if (!authChecked) {
    return null;
  }

  // Admin tabs require authentication
  const isAdminTab = ["dashboard", "songs", "categories", "users"].includes(activeTab);

  return (
    <PlayerProvider>
      <Layout
        activeTab={activeTab}
        onSelectTab={handleNavigate}
        user={adminUser || { name: "Guest Listener", role: "explorer" }}
        onLogout={handleLogout}
      >
        {activeTab === "home" && <HomeScreen onNavigate={handleNavigate} />}

        {(activeTab === "taste" || activeTab === "dna") && <TasteProfileScreen />}

        {(activeTab === "orbit" || activeTab === "stage") && <OrbitStageScreen onNavigate={handleNavigate} />}

        {(activeTab === "studio" || activeTab === "8d") && <Studio8D onNavigate={handleNavigate} />}

        {(activeTab === "library" || activeTab === "search") && (
          <MusicLibrary onNavigate={handleNavigate} initialCategory={libraryCategory} />
        )}

        {/* Admin Tabs - render Login if not authenticated */}
        {isAdminTab && !adminUser ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}

            {activeTab === "songs" && <SongManagement />}

            {activeTab === "categories" && <CategoryManagement />}

            {activeTab === "users" && <UserManagement currentAdmin={adminUser} />}
          </>
        )}
      </Layout>
    </PlayerProvider>
  );
}
