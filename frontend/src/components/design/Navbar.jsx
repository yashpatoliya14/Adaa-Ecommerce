import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Moon, Sun, ChevronDown, LogOut, User, Heart, Menu, X,
    Home, ShoppingBag, Sparkles, Tag, Package, Shield,
    Store
} from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { selectDarkMode, toggleDarkMode } from "../../store/features/themeSlice.js"
import { fetchUser, logOutUser } from "../../store/features/userSlice.js"
import axios from "axios"
import { toast } from "react-toastify"
import { SearchBar } from "./SearchBar"

const navItemVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.97 },
}

const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
    exit: { opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.15 } },
}

const mobileMenuVariants = {
    hidden: { opacity: 0, x: "-100%" },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: "-100%", transition: { duration: 0.2 } },
}

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
}

export default function Navbar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const darkMode = useSelector(selectDarkMode)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const user = useSelector((state) => state.user)
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
    const userDropdownRef = useRef(null)

    // Primary nav items — spread across the bar
    const primaryNavItems = [
        { name: "Home", path: "/", icon: Home },
        { name: "Shop", path: "/shop", icon: Store },
        { name: "Deals", path: "/deals", icon: Tag },
        { name: "New Arrivals", path: "/new-arrivals", icon: Sparkles },
        { name: "Orders", path: "/orders", icon: Package },
    ]

    // Role-based extra nav items
    const roleNavItems = [
        ...(user.role?.includes("dealer") ? [{ name: "Dealer", path: "/dealer/products", icon: ShoppingBag }] : []),
        ...(user.role?.includes("admin") ? [{ name: "Admin", path: "/admin", icon: Shield }] : []),
    ]

    const allNavItems = [...primaryNavItems, ...roleNavItems]

    useEffect(() => {
        dispatch(fetchUser())
    }, [])

    // Scroll listener for glass effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    const isActive = (path) => location.pathname === path

    return (
        <>
            <nav
                className={`fixed w-full z-50 transition-all duration-500 ${
                    scrolled
                        ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20"
                        : "bg-white dark:bg-gray-900"
                }`}
            >
                {/* Top accent line */}
                <div className="h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* ===== Left: Logo + Hamburger ===== */}
                        <div className="flex items-center gap-3">
                            {/* Mobile hamburger */}
                            <motion.button
                                variants={navItemVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Mobile menu toggle"
                            >
                                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </motion.button>

                            {/* Logo */}
                            <Link to="/" className="flex-shrink-0 group">
                                <motion.div
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="relative"
                                >
                                    <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent select-none">
                                        ADAA
                                    </span>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 group-hover:w-full transition-all duration-300" />
                                </motion.div>
                            </Link>
                        </div>

                        {/* ===== Center: Primary Nav Items (spread) ===== */}
                        <div className="hidden lg:flex items-center gap-1">
                            {allNavItems.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.path)
                                return (
                                    <Link key={item.path} to={item.path}>
                                        <motion.div
                                            variants={navItemVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                                                active
                                                    ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                            }`}
                                        >
                                            <Icon
                                                size={16}
                                                className={active ? "text-violet-500 dark:text-violet-400" : ""}
                                            />
                                            <span>{item.name}</span>
                                            {active && (
                                                <motion.div
                                                    layoutId="nav-indicator"
                                                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* ===== Right: Actions ===== */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Search */}
                            <SearchBar
                                isOpen={isSearchOpen}
                                onToggle={() => setIsSearchOpen(!isSearchOpen)}
                                darkMode={darkMode}
                            />

                            {/* Wishlist */}
                            <Link to="/wishlist">
                                <motion.div
                                    variants={navItemVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className={`p-2 rounded-xl transition-colors duration-200 ${
                                        isActive("/wishlist")
                                            ? "text-pink-500 bg-pink-50 dark:bg-pink-500/10"
                                            : "text-gray-600 dark:text-gray-400 hover:text-pink-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <Heart size={20} className={isActive("/wishlist") ? "fill-pink-500" : ""} />
                                </motion.div>
                            </Link>

                            {/* Dark mode toggle */}
                            <motion.button
                                variants={navItemVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => dispatch(toggleDarkMode())}
                                className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {darkMode ? (
                                        <motion.div
                                            key="sun"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Sun size={20} className="text-amber-400" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="moon"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Moon size={20} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* User / Auth */}
                            {user.isLoggedIn ? (
                                <div className="relative" ref={userDropdownRef}>
                                    <motion.button
                                        variants={navItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                        aria-expanded={isDropdownOpen}
                                        aria-haspopup="true"
                                    >
                                        <img
                                            src={user.profilePicture}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30 dark:ring-violet-400/30"
                                        />
                                        <ChevronDown
                                            size={14}
                                            className={`text-gray-500 transition-transform duration-300 ${
                                                isDropdownOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </motion.button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                variants={dropdownVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white dark:bg-gray-800 shadow-xl shadow-black/10 dark:shadow-black/30 border border-gray-200/60 dark:border-gray-700/60 overflow-hidden"
                                                role="menu"
                                            >
                                                {/* User info header */}
                                                <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border-b border-gray-200/60 dark:border-gray-700/60">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                        {user.email}
                                                    </p>
                                                </div>

                                                {/* Profile link */}
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <motion.div
                                                        whileHover={{ x: 4, backgroundColor: darkMode ? "rgb(55, 65, 81)" : "rgb(249, 250, 251)" }}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                                                        role="menuitem"
                                                    >
                                                        <User size={16} className="text-violet-500 dark:text-violet-400" />
                                                        <span>Your Profile</span>
                                                    </motion.div>
                                                </Link>

                                                {/* Divider */}
                                                <div className="h-px bg-gray-200/60 dark:bg-gray-700/60" />

                                                {/* Logout */}
                                                <motion.button
                                                    whileHover={{ x: 4, backgroundColor: darkMode ? "rgb(55, 65, 81)" : "rgb(254, 242, 242)" }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400"
                                                    onClick={() => {
                                                        axios
                                                            .delete(BACKEND_URL + "/clearCookie", { withCredentials: true })
                                                            .then((res) => {
                                                                if (res.data?.success) {
                                                                    dispatch(logOutUser())
                                                                    navigate("/signin")
                                                                } else {
                                                                    toast("Failed Log Out")
                                                                }
                                                            })
                                                        setIsDropdownOpen(false)
                                                    }}
                                                    role="menuitem"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Logout</span>
                                                </motion.button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        variants={navItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        className="hidden sm:block px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                        onClick={() => navigate("/signIn")}
                                    >
                                        Sign In
                                    </motion.button>

                                    <motion.button
                                        variants={navItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        className="px-4 py-1.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-md shadow-violet-500/25 transition-all duration-200"
                                        onClick={() => navigate("/signUp")}
                                    >
                                        Sign Up
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ===== Mobile Drawer Menu ===== */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-2xl shadow-black/20 lg:hidden overflow-y-auto"
                        >
                            {/* Drawer header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                                <span className="text-xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent">
                                    ADAA
                                </span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            {/* Nav links */}
                            <div className="p-3 space-y-1">
                                {allNavItems.map((item, i) => {
                                    const Icon = item.icon
                                    const active = isActive(item.path)
                                    return (
                                        <motion.div
                                            key={item.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <Link
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                                                    active
                                                        ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                                }`}
                                            >
                                                <Icon
                                                    size={18}
                                                    className={active ? "text-violet-500" : "text-gray-400 dark:text-gray-500"}
                                                />
                                                {item.name}
                                                {active && (
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                                                )}
                                            </Link>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {/* Divider */}
                            <div className="mx-4 h-px bg-gray-200 dark:bg-gray-700/60" />

                            {/* Mobile quick links */}
                            <div className="p-3 space-y-1">
                                <Link
                                    to="/wishlist"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                                        isActive("/wishlist")
                                            ? "text-pink-500 bg-pink-50 dark:bg-pink-500/10"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                    }`}
                                >
                                    <Heart size={18} className={isActive("/wishlist") ? "fill-pink-500 text-pink-500" : "text-gray-400"} />
                                    Wishlist
                                </Link>

                                {!user.isLoggedIn && (
                                    <div className="pt-2 px-2 space-y-2">
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false)
                                                navigate("/signIn")
                                            }}
                                            className="w-full py-2.5 rounded-xl text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false)
                                                navigate("/signUp")
                                            }}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-md shadow-violet-500/25 transition-all"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
