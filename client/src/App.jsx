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

// PAGES - SHOP (NOW POINTING TO NEW STRUCTURE)
import Home from './pages/shop/Home';
import ProductList from './pages/shop/ProductList'; // The new one
import ProductDetail from './pages/shop/ProductDetail'; // The new one
import Cart from './pages/shop/Cart';
import Checkout from './pages/Checkout'; // Still legacy for now
import Wishlist from './pages/Wishlist'; // Still legacy for now

// PAGES - ADMIN
import Dashboard from './pages/Dashboard';

function App() {
  const { syncFromOffline, items } = useCartStore();
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    syncFromOffline();
    return setupOfflineListeners(
      () => setOnline(true),
      () => setOnline(false)
    );
  }, []);

  return (
    <>
      {!online && (
        <div className="bg-warning text-warning-content text-center text-sm py-1 flex justify-center items-center gap-2 fixed top-0 w-full z-[60]">
          <WifiOff size={14} /> You are currently offline. Changes will save locally.
        </div>
      )}

      <Routes>
        {/* --- SHOP ROUTES --- */}
        <Route element={<ShopLayout />}>
          <Route path={ROUTES.SHOP.HOME} element={<Home />} />
          <Route path={ROUTES.SHOP.PRODUCT_LIST} element={<ProductList />} />
          <Route path={ROUTES.SHOP.PRODUCT_DETAIL} element={<ProductDetail />} />
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