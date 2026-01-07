import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Minus, Plus } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = getTotal();

  if (safeItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg p-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any kicks yet.</p>
        <Link to="/products" className="btn btn-primary px-8 text-white">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart ({safeItems.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {safeItems.map((item) => (
              <div key={item.sku || item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                {/* Image */}
                <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800 line-clamp-1">{item.title}</h3>
                      <button 
                        onClick={() => removeItem(item.sku || item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.selectedSize ? `Size: ${item.selectedSize}` : ''} 
                      {item.selectedColor ? ` | ${item.selectedColor}` : ''}
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.sku || item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-gray-50 text-gray-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.sku || item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 text-gray-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">
                          {item.quantity} x KES {item.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">Total</span>
                  <span className="font-bold text-primary text-xl">KES {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-primary w-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Proceed to Checkout <ArrowRight size={18} className="ml-2" />
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} /> Secure Checkout via MPESA
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