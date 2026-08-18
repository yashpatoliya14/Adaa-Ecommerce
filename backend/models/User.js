const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String},
        profilePicture: {
            type: String,
            default: "https://res.cloudinary.com/dvyz3pp5z/image/upload/v1735991146/default-profile-account_hawyxn.jpg"
        },
        otp: {type: String},
        role: {
            type: [String],
            enum: ["customer", "dealer", "delivery","admin"],
            default: ["customer"]
        },
        status: {type: String, default: 'active'},
        devices: {type: [String], default: []},
        googleId: {type: String},
        membership: {type: String},
        otpExpiresAt: {type: Date},
        userType: {type: String},
        verified: {type: Boolean, default: false},
    },
    {timestamps: true}
);

module.exports = mongoose.model('User', userSchema);
