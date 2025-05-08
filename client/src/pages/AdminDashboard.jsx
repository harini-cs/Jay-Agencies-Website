import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaChartBar,
  FaEnvelope,
} from "react-icons/fa";
import { MdAnalytics } from "react-icons/md";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [newOrders, setNewOrders] = useState(0);
  const [pendingMessages, setPendingMessages] = useState(0);
  const [showMessageAlert, setShowMessageAlert] = useState(false); // State to control message alert visibility

  // Fetch placed orders
  const fetchPlacedOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const placedOrders = response.data.filter(
        (order) => order.status === "Placed"
      );
      setNewOrders(placedOrders.length);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch pending messages
  const fetchPendingMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const pending = response.data.filter((message) => message.status === "Pending");
      setPendingMessages(pending.length);

      // Only show the alert if there are pending messages
      setShowMessageAlert(pending.length > 0);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchPlacedOrders();
    fetchPendingMessages();
  }, []);

  return (
          
    <div className="admin-dashboard">
      {/* Include AdminNavbar component */}

      {/* New Order Notification */}
      {newOrders > 0 && (
        <div className="order-notification">
          🚨 {newOrders} new order{newOrders > 1 ? "s" : ""} placed. Check the
          Manage Orders section!
        </div>
      )}

      {/* Pending Messages Notification */}
      {showMessageAlert && (
        <div className="message-alert">
          📬 You have new pending message{pendingMessages > 1 ? "s" : ""}. Check the Customer Messages section!
        </div>
      )}

      <div className="dashboard-content">
        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/products")}
        >
          <FaBoxOpen className="dashboard-icon" />
          <h2>Manage Products</h2>
          <p>View, update, or remove existing products.</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/orders")}
        >
          <FaShoppingCart className="dashboard-icon" />
          <h2>Manage Orders</h2>
          <p>Track and process customer orders.</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/sales-report")}
        >
          <FaChartBar className="dashboard-icon" />
          <h2>Sales Report</h2>
          <p>Analyze sales performance and generate reports.</p>
        </div>

        {/* Customer Messages Card */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/messages")}
        >
          <FaEnvelope className="dashboard-icon" />
          <h2>Customer Messages</h2>
          <p>Read and respond to messages sent by customers.</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/analytics")}
        >
          <MdAnalytics className="dashboard-icon" />
          <h2>Sales Analytics</h2>
          <p>View top-selling products and turnover trends.</p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
