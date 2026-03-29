import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { FaLock } from "react-icons/fa"
import axios from "axios"
import { toast } from "react-toastify" // Import toastify
import { useSelector } from "react-redux"
import { LoadingBar } from "../loadingBar/LoadingBar"

const RAZOR_API_KEY = import.meta.env.VITE_RAZOR_API_KEY
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const inputVariants = {
  focus: { scale: 1.02, transition: { type: "spring", stiffness: 300 } },
  tap: { scale: 0.98 },
}

const buttonVariants = {
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 400 } },
  tap: { scale: 0.95 },
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "India"]

export default function Checkout() {
  const [saveInfo, setSaveInfo] = useState(false)
  const [savePaymentInfo, setSavePaymentInfo] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [amount, setAmount] = useState(20000)
  const { userId } = useParams()
  const [isDisabled, setIsDisabled] = useState(true)
  const [isAddressHide,setIsAddressHide] =useState(false);
  // Create state to store address fields
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    addressLine: "",
    city: "",
    postalCode: "",
    state: "",
    country: "",
  })
  const user = useSelector((state  ) => state.user)

  useEffect(()=>{   
    axios.get(BACKEND_URL + '/api/address/' + user?.id ,{withCredentials:true})
    .then((res)=>{
      
      if(res.data.success){
          const addressUser = res.data.address[0]
          setSelectedCountry(addressUser.country)
          setAddress({
            firstName:addressUser.fullName?.split(" ")[0],
            lastName:addressUser.fullName?.split(" ")[1],
            addressLine:addressUser.address,
            city:addressUser.city,
            postalCode:addressUser.pincode,
            state:addressUser.state,
            country:addressUser.country
          })  
          console.log("this is " ,address);
          
          setIsAddressHide(true)
      }else{   
          setIsAddressHide(false)
      }
      
    })
  },[])
 
  // Handle change of address fields
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAddress((prev) => ({
      ...prev,
      [name]: value,
      country: selectedCountry,
      userId: user.id,
    }))
    
    // Validate the address after each change
  }

  // Address validation function
  const validateAddress = () => {
    const requiredFields = ["firstName", "lastName", "addressLine", "city", "postalCode", "state", "country"]
    const emptyFields = requiredFields.filter((field) => !address[field])
  
    if (emptyFields.length > 0) {
      toast.error(`Please fill in the following fields: ${emptyFields.join(", ")}`)
      return false
    }
  
    const postalCodeRegex = /^\d{6}$/
    if (!postalCodeRegex.test(address.postalCode)) {
      toast.error("Postal code must be 6 digits long and contain only numbers.")
      return false
    }
  
    return true
  }
  

  

  const [items, setItems] = useState([])
  useEffect(() => {
    setIsDisabled(true)
    axios
        .get(BACKEND_URL + "/api/cart", { withCredentials: true })
        .then((res) => {
          if (Array.isArray(res.data.items)) {
            setItems(
                res.data.items.map((item) => {
                  const selectedColorObj = item.product.availableColors?.find(
                      (color) => color.colorName === item.selectedColor,
                  )

                  return {
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price - (item.product.price * (item.product.discountPercent || 0)) / 100,
                    color: item.selectedColor || "No color selected",
                    image: selectedColorObj?.images?.[0] || item.product.images?.[0] || "default-image-url.jpg",
                    quantity: item.quantity,
                  }
                }),
            )

          } else {
            setItems([])
          }
          setIsDisabled(false)
        })
        .catch((err) => console.error("Error fetching cart:", err))
  }, [])


  const handlePayNow = async () => {
    setIsDisabled(true)
    if (!validateAddress()) {
      setIsDisabled(false)
      return
    }

    try {
      const addressResponse = await axios.post(BACKEND_URL + "/api/address", address, { withCredentials: true })

      const totalAmount = Number(localStorage.getItem("totalCart")) || 0;
      const {
        data: { order },
      } = await axios.post(
          BACKEND_URL + "/api/payment",
          {
            amount: totalAmount,
          },
          { withCredentials: true },
      )

      const options = {
        key: RAZOR_API_KEY,
        amount: order.amount,
        currency: "INR",
        name: "adaa-jaipur",
        description: "Adaa Jaipur Payment",
        image: "https://avatars.githubusercontent.com/u/25058652?v=4",
        order_id: order.id,
        callback_url: BACKEND_URL + "/api/paymentVerification",
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        notes: {
          address: "Adaa Jaipur",
        },
        theme: {
          color: "#121212",
        },
      }

      // Open Razorpay checkout
      // Orders are created server-side only after payment is verified
      const razor = new window.Razorpay(options)
      razor.open()

    } catch (error) {
      console.error("Error during payment initiation:", error)
      toast.error("Payment initiation failed. Please try again.")
    } finally {
      setIsDisabled(false)
    }
  }
  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-24 px-4 min-h-screen bg-white dark:bg-gray-900"
      >
        <LoadingBar isLoading={isDisabled} />
        <div className="max-w-7xl mx-auto">
          <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold text-center text-black dark:text-white mb-8"
          >
            ADAA Demo Checkout
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            {
              !isAddressHide?
            <motion.div variants={formVariants} initial="hidden" animate="visible" className="space-y-8">
            
              {/* Delivery Section */}
              <motion.div variants={formVariants}>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">Delivery</h2>
                <div className="space-y-4">
                  <motion.select
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="tap"
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value)
                      }}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-200 hover:border-slate-700 dark:hover:border-slate-500"
                  >
                    <option value="" className="dark:bg-gray-800">
                      Country / Region
                    </option>
                    {countries.map((country) => (
                        <option key={country} value={country} className="dark:bg-gray-800">
                          {country}
                        </option>
                    ))}
                  </motion.select>

                  <div className="grid grid-cols-2 gap-4">
                    {["First Name", "Last Name"].map((placeholder) => (
                        <motion.input
                            key={placeholder}
                            variants={inputVariants}
                            whileFocus="focus"
                            whileTap="tap"
                            type="text"
                            placeholder={placeholder}
                            name={placeholder === "First Name" ? "firstName" : "lastName"}
                            value={address[placeholder === "First Name" ? "firstName" : "lastName"]}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-200 hover:border-slate-700 dark:hover:border-slate-500"
                        />
                    ))}
                  </div>

                  <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="tap"
                      type="text"
                      name="addressLine"
                      placeholder="Address"
                      value={address.addressLine}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-200 hover:border-slate-700 dark:hover:border-slate-500"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    {["City", "Postal Code"].map((placeholder) => (
                        <motion.input
                            key={placeholder}
                            variants={inputVariants}
                            whileFocus="focus"
                            whileTap="tap"
                            type="text"
                            name={placeholder === "City" ? "city" : "postalCode"}
                            placeholder={placeholder}
                            value={address[placeholder === "City" ? "city" : "postalCode"]}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-200 hover:border-slate-700 dark:hover:border-slate-500"
                        />
                    ))}
                  </div>

                  <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="tap"
                      type="text"
                      name="state"
                      placeholder="State"
                      value={address.state}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-200 hover:border-slate-700 dark:hover:border-slate-500"
                  />

                  <motion.label whileHover={{ scale: 1.02 }} className="flex items-center space-x-2 cursor-pointer">
                    </motion.label>
                </div>
              </motion.div>
 
              {/* Payment Section */}
              <motion.div variants={formVariants}>
                <div className="space-y-4">
                  <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handlePayNow}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FaLock className="text-sm" />
                    <span>Pay Now</span>
                  </motion.button>
                </div> 
              </motion.div>
            </motion.div>:
  <motion.div variants={formVariants} initial="hidden" animate="visible" className="space-y-8">          
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md dark:bg-slate-800 dark:text-slate-50">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-50 mb-4">Delivery Address</h2>
      <div className="space-y-4">
        <div>
          <strong>Full Name:</strong> {address?.fullName}  {address.lastName}
        </div>
        <div>
          <strong>Address:</strong> {address.addressLine}
        </div>
        <div>
          <strong>City:</strong> {address.city}
        </div>
        <div>
          <strong>State:</strong> {address.state}
        </div>
        <div>
          <strong>Postal Code:</strong> {address.postalCode}
        </div>
        <div>
          <strong>Country:</strong> {address.country}
        </div>
      </div>
      <div className="mt-6">
        <button onClick={()=>setIsAddressHide(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-blue-700">Edit Address</button>
      </div>
    </div>
              <motion.div variants={formVariants}>
                <div className="space-y-4">
                  <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handlePayNow}
                      className="w-full bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white py-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FaLock className="text-sm" />
                    <span>Pay Now</span>
                  </motion.button>
                </div>
              </motion.div>
    </motion.div>
            }
            {/* Right Column - Payment Details */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg h-fit"
            >
              {items &&
                  items.map((item) => {
                    return (
                        <div className="flex items-center space-x-4 mb-6">
                          <motion.div whileHover={{ scale: 1.05 }} className="relative">
                            <img
                                src={item.image || "/placeholder.svg"}
                                alt="Mini Dress"
                                className="w-20 h-20 object-cover rounded"
                            />
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                            >
                              1
                            </motion.span>
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-black dark:text-white font-medium">{item.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{item.color}</p>
                          </div>
                          <span className="text-black dark:text-white font-medium">${item.price}</span>
                        </div>
                    )
                  })}

              <div className="space-y-4 mb-6">
                <div className="flex">
                  <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="tap"
                      type="text"
                      placeholder="Discount code"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-200"
                  />
                  <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="px-4 bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white rounded-r-md transition-colors duration-200"
                  >
                    Apply
                  </motion.button>
                </div>
              </div>

              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2 text-sm"
              >
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${localStorage.getItem("totalCart")}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>- $40.00</span>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-between text-black dark:text-white font-medium pt-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <span>Total</span>
                  <span>${localStorage.getItem("totalCart")}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8"
          >
            Copyright © 2025 ADAA. All Rights Reserved.
          </motion.div>
        </div>
      </motion.div>
  )
}