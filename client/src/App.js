import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManageProducts from "./pages/AdminManageProducts";
import AddProduct from "./pages/AdminAddProduct";
import EditProduct from "./pages/AdminEditProduct";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import WishList from "./pages/WishList";
import Profile from "./pages/Profile";
import CheckoutPage from "./pages/CheckoutPage";
import Layout from "./components/Layout";
import MyOrders from "./pages/MyOrders";
import AdminManageOrders from "./pages/AdminManageOrders";
import ProductDetails from './pages/ProductDetails';
import SalesReport from "./pages/AdminSalesReport";
import Contact from "./pages/Contact";
import AdminMessages from "./pages/AdminMessages";
import AdminLayout from "./components/AdminLayout";
import AdminAnalytics from "./pages/AdminAnalytics";


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);  // New loading state

  // Check localStorage and set state on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const storedRole = localStorage.getItem("role");

    if (token && name && email && storedRole) {
      setLoggedIn(true);
      setUserName(name);
      setUserEmail(email);
      setRole(storedRole);
    }

    setLoading(false);  // Set loading to false after checking localStorage
  }, []);

const handleLogin = (user) => {
  if (!user || !user.name || !user.email || !user.token) return;

  // Get the role from the user object directly
  const userRole = user.isAdmin ? "admin" : "customer";

  setLoggedIn(true);
  setUserName(user.name);
  setUserEmail(user.email);
  setRole(userRole);

  localStorage.setItem("token", user.token);
  localStorage.setItem("userName", user.name);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("role", userRole);
};


  const handleLogout = () => {
    setLoggedIn(false);
    setUserName("");
    setUserEmail("");
    setRole("");
    localStorage.clear();
  };

  if (loading) {
    return <div>Loading...</div>;  // Show loading message until state is updated
  }

  return (
    <Router>
      <ToastContainer
       closeButton={false}
     />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={loggedIn ? <Navigate to={role === "admin" ? "/admin/dashboard" : "/"} /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={loggedIn ? <Navigate to={role === "admin" ? "/admin/dashboard" : "/"} /> : <Signup />} />

        {/* Customer Routes (with Navbar) */}
        <Route element={<Layout user={loggedIn ? { name: userName, email: userEmail } : null} onLogout={handleLogout} />}>
        <Route
            path="/"
            element={role === "admin" ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Home user={loggedIn ? { name: userName, email: userEmail } : null} onLogout={handleLogout} />
            )}
          />
          <Route path="/products" element={role !== "admin" ? <ProductsPage /> : <Navigate to="/admin/dashboard" />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={role !== "admin" ? <CartPage /> : <Navigate to="/admin/dashboard" />} />
          <Route path="/wishlist" element={role !== "admin" ? <WishList /> : <Navigate to="/admin/dashboard" />} />
          <Route path="/profile" element={role !== "admin" ? <Profile /> : <Navigate to="/admin/dashboard" />} />
          <Route path="/checkout" element={role !== "admin" ? <CheckoutPage /> : <Navigate to="/admin/dashboard" />} />
          <Route path="/my-orders" element={role !== "admin" ? <MyOrders /> : <Navigate to="/admin/dashboard" />} />
          <Route path="/product/:id" element={role !== "admin" ? <ProductDetails /> : <Navigate to="/admin/dashboard" />} />
        </Route>

        {/* Admin Routes */}
        {/* Admin Routes with AdminLayout */}
        <Route path="/admin" element={role === "admin" ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminManageProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<AdminManageOrders />} />
          <Route path="sales-report" element={<SalesReport />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
