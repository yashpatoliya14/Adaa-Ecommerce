# Image Management (Cloudinary + Multer)

## Overview

All image uploads in Adaa flow through **Multer** (for file receiving) and **Cloudinary** (for cloud storage and CDN delivery). This system handles:
- User profile pictures
- Product images (per-color galleries)
- Admin static homepage images (hero, brands, deals, Instagram)

---

## Backend Files

| File                               | Purpose                           |
| ---------------------------------- | --------------------------------- |
| `services/cloudinary.js`          | Cloudinary upload & delete logic  |
| `middlewares/multer.middleware.js` | File upload configurations        |

---

## Multer Configurations

### Profile Pictures (`upload`)

```js
storage: multer.diskStorage({
    destination: './public/temp',
    filename: `${user._id}${path.extname(file.originalname)}`
})
```

- **Files:** Single file (`upload.single('profilePicture')`)
- **Naming:** `{userId}.{ext}` — previous file is overwritten
- **Used by:** `/api/user/uploadProfilePicture`, `/api/user/editProfile`

### Product Images (`uploadForProducts`)

```js
storage: multer.diskStorage({
    destination: './public/temp',
    filename: `${file.fieldname}-${Date.now()}-${random}${ext}`
})
```

- **Files:** Multiple files (`uploadForProducts.any()`)
- **Naming:** `{colorName}-{timestamp}-{random}.{ext}`
- **Size limit:** 5 MB per file
- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`
- **Used by:** `/api/dealer/add`, `/api/dealer/updateProduct`

### Admin Static Images (`upload`)

- **Files:** Single file (`upload.single('image')`)
- **Used by:** `/api/admin/uploadImages`

---

## Cloudinary Functions

### `uploadOnCloudinary(localFilePath, publicId, folderName)`

General-purpose upload for profile pictures and static images.

**Key behavior:**
- `overwrite: true` — re-uploading with the same `publicId` replaces the file
- Deletes the local temp file after upload
- Returns the Cloudinary response object

**Folder structure:**
```
Profile:  profile_pictures/{userId}/
Static:   staticPictures/{userId}/{section}/
```

### `uploadOnCloudinaryForProducts(localFilePath, dealerAndProductDetails)`

Product-specific upload with organized folder paths.

**Parameters:**
```js
{
    folderPath: `${userId}/${productId}/${colorName}`,
    publicId: `${userId}-${productId}-${colorName}-${timestamp}`
}
```

**Key behavior:**
- Sanitizes folder paths — removes special characters (only `a-zA-Z0-9/_-` allowed)
- Sanitizes public IDs — removes special characters (only `a-zA-Z0-9_-` allowed)
- Does NOT auto-delete temp files (caller handles cleanup)

**Folder structure:**
```
Products: {userId}/{productId}/{colorName}/
Example:  65a1b2c3d4e5f6/65b2c3d4e5f6a7/Blue/
```

### `deleteCloudinaryImageFromUrl(imageUrl)`

Extracts the public ID from a Cloudinary URL and deletes the image.

**URL parsing logic:**
```js
// Input: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/subfolder/image.jpg
// Output public ID: folder/subfolder/image
const parts = imageUrl.split('/');
const fileWithVersion = parts.pop();            // image.jpg
const folderPath = parts.slice(parts.indexOf('upload') + 1).join('/');
const publicId = folderPath.split('/').slice(1).join('/').replace(/\.[^/.]+$/, '');
```

---

## Image Lifecycle

### Profile Picture

```
Upload → Cloudinary (overwrite previous) → Save URL to User.profilePicture
Reset  → Set User.profilePicture to schema default URL
```

### Product Images

```
Create  → Upload new images per color → Save URLs to Product.colors[].images
Update  → Diff existing vs. submitted → Upload new + Delete removed from Cloudinary
Delete  → Delete ALL images from Cloudinary → Delete product from MongoDB
```

### Static Homepage Images

```
Upload → Cloudinary (overwrite with consistent publicId) → Update StaticImages document
```

---

## Environment Variables

| Variable     | Description                |
| ------------ | -------------------------- |
| `CLOUD_NAME` | Cloudinary cloud name      |
| `API_KEY`    | Cloudinary API key         |
| `API_SECRET` | Cloudinary API secret      |

---

## Temp Directory

All uploaded files are temporarily stored in `backend/public/temp/` before being uploaded to Cloudinary. The directory is automatically created if it doesn't exist:

```js
const tempDir = path.join(__dirname, '../public/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}
```

Temp files are cleaned up after successful Cloudinary upload via `fs.promises.unlink()` or `fs.unlinkSync()`.
