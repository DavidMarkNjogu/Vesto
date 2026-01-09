import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../../store/cartStore';
import { 
  ArrowLeft, CheckCircle, MapPin, Phone, CreditCard, 
  ShieldCheck, Truck, Lock, User, Info, AlertTriangle 
} from 'lucide-react';
import { offlineDB } from '../../utils/offlineDB';
import { isOnline, syncPendingOrders } from '../../utils/offlineSync';

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

  // Safety: Ensure items is an array
  const validItems = Array.isArray(items) ? items : [];

  // Locations Map (Simplified for MVP - Expand later)
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
    // We send SKUs so the backend knows exactly which Variant to deduct stock from
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
        // Online Flow: Hit the API
        const response = await axios.post('http://localhost:5000/api/orders', payload);
        responseData = response.data;
      } else {
        // Offline Flow: Save to IndexedDB
        await offlineDB.savePendingOrder(payload);
        responseData = { 
          orderId: 'OFFLINE-' + Date.now().toString().slice(-6),
          success: true 
        };
      }

      // Success -> Redirect to Success Page with State
      clearCart();
      navigate('/checkout/success', { 
        state: { 
          orderId: responseData.orderId || 'PENDING',
          ...payload
        } 
      });

    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Order processing failed. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sync pending orders on mount if online
  useEffect(() => {
    if (isOnline()) syncPendingOrders();
  }, []);

  // Redirect if cart empty
  useEffect(() => {
    if (validItems.length === 0) {
        navigate('/cart');
    }
  }, [validItems, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
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
            <Lock size={16} className="text-green-600" />
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
                      className="input input-bordered w-full pl-10 focus:ring-primary focus:border-primary" 
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
                    className="input input-bordered w-full focus:ring-primary focus:border-primary" 
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
                      className="input input-bordered w-full pl-10 focus:ring-primary focus:border-primary" 
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
                      className="select select-bordered w-full pl-10 focus:ring-primary focus:border-primary"
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
                    className="textarea textarea-bordered h-24 focus:ring-primary focus:border-primary" 
                    placeholder="E.g. Drop at the reception, or call me when near the gate."
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Trust Badges (KenyaKicks Style) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <ShieldCheck className="text-secondary w-8 h-8 mb-2" />
                <span className="text-xs font-bold text-gray-600">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Truck className="text-secondary w-8 h-8 mb-2" />
                <span className="text-xs font-bold text-gray-600">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <CheckCircle className="text-secondary w-8 h-8 mb-2" />
                <span className="text-xs font-bold text-gray-600">Authentic</span>
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h3>
              
              {/* Item List */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {validItems.map((item) => (
                  <div key={item.sku || item.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-gray-50 rounded border border-gray-100 overflow-hidden flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
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
                {!formData.location && (
                    <div className="flex items-center gap-1 text-xs text-orange-500 justify-end">
                        <AlertTriangle size={12} /> Select location to calculate
                    </div>
                )}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-gray-200">
                  <span className="font-bold text-gray-800 text-lg">Total to Pay</span>
                  <span className="font-bold text-2xl text-primary">KES {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment CTA */}
              <div className="mt-6">
                <div className="alert alert-info bg-blue-50 border-blue-100 text-blue-800 py-2 px-3 text-xs mb-4 flex gap-2 rounded-lg">
                  <Info size={16} className="flex-shrink-0" />
                  <span>You will receive an M-PESA prompt on <strong>{formData.phone || 'your phone'}</strong> to complete payment.</span>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || validItems.length === 0}
                  className="btn btn-primary w-full h-14 text-white text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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