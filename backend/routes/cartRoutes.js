import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCartItems
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart); 
router.delete("/remove/:productId", protect, removeFromCart);
router.put("/update", protect, updateCartQuantity);
router.delete("/clear", protect, clearCart);
router.get("/items", protect, getCartItems);

export default router;
