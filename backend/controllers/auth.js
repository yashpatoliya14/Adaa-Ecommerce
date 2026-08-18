const userModel = require('../models/User')
const {sendOtpViaEmail} = require('../services/mailServices');
const bcrypt = require('bcrypt');
const tempUserModel = require('../models/TempUserModel');
const {setUser, setUserCookies, giveUserIdFromCookies} = require('../services/auth');
const User = require("../models/User");

//signupSendOtp method -----------------------------------------------------
const sendOtpToSignup = async (req, res) => {
    const {name, email, password} = req.body;

    // Generate OTP and expiration time
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    try {
        // Check if the user already exists in the main userModel
        const existingUser = await userModel.findOne({email});
        if (existingUser) {
            return res.json({success: false, msg: "User already exists"});
        }

        // Check if an unverified user already exists
        const tempUser = await tempUserModel.findOne({email});
        if (tempUser) {
            return res.status(400).json({success: true, msg: "OTP already sent. Please verify."});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 5);

        // Save user temporarily
        await tempUserModel.create({name, email, password: hashedPassword, otp, otpExpiresAt});

        // Send OTP
        await sendOtpViaEmail(email, otp);

        return res.status(200).json({success: true, msg: "OTP sent successfully"});

    } catch (err) {
        console.error("Error in sendOtpToSignup:", err);
        return res.status(500).json({success: false, msg: "Internal server error"});
    }
};


const verifyOtpToSignup = async (req, res) => {
    const {email, otp} = req.body;

    try {
        // Find the unverified user in the temp collection
        const tempUser = await tempUserModel.findOne({email});

        if (!tempUser) {
            return res.status(404).json({success: false, msg: "User not found or OTP expired"});
        }

        // Check if OTP matches
        if (tempUser.otp !== otp) {
            return res.status(400).json({success: false, msg: "Invalid OTP"});
        }

        // Check if OTP has expired
        if (tempUser.otpExpiresAt < Date.now()) {
            await tempUserModel.deleteOne({email}); // Cleanup expired user
            return res.status(400).json({success: false, msg: "OTP has expired"});
        }

        // Transfer user to main userModel
        const newUser = await userModel.create({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            verified: true
        });

        // Delete temporary user
        await tempUserModel.deleteOne({email});

        // Generate JWT token
        const token = setUser(newUser)
        setUserCookies(res, token);

        return res.status(200).json({
            success: true,
            message: 'User verified successfully'
        });

    } catch (err) {
        console.error("Error in verifyOtpToSignup:", err);
        return res.status(500).json({success: false, msg: "Internal server error"});
    }
};


//forgot password during the login
const sendOtpForgotPassword = async (req, res) => {
    const {email} = req.body;

    //generate otp & expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    try {

        //userModel exists or not
        const User = await userModel.findOne({email});
        if (!User) {
            return res.json({success: false, msg: "User doesn't exists"});
        }

        //send otp
        await sendOtpViaEmail(email, otp)


        User.otp = otp,
            User.otpExpiresAt = otpExpiresAt

        //save otp to database
        await User.save();


        res.status(200).json({success: true, msg: "Otp send successful !"})

    } catch (err) {

        console.log(`Error occured in send otp  : ${err}`);

    }
}

const verifyOtpForgotPassword = async (req, res) => {
    const {otp, email} = req.body;

    //check is empty or not
    if (!otp || !email) {
        return res.status(400).json({success: false, msg: "All fields are required Email and OTP !"});
    }

    try {
        //find userModel
        const User = await userModel.findOne({email});

        if (!User) {
            return res.status(404).json({success: false, msg: "User not found"});
        }

        //check is invalid or expiration
        if (User.otp !== otp) {
            return res.status(400).json({success: false, msg: "Otp is invalid"});
        }

        if (User.otpExpiresAt < Date.now()) {
            return res.status(400).json({success: false, msg: "Otp has expired"});
        }


        //sign a jwt token
        const token = setUser(User)
        setUserCookies(res, token);
        return res.status(200).json({success: true, message: 'User verified successfully', token});

    } catch (err) {
        console.log(`Error occurred in verifyOtpForgotPassword: ${err}`);
        return res.status(500).json({success: false, msg: "Internal server error"});
    }

}

const setNewPassword = async (req, res) => {
    const {email, newPassword} = req.body;

    //check is empty or not
    if (!email) {
        res.status(400).json({success: false, msg: "All fields are required Email !"});
    }

    try {
        //find userModel
        const User = await userModel.findOne({email});

        //check is invalid or expiration
        User.password = await bcrypt.hash(newPassword, 5);
        await User.save();

        res.status(200).json({success: true, message: 'Password changed successfully'});

    } catch (err) {

        console.log(`Error occur in verify otp : ${err}`);

    }
}

const forLogin = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email && !password) {
            res.json({success: false, msg: "All feild are required !"});
        }

        const data = await userModel.findOne({email});
        if (!data) {
            res.json({success: false, msg: "User Not found"});
        }
        const isPassValid = await bcrypt.compare(password, data.password)
        if (isPassValid) {
            const token = setUser(data)
            setUserCookies(res, token);

            return res.json({
                success: true, msg: "Login Successful", token, profilePicture: data.profilePicture
            })
        } else {
            res.json({success: false, msg: "Password Incorrect"})
        }
    } catch (err) {
        console.log(`Error occur in forLogin : ${err}`);
        res.status(500).json({success: false, msg: "Internal server error"});
    }
}

const isUserLoggedIn = async (req,res) => {

    try {
        const userIdFromCookies = giveUserIdFromCookies(req.cookies.authToken);

        if(!userIdFromCookies) {
            return res.status(401).json({error:"User not logged in"});
        }

        const user = await User.findById(userIdFromCookies);

        if (!user){
            return res.status(401).json({error: "User not signed Up"});
        }

        return res.status(200).json({message: "User is logged in"});
    }catch (error) {
        console.error(error);
        return res.status(401).json({error:"User not logged in"});
    }
}

module.exports = {
    sendOtpToSignup,
    verifyOtpToSignup,
    sendOtpForgotPassword,
    verifyOtpForgotPassword,
    setNewPassword,
    forLogin,
    isUserLoggedIn
}