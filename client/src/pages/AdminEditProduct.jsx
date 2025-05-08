import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts, updateProduct } from "../api";
import "./AdminEditProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    size: "",
    description: "",
    stock: "", // Will be converted to number later
    image: null,
  });

  const [existingImage, setExistingImage] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProducts();
        const product = res.data.find((p) => p._id === id);
        if (product) {
          setProductData({
            name: product.name,
            price: product.price,
            size: product.size,
            description: product.description,
            stock: Number(product.stock) || 0,
            image: null,
          });
          setExistingImage(product.image);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setProductData({ ...productData, image: files[0] });
    } else if (name === "stock") {
      const stockValue = Number(value);
      setProductData({ ...productData, stock: stockValue });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("price", productData.price);
      formData.append("size", productData.size);
      formData.append("description", productData.description);
      formData.append("stock", Number(productData.stock)); // Debug here

      if (productData.image) {
        formData.append("productImage", productData.image);
      }

      await updateProduct(id, formData);
      setToast({ message: "Product updated successfully!", type: "success" });

      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
    } catch (err) {
      console.error("Error updating product:", err);
      setToast({ message: "Failed to update product.", type: "error" });
    }
  };

  const handleCloseToast = () => {
    setToast({ message: "", type: "" });
  };

  return (
      <div className="edit-container">
        <h2>Edit Product</h2>

        {toast.message && (
          <div className={`toast-container`}>
            <div className={`toast ${toast.type}`}>
              <span>{toast.message}</span>
              <button className="close-toast" onClick={handleCloseToast}>
                ×
              </button>
            </div>
          </div>
        )}

        <form className="edit-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="name">Product Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={productData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹):</label>
            <input
              type="number"
              id="price"
              name="price"
              value={productData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="size">Capacity / Size:</label>
            <input
              type="text"
              id="size"
              name="size"
              value={productData.size}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Product Description:</label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock Quantity:</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={productData.stock}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              min="0"
              required
            />

          </div>

          <div className="form-group">
            <label>Existing Image:</label>
            {existingImage && (
              <div className="image-preview">
                <img
                  src={`http://localhost:5000/uploads/products/${existingImage}`}
                  alt="Existing"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload New Image:</label>
            <input type="file" name="image" onChange={handleChange} />
          </div>

          <button type="submit">Update Product</button>
        </form>
      </div>
  );
};

export default EditProduct;
