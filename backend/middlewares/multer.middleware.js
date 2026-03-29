const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {giveUserFromDb} = require("../services/common.services");
const {giveUserIdFromCookies} = require("../services/auth");

// Define the temp directory relative to this script
const tempDir = path.join(__dirname, '../public/temp');

// Ensure the temp directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, {recursive: true});
}

//storage for userProfile
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: async function (req, file, cb) {
        try {
            const user = await giveUserFromDb(req.cookies.userId);
            if (!user) {
                return cb(new Error('No user found'), false);
            }

            const nameOfFile = `${user._id}${path.extname(file.originalname)}`;
            const localFilePath = path.join(tempDir, nameOfFile);


            // Check if the file exists and delete it if necessary
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
            cb(null, nameOfFile);
        } catch (e) {
            console.error('Error in filename callback:', e);
            cb(e, false);
        }
    }
});

const upload = multer({storage: storage});


const storageForProducts = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir); // Temporary directory for all files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});


const uploadForProducts = multer({
    storage: storageForProducts,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed: " + file.originalname), false);
        }
    },
});


module.exports = upload;
module.exports = uploadForProducts;