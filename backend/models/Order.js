import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  address: String,
  phone: String,
  total: Number,
  status: { type: String, enum: ["Placed", "Delivered"], default: "Placed" },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;