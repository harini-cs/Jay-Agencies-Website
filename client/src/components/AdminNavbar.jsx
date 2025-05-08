import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "./AdminNavbar.css";

const AdminNavbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
    navigate("/"); // Redirect to the homepage after logout
  };

  return (
    <header className="admin-nav-header">
      {/* Clickable Jay Agencies heading with logo */}
      <Link to="/" className="shop-name">
        <img
          src="/jay_logo.png"  // Referencing the logo from the public folder
          alt="Jay Agencies Logo"
          className="navbar-logo"
        />
        Jay Agencies
      </Link>

      <nav className="admin-nav-menu">
        <Link to="/admin/products">Manage Products</Link>
        <Link to="/admin/orders">Manage Orders</Link>
        <Link to="/admin/sales-report">Sales Report</Link>
        <Link to="/admin/messages">Customer Messages</Link>
        <Link to="/admin/analytics">Analytics</Link>
      </nav>

      <div className="admin-nav-actions">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt size={18} /> Logout
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
