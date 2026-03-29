# Frontend Architecture

## Overview

The Adaa frontend is a **React 18** single-page application built with **Vite 5**, using **Tailwind CSS** for styling and **Framer Motion** for animations. State is managed globally with **Redux Toolkit**, and routing is handled by **React Router v6**.

---

## Entry Points

| File                  | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `index.html`          | HTML shell with `<div id="root">`            |
| `src/main.jsx`        | React DOM render, Provider & Router wrapping |
| `src/App.jsx`         | Root component with routes & layout          |
| `src/index.css`       | Tailwind directives + custom CSS utilities   |

---

## Redux Store

### Store Configuration (`store/store.js`)

```js
configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    staticImages: staticImageReducer,
    chat: chatReducer,
  },
})
```

### Slices

#### `themeSlice.js` — Dark Mode

| Export          | Type     | Description                                |
| --------------- | -------- | ------------------------------------------ |
| `toggleDarkMode`| Action  | Toggles dark mode & persists to localStorage |
| `setDarkMode`   | Action  | Sets dark mode to specific value            |
| `selectDarkMode`| Selector| Returns `state.theme.darkMode`              |

**Persistence:** Dark mode preference is saved to `localStorage.darkMode` and restored on load.

#### `userSlice.js` — User State

| Export             | Type         | Description                               |
| ------------------ | ------------ | ----------------------------------------- |
| `fetchUser`        | AsyncThunk   | GET `/api/user/userInfo` → populate state  |
| `addUser`          | Action       | Merge payload into user state              |
| `logInUser`        | Action       | Set `isLoggedIn = true`                    |
| `logOutUser`       | Action       | Clear all user state                       |
| `setProfilePicture`| Action       | Update profile picture URL                 |
| `changeName`       | Action       | Update name                                |
| `editUser`         | Action       | Update name + profile picture              |
| `changeRole`       | Action       | Add a role to role array                   |

**Initial state:**
```js
{ id: '', email: '', name: '', profilePicture: '', userType: 'normal', isLoggedIn: false, role: [], cart: [] }
```

#### `staticImagesSlice.js` — Homepage Images

| Export              | Type       | Description                                |
| ------------------- | ---------- | ------------------------------------------ |
| `fetchStaticImages` | AsyncThunk | GET `/api/getStaticImages` → merge state   |

Manages default URLs for hero section, brands, deals, and Instagram feed images. Falls back to defaults if the API call fails.

#### `chatSlice.js` — Chatbot State

| Export         | Type    | Description                              |
| -------------- | ------- | ---------------------------------------- |
| `toggleChat`   | Action  | Toggle chatbot open/close                |
| `addMessage`   | Action  | Push a message to conversation array     |
| `setTyping`    | Action  | Set typing indicator state               |
| `setLoading`   | Action  | Set loading state                        |
| `setError`     | Action  | Set error state                          |

---

## Routing Structure (`App.jsx`)

### Public Routes

| Path                  | Component        | Description              |
| --------------------- | ---------------- | ------------------------ |
| `/`                   | `HomePage`       | Hero, brands, deals, etc.|
| `/shop`               | `Shop`           | Product listing          |
| `/product/:id`        | `ProductDetail`  | Single product view      |
| `/deals`              | `Deals`          | Deals page               |
| `/new-arrivals`       | `NewArrivalsPage`| New arrivals             |
| `/search`             | `SearchResults`  | Search results           |
| `/signIn`             | `SignIn`          | Login page               |
| `/signUp`             | `SignUp`          | Registration page        |
| `/forgot-password`    | `ForgotPassword` | Forgot password          |
| `/reset-password`     | `ResetPassword`  | Reset password           |
| `/confirm-code`       | `ConfirmCode`    | OTP verification         |

### Authenticated Routes

| Path               | Component     | Description              |
| ------------------ | ------------- | ------------------------ |
| `/cart`             | `Cart`        | Shopping cart             |
| `/checkout/:userId` | `Checkout`   | Checkout flow            |
| `/orders`           | `OrdersPage` | Order history            |
| `/profile`          | `UserProfile` | View profile             |
| `/profile/edit`     | `EditProfile` | Edit profile             |
| `/wishlist`         | `Wishlist`    | Saved items              |

