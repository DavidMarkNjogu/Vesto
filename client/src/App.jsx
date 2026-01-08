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

// PAGES - SHOP
import Home from './pages/shop/Home';
import ProductList from './pages/ProductList'; // Legacy: Keep until refactor
import ProductDetail from './pages/ProductDetail'; // Legacy: Keep until refactor
import Cart from './pages/shop/Cart'; // NEW
import Checkout from './pages/Checkout'; // Legacy: Keep until refactor
import Wishlist from './pages/Wishlist'; // Legacy: Keep until refactor

// PAGES - ADMIN
import Dashboard from './pages/Dashboard';

function App() {
  const { syncFromOffline, items } = useCartStore();
  const [online, setOnline] = useState(isOnline());

  const safeItems = Array.isArray(items) ? items : []; 

  useEffect(() => {
    syncFromOffline();
    const cleanup = setupOfflineListeners(
      () => setOnline(true),
      () => setOnline(false)
    );
    return cleanup;
  }, []);

  return (
    <>
      {!online && (
        <div className="bg-warning text-warning-content text-center text-sm py-1 flex justify-center items-center gap-2 fixed top-0 w-full z-[60]">
          <WifiOff size={14} /> You are currently offline. Changes will save locally.
        </div>
      )}

      <Routes>
        {/* --- PUBLIC SHOP ROUTES --- */}
        <Route element={<ShopLayout />}>
          {/* UPDATED: Points to real Home page */}
          <Route path={ROUTES.SHOP.HOME} element={<Home />} />
          
          <Route path={ROUTES.SHOP.PRODUCT_LIST} element={<ProductList />} />
          <Route path={ROUTES.SHOP.PRODUCT_DETAIL} element={<ProductDetail />} />
          
          {/* UPDATED: Points to real Cart page */}
          <Route path={ROUTES.SHOP.CART} element={<Cart />} />
          
          <Route path={ROUTES.SHOP.CHECKOUT} element={<Checkout />} />
          <Route path={ROUTES.SHOP.WISHLIST} element={<Wishlist />} />
        </Route>

        {/* --- ADMIN ROUTES --- */}
        <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Dashboard />} /> 
          <Route path="orders" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;