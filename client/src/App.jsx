import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import useCartStore from './store/cartStore';
import { ShoppingCart, LayoutDashboard, WifiOff, Heart } from 'lucide-react';
import { setupOfflineListeners, isOnline } from './utils/offlineSync';

function App() {
  const { items, syncFromOffline } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    // Sync cart from offline DB on mount
    syncFromOffline();
    
    // Setup offline listeners
    setupOfflineListeners(
      () => setOnline(true),
      () => setOnline(false)
    );
  }, [syncFromOffline]);

  return (
    <Router>
      <div className="min-h-screen bg-bg">
        <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold hover:text-secondary transition-colors">
                👟 Vesto Shoes
              </Link>
              <div className="flex gap-2 items-center">
                {!online && (
                  <div className="badge badge-warning gap-2 mr-2">
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </div>
                )}
                <Link
                  to="/wishlist"
                  className="btn btn-ghost btn-sm hover:bg-white/20"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="btn btn-ghost btn-sm hover:bg-white/20"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <Link
                  to="/checkout"
                  className="btn btn-secondary btn-sm hover:scale-105 transition-transform relative"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart
                  {cartCount > 0 && (
                    <span className="badge badge-primary badge-sm absolute -top-2 -right-2">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-primary text-white mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">👟 Vesto Shoes</h3>
                <p className="text-gray-300">Premium quality footwear for every occasion. Made in Kenya, for Kenya.</p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="/checkout" className="hover:text-white transition-colors">Checkout</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <p className="text-gray-300">📞 +254 700 000 000</p>
                <p className="text-gray-300">📧 info@vestoshoes.co.ke</p>
                <p className="text-gray-300">📍 Nairobi, Kenya</p>
              </div>
            </div>
            <div className="border-t border-white/20 mt-8 pt-4 text-center text-gray-300">
              <p>&copy; 2024 Vesto Shoes. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

