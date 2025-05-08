import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";  // adjust path if needed

const AdminLayout = ({ onLogout }) => {
  return (
    <>
      <AdminNavbar onLogout={onLogout} />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default AdminLayout;
