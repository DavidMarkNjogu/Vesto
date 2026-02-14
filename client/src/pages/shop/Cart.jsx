import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Safe hydration check
  const cartItems = mounted && Array.isArray(items) ? items : [];
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!mounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-xs">Looks like you haven't found the right pair yet.</p>
        <Link to="/products" className="btn btn-primary btn-lg rounded-full text-white shadow-xl px-8">
          Start Shopping <ArrowRight size={20} className="ml-2"/>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">SHOPPING BAG <span className="text-gray-400 ml-2 text-xl font-medium">({cartItems.length} Items)</span></h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-start hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                
                {/* Info */}
                <div className="flex-1 flex flex-col justify-between h-24 sm:h-32">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.title}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.selectedSize} / {item.selectedColor}</p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    {/* Qty Controls */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-2 py-1 border border-gray-100">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 hover:text-primary transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-primary transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    {/* Price */}
                    <p className="text-lg font-black text-gray-900">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <button onClick={clearCart} className="text-sm text-red-500 font-bold hover:underline px-2">
              Clear Shopping Bag
            </button>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-xl font-black text-gray-900 mb-6">SUMMARY</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-bold">Calculated Next</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-black text-3xl text-primary">KES {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-primary w-full btn-lg rounded-2xl text-white shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all font-bold text-lg"
              >
                Checkout Securely <ArrowRight className="ml-2" />
              </button>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                Secure checkout powered by M-PESA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

// import { useEffect } from 'react'; // Added useEffect
// import { Link, useNavigate } from 'react-router-dom';
// import { Trash2, ArrowRight, ShoppingBag, Minus, Plus, AlertTriangle, XCircle } from 'lucide-react';
// import useCartStore from '../../store/cartStore';

// const Cart = () => {
//   const navigate = useNavigate();
//   const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  
//   // --- EMERGENCY CLEANUP ---
//   // If we find corrupted items, we purge them immediately to stop the crash loop
//   useEffect(() => {
//     if (Array.isArray(items)) {
//       items.forEach(item => {
//         if (typeof item.selectedSize === 'object' || typeof item.selectedColor === 'object') {
//           console.warn("Corrupted item found, removing:", item);
//           removeItem(item.id || item.sku);
//         }
//       });
//     }
//   }, [items, removeItem]);

//   // --- ROBUST DATA MAPPING ---
//   const rawItems = Array.isArray(items) ? items : [];
  
//   const safeItems = rawItems
//     .filter(item => item && typeof item === 'object')
//     .map(item => {
//       // Force string conversion no matter what
//       const safeString = (val) => {
//           if (val === null || val === undefined) return 'N/A';
//           if (typeof val === 'string') return val;
//           if (typeof val === 'number') return String(val);
//           return 'Fixed'; // Fallback for objects
//       };

//       return {
//         ...item,
//         id: item.sku || item.id || Math.random().toString(),
//         title: item.title || 'Unknown Product',
//         price: Number(item.price) || 0,
//         quantity: Math.max(1, Number(item.quantity) || 1),
//         image: item.image || 'https://via.placeholder.com/150',
//         selectedSize: safeString(item.selectedSize),
//         selectedColor: safeString(item.selectedColor)
//       };
//     });

//   const subtotal = safeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//   if (safeItems.length === 0) {
//     return (
//       <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-4 animate-fade-in">
//         <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-gray-300 shadow-sm border border-gray-100">
//           <ShoppingBag size={48} />
//         </div>
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
//         <p className="text-gray-500 mb-8 max-w-xs text-center">Looks like you haven't added any kicks yet.</p>
//         <Link 
//           to="/products" 
//           className="btn btn-primary px-8 text-white shadow-lg hover:-translate-y-1 transition-transform rounded-xl"
//         >
//           Start Shopping
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">Shopping Cart ({safeItems.length})</h1>
//           <button 
//             onClick={clearCart}
//             className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
//           >
//             <XCircle size={14} /> Clear Cart
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-4">
//             {safeItems.map((item) => (
//               <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
//                 <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
//                   <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
//                 </div>
//                 <div className="flex-1 flex flex-col justify-between">
//                   <div>
//                     <div className="flex justify-between items-start gap-2">
//                       <h3 className="font-bold text-gray-800 line-clamp-1">{item.title}</h3>
//                       <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                     <div className="flex items-center gap-2 mt-1">
//                       <span className="badge badge-sm badge-ghost text-xs font-medium">Size: {item.selectedSize}</span>
//                       <span className="badge badge-sm badge-ghost text-xs font-medium">{item.selectedColor}</span>
//                     </div>
//                   </div>
//                   <div className="flex justify-between items-end mt-4">
//                     <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-9">
//                       <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-full hover:bg-gray-100 text-gray-600 rounded-l-lg"><Minus size={14} /></button>
//                       <span className="w-10 text-center text-sm font-bold bg-white h-full flex items-center justify-center border-x border-gray-200">{item.quantity}</span>
//                       <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full hover:bg-gray-100 text-gray-600 rounded-r-lg"><Plus size={14} /></button>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-lg font-bold text-primary">KES {(item.price * item.quantity).toLocaleString()}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="lg:col-span-1">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
//               <h3 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h3>
//               <div className="space-y-3 mb-6">
//                 <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium">KES {subtotal.toLocaleString()}</span></div>
//                 <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Calculated at checkout</span></div>
//                 <div className="border-t border-gray-100 pt-3 flex justify-between items-center"><span className="font-bold text-gray-800 text-lg">Total</span><span className="font-bold text-primary text-xl">KES {subtotal.toLocaleString()}</span></div>
//               </div>
//               <button onClick={() => navigate('/checkout')} className="btn btn-primary w-full text-white shadow-lg h-12 text-lg rounded-xl">Proceed to Checkout <ArrowRight size={18} className="ml-2" /></button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;
// import { Link, useNavigate } from 'react-router-dom';
// import { Trash2, ArrowRight, ShoppingBag, Minus, Plus, AlertTriangle, XCircle } from 'lucide-react';
// import useCartStore from '../../store/cartStore';

// const Cart = () => {
//   const navigate = useNavigate();
//   const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  
//   // --- ROBUST DATA HANDLING ---
//   // 1. Force array type
//   const rawItems = Array.isArray(items) ? items : [];
  
//   // 2. Filter & Sanitize (CRITICAL FIX HERE)
//   const safeItems = rawItems.filter(item => item && typeof item === 'object').map(item => {
//     // Helper to safely extract string from potential object
//     const safeString = (val) => {
//         if (typeof val === 'object' && val !== null) return val.name || val.value || JSON.stringify(val);
//         return String(val || 'N/A');
//     };

//     return {
//         ...item,
//         // Ensure vital fields exist to prevent render crashes
//         id: item.sku || item.id || Math.random().toString(), 
//         title: item.title || 'Unknown Product',
//         price: Number(item.price) || 0, 
//         quantity: Math.max(1, Number(item.quantity) || 1), 
//         image: item.image || 'https://via.placeholder.com/150?text=No+Image',
//         // FIX: Force these to be strings
//         selectedSize: safeString(item.selectedSize),
//         selectedColor: safeString(item.selectedColor)
//     };
//   });

//   // 3. Calculate Subtotal safely
//   const subtotal = safeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//   // --- EMPTY STATE ---
//   if (safeItems.length === 0) {
//     return (
//       <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-4 animate-fade-in">
//         <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-gray-300 shadow-sm border border-gray-100">
//           <ShoppingBag size={48} />
//         </div>
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
//         <p className="text-gray-500 mb-8 max-w-xs text-center">Looks like you haven't added any kicks yet.</p>
//         <Link 
//           to="/products" 
//           className="btn btn-primary px-8 text-white shadow-lg hover:-translate-y-1 transition-transform rounded-xl"
//         >
//           Start Shopping
//         </Link>
//       </div>
//     );
//   }

//   // --- MAIN RENDER ---
//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">Shopping Cart ({safeItems.length})</h1>
//           <button 
//             onClick={clearCart}
//             className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
//           >
//             <XCircle size={14} /> Clear Cart
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Cart Items List */}
//           <div className="lg:col-span-2 space-y-4">
//             {safeItems.map((item) => (
//               <div 
//                 key={item.id} 
//                 className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md"
//               >
//                 {/* Image */}
//                 <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
//                   <img 
//                     src={item.image} 
//                     alt={item.title} 
//                     className="w-full h-full object-cover"
//                     onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }} 
//                   />
//                 </div>

