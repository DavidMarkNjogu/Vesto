import { useEffect, useState } from 'react';
import axios from 'axios';
import { Filter, RefreshCw, Calendar, Search } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders');
      setOrders(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-12 flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Order Management</h1>
          <p className="text-sm text-gray-500">Track and fulfill customer orders.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search orders..." className="input input-bordered input-sm pl-9" />
          </div>
          <button className="btn btn-outline btn-sm gap-2"><Filter size={14}/> Filter</button>
          <button onClick={fetchOrders} className="btn btn-ghost btn-sm gap-2 hover:bg-gray-100"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="table w-full">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr><th className="pl-6">Order ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-12 text-gray-400">No orders found.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 border-b border-gray-50 last:border-none">
                  <td className="pl-6 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="text-sm text-gray-600 flex items-center gap-2">
                     <Calendar size={12} className="text-gray-400"/>
                     {new Date(order.timestamp).toLocaleDateString()}
                  </td>
                  <td>
                      <div className="font-bold text-sm text-gray-800">{order.phone}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{order.location}</div>
                  </td>
                  <td><span className="badge badge-ghost badge-sm font-normal">{order.cartItems?.length || 0} items</span></td>
                  <td className="font-bold text-gray-800">KES {order.total.toLocaleString()}</td>
                  <td><StatusBadge status={order.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;