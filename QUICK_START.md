# 🚀 Quick Start Guide - Vesto Shoes MVP

## Start the Application

### Terminal 1 - Backend Server
```bash
cd vesto-shoes/server
pnpm dev
```
Server runs on: http://localhost:5000

### Terminal 2 - Frontend Client
```bash
cd vesto-shoes/client
pnpm dev
```
Client runs on: http://localhost:3000

## First Steps

1. **Open Browser**: http://localhost:3000
2. **Browse Products**: See 12 placeholder products
3. **Add to Cart**: Click "Add to Cart" on any product
4. **View Cart**: Click cart icon in navigation
5. **Checkout**: Fill phone + location, place order
6. **Dashboard**: Click dashboard icon → Manage products

## Test Offline Mode

1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Check "Offline" checkbox
4. Refresh page - App still works! ✨

## Features to Try

✅ **Product Detail Page**: Click any product → See multiple images, sizes, colors
✅ **Search**: Type in search bar to filter products
✅ **Filters**: Click "Filters" → Select category, sort by price/rating
✅ **Wishlist**: Click heart icon on product → View in wishlist
✅ **Dashboard**: Add new products with image upload
✅ **Offline Orders**: Place order offline → Syncs when online

## Admin Dashboard

Access: http://localhost:3000/dashboard

**Features:**
- View stats (products, orders, revenue)
- Add/Edit/Delete products
- Upload images (auto-optimized)
- Multiple image angles
- View all orders

## Troubleshooting

**Server not starting?**
- Check if MongoDB is running (optional - works without it)
- Check port 5000 is available

**Client not starting?**
- Check port 3000 is available
- Try: `pnpm install` again

**Offline not working?**
- Make sure service worker is registered
- Check browser console for errors
- Clear cache and reload

## Next Steps

1. Add real product images
2. Configure MPESA Daraja API
3. Set up MongoDB for production
4. Deploy to hosting

---

**Everything is ready to go!** 🎉


