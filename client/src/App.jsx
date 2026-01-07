import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WifiOff } from 'lucide-react';

// LOGIC & STATE
import useCartStore from './store/cartStore';
import { setupOfflineListeners, isOnline } from './utils/offlineSync';
import { ROUTES } from './routes';

// LAYOUTS
import ShopLayout from './layouts/ShopLayout';
import AdminLayout from './layouts/AdminLayout';

// PAGES - SHOP (Importing the new structure)
// Note: Ensure these files export a default component (even if empty)
import Home from './pages/shop/Home';
import ProductList from './pages/ProductList'; // Using your existing working file
import ProductDetail from './pages/ProductDetail'; // Using your existing working file
import Cart from './pages/shop/Cart';
import Checkout from './pages/Checkout'; // Using your existing working file
import Wishlist from './pages/Wishlist'; // Using your existing working file

// PAGES - ADMIN
import Dashboard from './pages/Dashboard'; // Your massive logic file

function App() {
  const { syncFromOffline, items } = useCartStore();
  const [online, setOnline] = useState(isOnline());

  // OG SAFETY LAYER: 
  // Ensures we never crash even if local storage is messy
  const safeItems = Array.isArray(items) ? items : []; 
  const cartCount = safeItems.reduce((sum, item) => sum + (item?.quantity || 1), 0);

  useEffect(() => {
    // 1. Sync Data on Load
    syncFromOffline();
    
    // 2. Setup Network Listeners
    const cleanup = setupOfflineListeners(
      () => setOnline(true),
      () => setOnline(false)
    );
    
    return cleanup;
  }, []);

  return (
    <>
      {/* Offline Banner Indicator */}
      {!online && (
        <div className="bg-warning text-warning-content text-center text-sm py-1 flex justify-center items-center gap-2 fixed top-0 w-full z-[60]">
          <WifiOff size={14} /> You are currently offline. Changes will save locally.
        </div>
      )}

      <Routes>
        {/* --- PUBLIC SHOP ROUTES --- */}
        <Route element={<ShopLayout />}>
          <Route path={ROUTES.SHOP.HOME} element={<ProductList />} /> {/* Using ProductList as Home for MVP */}
          <Route path={ROUTES.SHOP.PRODUCT_LIST} element={<ProductList />} />
          <Route path={ROUTES.SHOP.PRODUCT_DETAIL} element={<ProductDetail />} />
          <Route path={ROUTES.SHOP.CHECKOUT} element={<Checkout />} />
          <Route path={ROUTES.SHOP.WISHLIST} element={<Wishlist />} />
          {/* Fallback for now until Cart page is built */}
          <Route path={ROUTES.SHOP.CART} element={<Navigate to="/checkout" replace />} />
        </Route>

        {/* --- ADMIN ROUTES --- */}
        <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          {/* Future sub-routes will go here */}
          <Route path="inventory" element={<Dashboard />} /> 
          <Route path="orders" element={<Dashboard />} />
        </Route>

        {/* --- AUTH & FALLBACKS --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;