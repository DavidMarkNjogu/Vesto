# 🚀 Deployment Guide - Covera Shoes

## Quick Deploy Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend:**
```bash
cd client
pnpm build
# Deploy dist folder to Vercel
```

**Backend:**
```bash
cd server
# Deploy to Railway
# Set environment variables:
# - MONGO_URI
# - PORT
```

### Option 2: Netlify (Frontend) + Render (Backend)

**Frontend:**
- Connect GitHub repo
- Build command: `cd client && pnpm build`
- Publish directory: `client/dist`

**Backend:**
- Connect GitHub repo
- Build command: `cd server && pnpm install`
- Start command: `cd server && pnpm start`

### Option 3: Full Stack on Railway

1. Deploy server folder
2. Deploy client folder as static site
3. Update API URLs in client code

## Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/covershoes
NODE_ENV=production
```

### Client (Update API URLs)
Update `http://localhost:5000` to your backend URL in:
- `client/src/pages/ProductList.jsx`
- `client/src/pages/ProductDetail.jsx`
- `client/src/pages/Checkout.jsx`
- `client/src/pages/Dashboard.jsx`
- `client/src/utils/offlineSync.js`

## MongoDB Setup

1. Create account at MongoDB Atlas
2. Create cluster
3. Get connection string
4. Add to server/.env

## Post-Deployment Checklist

- [ ] Update API URLs in client
- [ ] Set environment variables
- [ ] Test offline functionality
- [ ] Test checkout flow
- [ ] Verify service worker
- [ ] Add real product images
- [ ] Configure MPESA API
- [ ] Set up domain name
- [ ] Enable HTTPS
- [ ] Test on mobile devices

---

**Your app is ready to go live!** 🎉


