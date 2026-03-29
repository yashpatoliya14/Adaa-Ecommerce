# Wishlist System

## Overview

The wishlist allows authenticated customers to save products they're interested in, with specific **color** and **size** selections. Unlike the cart, the wishlist is purely for bookmarking — items aren't part of the checkout flow directly.

---

## Backend Files

| File                        | Purpose                        |
| --------------------------- | ------------------------------ |
| `controllers/wishlist.js`   | Wishlist add/get/remove logic  |
| `routes/wishlist.js`        | Wishlist route definitions     |
| `models/WishList.js`        | Wishlist item schema           |

## Frontend Files

| File                              | Purpose                        |
| --------------------------------- | ------------------------------ |
| `components/customer/Wishlist.jsx`| Wishlist page UI               |

---

## API Endpoints (`/api/wishlist`)

| Method | Endpoint              | Description                               |
| ------ | --------------------- | ----------------------------------------- |
| POST   | `/:productId`         | Add a product to the wishlist             |
| GET    | `/:id`                | Get all wishlist items for a user         |
| DELETE | `/:productId/:userId` | Remove an item from the wishlist          |

---

## Controller Functions

### `addToWishlist(req, res)`

**Input:** `{ productId, color, size }` (from body) + user from cookie

**Flow:**
1. Extracts `userId` from auth cookie
2. Validates the product exists
3. Validates the selected `color` exists in `product.colors`
4. Validates the selected `size` exists in `product.size`
5. Checks for duplicate (same user + product + color + size)
6. Creates new `Wishlist` entry
7. Returns populated item with product details

**Duplicate handling:** Returns `200` with message `"Item already in wishlist"` (not an error).

### `getWishlistItems(req, res)`

**Input:** `:id` param (user ID)

**Flow:**
1. Queries `Wishlist.find({ user: id })` with product population
2. Sorts by `-createdAt` (newest first)
3. Maps response to include only the images for the selected color:
   ```js
   images: item.product.colors.find(c => c.colorName === item.color).images
   ```

**Response structure:**
```json
[
  {
    "_id": "wishlist-item-id",
    "product": {
      "_id": "product-id",
      "name": "Cotton Shirt",
      "title": "Premium Cotton...",
      "price": 1500,
      "images": ["url1", "url2"],
      "brand": "Adaa",
      "category": "Shirts"
    },
    "color": "Blue",
    "size": "L",
    "createdAt": "2026-03-20T..."
  }
]
```

### `removeFromWishlist(req, res)`

**Input:** `:productId` (wishlist item ID) and `:userId` (user ID) from URL params

Deletes the wishlist entry using `findOneAndDelete({ _id: itemId, user: userId })`.

---

## Data Model

### `Wishlist` Schema

| Field      | Type                    | Description                    |
| ---------- | ----------------------- | ------------------------------ |
| `user`     | ObjectId (ref: User)    | Required. The wishlist owner   |
| `product`  | ObjectId (ref: Product) | Required. The saved product    |
| `color`    | String                  | Required. Selected color       |
| `size`     | String                  | Required. Selected size        |
| `createdAt`| Date                    | Default: `Date.now`            |

**Uniqueness:** There's no unique index, but the controller manually checks for duplicates before inserting.
