# Authentication System

## Overview

Adaa uses a **dual authentication system**:
1. **Email + OTP** — Traditional signup/login with OTP verification via Nodemailer.
2. **Google OAuth 2.0** — One-click sign-in via Passport.js.

Both methods issue a **JWT token** stored in an `httpOnly` cookie (`authToken`) with a 7-day expiry.

---

## Backend Files

| File                                   | Purpose                                |
| -------------------------------------- | -------------------------------------- |
| `controllers/auth.js`                  | All auth handler functions             |
| `services/auth.js`                     | JWT sign/verify, cookie helpers        |
| `services/passport.js`                 | Google OAuth strategy                  |
| `services/mailServices.js`             | Nodemailer OTP email sender            |
| `routes/auth.js`                       | Email auth routes                      |
| `routes/googleRoutes.js`               | Google OAuth routes                    |
| `models/User.js`                       | Main user schema                       |
| `models/TempUserModel.js`              | Temporary user for OTP verification    |

---

## Frontend Files

| File                        | Purpose                            |
| --------------------------- | ---------------------------------- |
| `components/auth/SignIn.jsx`        | Login form (email/password)        |
| `components/auth/SignUp.jsx`        | Registration form                  |
| `components/auth/ConfirmCode.jsx`   | OTP input screen                   |
| `components/auth/ForgotPassword.jsx`| Forgot password email entry        |
| `components/auth/ResetPassword.jsx` | New password form                  |
| `components/auth/GoogleButton.jsx`  | Google sign-in button              |
| `store/features/userSlice.js`       | Redux user state & fetchUser thunk |
| `ProtectedRoute.jsx`               | Role-based route guard             |

---

## API Endpoints

### Email Authentication (`/api`)

| Method | Endpoint                     | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/signup/send-otp`           | Send OTP to email for new user signup         |
| POST   | `/signup/verify-otp`         | Verify OTP and create user account            |
| POST   | `/login`                     | Login with email & password                   |
| POST   | `/login/send-otp-forgot`     | Send OTP for forgot password flow             |
| POST   | `/login/verify-otp-forgot`   | Verify OTP and issue JWT for password reset   |
| POST   | `/login/set-new-password`    | Set a new password after OTP verification     |
| GET    | `/isLoggedIn`                | Check if the user's JWT cookie is valid       |
| DELETE | `/clearCookie`               | Logout — clears `authToken` cookie            |

### Google OAuth (`/api/google`)

| Method | Endpoint          | Description                                     |
| ------ | ----------------- | ----------------------------------------------- |
| GET    | `/`               | Redirect to Google consent screen                |
| GET    | `/callback`       | Handle Google callback, set JWT cookie, redirect |
| GET    | `/login/success`  | Return authenticated user data                   |
| GET    | `/login/failed`   | Return login failure message                     |
| GET    | `/user`           | Get current Google session user                   |
| GET    | `/logout`         | Destroy session & redirect                        |

---

## Controller Functions

### `controllers/auth.js`

#### `sendOtpToSignup(req, res)`
- **Input**: `{ name, email, password }`
- **Flow**: Checks if user exists → hashes password with bcrypt (salt=5) → creates `TempUser` (auto-expires in 10 min via MongoDB TTL index) → sends 6-digit OTP via email.
- **Response**: `{ success: true, msg: "OTP sent successfully" }`

#### `verifyOtpToSignup(req, res)`
- **Input**: `{ email, otp }`
- **Flow**: Finds `TempUser` → validates OTP and expiry → creates permanent `User` → deletes `TempUser` → signs JWT → sets cookie.
- **Response**: `{ success: true, message: "User verified successfully" }`

#### `forLogin(req, res)`
- **Input**: `{ email, password }`
- **Flow**: Finds user by email → compares password with bcrypt → signs JWT → sets cookie.
- **Response**: `{ success: true, msg: "Login Successful", token, profilePicture }`

#### `sendOtpForgotPassword(req, res)`
- **Input**: `{ email }`
- **Flow**: Finds existing user → generates OTP → saves OTP + expiry to user document → sends email.

#### `verifyOtpForgotPassword(req, res)`
- **Input**: `{ otp, email }`
- **Flow**: Validates OTP match and expiry → issues JWT → sets cookie.

#### `setNewPassword(req, res)`
- **Input**: `{ email, newPassword }`
- **Flow**: Finds user → hashes new password → saves.

#### `isUserLoggedIn(req, res)`
- **Flow**: Decodes `authToken` cookie → finds user in DB → returns 200 if valid.

---

## Service Functions

### `services/auth.js`

| Function                | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `setUser(user)`         | Signs a JWT with `{ id, email, role }`, 30-day expiry |
| `getUser(token)`        | Verifies and decodes JWT, returns payload            |
| `giveUserIdFromCookies(token)` | Extracts `user.id` from JWT token             |
| `setUserCookies(res, token)` | Sets `authToken` cookie (httpOnly, secure, SameSite=None, 7d) |
| `removeUserCookies(res, name)` | Clears a named cookie                         |

### `services/passport.js`

Configures **Google OAuth 2.0** strategy:
- On callback, checks if user exists by email → creates new user if not → returns user.
- Serializes/deserializes full user object for session.

### `services/mailServices.js`

| Function           | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `sendOtpViaEmail(email, otp)` | Sends OTP via Gmail SMTP using Nodemailer        |

---

## Data Models

### `User` Schema

| Field            | Type        | Description                                      |
| ---------------- | ----------- | ------------------------------------------------ |
| `name`           | String      | Required. User's display name                    |
| `email`          | String      | Required, unique. Login identifier               |
| `password`       | String      | Bcrypt-hashed password (null for Google users)   |
| `profilePicture` | String      | Cloudinary URL (default avatar provided)         |
| `otp`            | String      | Temporary OTP for forgot-password                |
| `otpExpiresAt`   | Date        | OTP expiration timestamp                         |
| `role`           | [String]    | Enum: `customer`, `dealer`, `admin`              |
| `status`         | String      | Default: `active`                                |
| `googleId`       | String      | Google OAuth profile ID                          |
| `verified`       | Boolean     | Whether email is OTP-verified                    |
| `devices`        | [String]    | Registered device identifiers                    |

### `TempUser` Schema

| Field          | Type   | Description                              |
| -------------- | ------ | ---------------------------------------- |
| `name`         | String | Required                                 |
| `email`        | String | Required, unique                         |
| `password`     | String | Bcrypt-hashed                            |
| `otp`          | String | 6-digit OTP                              |
| `otpExpiresAt` | Date   | TTL index — auto-deletes after 10 min    |

---

## Frontend: Route Protection

### `ProtectedRoute.jsx`

A wrapper component that checks the Redux `user.role` array against `allowedRoles`:

```jsx
const hasAccess = user.role.some(role => allowedRoles.includes(role.toLowerCase()));
return hasAccess ? children : <Navigate to="/unauthorized" replace />;
```

**Usage:**
```jsx
<Route path="/admin" element={
    <ProtectedRoute allowedRoles={["admin"]}>
        <AdminPanel />
    </ProtectedRoute>
} />
```

---

## Security Notes

- Passwords are hashed with **bcrypt** (salt rounds = 5).
- JWT tokens are stored in **httpOnly, Secure, SameSite=None** cookies — not accessible via JavaScript.
- OTPs automatically expire in 10 minutes (enforced at both DB and application level).
- Google OAuth tokens are handled server-side only — the client never sees them.
