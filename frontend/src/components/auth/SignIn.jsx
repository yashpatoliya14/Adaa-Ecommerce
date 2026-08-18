import { useState,useEffect } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import {toast} from 'react-toastify'
import {GoogleButton} from "./GoogleButton.jsx";
import { jwtDecode } from 'jwt-decode'
import {useDispatch} from "react-redux";
import {fetchUser, logInUser} from "../../store/features/userSlice.js";
import {LoadingBar} from "../loadingBar/LoadingBar.jsx";
import axios from "axios";

function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({});
  const [loading,setLoading] = useState(false);
  const [isForgotLoading,setIsForgotLoading] = useState(false);
  const navigate = useNavigate()
    const dispatch = useDispatch();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [isHidePass,setIsHidePass] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);

  const validate = (name, value) => {
      let error = '';
      if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
          error = 'Please enter a valid email address';
      } else if (name === 'password') {
          const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{6,}$/;
          if (!passwordRegex.test(value)) {
              error = 'Password must be at least 6 characters long, include at least one number, and one special character';
          }
      }
      setErrors(prev => ({ ...prev, [name]: error })); // Update the error state
    };


  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      validate(name, value);
  };
const validateForm = ()=>{

  if(!formData.email && !formData.password){
    setErrors(prev => ({...prev ,"password":"Please enter Password"}))
    setErrors(prev => ({...prev ,"email":"Please enter Email"}))
  }
  else if(!formData.password){
    setErrors(prev => ({...prev ,"password":"Please enter Password"}))
  }else if(!formData.email){
    setErrors(prev => ({...prev ,"email":"Please enter Email"}))

  }
  return true
}

  const handleForgot = (e)=>{
    e.preventDefault()

    if(!formData.email){
      setErrors({"email":"Please Enter Email"})
      return ;
    }
    setIsForgotLoading(true)
    fetch(BACKEND_URL+ '/api/login/send-otp-forgot', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email:formData.email }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
          toast(data.msg);
          localStorage.setItem('email', formData.email);
          navigate('/forgot-password'); // Redirect to home page after successful OTP verification

      } else {
          toast(data.msg)
          setErrors('Please try again.');
      }
    })
    .catch((err) => {
        console.log(err);
        setErrors('Error verifying OTP.');
    })
    .finally(()=>{
    setIsForgotLoading(false)

    })
  }
  const handleSubmit = (e) => {
      e.preventDefault();

      setIsDisabled(true);
      if (validateForm()) {
          console.log('Form Submitted:', formData);

          setLoading(true);


          fetch( BACKEND_URL + "/api/login",
              {
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },credentials: 'include',
                  method: "POST",
                  body: JSON.stringify(formData)
              })
              .then((res)=> res.json())
              .then((res)=>{
                console.log(res);

                  if(res.success){
                      setLoading(false);
                      toast(res.msg);
                      dispatch(fetchUser());
                      dispatch(logInUser());
                          navigate('/')

                  }else{
                    toast(res.msg)
                  }
              })
              .catch(function(res){ console.log(res) })
              .finally(()=>setIsDisabled(false));
      }
  };

    const handleSignInWithGoogle = () => {
        window.location.href=import.meta.env.VITE_BACKENDURL + '/api/google';
    }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
        <LoadingBar isLoading={isDisabled || isForgotLoading} />
      <div className="flex-1 hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1200&fit=crop"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In To ADAA</h2>
          </div>

          <div className="flex gap-4 mb-6">
            <GoogleButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  name='email'
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  onChange={handleChange}
                />
                {errors.email && <span className='text-red-700'>{errors.email}</span>}
              </div>
              <div className="relative">
  <input
    type={isHidePass ? "password" : "text"}
    placeholder="Password"
    name="password"
    className="relative w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-200"
    onChange={handleChange}
  />
  {errors.password && <span className="text-red-700">{errors.password}</span>}
  <button
    type="button"
    className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 p-1"
    onClick={(e) => {
      e.preventDefault();
      setIsHidePass(!isHidePass);
    }}
  >
    {isHidePass ? (
      <i className="fa-regular fa-eye"></i>
    ) : (
      <i className="fa-regular fa-eye-slash"></i>
    )}
  </button>
</div>

            </div>

              <button
                  type="submit"
                  className={`w-full p-3 rounded-lg transition-all duration-200 transform ${
                      isDisabled
                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                          : "bg-black text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  disabled={isDisabled}
              >
                  Sign In
              </button>


              <div className="flex items-center justify-between text-sm">
              <Link
                to="/signup"
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                Register Now
              </Link>
              <button
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleForgot}
                disabled={isForgotLoading}
              >
                {isForgotLoading ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to ADAA's{' '}
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn