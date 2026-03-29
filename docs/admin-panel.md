# Admin Panel

## Overview

The Admin panel provides full control over the platform. Admins can:
- View and manage all registered users
- Assign or revoke roles (customer, dealer, admin)
- Delete user accounts
- View user-specific order history
- Update static images used on the homepage (hero, brands, deals, Instagram)

Admin routes are protected by the `checkForAdminAuthentication` middleware.

---

## Backend Files

| File                         | Purpose                              |
| ---------------------------- | ------------------------------------ |
| `controllers/admin.js`       | Admin controller functions           |
| `routes/adminRoutes.js`      | Admin route definitions              |
| `middlewares/admin.js`       | Admin role verification middleware   |
| `models/StaticImages.js`     | Schema for homepage static images    |

## Frontend Files

| File                                      | Purpose                          |
| ----------------------------------------- | -------------------------------- |
| `components/admin/AdminPanel.jsx`         | Main admin dashboard             |
| `components/admin/AdminPermissionsPage.jsx`| Role management page            |
| `components/admin/UserDetails.jsx`        | User detail view with orders     |

---

## API Endpoints (`/api/admin`) — *Requires admin role*

| Method | Endpoint             | Description                                    |
| ------ | -------------------- | ---------------------------------------------- |
| GET    | `/`                  | Get all users                                  |
| GET    | `/:userId`           | Get user details + their order history         |
| DELETE | `/:userId`           | Delete a user account                          |
| PUT    | `/givePermissions`   | Assign a new role to a user                    |
| PUT    | `/removePermission`  | Remove a role from a user                      |
| PUT    | `/uploadImages`      | Upload a new static image (hero, deals, etc.)  |
| GET    | `/getStaticImages`   | Get all static images                          |

---

## Controller Functions

### `giveAllUsers(req, res)`
Returns all users from the database: `User.find({})`

### `giveUserAndOrdersInfo(req, res)`
Returns a specific user's profile and all their orders:
```js
const user = await User.findById(userId);
const orders = await Orders.find({ userId });
return { user, orders };
```

### `deleteUser(req, res)`
Permanently deletes a user: `User.findByIdAndDelete(userId)`

### `givePermission(req, res)`

**Input:** `{ permission, userEmail }`

Adds a role to a user's `role` array if not already present:
```js
if (!user.role.includes(permission)) {
    user.role.push(permission);
    await user.save();
}
```

### `removePermission(req, res)`

**Input:** `{ permission, userEmail }`

Filters out the specified role:
```js
user.role = user.role.filter(role => role !== permission);
await user.save();
```

### `changeImages(req, res)`

Uploads a new static image for a specific section/part of the homepage.

**Input:** `file` (multipart), `{ section, part }` in body
- Example: `section = "heroSection"`, `part = "left"`

**Flow:**
1. Validates file upload and admin user
2. Uploads to Cloudinary under `staticPictures/{userId}/{section}/`
3. Updates `StaticImages` document using dynamic key: `{section}.{part}`
4. Uses `findOneAndUpdate` with `upsert: true` (creates if not exists)

### `giveStaticImages(req, res)`
Returns the single `StaticImages` document. This is a **public route** (not behind admin middleware) — used by the frontend homepage.

### `getOrCreateStaticImages()` *(Helper)*
Internal function — finds or creates the singleton `StaticImages` document.

### `updateStaticImages(updateData)` *(Helper)*
Internal function — updates the `StaticImages` document with provided data.

---

## Middleware

### `checkForAdminAuthentication(req, res, next)`

```js
async function checkForAdminAuthentication(req, res, next) {
    const user = await giveUserFromDb(req.cookies.authToken);
    if (!user.role.includes("admin")) {
        return res.status(403).send("Not authorized");
    }
    return next();
}
```

Applied to all `/api/admin` routes in `index.js`:
```js
app.use('/api/admin', checkForAdminAuthentication, adminRouter);
```

---

## Data Model

### `StaticImages` Schema

Stores all homepage images as a **singleton document**. Only one document exists.

| Field               | Type                | Default Value                     | Description                      |
| ------------------- | ------------------- | --------------------------------- | -------------------------------- |
| `heroSection.left`  | String              | Unsplash URL                      | Left hero image                  |
| `heroSection.right` | String              | Unsplash URL                      | Right hero image                 |
| `brands`            | [String]            | Array of brand logo URLs          | Brand carousel images            |
| `deals`             | [String]            | Array of deal banner URLs         | Deals section images             |
| `instagram`         | [String]            | Array of Instagram-style URLs     | Instagram feed images            |

---

## Role System

Users can have **multiple roles** simultaneously:

| Role        | Capabilities                                         |
| ----------- | ---------------------------------------------------- |
| `customer`  | Default. Shop, cart, wishlist, orders, profile        |
| `dealer`    | All customer features + product management           |
| `admin`     | All features + user management + static image control |

Roles are stored as an array in the `User.role` field:
```js
role: {
    type: [String],
    enum: ["customer", "dealer", "admin"],
    default: ["customer"]
}
```
