const Razorpay = require('razorpay');
const crypto = require('crypto');
const instance = new Razorpay({ key_id: process.env.RAZOR_API_KEY, key_secret: process.env.RAZOR_API_SECRET });
const Payment = require('../models/Payment');
const PendingPayment = require('../models/PendingPayment');
const Cart = require('../models/Cart');
const Orders = require('../models/Orders');
const Product = require('../models/Product');
const { giveUserIdFromCookies } = require('../services/auth');
const { updateProductsUsingSocketIo } = require('../services/socket');
const { ObjectId } = require('mongoose').Types;


// Step 1: Create Razorpay order and store pending payment
const checkout = async (req, res) => {
    try {
        const userId = giveUserIdFromCookies(req.cookies.authToken);
        if (!userId) {
            return res.status(401).json({ success: false, msg: "Unauthorized" });
        }

        const amountInPaise = Math.round(Number(req.body.amount) * 100);
        const options = {
            amount: amountInPaise,
            currency: "INR",
        };
        const order = await instance.orders.create(options);

        // Save pending payment in DB (survives server restarts)
        await PendingPayment.create({
            razorpay_order_id: order.id,
            userId,
            amount: req.body.amount,
        });

        res.status(200).json({
            success: true,
            order,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, msg: "Error creating order" });
    }
};


// Step 2: Verify payment → create orders from cart → save payment record → clear cart
const paymentVerification = async (req, res) => {
    try {
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature} =
        req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZOR_API_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ success: false, msg: "Payment verification failed" });
        }

        // Get the pending payment to find the userId
        const pendingData = await PendingPayment.findOne({ razorpay_order_id });
        if (!pendingData) {
            return res.status(400).json({ success: false, msg: "No pending payment found" });
        }

        const userId = pendingData.userId;

        // Create orders from cart items (orders are only created AFTER payment succeeds)
        const cartItems = await Cart.find({ userId: userId }).populate('productId');

        let orderIds = [];

        if (cartItems.length > 0) {
            const orderDocs = cartItems.map(item => ({
                userId: userId,
                productId: item.productId?._id,
                price: item.productId?.price || 0,
                discount: item.productId?.discountPercent || 0,
                quantity: item.quantity,
                orderType: 'normal',
                paymentMethod: 'Razorpay',
                paymentStatus: 'paid',
                orderStatus: 'success',
                orderDate: new Date(),
            }));

            const createdOrders = await Orders.insertMany(orderDocs);
            orderIds = createdOrders.map(o => o._id);

            // Decrease stock for each product
            for (const item of cartItems) {
                if (item.productId) {
                    await Product.findByIdAndUpdate(item.productId._id, {
                        $inc: { stock: -item.quantity }
                    });
                }
            }

            // Clear the cart
            await Cart.deleteMany({ userId: userId });

            try {
                updateProductsUsingSocketIo();
            } catch(e) { console.error("Socket emit failed", e); }
        }

        // Save the payment record with all linked order IDs
        await Payment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orders: orderIds,
            user: userId,
            amount: pendingData.amount,
            status: "success",
        });

        // Clean up pending entry
        await PendingPayment.deleteOne({ _id: pendingData._id });

        return res.status(200).json({ success: true, message: "Payment verified successfully" });

    } catch (err) {
        console.log("PAYMENT VERIFICATION ERROR:", err);
        return res.status(500).json({ success: false, msg: "Payment verification error: " + err.message, stack: err.stack });
    }
};


module.exports = {
    checkout,
    paymentVerification
};