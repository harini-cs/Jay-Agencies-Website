import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
// ✅ Get cart with filtered items
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("products.productId");

    if (!cart) return res.status(200).json({ products: [] });

    // Filter out deleted products
    const validProducts = cart.products.filter(item => item.productId !== null);

    if (validProducts.length !== cart.products.length) {
      cart.products = validProducts;
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart." });
  }
};

// ✅ Add item to cart with stock check
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      if (quantity > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} item(s) in stock` });
      }

      cart = new Cart({
        user: req.user._id,
        products: [{ productId, quantity }],
      });
    } else {
      if (!Array.isArray(cart.products)) {
        cart.products = [];
      }

      const existingItem = cart.products.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} item(s) in stock` });
        }
        existingItem.quantity = newQty;
      } else {
        if (quantity > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} item(s) in stock` });
        }
        cart.products.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("Cart add error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update quantity of a product in cart with stock check
export const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} item(s) in stock` });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Quantity updated", cart });
  } catch (err) {
    console.error("Update cart error:", err.message);
    res.status(500).json({ message: "Failed to update quantity" });
  }
};


// ✅ Remove specific product from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: "Product removed", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item from cart." });
  }
};


// ✅ Clear entire cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};

// ✅ Get cart items only (used for Products page maybe)
export const getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("products.productId", "name price image");

    if (!cart) {
      return res.json({ products: [] });
    }

    res.json({ products: cart.products });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Server error" });
  }
};
