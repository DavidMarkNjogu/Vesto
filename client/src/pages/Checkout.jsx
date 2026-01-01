import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';
import { ArrowLeft, CheckCircle, MapPin, Phone, CreditCard } from 'lucide-react';
import { offlineDB } from '../utils/offlineDB';
import { isOnline, syncPendingOrders } from '../utils/offlineSync';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const locations = [
    'Nairobi CBD',
    'Westlands',
    'Karen',
    'Nakuru',
    'Eldoret',
    'Mombasa',
    'Kisumu',
    'Thika',
    'Nyeri',
    'Meru',
  ];

  const getShippingFee = (loc) => {
    const SHIPPING_COSTS = {
      'Nairobi CBD': 200,
      'Westlands': 250,
      'Karen': 300,
      'Nakuru': 300,
      'Eldoret': 400,
      'Mombasa': 500,
      'Kisumu': 350,
      'Thika': 250,
      'Nyeri': 350,
      'Meru': 400,
    };
    return SHIPPING_COSTS[loc] || 500;
  };

  const subtotal = getTotal();
  const shippingFee = location ? getShippingFee(location) : 0;
  const grandTotal = subtotal + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || !location || items.length === 0) {
      alert('Please fill in all fields and add items to cart');
      return;
    }

    setLoading(true);

    try {
      const cartItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        phone,
        location,
        cartItems,
      };

      if (isOnline()) {
        // Try to submit online
        try {
          const response = await axios.post('http://localhost:5000/api/orders', orderData);
          
          setOrderData({
            id: response.data.orderId,
            phone,
            location,
            subtotal: response.data.subtotal,
            shipping: response.data.shipping,
            total: response.data.total,
          });
          setOrderSuccess(true);
          clearCart();
        } catch (error) {
          // If online submission fails, save to pending
          throw error;
        }
      } else {
        // Save to pending orders for offline sync
        await offlineDB.savePendingOrder(orderData);
        
        setOrderData({
          id: 'pending_' + Date.now(),
          phone,
          location,
          subtotal,
          shipping: shippingFee,
          total: grandTotal,
        });
        setOrderSuccess(true);
        clearCart();
        
        // Show offline message
        alert('Order saved offline. It will be processed when you\'re back online.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Try to save offline as fallback
      if (isOnline()) {
        try {
          const cartItems = items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          }));
          
          await offlineDB.savePendingOrder({
            phone,
            location,
            cartItems,
          });
          
          alert('Order saved offline. It will be processed when connection is restored.');
          setOrderSuccess(true);
          clearCart();
        } catch (offlineError) {
          alert('Failed to create order. Please try again.');
        }
      } else {
        alert('Failed to create order. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sync pending orders when component mounts and online
    if (isOnline()) {
      syncPendingOrders();
    }
  }, []);

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center py-8">
        <div className="card bg-base-100 shadow-2xl max-w-lg w-full mx-4">
          <div className="card-body text-center">
            <div className="mb-4">
              <CheckCircle className="w-24 h-24 text-success mx-auto mb-4 animate-bounce" />
              <h2 className="card-title justify-center text-3xl mb-2 text-primary">
                🎉 Order Placed Successfully!
              </h2>
              <p className="text-gray-600">Thank you for shopping with Covera Shoes</p>
            </div>
            <div className="divider"></div>
            <div className="space-y-3 mb-6 text-left">
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span className="font-semibold">Order ID:</span>
                <span className="font-mono text-sm">{orderData.id}</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span className="font-semibold">Phone:</span>
                <span>{orderData.phone}</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span className="font-semibold">Delivery Location:</span>
                <span>{orderData.location}</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span className="font-semibold">Subtotal:</span>
                <span>KES {orderData.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-base-200 rounded">
                <span className="font-semibold">Shipping:</span>
                <span>KES {orderData.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-primary text-white rounded-lg mt-4">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-xl">KES {orderData.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="alert alert-info mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>You will receive an M-PESA prompt shortly</span>
            </div>
            <button
              className="btn btn-primary w-full text-lg hover:btn-secondary transition-colors"
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

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          className="btn btn-ghost mb-4 hover:btn-primary transition-colors"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Store
        </button>

        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">
            <div className="mb-6 text-center">
              <h2 className="card-title text-4xl mb-2 justify-center">Guest Checkout</h2>
              <p className="text-gray-600 text-lg">No account needed - Quick & Easy</p>
              <div className="badge badge-primary badge-lg mt-2">
                {items.length} {items.length === 1 ? 'Item' : 'Items'} in Cart
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Phone Number</span>
                </label>
                <input
                  type="tel"
                  placeholder="0712345678"
                  className="input input-bordered w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Delivery Location</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="divider">Order Summary</div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                    <div className="flex-1">
                      <span className="font-semibold">{item.title}</span>
                      <span className="text-gray-500 ml-2">x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-secondary">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t-2 border-primary">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Shipping Fee</span>
                  <span className="font-bold">
                    {location ? `KES ${shippingFee.toLocaleString()}` : 'Select location'}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-secondary pt-3 border-t">
                  <span>Grand Total</span>
                  <span className="text-primary">
                    {location ? `KES ${grandTotal.toLocaleString()}` : '---'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-6 hover:btn-secondary transition-colors text-lg font-semibold"
                disabled={loading || items.length === 0}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    💳 Place Order (M-PESA)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

