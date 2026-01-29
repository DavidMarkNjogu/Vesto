import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useCartStore from '../store/cartStore';
import { 
  ArrowLeft, CheckCircle, MapPin, Phone, CreditCard, 
  ShieldCheck, Truck, Lock, User, Info
} from 'lucide-react';
import { offlineDB } from '../utils/offlineDB';
import { isOnline, syncPendingOrders } from '../utils/offlineSync';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  
  // --- STATE ---
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    deliveryNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Safety: Ensure items is an array
  const validItems = Array.isArray(items) ? items : [];

  // Locations Map (Simplified for MVP)
  const SHIPPING_COSTS = {
    'Nairobi CBD': 200, 'Westlands': 250, 'Karen': 300,
    'Nakuru': 300, 'Eldoret': 400, 'Mombasa': 500, 
    'Kisumu': 350, 'Thika': 250, 'Nyeri': 350, 'Meru': 400,
  };
  const locations = Object.keys(SHIPPING_COSTS);

  // --- CALCULATIONS ---
  const subtotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = formData.location ? (SHIPPING_COSTS[formData.location] || 500) : 0;
  const grandTotal = subtotal + shippingFee;

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.location || validItems.length === 0) {
      alert('Please fill in all required fields and ensure cart is not empty');
      return;
    }

    setLoading(true);

    // Prepare Payload (Variant Aware)
    const cartItemsPayload = validItems.map((item) => ({
      sku: item.sku || item.id, // Prefer SKU
      productId: item.productId || item.id,
      title: item.title,
      size: item.selectedSize || 'N/A',
      color: item.selectedColor || 'N/A',
      quantity: item.quantity,
      price: item.price,
      image: item.image
    }));

    const payload = {
      ...formData,
      cartItems: cartItemsPayload,
      subtotal,
      shipping: shippingFee,
      total: grandTotal,
      status: 'Pending',
      paymentMethod: 'MPESA',
      timestamp: new Date().toISOString()
    };

    try {
      let responseData;

      if (isOnline()) {
        // Online Flow
        const response = await axios.post('http://localhost:5000/api/orders', payload);
        responseData = response.data;
      } else {
        // Offline Flow
        await offlineDB.savePendingOrder(payload);
        responseData = { 
          orderId: 'OFFLINE-' + Date.now().toString().slice(-6),
          success: true 
        };
      }

      // Success State
      setOrderData({
        id: responseData.orderId || 'PENDING',
        ...payload
      });
      setOrderSuccess(true);
      clearCart();

    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Order processing failed. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOnline()) syncPendingOrders();
  }, []);

  // --- RENDER: SUCCESS SCREEN ---
  if (orderSuccess && orderData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="card bg-white shadow-2xl max-w-md w-full border-t-4 border-success">
          <div className="card-body text-center p-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
               <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-6">Thanks {orderData.firstName}, we've received your order.</p>
            
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-3 mb-8 text-left border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Ref</span>
                <span className="font-mono font-bold text-gray-800">{orderData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-primary">KES {orderData.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="font-medium">{orderData.location}</span>
              </div>
              <div className="alert alert-info py-2 text-xs mt-2">
                <Info size={14} /> You will receive an MPESA prompt shortly.
              </div>
            </div>

            <button
              className="btn btn-primary w-full shadow-lg"
              onClick={() => {
                setOrderSuccess(false);
                navigate('/');
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN CHECKOUT ---
  return (
    <div className="min-h-screen bg-bg pb-12">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            className="btn btn-circle btn-ghost btn-sm"
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-success" />
            <span className="font-bold text-gray-800">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: DETAILS FORM */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Contact Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">1</span>
                Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      name="firstName"
                      className="input input-bordered w-full pl-10 focus:ring-primary" 
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    className="input input-bordered w-full focus:ring-primary" 
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label text-xs font-bold text-gray-500 uppercase">MPESA Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input 
                      type="tel" 
                      name="phone"
                      className="input input-bordered w-full pl-10 focus:ring-primary" 
                      placeholder="0712 345 678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <label className="label text-xs text-gray-400">
                    Format: 07XX or 01XX. We will send an STK push to this number.
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Delivery Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">2</span>
                Delivery Details
              </h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Delivery Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <select 
                      name="location"
                      className="select select-bordered w-full pl-10 focus:ring-primary"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select your location/region</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc} - KES {SHIPPING_COSTS[loc]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Specific Instructions (Optional)</label>
                  <textarea 
                    name="deliveryNotes"
                    className="textarea textarea-bordered h-24 focus:ring-primary" 
                    placeholder="E.g. Drop at the reception, or call me when near the gate."
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Trust Badges (KenyaKicks Style) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-100">
                <ShieldCheck className="text-secondary w-8 h-8 mb-2" />
                <span className="text-xs font-bold text-gray-600">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-100">
                <Truck className="text-secondary w-8 h-8 mb-2" />
                <span className="text-xs font-bold text-gray-600">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-100">
                <CheckCircle className="text-secondary w-8 h-8 mb-2" />
                <span className="text-xs font-bold text-gray-600">Quality Guarantee</span>
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h3>
              
              {/* Item List (Compact) */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {validItems.map((item) => (
                  <div key={item.sku || item.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-gray-50 rounded border border-gray-100 overflow-hidden flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.selectedSize} / {item.selectedColor} x {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">KES {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span>{formData.location ? `KES ${shippingFee.toLocaleString()}` : '--'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-gray-200">
                  <span className="font-bold text-gray-800">Total to Pay</span>
                  <span className="font-bold text-2xl text-primary">KES {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment CTA */}
              <div className="mt-6">
                <div className="alert alert-warning py-2 px-3 text-xs mb-4 flex gap-2">
                  <Info size={16} />
                  <span>By clicking below, you will receive an M-PESA prompt on your phone to complete payment.</span>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || validItems.length === 0}
                  className="btn btn-primary w-full h-14 text-white text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {loading ? (
                    <span className="loading loading-spinner text-white"></span>
                  ) : (
                    <>
                      <CreditCard className="mr-2" /> Pay with M-PESA
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import useCartStore from '../store/cartStore';
// import { ArrowLeft, CheckCircle, MapPin, Phone, CreditCard } from 'lucide-react';
// import { offlineDB } from '../utils/offlineDB';
// import { isOnline, syncPendingOrders } from '../utils/offlineSync';

// const Checkout = () => {
//   const navigate = useNavigate();
//   const { items, getTotal, clearCart } = useCartStore();
//   const [phone, setPhone] = useState('');
//   const [location, setLocation] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [orderSuccess, setOrderSuccess] = useState(false);
//   const [orderData, setOrderData] = useState(null);

//   const locations = [
//     'Nairobi CBD',
//     'Westlands',
//     'Karen',
//     'Nakuru',
//     'Eldoret',
//     'Mombasa',
//     'Kisumu',
//     'Thika',
//     'Nyeri',
//     'Meru',
//   ];

//   const getShippingFee = (loc) => {
//     const SHIPPING_COSTS = {
//       'Nairobi CBD': 200,
//       'Westlands': 250,
//       'Karen': 300,
//       'Nakuru': 300,
//       'Eldoret': 400,
//       'Mombasa': 500,
//       'Kisumu': 350,
//       'Thika': 250,
//       'Nyeri': 350,
//       'Meru': 400,
//     };
//     return SHIPPING_COSTS[loc] || 500;
//   };

//   const subtotal = getTotal();
//   const shippingFee = location ? getShippingFee(location) : 0;
//   const grandTotal = subtotal + shippingFee;

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!phone || !location || items.length === 0) {
//       alert('Please fill in all fields and add items to cart');
//       return;
//     }

//     setLoading(true);

//     try {
//       const cartItems = items.map((item) => ({
//         sku: item.sku,             // VITAL: The specific variant identifier
//         productId: item.productId, // Reference to parent
//         title: item.title,         // Snapshot for history
//         size: item.selectedSize,   // Snapshot
//         color: item.selectedColor, // Snapshot
//         quantity: item.quantity,
//         price: item.price,
//       }));

//       const orderData = {
//         phone,
//         location,
//         cartItems,
//       };

//       if (isOnline()) {
//         // Try to submit online
//         try {
//           const response = await axios.post('http://localhost:5000/api/orders', orderData);
          
//           setOrderData({
//             id: response.data.orderId,
//             phone,
//             location,
//             subtotal: response.data.subtotal,
//             shipping: response.data.shipping,
//             total: response.data.total,
//           });
//           setOrderSuccess(true);
//           clearCart();
//         } catch (error) {
//           // If online submission fails, save to pending
//           throw error;
//         }
//       } else {
//         // Save to pending orders for offline sync
//         await offlineDB.savePendingOrder(orderData);
        
//         setOrderData({
//           id: 'pending_' + Date.now(),
//           phone,
//           location,
//           subtotal,
//           shipping: shippingFee,
//           total: grandTotal,
//         });
//         setOrderSuccess(true);
//         clearCart();
        
//         // Show offline message
//         alert('Order saved offline. It will be processed when you\'re back online.');
//       }
//     } catch (error) {
//       console.error('Error creating order:', error);
      
//       // Try to save offline as fallback
//       if (isOnline()) {
//         try {
//           const cartItems = items.map((item) => ({
//             productId: item.id,
//             quantity: item.quantity,
//             price: item.price,
//           }));
          
//           await offlineDB.savePendingOrder({
//             phone,
//             location,
//             cartItems,
//           });
          
//           alert('Order saved offline. It will be processed when connection is restored.');
//           setOrderSuccess(true);
//           clearCart();
//         } catch (offlineError) {
//           alert('Failed to create order. Please try again.');
//         }
//       } else {
//         alert('Failed to create order. Please check your connection.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Sync pending orders when component mounts and online
//     if (isOnline()) {
//       syncPendingOrders();
//     }
//   }, []);

//   if (orderSuccess) {
//     return (
//       <div className="min-h-screen bg-bg flex items-center justify-center py-8">
//         <div className="card bg-base-100 shadow-2xl max-w-lg w-full mx-4">
//           <div className="card-body text-center">
//             <div className="mb-4">
//               <CheckCircle className="w-24 h-24 text-success mx-auto mb-4 animate-bounce" />
//               <h2 className="card-title justify-center text-3xl mb-2 text-primary">
//                 🎉 Order Placed Successfully!
//               </h2>
//               <p className="text-gray-600">Thank you for shopping with Vesto Shoes</p>
//             </div>
//             <div className="divider"></div>
//             <div className="space-y-3 mb-6 text-left">
//               <div className="flex justify-between p-2 bg-base-200 rounded">
//                 <span className="font-semibold">Order ID:</span>
//                 <span className="font-mono text-sm">{orderData.id}</span>
//               </div>
//               <div className="flex justify-between p-2 bg-base-200 rounded">
//                 <span className="font-semibold">Phone:</span>
//                 <span>{orderData.phone}</span>
//               </div>
//               <div className="flex justify-between p-2 bg-base-200 rounded">
//                 <span className="font-semibold">Delivery Location:</span>
//                 <span>{orderData.location}</span>
//               </div>
//               <div className="flex justify-between p-2 bg-base-200 rounded">
//                 <span className="font-semibold">Subtotal:</span>
//                 <span>KES {orderData.subtotal.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between p-2 bg-base-200 rounded">
//                 <span className="font-semibold">Shipping:</span>
//                 <span>KES {orderData.shipping.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between p-3 bg-primary text-white rounded-lg mt-4">
//                 <span className="font-bold text-lg">Total:</span>
//                 <span className="font-bold text-xl">KES {orderData.total.toLocaleString()}</span>
//               </div>
//             </div>
//             <div className="alert alert-info mb-4">
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
//               <span>You will receive an M-PESA prompt shortly</span>
//             </div>
//             <button
//               className="btn btn-primary w-full text-lg hover:btn-secondary transition-colors"
//               onClick={() => {
//                 setOrderSuccess(false);
//                 navigate('/');
//               }}
//             >
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-bg py-8">
//       <div className="container mx-auto px-4 max-w-3xl">
//         <button
//           className="btn btn-ghost mb-4 hover:btn-primary transition-colors"
//           onClick={() => navigate('/')}
//         >
//           <ArrowLeft className="w-5 h-5 mr-2" />
//           Back to Store
//         </button>

//         <div className="card bg-base-100 shadow-2xl">
//           <div className="card-body">
//             <div className="mb-6 text-center">
//               <h2 className="card-title text-4xl mb-2 justify-center">Guest Checkout</h2>
//               <p className="text-gray-600 text-lg">No account needed - Quick & Easy</p>
//               <div className="badge badge-primary badge-lg mt-2">
//                 {items.length} {items.length === 1 ? 'Item' : 'Items'} in Cart
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text font-semibold">Phone Number</span>
//                 </label>
//                 <input
//                   type="tel"
//                   placeholder="0712345678"
//                   className="input input-bordered w-full"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text font-semibold">Delivery Location</span>
//                 </label>
//                 <select
//                   className="select select-bordered w-full"
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   required
//                 >
//                   <option value="">Select a location</option>
//                   {locations.map((loc) => (
//                     <option key={loc} value={loc}>
//                       {loc}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="divider">Order Summary</div>

//               <div className="space-y-3">
//                 {items.map((item) => (
//                   <div key={item.id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
//                     <div className="flex-1">
//                       <span className="font-semibold">{item.title}</span>
//                       <span className="text-gray-500 ml-2">x {item.quantity}</span>
//                     </div>
//                     <span className="font-bold text-secondary">
//                       KES {(item.price * item.quantity).toLocaleString()}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               <div className="space-y-3 pt-4 border-t-2 border-primary">
//                 <div className="flex justify-between text-lg">
//                   <span className="font-semibold">Subtotal</span>
//                   <span className="font-bold">KES {subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-lg">
//                   <span className="font-semibold">Shipping Fee</span>
//                   <span className="font-bold">
//                     {location ? `KES ${shippingFee.toLocaleString()}` : 'Select location'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-2xl font-bold text-secondary pt-3 border-t">
//                   <span>Grand Total</span>
//                   <span className="text-primary">
//                     {location ? `KES ${grandTotal.toLocaleString()}` : '---'}
//                   </span>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-primary w-full mt-6 hover:btn-secondary transition-colors text-lg font-semibold"
//                 disabled={loading || items.length === 0}
//               >
//                 {loading ? (
//                   <>
//                     <span className="loading loading-spinner"></span>
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     💳 Place Order (M-PESA)
//                   </>
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;

