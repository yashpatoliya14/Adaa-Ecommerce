import { motion } from "framer-motion";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { selectDarkMode } from "../../store/features/themeSlice.js";
import { Package, XCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const statusStyles = {
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    Delivered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    return_requested: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    exchange_requested: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const OrderCard = ({ order, address, onOrderUpdate }) => {
    const darkMode = useSelector(selectDarkMode);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const productImage =
        order.productId?.colors && order.productId.colors.length > 0
            ? order.productId.colors[0].images[0]
            : "/placeholder.svg";

    const statusLabel = (order.orderStatus || "success").replace(/_/g, " ");
    const badgeStyle = statusStyles[order.orderStatus] || statusStyles.success;

    const canCancel = !["Delivered", "Cancelled", "return_requested", "exchange_requested"].includes(order.orderStatus);

    const handleCancel = async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/orders/cancel/${order._id}`, {}, { withCredentials: true });
            toast.success("Order cancelled successfully");
            if (onOrderUpdate) onOrderUpdate();
        } catch (err) {
            console.error(err);
            toast.error("Failed to cancel order");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl overflow-hidden border ${
                darkMode
                    ? "bg-gray-800 border-gray-700/50 hover:border-gray-600/50"
                    : "bg-white border-gray-200 hover:border-gray-300"
            } transition-colors duration-200 shadow-sm hover:shadow-md`}
        >
            <div className="p-5 sm:p-6">
                {/* Top row: product + price */}
                <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                        <img
                            src={productImage}
                            alt={order.productId?.name}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {order.productId?.name}
                        </h3>
                        <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                ₹{order.price?.toFixed(2)}
                            </span>
                            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                × {order.quantity}
                            </span>
                        </div>
                    </div>
                    {/* Status badge */}
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badgeStyle}`}>
                        <Package className="w-3 h-3" />
                        {statusLabel}
                    </span>
                </div>

                {/* Details row */}
                <div className={`mt-4 pt-4 border-t ${darkMode ? "border-gray-700/50" : "border-gray-100"} grid grid-cols-1 sm:grid-cols-2 gap-3`}>
                    <div>
                        <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Shipping</p>
                        <p className={`mt-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {address?.address || "Address not available"}
                            {address?.city && `, ${address.city}`}
                            {address?.pincode && ` - ${address.pincode}`}
                        </p>
                    </div>
                    <div>
                        <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Details</p>
                        <div className={`mt-1 text-sm space-y-0.5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <p>Payment: {order.paymentMethod || "N/A"}</p>
                            <p>Ordered: {format(new Date(order.orderDate), "MMM dd, yyyy")}</p>
                        </div>
                    </div>
                </div>

                {/* Cancel action */}
                {canCancel && (
                    <div className={`mt-4 pt-3 border-t ${darkMode ? "border-gray-700/50" : "border-gray-100"} flex justify-end`}>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCancel}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default OrderCard;
