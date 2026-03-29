const mongoose = require("mongoose");

const pendingPaymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Auto-delete after 1 hour (TTL index)
  },
});

module.exports = mongoose.model("PendingPayment", pendingPaymentSchema);
