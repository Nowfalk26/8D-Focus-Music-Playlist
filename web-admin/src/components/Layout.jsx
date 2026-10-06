import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ activeTab, onSelectTab, user, onLogout, children }) {
  return (
    <div className="admin-layout">
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
      <div className="main-wrapper">
        <Navbar activeTab={activeTab} user={user} onLogout={onLogout} />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
}
