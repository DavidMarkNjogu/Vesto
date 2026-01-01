# 👟 Vesto Shoes - Complete E-Commerce MVP

A fully functional, offline-capable shoe e-commerce platform built with MERN stack, inspired by Nike and Kicks Kenya.

## 🚀 Features

### ✅ Complete Offline Functionality
- **PWA Support** - Installable app, works offline
- **Service Worker** - Caches all assets and pages
- **IndexedDB Storage** - Products, cart, orders, wishlist persist offline
- **Background Sync** - Orders sync when connection restored
- **Offline Indicators** - Visual feedback for connection status

### 🛍️ E-Commerce Features
- **Product Browsing** - Search, filter, sort products
- **Product Details** - Multiple image angles, size/color selection, sizing guide
- **Shopping Cart** - Persistent cart with Zustand
- **Guest Checkout** - No login required, phone + location
- **Wishlist** - Save products for later
- **Location-Based Shipping** - Dynamic shipping fees by location
- **M-PESA Ready** - Payment integration ready

### 🎨 Design Features
- **Nike-Inspired Product Pages** - Multiple image angles, size selection with stock status
- **Kicks Kenya Checkout** - Clean, optional fields, location selection
- **Mobile-First Design** - Fully responsive, beautiful on all devices
- **Hero Section** - Eye-catching landing page
- **Featured Products** - Highlighted bestsellers

### 📊 Admin Dashboard
- **Product Management** - Add, edit, delete products
- **Image Upload** - Automatic optimization and background removal
- **Multiple Image Angles** - Front, side, back, top, bottom views
- **Order Management** - View and track all orders
- **Analytics** - Sales stats, revenue tracking
- **Stock Management** - Track inventory levels

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS + DaisyUI** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Service Workers** - Offline support
- **IndexedDB** - Offline storage

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB + Mongoose** - Database
- **CORS** - Cross-origin support
- **Dotenv** - Environment variables

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- MongoDB (optional - works with mock data)

### Setup

1. **Clone and navigate:**
```bash
cd vesto-shoes
```

2. **Install server dependencies:**
```bash
cd server
pnpm install
```

3. **Install client dependencies:**
```bash
cd ../client
pnpm install
```

4. **Start MongoDB** (optional):
```bash
# If you have MongoDB installed
mongod
```

5. **Start the server:**
```bash
cd server
pnpm dev
```

6. **Start the client** (in another terminal):
```bash
cd client
pnpm dev
```

7. **Access the app:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Dashboard: http://localhost:3000/dashboard

## 📱 Offline Functionality

The app works completely offline after the first visit:

1. **First Visit (Online)**
   - Service worker installs
   - Products cached to IndexedDB
   - Assets cached for offline use

2. **Subsequent Visits (Offline)**
   - App loads from cache
   - Products from IndexedDB
   - Full functionality maintained

3. **Order Placement (Offline)**
   - Orders saved to IndexedDB
   - Queued for background sync
   - Automatically submitted when online

## 🎯 Key Features Explained

### Product Detail Page
- **Multiple Images**: Upload 1-5 images (front, side, back, top, bottom)
- **Size Selection**: Shows stock status (Available/Low Stock/Out of Stock)
- **Color Variants**: Switch colors, images update automatically
- **Sizing Guide**: Modal with EU/UK/US size conversions
- **Wishlist**: Heart icon to save products

### Checkout Process
- **Guest Checkout**: Phone number + location only
- **Location Selection**: 10+ Kenyan locations with dynamic shipping
- **Offline Support**: Orders queued and synced when online
- **M-PESA Ready**: Payment integration prepared

### Admin Dashboard
- **Image Upload**: Automatic optimization (resize, compress)
- **Background Removal**: Automatic processing (placeholder for API)
- **Multiple Angles**: Upload different views of each shoe
- **Product Management**: Full CRUD operations
- **Order Tracking**: View all orders with details

## 🔧 Configuration

### Environment Variables

Create `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/covershoes
```

### Service Worker

The service worker is automatically registered in `client/index.html`. It caches:
- All HTML/CSS/JS assets
- Product images
- API responses

## 📂 Project Structure

```
vesto-shoes/
├── server/
│   ├── server.js          # Express API
│   ├── package.json
│   └── .env
├── client/
│   ├── public/
│   │   ├── sw.js          # Service Worker
│   │   └── manifest.json  # PWA Manifest
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── utils/         # Utilities (offline, image optimization)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build: `cd client && pnpm build`
2. Deploy `dist` folder

### Backend (Railway/Heroku)
1. Set environment variables
2. Deploy server folder
3. Update API URLs in client

## 🎨 Customization

### Colors
Edit `client/tailwind.config.js`:
```js
colors: {
  primary: '#358c9c',    // Teal
  secondary: '#f68716',  // Orange
  bg: '#f5f5f5'          // Background
}
```

### Shipping Locations
Edit `server/server.js`:
```js
const SHIPPING_COSTS = {
  'Nairobi CBD': 200,
  // Add more locations...
};
```

## 📝 TODO / Future Enhancements

- [ ] MPESA Daraja API integration
- [ ] Email notifications
- [ ] SMS notifications
- [ ] User accounts (optional)
- [ ] Product reviews
- [ ] Order tracking
- [ ] Analytics dashboard
- [ ] Image CDN integration
- [ ] Background removal API integration

## 🤝 Contributing

This is an MVP. Feel free to extend and improve!

## 📄 License

MIT License - Feel free to use for your projects.

---

**Built with ❤️ for Kenyan e-commerce**


