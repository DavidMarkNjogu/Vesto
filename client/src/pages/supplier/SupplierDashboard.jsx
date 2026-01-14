import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle, TrendingUp, AlertCircle, Loader } from 'lucide-react';

const SupplierDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
    performance: '100%'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/supplier/orders');
      if (Array.isArray(res.data)) {
        const allOrders = res.data;
        setOrders(allOrders);

        // Calculate Real Stats
        const pending = allOrders.filter(o => o.status === 'Paid').length;
        const completed = allOrders.filter(o => o.status === 'Ready' || o.status === 'Shipped').length;
        
        setStats({
          pending,
          completed,
          total: allOrders.length,
          performance: '98%' // Hardcoded for now, or calc based on time
        });
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markReady = async (orderId) => {
    try {
      // Optimistic UI Update (Instant feedback)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Ready' } : o));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, completed: prev.completed + 1 }));

      // API Call
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'Ready' });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert if failed (optional, but good practice)
      fetchData(); 
    }
  };

  // Filter for the "Urgent" Table (Only show 'Paid' orders that need packing)
  const urgentOrders = orders.filter(o => o.status === 'Paid');

  const statCards = [
    { title: 'Pending Shipments', value: stats.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Total Orders', value: stats.total, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Performance', value: stats.performance, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  if (loading) {
    return <div className="flex justify-center p-12"><Loader className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Supplier Overview</h1>
        <p className="text-gray-500">
          You have <span className="text-primary font-bold">{stats.pending} orders</span> waiting for dispatch.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Action Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Dispatch Queue</h3>
          {urgentOrders.length > 0 && <span className="badge badge-warning text-xs">Action Needed</span>}
        </div>
        
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th>Order Ref</th>
                <th>Items</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {urgentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    <CheckCircle className="mx-auto w-8 h-8 mb-2 opacity-50" />
                    All caught up! No pending orders.
                  </td>
                </tr>
              ) : (
                urgentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="font-mono font-bold text-gray-700">#{order._id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold">{order.cartItems[0]?.title}</span>
                        <span className="text-xs text-gray-500">
                          {order.cartItems.length > 1 ? `+ ${order.cartItems.length - 1} more items` : order.cartItems[0]?.selectedSize}
                        </span>
                      </div>
                    </td>
                    <td><span className="text-gray-600">{order.location}</span></td>
                    <td><span className="badge badge-warning text-white">Pending</span></td>
                    <td>
                      <button 
                        onClick={() => markReady(order._id)}
                        className="btn btn-xs btn-primary text-white hover:scale-105 transition-transform"
                      >
                        Mark Ready
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;