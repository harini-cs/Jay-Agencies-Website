import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add/:productId", protect, addToWishlist);
router.delete("/remove/:productId", protect, removeFromWishlist);
router.get("/", protect, getWishlist);

export default router;
