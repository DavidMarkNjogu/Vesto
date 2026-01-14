import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Box, MapPin, Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const MyShipments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Direct call to local server
      const res = await axios.get('http://localhost:5000/api/supplier/orders');
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load shipments", err);
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
        <div className="p-8 text-center">
            <div className="text-red-500 mb-2"><AlertCircle className="mx-auto h-8 w-8"/></div>
            <h3 className="font-bold text-gray-800">Connection Error</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={fetchOrders} className="btn btn-sm btn-outline">Retry</button>
        </div>
    );
  }

  // ... (Rest of render logic remains same as previous turn) ...
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Shipments</h1>
        {/* ... Search Bar ... */}
      </div>

      {loading ? (
        <div className="text-center py-12"><span className="loading loading-spinner text-primary"></span></div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
          <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No Orders Yet</h3>
          <p className="text-gray-500">New orders will appear here once customers checkout.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* ... Order Card Content ... */}
               <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-700">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`badge badge-sm ${order.status === 'Paid' ? 'badge-success text-white' : 'badge-warning text-white'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Clock size={12} /> {new Date(order.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Packing List</h4>
                  {order.cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-12 h-12 rounded object-cover border border-gray-200"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          Size: <span className="font-bold text-gray-700">{item.selectedSize}</span> | 
                          Color: {item.selectedColor}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-neutral">x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-l border-gray-100 pl-0 lg:pl-6 pt-4 lg:pt-0">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Delivery To</h4>
                    <p className="font-bold text-gray-800">{order.firstName} {order.lastName}</p>
                    <div className="flex items-start gap-2 mt-1 text-sm text-gray-600">
                      <MapPin size={14} className="mt-1 flex-shrink-0" />
                      <span>{order.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{order.phone}</span>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-sm w-full gap-2 text-white">
                    <CheckCircle size={14} /> Mark Ready for Pickup
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyShipments;