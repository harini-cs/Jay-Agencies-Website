import express from "express";
import { addOrUpdateRating, getProductRatings, getMyRating } from "../controllers/ratingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/:productId", protect, addOrUpdateRating);
router.get("/:productId", getProductRatings);
router.get("/:productId/my", protect, getMyRating);

export default router;
