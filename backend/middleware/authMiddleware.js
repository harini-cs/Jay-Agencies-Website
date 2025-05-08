import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔐 Middleware to protect routes (authenticate user)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      return next(); // ✅ Authenticated
    } catch (error) {
      return res.status(401).json({
        message:
          error.name === "TokenExpiredError"
            ? "Session expired. Please login again."
            : "Not authorized, token failed",
      });
    }
  }

  // ⛔ No token provided
  return res.status(401).json({ message: "Not authorized, no token" });
};

// 🛡️ Middleware to check if the user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next(); // ✅ Admin access granted
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};