### Protected Routes (Role-Based)

| Path                           | Role     | Component                   |
| ------------------------------ | -------- | --------------------------- |
| `/admin`                       | admin    | `AdminPanel`                |
| `/admin/user/:id/edit`         | admin    | `UserDetails`               |
| `/admin/give-roles`            | admin    | `AdminPermissionsPage`      |
| `/dealer/products`             | dealer   | `DealerProducts`            |
| `/dealer/products/:id`         | dealer   | `DealerProductDetail`       |
| `/dealer/products/new`         | dealer   | `DealerProductForm`         |
| `/dealer/products/:id/edit`    | dealer   | `DealerProductEditingPage`  |

---

## Global Layout

```
┌──────────────────────────────────────────────┐
│  Navbar (fixed, glassmorphism, z-50)         │
├──────────────────────────────────────────────┤
│                                              │
│  <Routes> content area                       │
│                                              │
├──────────────────────────────────────────────┤
│  Footer                                      │
└──────────────────────────────────────────────┘
│  ChatBot (fixed overlay)                     │
│  ChatToggle (FAB)                            │
│  Cart FAB (fixed bottom-right)               │
│  Scroll-to-Top button (conditional)          │
```

---

## Design System Components

### `components/design/`

| Component           | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `Navbar.jsx`        | Top navigation with glassmorphism, lucide icons, gradient accents |
| `Hero.jsx`          | Hero section with dynamic images from StaticImages |
| `Brands.jsx`        | Brand logo carousel                           |
| `DealsSection.jsx`  | Deals cards with discounts                    |
| `NewArrivals.jsx`   | New arrivals product grid                     |
| `InstagramFeed.jsx` | Instagram-style image grid                    |
| `Testimonials.jsx`  | Customer testimonial cards                    |
| `Newsletter.jsx`    | Email newsletter signup                       |
| `Footer.jsx`        | Site footer with links                        |
| `SearchBar.jsx`     | Global search with autocomplete suggestions   |

---

## Custom CSS Utilities (`index.css`)

| Class             | Effect                                        |
| ----------------- | --------------------------------------------- |
| `hover-transition` | Scale 1.05 on hover with smooth transition   |
| `button-hover`    | Scale + shadow + brightness on hover/active   |
| `card-hover`      | Lift + shadow on hover                        |
| `input-focus`     | Slight scale + shadow on focus                |
| `image-hover`     | Scale 1.1 on hover (500ms ease)               |
| `text-hover`      | Color change to indigo on hover               |
| `loading-shimmer` | Shimmer loading animation                     |
| `animate-float`   | Continuous floating animation                 |
| `animate-pulse-soft` | Subtle pulse animation                     |
| `success-animation` | Bounce-in checkmark animation               |
| `error-animation` | Shake animation                               |
| `scroll-reveal`   | Fade-up reveal on scroll                      |

**Global:** All elements have `transition-all duration-300 ease-in-out` applied.

---

## Key Dependencies

| Package                    | Purpose                              |
| -------------------------- | ------------------------------------ |
| `framer-motion`            | Page transitions, hover animations   |
| `lucide-react`             | Navbar icons                         |
| `react-icons`              | Icons throughout the app             |
| `react-toastify`           | Toast notifications                  |
| `react-loading-skeleton`   | Loading placeholder skeletons        |
| `sweetalert2`              | Confirmation dialogs                 |
| `react-swipeable`          | Touch swipe gestures                 |
| `react-share`              | Social sharing buttons               |
| `socket.io-client`         | Real-time product updates            |
| `react-ga4`                | Google Analytics integration         |
| `@react-three/fiber` + `drei` | 3D Globe visualization           |
| `react-virtualized`        | Virtualized lists for performance    |
| `axios`                    | HTTP client for API calls            |
