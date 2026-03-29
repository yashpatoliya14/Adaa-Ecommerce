# API Reference — Complete Endpoint List

## Base URL

```
Backend: http://localhost:{PORT}/api
```

---

## Authentication

| Method | Endpoint                          | Auth  | Description                        |
| ------ | --------------------------------- | ----- | ---------------------------------- |
| POST   | `/signup/send-otp`                | No    | Send OTP for signup                |
| POST   | `/signup/verify-otp`              | No    | Verify OTP & create account        |
| POST   | `/login`                          | No    | Login with email/password          |
| POST   | `/login/send-otp-forgot`          | No    | Send OTP for password reset        |
| POST   | `/login/verify-otp-forgot`        | No    | Verify forgot-password OTP         |
| POST   | `/login/set-new-password`         | No    | Set new password                   |
| GET    | `/isLoggedIn`                     | Cookie| Check if user is authenticated     |
| DELETE | `/clearCookie`                    | No    | Logout (clear authToken)           |

## Google OAuth

| Method | Endpoint                | Auth  | Description                              |
| ------ | ----------------------- | ----- | ---------------------------------------- |
| GET    | `/google/`              | No    | Redirect to Google consent screen        |
| GET    | `/google/callback`      | No    | Google OAuth callback → set cookie       |
| GET    | `/google/login/success` | Session | Get authenticated user data            |
| GET    | `/google/login/failed`  | No    | Login failure response                   |
| GET    | `/google/user`          | Session | Get current Google user                |
| GET    | `/google/logout`        | Session | Logout from Google                     |

## Products

| Method | Endpoint                          | Auth   | Description                           |
| ------ | --------------------------------- | ------ | ------------------------------------- |
| GET    | `/products/`                      | No     | Get all products                      |
| GET    | `/products/:id`                   | No     | Get product by ID                     |
| GET    | `/products/search/:searchText`    | No     | Search products (name, title, desc)   |
| GET    | `/products/suggestions?q=`        | No     | Autocomplete suggestions              |
| GET    | `/products/dealsOfMonth`          | No     | Top 10 discounted products            |
| GET    | `/products/newArrivals`           | No     | Latest 10 products                    |
| POST   | `/products/filter`                | No     | Filter by category/price/size/etc.    |
| POST   | `/products/add`                   | No     | Add product (with file uploads)       |

## Cart

| Method | Endpoint                              | Auth   | Description                        |
| ------ | ------------------------------------- | ------ | ---------------------------------- |
| GET    | `/cart/`                              | Cookie | Get user's cart                    |
| POST   | `/cart/addProduct/:productId`         | Cookie | Add product to cart                |
| PUT    | `/cart/changeProductQuantity/:productId` | Cookie | Update quantity/color/size     |
| DELETE | `/cart/:productId`                    | Cookie | Remove product from cart           |

## Wishlist

| Method | Endpoint                        | Auth   | Description                       |
| ------ | ------------------------------- | ------ | --------------------------------- |
| POST   | `/wishlist/:productId`          | Cookie | Add to wishlist                   |
| GET    | `/wishlist/:id`                 | No     | Get user's wishlist items         |
| DELETE | `/wishlist/:productId/:userId`  | No     | Remove from wishlist              |

## Orders

| Method | Endpoint                          | Auth   | Description                        |
| ------ | --------------------------------- | ------ | ---------------------------------- |
| GET    | `/orders/`                        | Cookie | Get user's orders                  |
| GET    | `/orders/:id`                     | Cookie | Get order by ID                    |
| GET    | `/orders/ordersByStatus`          | Cookie | Filter orders by status            |
| POST   | `/orders/`                        | Cookie | Create single order                |
| POST   | `/orders/addAllProductsOfCart`    | Cookie | Convert cart to orders             |
| PUT    | `/orders/updateOrder`             | Cookie | Update order                       |
| POST   | `/orders/cancel/:id`              | Cookie | Cancel order                       |
| POST   | `/orders/:id`                     | Cookie | Mark as delivered                  |
| POST   | `/orders/return`                  | Cookie | Request return                     |
| POST   | `/orders/exchange`                | Cookie | Request exchange                   |

## User Profile

| Method | Endpoint                            | Auth   | Description                       |
| ------ | ----------------------------------- | ------ | --------------------------------- |
| GET    | `/user/userInfo`                    | Cookie | Get current user's info           |
| POST   | `/user/uploadProfilePicture`        | Cookie | Upload profile picture            |
| PUT    | `/user/editProfile`                 | Cookie | Edit name/picture                 |
| DELETE | `/user/setProfilePictureToDefault`  | Cookie | Reset to default avatar           |

## Address

| Method | Endpoint            | Auth   | Description                          |
| ------ | ------------------- | ------ | ------------------------------------ |
| GET    | `/address/:id`      | No     | Get user's address                   |
| GET    | `/address`          | No     | Get all addresses                    |
| POST   | `/address`          | Cookie | Create/update address                |

## Payments

| Method | Endpoint               | Auth   | Description                         |
| ------ | ---------------------- | ------ | ----------------------------------- |
| POST   | `/payment`             | Cookie | Create Razorpay order               |
| POST   | `/paymentVerification` | No     | Verify Razorpay signature           |

## Admin (Requires `admin` role)

| Method | Endpoint                    | Auth    | Description                        |
| ------ | --------------------------- | ------- | ---------------------------------- |
| GET    | `/admin/`                   | Admin   | Get all users                      |
| GET    | `/admin/:userId`            | Admin   | Get user details + orders          |
| DELETE | `/admin/:userId`            | Admin   | Delete user                        |
| PUT    | `/admin/givePermissions`    | Admin   | Assign role to user                |
| PUT    | `/admin/removePermission`   | Admin   | Remove role from user              |
| PUT    | `/admin/uploadImages`       | Admin   | Upload static homepage image       |
| GET    | `/admin/getStaticImages`    | Admin   | Get static images                  |

## Dealer (Requires `dealer` role)

| Method | Endpoint                    | Auth    | Description                        |
| ------ | --------------------------- | ------- | ---------------------------------- |
| GET    | `/dealer/getAllProducts`     | Dealer  | Get dealer's own products          |
| POST   | `/dealer/add`               | Dealer  | Add product (with images)          |
| PUT    | `/dealer/updateProduct`     | Dealer  | Update product (with images)       |
| DELETE | `/dealer/deleteProduct/:id` | Dealer  | Delete product + Cloudinary images |

## Static Assets

| Method | Endpoint                | Auth  | Description                          |
| ------ | ----------------------- | ----- | ------------------------------------ |
| GET    | `/getStaticImages`      | No    | Get homepage static images (public)  |
| GET    | `/static/*`             | No    | Serve files from `public/staticPictures` |
