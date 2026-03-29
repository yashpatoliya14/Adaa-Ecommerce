import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { selectDarkMode } from "../../store/features/themeSlice.js";
import OrderCard from "./OrderCard.jsx";
import EmptyState from "../EmptyState.jsx";
import { Filter, Search } from "lucide-react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const OrdersPage = () => {
    const darkMode = useSelector(selectDarkMode);
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [address , setAddress]  = useState({});
    const user = useSelector(state=>state.user)
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.isLoggedIn){
            navigate('/signIn');
        }
    }, []);


    //-------------------------------------------fetch address ------------------------
    useEffect(()=>{   
        axios.get(BACKEND_URL + '/api/address/' + user?.id,{withCredentials:true} )
        .then((res)=>{
          
          if(res.data.success){
              const addressUser = res.data.address[0]
              setAddress(addressUser)  
              console.log("this is " ,address);
              
          }
          
        })
      },[orders])
    useEffect(() => {
        fetchOrders();
    }, []); // Ensure it runs only once on component mount


    //-------------------------------------------fetch orders ------------------------

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/orders`, { withCredentials: true });
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesStatus = filterStatus === "all" || order.orderStatus === filterStatus;
        const matchesSearch =
            order.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${
                darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
            }`}
        >
            <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0"
                >
                    <h1 className={`text-3xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>My Orders</h1>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-10 pr-4 py-2 rounded-lg border ${
                                    darkMode
                                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>

                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center px-4 py-2 rounded-lg border ${
                                    darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                            >
                                <Filter className="w-5 h-5 mr-2" />
                                Filter
                            </motion.button>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                                            darkMode ? "bg-gray-800" : "bg-white"
                                        } ring-1 ring-black ring-opacity-5 z-10`}
                                    >
                                        {["all", "success", "Delivered", "Cancelled"].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setFilterStatus(status);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-sm capitalize ${
                                                    darkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                                                } ${filterStatus === status ? "text-blue-600" : ""}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {filteredOrders.length > 0 ? (
                        <motion.div layout className="space-y-6">
                            {filteredOrders.map((order) => (
                                <OrderCard key={order._id} order={order} address={address} darkMode={darkMode} onOrderUpdate={fetchOrders} />
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrdersPage;
