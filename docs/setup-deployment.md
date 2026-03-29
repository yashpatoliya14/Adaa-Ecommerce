# Setup & Deployment Guide

## Prerequisites

- **Node.js** v22+ with npm 10+
- **MongoDB** (Atlas cloud or local instance)
- **Cloudinary** account (free tier works)
- **Razorpay** account (test mode for dev)
- **Google Cloud Console** project (for OAuth)
- **Gmail** account with App Password enabled

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ombhut175/AdaaEcommerce.git
cd AdaaEcommerce
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/adaa
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET_KEY=your-session-secret

# CORS & Client
CLIENT_URL=http://localhost:5173
CLIENT_URL_FOR_CORS=http://localhost:5173

# Cloudinary
CLOUD_NAME=your-cloud-name
API_KEY=your-cloudinary-api-key
API_SECRET=your-cloudinary-api-secret

# Google OAuth
CLIENT_ID=your-google-client-id
CLIENT_SECRET=your-google-client-secret
BACKEND_URL=http://localhost:5000/api/google/callback

# Razorpay
RAZOR_API_KEY=rzp_test_xxxxx
RAZOR_API_SECRET=your-razorpay-secret

# Email
EMAIL_OF_DEVELOPER=your-gmail@gmail.com
```

Start the backend:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Create an **OAuth 2.0 Client ID** (Web Application)
5. Add authorized redirect URI: `http://localhost:5000/api/google/callback`
6. Copy the **Client ID** and **Client Secret** to `backend/.env`

---

## Gmail App Password (for OTP)

1. Enable **2-Step Verification** on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate an app password for "Mail"
4. Use this password in `services/mailServices.js` (replace the hardcoded value)

---

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. From the dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add them to `backend/.env`

---

## Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get **Test Mode** API keys from Dashboard → Settings → API Keys
3. Add `RAZOR_API_KEY` and `RAZOR_API_SECRET` to `backend/.env`

---

## Production Build

### Frontend

```bash
cd frontend
npm run build
```

Outputs to `frontend/dist/`. Serve with any static file server or deploy to Vercel/Netlify.

### Backend

No build step required. Deploy with Node.js runtime.

---

## Deployment (Render)

The project is deployed at: [https://adaaecommerce-1.onrender.com](https://adaaecommerce-1.onrender.com)

### Backend (Render Web Service)

- **Build Command:** `npm install`
- **Start Command:** `npm start` (runs `node index.js`)
- **Environment:** Node.js
- Set all environment variables from `.env` in Render dashboard
- Update `CLIENT_URL` to your frontend's deployed URL

### Frontend (Render Static Site or Vercel)

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- Set `VITE_BACKEND_URL` to your backend's deployed URL

---

## Project Scripts

### Backend (`backend/package.json`)

| Script  | Command          | Description          |
| ------- | ---------------- | -------------------- |
| `start` | `node index.js`  | Start the server     |

### Frontend (`frontend/package.json`)

| Script    | Command          | Description             |
| --------- | ---------------- | ----------------------- |
| `dev`     | `vite`           | Start dev server        |
| `build`   | `vite build`     | Production build        |
| `preview` | `vite preview`   | Preview production build|
| `lint`    | `eslint .`       | Run ESLint              |

---

## Troubleshooting

### Common Issues

| Issue                              | Solution                                          |
| ---------------------------------- | ------------------------------------------------- |
| MongoDB connection fails           | Check `MONGO_URL`, ensure IP is whitelisted in Atlas |
| Google OAuth redirect error        | Ensure callback URL matches in Google Console + `.env` |
| Images not uploading               | Verify Cloudinary credentials, check `public/temp/` exists |
| CORS errors                        | Ensure `CLIENT_URL` in backend `.env` matches frontend URL |
| OTP email not received             | Check Gmail App Password, ensure 2FA is enabled   |
| Razorpay payment fails             | Use test mode keys for development                |
| Socket.IO connection fails         | Ensure both client and server CORS origins match  |
