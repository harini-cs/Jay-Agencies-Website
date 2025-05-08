// GET /api/analytics/top-rated-products
import Rating from "../models/Rating.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// 📌 Yearly Turnover (Group by Year)
export const getYearlyTurnover = async (req, res) => {
  try {
    const yearlyData = await Order.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
          totalTurnover: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.json(yearlyData.map(d => ({ year: d._id, total: d.totalTurnover })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch yearly turnover" });
  }
};

// 📌 Monthly Turnover (Current Year)
export const getMonthlyTurnover = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalTurnover: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(
      monthlyData.map((d) => ({
        month: d._id,
        total: d.totalTurnover,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch monthly turnover" });
  }
};

// 📌 Top 10 Most Active Customers
export const getTopCustomers = async (req, res) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          ordersCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
      { $sort: { ordersCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          name: "$userDetails.name",
          email: "$userDetails.email",
          ordersCount: 1,
          totalSpent: 1,
        },
      },
    ]);

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch top customers" });
  }
};

export const getTopSoldProducts = async (req, res) => {
  try {
    const topSold = await Product.find()
      .sort({ sold: -1 })
      .limit(10); // or any number you prefer

    res.json(topSold);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top sold products" });
  }
};


export const getTopRatedProducts = async (req, res) => {
  try {
    const topRated = await Rating.aggregate([
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1, totalRatings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          name: "$product.name",
          image: "$product.image",
          averageRating: 1,
          totalRatings: 1,
        },
      },
    ]);

    res.json(topRated);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top rated products" });
  }
};
