import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WifiOff } from 'lucide-react';

// LOGIC & STATE
import useCartStore from './store/cartStore';
import { setupOfflineListeners, isOnline } from './utils/offlineSync';
import { ROUTES } from './routes';

// AUTH (New Integration)
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';

// LAYOUTS
import ShopLayout from './layouts/ShopLayout';
import AdminLayout from './layouts/AdminLayout';
import SupplierLayout from './layouts/SupplierLayout';

// PAGES - SHOP
import Home from './pages/shop/Home';
import ProductList from './pages/shop/ProductList';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import Wishlist from './pages/Wishlist';
import OrderSuccess from './pages/shop/OrderSuccess';
import OrderTracking from './pages/shop/OrderTracking';

// PAGES - ADMIN
import Dashboard from './pages/Dashboard';

// PAGES - SUPPLIER
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import MyShipments from './pages/supplier/MyShipments';

function App() {
  const { syncFromOffline } = useCartStore();
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
        {/* --- PUBLIC AUTH --- */}
        <Route path="/login" element={<Login />} />

        {/* --- PUBLIC SHOP --- */}
        <Route element={<ShopLayout />}>
          <Route path={ROUTES.SHOP.HOME} element={<Home />} />
          <Route path={ROUTES.SHOP.PRODUCT_LIST} element={<ProductList />} />
          <Route path={ROUTES.SHOP.PRODUCT_DETAIL} element={<ProductDetail />} />
          <Route path={ROUTES.SHOP.CART} element={<Cart />} />
          <Route path={ROUTES.SHOP.CHECKOUT} element={<Checkout />} />
          <Route path={ROUTES.SHOP.SUCCESS} element={<OrderSuccess />} />
          <Route path={ROUTES.SHOP.WISHLIST} element={<Wishlist />} />
          <Route path={ROUTES.SHOP.TRACKING} element={<OrderTracking />} />
        </Route>

        {/* --- PROTECTED ADMIN ROUTES --- */}
        {/* This wrapper forces the Login Redirect if not authenticated */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Dashboard />} /> 
            <Route path="orders" element={<Dashboard />} />
          </Route>
        </Route>

        {/* --- PROTECTED SUPPLIER ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={['supplier']} />}>
          <Route path={ROUTES.SUPPLIER.DASHBOARD} element={<SupplierLayout />}>
            <Route index element={<SupplierDashboard />} />
            <Route path="shipments" element={<MyShipments />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
// import { useEffect, useState } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { WifiOff } from 'lucide-react';

// // LOGIC & STATE
// import useCartStore from './store/cartStore';
// import { setupOfflineListeners, isOnline } from './utils/offlineSync';
// import { ROUTES } from './routes';

// // LAYOUTS
// import ShopLayout from './layouts/ShopLayout';
// import AdminLayout from './layouts/AdminLayout';

// // PAGES - SHOP
// import Home from './pages/shop/Home';
// import ProductList from './pages/shop/ProductList';
// import ProductDetail from './pages/shop/ProductDetail';
// import Cart from './pages/shop/Cart';
// import Checkout from './pages/shop/Checkout'; // NEW: Points to the new shop domain file
// import Wishlist from './pages/Wishlist'; // Legacy: Can stay for now
// import OrderSuccess from './pages/shop/OrderSuccess'; // NEW: The success page we built

// // PAGES - ADMIN
// import Dashboard from './pages/Dashboard';

// function App() {
//   const { syncFromOffline, items } = useCartStore();
//   const [online, setOnline] = useState(isOnline());

//   useEffect(() => {
//     syncFromOffline();
//     return setupOfflineListeners(
//       () => setOnline(true),
//       () => setOnline(false)
//     );
//   }, []);

//   return (
//     <>
//       {!online && (
//         <div className="bg-warning text-warning-content text-center text-sm py-1 flex justify-center items-center gap-2 fixed top-0 w-full z-[60]">
//           <WifiOff size={14} /> You are currently offline. Changes will save locally.
//         </div>
//       )}

//       <Routes>
//         {/* --- SHOP ROUTES --- */}
//         <Route element={<ShopLayout />}>
//           <Route path={ROUTES.SHOP.HOME} element={<Home />} />
//           <Route path={ROUTES.SHOP.PRODUCT_LIST} element={<ProductList />} />
//           <Route path={ROUTES.SHOP.PRODUCT_DETAIL} element={<ProductDetail />} />
//           <Route path={ROUTES.SHOP.CART} element={<Cart />} />
//           <Route path={ROUTES.SHOP.CHECKOUT} element={<Checkout />} />
//           <Route path={ROUTES.SHOP.SUCCESS} element={<OrderSuccess />} /> {/* New Success Route */}
//           <Route path={ROUTES.SHOP.WISHLIST} element={<Wishlist />} />
//         </Route>

//         {/* --- ADMIN ROUTES --- */}
//         <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminLayout />}>
//           <Route index element={<Dashboard />} />
//           <Route path="inventory" element={<Dashboard />} /> 
//           <Route path="orders" element={<Dashboard />} />
//         </Route>

//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </>
//   );
// }

// export default App;