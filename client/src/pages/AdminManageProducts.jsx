import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { getProducts, deleteProduct } from "../api";
import "./AdminManageProducts.css";

const AdminManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product._id !== id));
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Something went wrong while deleting the product.");
      }
    }
  };

  // 🔍 Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="manage-products-container">
        <header className="manage-products-header">
          <h2>Manage Products</h2>
          <button
            className="add-product-btn"
            onClick={() => navigate("/admin/products/add")}
          >
            <FaPlus /> Add Product
          </button>
        </header>

        {/* 🔍 Search Bar */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="product-table">
          {filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price (₹)</th>
                  <th>Size</th>
                  <th>Description</th>
                  <th>Stock</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={`http://localhost:5000/uploads/products/${product.image}`}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>₹{product.price}</td>
                    <td>{product.size}</td>
                    <td>{product.description}</td>
                    <td>{product.stock}</td>
                    <td>
                      {product.stock > 0 ? (
                        <span className="in-stock">In Stock</span>
                      ) : (
                        <span className="admin-out-of-stock">Out of Stock</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(product._id)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
  );
};

export default AdminManageProducts;
