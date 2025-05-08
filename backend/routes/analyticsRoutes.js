import express from "express";
import {
  getTopSoldProducts,
  getTopRatedProducts,
    getYearlyTurnover,
    getMonthlyTurnover,
    getTopCustomers,
} from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/top-sold-products", protect, admin, getTopSoldProducts);
router.get("/top-rated-products", protect, admin, getTopRatedProducts);
router.get("/turnover/yearly", protect, admin, getYearlyTurnover);
router.get("/turnover/monthly", protect, admin, getMonthlyTurnover);
router.get("/top-customers", protect, admin, getTopCustomers);


export default router;
