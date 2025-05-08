import React, { useEffect, useState } from "react";
import { getAllOrders, markOrderDelivered } from "../api";
import { toast } from "react-toastify";
import "./AdminManageOrders.css";
import "react-toastify/dist/ReactToastify.css";

const AdminManageOrders = () => {
  const [confirmModal, setConfirmModal] = useState({ show: false, orderId: null, loading: false });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders
    .filter((order) => {
      const matchesFilter = filter === "All" ? true : order.status === filter;
      const matchesSearch = order._id.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <div className="admin-loading">Loading orders...</div>;

  return (
    <div className="admin-orders-page">
      {/* Use AdminNavbar here */}

      <div className="admin-orders-header">
        <h2 className="admin-orders-title">Manage Orders</h2>

        <div className="admin-controls">
          <div className="admin-search">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Enter Order ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-filter">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Placed">Placed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="admin-sort">
            <label>Sort by:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>
          <button
            className="reset-btn"
            onClick={() => {
              setSearch("");
              setFilter("All");
              setSortOrder("Newest");
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delivery</h3>
            <p>Are you sure you want to mark this order as <strong>Delivered</strong>?</p>
            <div className="modal-buttons">
              {confirmModal.loading ? (
                <p className="modal-loading">Processing... Please wait</p>
              ) : (
                <>
                  <button
                    className="modal-confirm"
                    onClick={async () => {
                      setConfirmModal({ ...confirmModal, loading: true });
                      try {
                        await markOrderDelivered(confirmModal.orderId);
                        toast.success("Order marked as Delivered!");
                        await fetchOrders();
                      } catch (error) {
                        toast.error("Failed to update order status.");
                      } finally {
                        setConfirmModal({ show: false, orderId: null, loading: false });
                      }
                    }}
                    disabled={confirmModal.loading}
                  >
                    Yes, Confirm
                  </button>
                  <button
                    className="modal-cancel"
                    onClick={() => setConfirmModal({ show: false, orderId: null, loading: false })}
                    disabled={confirmModal.loading}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <p className="no-orders">No {filter.toLowerCase()} orders found.</p>
      ) : (
        <div className="admin-order-grid">
          {filteredOrders.map((order) => {
            const orderTotal = order.products.reduce(
              (sum, item) => sum + item.quantity * (item.productId?.price || 0),
              0
            );

            return (
              <div className="admin-order-card" key={order._id}>
                <div className="admin-order-info">
                  <h4>Order #{order._id.slice(-6).toUpperCase()}</h4>
                  <p><strong>Customer:</strong> {order.user?.name} ({order.user?.email}) <br></br> Phone No: {order.user?.phone}</p>
                  <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                  {order.status === "Delivered" && (
                    <p className="delivered-time">
                      <strong>Delivered:</strong>{" "}
                      {order.deliveredAt
                        ? new Date(order.deliveredAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                        : "N/A"}
                    </p>
                  )}

                  <p><strong>Total:</strong> ₹{orderTotal}</p>

                  <div className="admin-status">
                    <span className={`badge ${order.status === "Delivered" ? "delivered" : "placed"}`}>
                      {order.status}
                    </span>

                    {order.status !== "Delivered" && (
                      <button
                        className="mark-delivered-btn"
                        onClick={() => setConfirmModal({ show: true, orderId: order._id })}
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>

                <div className="admin-order-products">
                  {order.products.map((item) => (
                    <div key={item._id} className="admin-product">
                      <img
                        src={`http://localhost:5000/uploads/products/${item.productId?.image}`}
                        alt={item.productId?.name}
                        onError={(e) => (e.target.src = "/default-product.png")}
                      />
                      <div>
                        <p className="product-name-order">{item.productId?.name}</p>
                        <p>Qty: {item.quantity}</p>
                        <p>₹{item.productId?.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminManageOrders;