//                 {/* Details */}
//                 <div className="flex-1 flex flex-col justify-between">
//                   <div>
//                     <div className="flex justify-between items-start gap-2">
//                       <h3 className="font-bold text-gray-800 line-clamp-1">{item.title}</h3>
//                       <button 
//                         onClick={() => removeItem(item.id)}
//                         className="text-gray-400 hover:text-red-500 transition-colors p-1"
//                         aria-label="Remove item"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                     <div className="flex items-center gap-2 mt-1">
//                       {/* NOW SAFE: These are guaranteed strings */}
//                       <span className="badge badge-sm badge-ghost text-xs font-medium">Size: {item.selectedSize}</span>
//                       <span className="badge badge-sm badge-ghost text-xs font-medium">{item.selectedColor}</span>
//                     </div>
//                   </div>

//                   <div className="flex justify-between items-end mt-4">
//                     {/* Quantity Controls */}
//                     <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-9">
//                       <button 
//                         onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
//                         className="w-8 h-full hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors flex items-center justify-center"
//                       >
//                         <Minus size={14} />
//                       </button>
//                       <span className="w-10 text-center text-sm font-bold bg-white h-full flex items-center justify-center border-x border-gray-200">
//                         {item.quantity}
//                       </span>
//                       <button 
//                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                         className="w-8 h-full hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors flex items-center justify-center"
//                       >
//                         <Plus size={14} />
//                       </button>
//                     </div>

//                     {/* Price */}
//                     <div className="text-right">
//                       <p className="text-lg font-bold text-primary">
//                         KES {(item.price * item.quantity).toLocaleString()}
//                       </p>
//                       {item.quantity > 1 && (
//                         <p className="text-xs text-gray-400">
//                           {item.quantity} x KES {item.price.toLocaleString()}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Summary Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
//               <h3 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h3>
              
//               <div className="space-y-3 mb-6">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Subtotal</span>
//                   <span className="font-medium">KES {subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Shipping</span>
//                   <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Calculated at checkout</span>
//                 </div>
//                 <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
//                   <span className="font-bold text-gray-800 text-lg">Total</span>
//                   <span className="font-bold text-primary text-xl">KES {subtotal.toLocaleString()}</span>
//                 </div>
//               </div>

//               <button 
//                 onClick={() => navigate('/checkout')}
//                 className="btn btn-primary w-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all h-12 text-lg rounded-xl"
//               >
//                 Proceed to Checkout <ArrowRight size={18} className="ml-2" />
//               </button>

//               <div className="mt-6 text-center space-y-2">
//                 <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
//                   <AlertTriangle size={12} className="text-orange-400"/> Items not reserved until checkout
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;