# User Profile & Address Management

## Overview

Authenticated users can view and edit their profile (name, profile picture) and manage their shipping address. Profile pictures are uploaded to Cloudinary and the address is used during checkout.

---

## Backend Files

| File                          | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `controllers/user.js`         | Profile management functions          |
| `controllers/address.js`      | Address CRUD functions                |
| `routes/user.js`              | User profile routes                   |
| `routes/address.js`           | Address routes                        |
| `models/User.js`              | User schema                           |
| `models/Address.js`           | Address schema                        |
| `services/common.services.js` | Shared `giveUserFromDb` helper        |

## Frontend Files

| File                                  | Purpose                          |
| ------------------------------------- | -------------------------------- |
| `components/customer/UserProfile.jsx` | Profile display page             |
| `components/customer/EditProfile.jsx` | Profile editing form             |

---

## User Profile API Endpoints (`/api/user`)

| Method | Endpoint                    | Description                             |
| ------ | --------------------------- | --------------------------------------- |
| GET    | `/userInfo`                 | Get current user's profile information  |
| POST   | `/uploadProfilePicture`     | Upload a new profile picture            |
| PUT    | `/editProfile`              | Edit name and/or profile picture        |
| DELETE | `/setProfilePictureToDefault` | Reset profile picture to default avatar |

## Address API Endpoints (`/api`)

| Method | Endpoint        | Description                               |
| ------ | --------------- | ----------------------------------------- |
| GET    | `/address/:id`  | Get address(es) for a user                |
| GET    | `/address`      | Get all addresses (admin use)             |
| POST   | `/address`      | Create or update user's address           |

---

## Controller Functions

### User Controller (`controllers/user.js`)

#### `handleGiveUserInfo(req, res)`

Returns the authenticated user's profile information.

**Response:**
```json
{
  "id": "user-id",
  "name": "Yash Patoliya",
  "email": "yash@example.com",
  "profilePicture": "https://res.cloudinary.com/...",
  "role": ["customer"],
  "devices": [],
  "verified": true
}
```

#### `handleEditProfile(req, res)`

**Input:** `{ name, profilePictureUrl }` + optional file upload

**Flow:**
1. If a file is uploaded → calls `changePfp()` to upload to Cloudinary
2. Updates user's `name` and `profilePicture` in the database
3. Returns the updated user document

#### `changeProfilePicture(req, res)`

Uploads a new profile picture via the `changePfp()` helper.

#### `changePfp(file, userId)` *(Helper)*

**Flow:**
1. Takes the uploaded temp file path
2. Uploads to Cloudinary at `profile_pictures/{userId}/`
3. Uses a consistent `publicId` so re-uploads overwrite the previous image
4. Returns `{ message, url }` or `{ error }`

#### `setProfilePictureToDefault(req, res)`

Resets the profile picture to the default (schema-defined) avatar:
```js
const defaultImg = await user.schema.path('profilePicture').default;
user.profilePicture = defaultImg;
await user.save();
```

---

### Address Controller (`controllers/address.js`)

#### `address(req, res)`

Creates or updates the user's shipping address.

**Input:** `{ firstName, lastName, addressLine, postalCode, state, country, city }`

**Logic:**
- Checks if an address already exists for the user
- If yes → **updates** the existing address
- If no → **creates** a new address
- This means each user has **one address** (upsert behavior)

#### `checkAddress(req, res)`

Retrieves address(es) for a specific user by ID. Used during checkout to prefill the address form.

#### `getAllAddress(req, res)`

Returns all addresses in the database. Primarily for administrative use.

---

## Shared Service

### `services/common.services.js`

#### `giveUserFromDb(token)`

Utility function used across the codebase:

```js
async function giveUserFromDb(token) {
    const user = getUser(token);     // Decode JWT
    return await User.findById(user.id);  // Fetch full user from DB
}
```

Used by: admin middleware, dealer middleware, user middleware, profile controller, admin controller.

---

## Data Models

### `Address` Schema

| Field       | Type                  | Description                    |
| ----------- | --------------------- | ------------------------------ |
| `userId`    | ObjectId (ref: User)  | Required. Address owner        |
| `fullName`  | String                | Required. Full name            |
| `address`   | String                | Required. Street address       |
| `city`      | String                | Required. City name            |
| `pincode`   | Number                | Required. Postal/ZIP code      |
| `state`     | String                | Required. State/province       |
| `country`   | String                | Required. Country              |
| `latitude`  | Number                | Optional. Geo-coordinate       |
| `longitude` | Number                | Optional. Geo-coordinate       |
| `createdAt` | Date                  | Auto-managed                   |
| `updatedAt` | Date                  | Auto-managed                   |

### `UserActivities` Schema

Tracks user engagement for analytics and recommendations:

| Field              | Type                                    | Description                         |
| ------------------ | --------------------------------------- | ----------------------------------- |
| `userId`           | ObjectId (ref: User)                    | Required. The user                  |
| `searchedProducts` | Array of `{ productId, searchTimestamp }` | Products found via search         |
| `viewedProducts`   | Array of `{ productId, viewTimestamp }`   | Products viewed in detail         |
| `purchasedProducts`| [ObjectId]                               | Products purchased                 |
| `wishlist`         | ObjectId                                 | Reference to wishlist              |
| `cartId`           | ObjectId                                 | Reference to cart                  |
