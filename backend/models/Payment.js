const mongoose =require("mongoose");

const paymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Orders",
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success",
  },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);