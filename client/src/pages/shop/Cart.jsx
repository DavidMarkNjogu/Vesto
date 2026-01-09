import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Minus, Plus, AlertTriangle } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCartStore();
  
  // --- DEFENSIVE CODING ---
  // 1. Ensure items is an array
  const rawItems = Array.isArray(items) ? items : [];
  
  // 2. Filter out "ghost" items (null/undefined/missing IDs)
  const safeItems = rawItems.filter(item => item && (item.id || item.sku));

  // 3. Calculate Subtotal safely (handle NaN/undefined prices)
  const subtotal = safeItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + (price * qty);
  }, 0);

  // If filtered items differ from raw items, we might want to clean up (Optional logic)
  
  if (safeItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-gray-300 shadow-sm">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any kicks yet.</p>
        <Link to="/products" className="btn btn-primary px-8 text-white shadow-lg hover:-translate-y-1 transition-transform">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart ({safeItems.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {safeItems.map((item) => {
              // Safe accessors
              const id = item.sku || item.id;
              const title = item.title || 'Unknown Product';
              const image = item.image || 'https://via.placeholder.com/150';
              const price = Number(item.price) || 0;
              const qty = Number(item.quantity) || 1;
              const size = item.selectedSize || 'N/A';
              const color = item.selectedColor || 'N/A';

              return (
                <div key={id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img 
                      src={image} 
                      alt={title} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 line-clamp-1">{title}</h3>
                        <button 
                          onClick={() => removeItem(id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Size: <span className="font-medium text-gray-700">{size}</span> | 
                        Color: <span className="font-medium text-gray-700">{color}</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button 
                          onClick={() => updateQuantity(id, Math.max(1, qty - 1))}
                          className="p-2 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold bg-white h-full flex items-center justify-center border-x border-gray-200">{qty}</span>
                        <button 
                          onClick={() => updateQuantity(id, qty + 1)}
                          className="p-2 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          KES {(price * qty).toLocaleString()}
                        </p>
                        {qty > 1 && (
                          <p className="text-xs text-gray-400">
                            {qty} x KES {price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">Total</span>
                  <span className="font-bold text-primary text-xl">KES {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-primary w-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all h-12 text-lg"
              >
                Proceed to Checkout <ArrowRight size={18} className="ml-2" />
              </button>

              <div className="mt-6 text-center space-y-2">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                  <AlertTriangle size={12} className="text-orange-400"/> Items not reserved until checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;