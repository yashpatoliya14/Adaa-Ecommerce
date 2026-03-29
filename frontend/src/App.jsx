import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { FaShoppingCart, FaArrowUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectDarkMode } from './store/features/themeSlice';

import { StagewiseToolbar } from '@stagewise/toolbar-react';
import ReactPlugin from '@stagewise-plugins/react';

// Components
import Navbar from './components/design/Navbar.jsx';
import Hero from './components/design/Hero.jsx';
import Brands from './components/design/Brands.jsx';
import DealsSection from './components/design/DealsSection.jsx';
import NewArrivals from './components/design/NewArrivals.jsx';
import InstagramFeed from './components/design/InstagramFeed.jsx';
import Testimonials from './components/design/Testimonials.jsx';
import Newsletter from './components/design/Newsletter.jsx';
import Footer from './components/design/Footer.jsx';
import Cart from './components/customer/Cart.jsx';
import Shop from './components/pages/Shop.jsx';
import ProductDetail from './components/pages/ProductDetail.jsx';
import Checkout from './components/customer/Checkout.jsx';
import UserProfile from './components/customer/UserProfile.jsx';
import EditProfile from './components/customer/EditProfile.jsx';
import Deals from './components/pages/Deals';
import NewArrivalsPage from './components/pages/NewArrivalsPage';
import Wishlist from './components/customer/Wishlist.jsx';
import SearchResults from './components/searchProducts/SearchResults.jsx';
import SignIn from "./components/auth/SignIn.jsx";
import SignUp from "./components/auth/SignUp.jsx";
import ForgotPassword from "./components/auth/ForgotPassword.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import ConfirmCode from "./components/auth/ConfirmCode.jsx";
import DealerProducts from "./components/dealer/DealerProducts.jsx";
import DealerProductDetail from "./components/dealer/DealerProductDetail.jsx";
import DealerProductForm from "./components/dealer/DealerProductForm.jsx";

import AdminPanel from "./components/admin/AdminPanel.jsx";
import UserDetails from "./components/admin/UserDetails.jsx";
import ProtectedRoute from './ProtectedRoute.jsx';
import Unauthorized from './Unauthorized.jsx';
import DealerProductEditingPage from "./components/dealer/DealerProductEditForm.jsx";
import OrdersPage from "./components/customer/OrdersPage.jsx";
import ChatBot from "./components/ChatBot/ChatBot.jsx";
import ChatToggle from "./components/ChatBot/ChatToggle.jsx";
import GlobeContainer from "./components/Globe/GlobeContainer.jsx";
import AdminPermissionsPage from "./components/admin/AdminPermissionsPage.jsx";

// ScrollToTop component: listens for location changes and scrolls to the top
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [pathname]);
    return null;
};

function App() {
    const darkMode = useSelector(selectDarkMode);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const user = useSelector(state => state.user);

    // Throttled scroll handler to improve scrolling performance
    useEffect(() => {
        let throttleTimeout = null;
        const handleScroll = () => {
            if (throttleTimeout === null) {
                throttleTimeout = setTimeout(() => {
                    setShowScrollTop(window.scrollY > 300);
                    throttleTimeout = null;
                }, 200); // Adjust delay as needed for performance optimization
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <LazyMotion features={domAnimation}>
            <div className={darkMode ? 'dark' : ''}>
                <div className="min-h-screen bg-white dark:bg-gray-900">
                    <StagewiseToolbar
                        config={{
                            plugins: [ReactPlugin],
                        }}
                    />
                    <Navbar />

                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center min-h-screen">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
                            </div>
                        }
                    >
                        {/* ScrollToTop ensures each route begins at the top */}
                        <ScrollToTop />
                        <Routes>
                            {/* User Login Routes */}
                            <Route path="/signIn" element={<SignIn />} />
                            <Route path="/signUp" element={<SignUp />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/confirm-code" element={<ConfirmCode />} />

                            {/* Main Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/checkout/:userIdFromCookies" element={<Checkout />} />

                            {/* User Profile Routes */}
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/profile/edit" element={<EditProfile />} />

                            {/* Additional Pages */}
                            <Route path="/deals" element={<Deals />} />
                            <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/search" element={<SearchResults />} />

                            <Route>
                                {/* Admin Routes */}
                                <Route path="/admin" element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                        <AdminPanel />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/user/:id/edit" element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                        <UserDetails />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin/give-roles" element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                        <AdminPermissionsPage />
                                    </ProtectedRoute>
                                } />

                                {/* Dealer Routes */}
                                <Route path="/dealer/products" element={
                                    <ProtectedRoute allowedRoles={["dealer"]}>
                                        <DealerProducts />
                                    </ProtectedRoute>
                                } />
                                <Route path="/dealer/products/:id" element={
                                    <ProtectedRoute allowedRoles={["dealer"]}>
                                        <DealerProductDetail />
                                    </ProtectedRoute>
                                } />
                                <Route path="/dealer/products/new" element={
                                    <ProtectedRoute allowedRoles={["dealer"]}>
                                        <DealerProductForm />
                                    </ProtectedRoute>
                                } />
                                <Route path="/dealer/products/:id/edit" element={
                                    <ProtectedRoute allowedRoles={["dealer"]}>
                                        <DealerProductEditingPage />
                                    </ProtectedRoute>
                                } />



                                {/* Unauthorized Page */}
                                <Route path="/unauthorized" element={<Unauthorized />} />
                            </Route>
                        </Routes>
                        <Footer />
                    </Suspense>

                    <ChatBot />
                    <ChatToggle />

                    {/* Cart and Scroll-to-Top Buttons */}
                    <Link to="/cart">
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            className="fixed bottom-8 right-8 p-4 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg z-50 hover:bg-gray-900 dark:hover:bg-gray-100"
                        >
                            <FaShoppingCart size={24} />
                        </motion.button>
                    </Link>

                    <AnimatePresence>
                        {showScrollTop && (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                onClick={scrollToTop}
                                className="fixed bottom-24 right-8 p-4 bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-full shadow-lg z-50 hover:bg-gray-700 dark:hover:bg-gray-300"
                            >
                                <FaArrowUp size={24} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </LazyMotion>
    );
}

// Memoized HomePage component to reduce unnecessary re-renders
const HomePage = memo(() => (
    <>
        <Hero />
        <Brands />
        <DealsSection />
        <NewArrivals />
        <InstagramFeed />
        <Testimonials />
        <Newsletter />
    </>
));

export default memo(App);
