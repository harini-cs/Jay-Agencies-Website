import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="home-header">
      {/* Logo */}
      <div className="shop-name">
        <img
          src="/jay_logo.png"
          alt="Jay Agencies Logo"
          className="navbar-logo"
        />
        Jay Agencies
      </div>

      <nav className="nav-menu">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        {user && (
          <>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/my-orders">My Orders</Link>
          </>
        )}
        <Link to="/contact">Contact</Link>
      </nav>

      {user ? (
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => navigate("/cart")}>
            <FaShoppingCart size={20} />
          </button>
          <button className="icon-btn" onClick={() => navigate("/profile")}>
            <FaUserCircle size={22} />
          </button>
          <button onClick={onLogout} className="logout-btn-nav">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={() => navigate("/login")} className="logout-btn-nav">
          Get Started
        </button>
      )}
    </header>
  );
};

export default Navbar;
