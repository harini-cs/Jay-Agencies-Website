import React, { useEffect, useState } from "react";
import { getWishlistItems, removeFromWishlist } from "../api";
import { useNavigate } from "react-router-dom"; // import for navigation
import "./WishList.css"; // Optional: style as needed

const WishList = () => {
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate(); // initialize navigation

  const fetchWishlist = async () => {
    try {
      const res = await getWishlistItems();
      setWishlist(res.data);
    } catch (err) {
      const message =
        err.response?.data?.message === "Session expired. Please login again."
          ? "Session expired! Please login to view wishlist ❗"
          : "Login to view wishlist ❗";
      setToast(message);
      setTimeout(() => setToast(null), 2000);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setToast("Removed from wishlist ❌");
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      const message =
        err.response?.data?.message === "Session expired. Please login again."
          ? "Session expired! Please login to remove from wishlist ❗"
          : "Error removing from wishlist ❗";
      setToast(message);
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="wishlist-page">
      <h2>Your Wishlist</h2>

      {/* ✅ Toast Message */}
      {toast && <div className="toast">{toast}</div>}

      <div className="wishlist-grid">
        {wishlist.map((product) => (
          <div key={product._id} className="wishlist-card">
            <img
              src={`http://localhost:5000/uploads/products/${product.image}`}
              alt={product.name}
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>₹{product.price}</p>
            <p>Size: {product.size}</p>
            <div className="wishlist-actions">
              <button onClick={() => handleViewProduct(product._id)}>
                View
              </button>
              <button onClick={() => handleRemove(product._id)}>
                Remove ❌
              </button>
            </div>
          </div>
        ))}
        {wishlist.length === 0 && <p>No products in wishlist.</p>}
      </div>
    </div>
  );
};

export default WishList;
