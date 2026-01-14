import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Box, MapPin, Phone, CheckCircle, Clock, Truck } from 'lucide-react';

const MyShipments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/supplier/orders');
      if (Array.isArray(res.data)) setOrders(res.data);
    } catch (err) {
      console.error("Failed to load shipments", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      // API Call
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
    } catch (err) {
      console.error("Update failed", err);
      fetchOrders(); // Revert on error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Shipments</h1>
        <div className="flex gap-2 w-full md:w-auto">
          {/* ... Search Inputs (Keep existing) ... */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search Order ID..." className="input input-bordered input-sm w-full pl-9" />
          </div>
          <button className="btn btn-sm btn-outline gap-2"><Filter size={14}/> Filter</button>
        </div>
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
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              
              {/* Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-700">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`badge badge-sm ${
                    order.status === 'Paid' ? 'badge-warning text-white' : 
                    order.status === 'Ready' ? 'badge-success text-white' : 'badge-ghost'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Clock size={12} /> {new Date(order.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Packing List */}
                <div className="lg:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Packing List</h4>
                  {order.cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded object-cover border border-gray-200"/>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                      </div>
                      <span className="badge badge-neutral">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-4 border-l border-gray-100 pl-0 lg:pl-6 pt-4 lg:pt-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Delivery To</h4>
                    <p className="font-bold text-gray-800">{order.firstName} {order.lastName}</p>
                    <div className="flex items-start gap-2 mt-1 text-sm text-gray-600"><MapPin size={14} className="mt-1"/> {order.location}</div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600"><Phone size={14} /> {order.phone}</div>
                  </div>

                  {order.status === 'Paid' ? (
                    <button 
                      onClick={() => updateStatus(order._id, 'Ready')}
                      className="btn btn-primary btn-sm w-full gap-2 text-white shadow-lg hover:-translate-y-1 transition-transform"
                    >
                      <CheckCircle size={14} /> Mark Ready
                    </button>
                  ) : order.status === 'Ready' ? (
                    <button className="btn btn-success btn-sm w-full gap-2 text-white cursor-default">
                      <Truck size={14} /> Ready for Pickup
                    </button>
                  ) : (
                    <button className="btn btn-disabled btn-sm w-full">Completed</button>
                  )}
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