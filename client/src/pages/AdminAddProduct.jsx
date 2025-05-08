import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import "./AdminAddProduct.css";

const AddProduct = ({onLogout}) => {
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    size: "",
    description: "",
    stock: 0,  // Added stock field
  });

  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleReset = () => {
    setProductData({ name: "", price: "", size: "", description: "", stock: 0 }); // Reset stock to 0
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !productData.name || !productData.price || !productData.size || !productData.description || productData.stock === "") {
      toast.error("Please fill all fields and upload an image.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("productImage", image);
    formData.append("name", productData.name);
    formData.append("price", productData.price);
    formData.append("size", productData.size);
    formData.append("description", productData.description);
    formData.append("stock", productData.stock);  // Send stock in the request

    try {
      const res = await fetch("http://localhost:5000/api/products/add", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Product added successfully!");
        handleReset(); 
      } else {
        toast.error(data.message || "Failed to add product.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
          <div className="add-product-container">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={productData.name}
              onChange={handleChange}
              placeholder="Product Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image</label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
              ref={fileInputRef}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={productData.price}
              onChange={handleChange}
              placeholder="Price (₹)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="size">Capacity / Size</label>
            <input
              type="text"
              id="size"
              name="size"
              value={productData.size}
              onChange={handleChange}
              placeholder="Capacity / Size"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Product Description</label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleChange}
              placeholder="Product Description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock Count</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={productData.stock}
              onChange={handleChange}
              placeholder="Stock Count"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              Submit
            </button>
            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddProduct;
