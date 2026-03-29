const user = require('../models/User')
const jwt = require('jsonwebtoken');
const {giveUserFromDb} = require("../services/common.services");
const {uploadOnCloudinary} = require("../services/cloudinary");
const {giveUserIdFromCookies} = require("../services/auth");


async function changeProfilePicture(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'No file uploaded'});
        }
        const user = await giveUserFromDb(req.cookies.userId);
        if (!user) {
            return res.status(400).json({message: 'No user found'});
        }

        const response = await changePfp(req.file,user);
        if (response.error) {
            return res.status(400).json({error: response.error});
        }
        user.profilePicture = response.url;
        await user.save();
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({error: 'An error occurred while uploading the file'});
    }
}

async function handleEditProfile(req, res) {
    try {
        const userId = giveUserIdFromCookies(req.cookies.authToken);
        let { name , profilePictureUrl} = req.body;

        if (req.file) {
            const cloudinaryResponse = await changePfp(req.file, userId);
            if (cloudinaryResponse.error) {
                return res.status(400).json({ error: cloudinaryResponse.error });
            }
            profilePictureUrl = cloudinaryResponse.url;
        }

        const updatedUser = await user.findByIdAndUpdate(
            userId,
            {
                name: name,
                ...(req.file && { profilePicture: profilePictureUrl }),
            },
            { new: true }
        );

        return res.status(200).json(updatedUser);

    } catch (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function changePfp(file,userId) {
    try {
        const localFilePath = file.path; // Path to the uploaded file in ./public/temp
        const response = await uploadOnCloudinary(localFilePath, `profile_pictures/${userId}`,`profilePicture/${userId}`);
        if (response) {
            return {
                message: 'File uploaded successfully to Cloudinary',
                url: response.url
            };
        } else {
            return {error: 'Failed to upload file to Cloudinary'};
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return {error: 'An error occurred while uploading the file'};
    }
}

async function setProfilePictureToDefault(req, res) {
    try {
        const user = await giveUserFromDb(req.cookies.userId);
        if (!user) {
            return res.status(400).json({message: 'No user found'});
        }
        const defaultImg = await user.schema.path('profilePicture').default;
        user.profilePicture = defaultImg;
        await user.save();
        return res.status(200).send({url: defaultImg});
    } catch (error) {
        return res.status(500).json({error: 'An error occurred while setting the default image'});
    }
}

async function handleGiveUserInfo(req, res) {
    try {
        // console.log("from handleGiveUserInfo");
        // console.log(req.cookies.authToken);
        const user = await giveUserFromDb(req.cookies.authToken);
        // console.log(user);
        if (!user) {
            return res.status(400).json({message: 'No user found'});
        }
        const giveInfo = {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            role: user.role,
            devices: user.devices,
            verified: user.verified,
        };
        // console.log(giveInfo);
        return res.status(200).json(giveInfo);
    }catch(err) {
        console.log(err);
        return res.status(400).json({error: err.message});
    }
}

module.exports = {
    changeProfilePicture,
    setProfilePictureToDefault,
    handleGiveUserInfo,
    handleEditProfile,
}