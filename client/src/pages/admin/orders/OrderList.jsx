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
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Orders</h1>
          <p className="text-xs text-gray-500">Track fulfillment.</p>
        </div>
        <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Order #..." className="input input-bordered input-sm pl-9 w-full" />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm flex-1"><Filter size={14}/> Filter</button>
            <button onClick={fetchOrders} className="btn btn-ghost btn-sm flex-1 bg-gray-50"><RefreshCw size={14} /></button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase font-bold">
              <tr>
                <th className="pl-4 sm:pl-6">ID</th>
                <th>Date</th>
                <th className="hidden sm:table-cell">Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th className="text-right pr-4 sm:pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 border-b border-gray-50">
                  <td className="pl-4 sm:pl-6 font-mono text-[10px] sm:text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="text-gray-500 whitespace-nowrap">
                     <div className="flex items-center gap-1"><Calendar size={12}/> {new Date(order.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="hidden sm:table-cell">
                      <div className="font-bold text-gray-800">{order.phone}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[100px]">{order.location}</div>
                  </td>
                  <td><span className="badge badge-ghost badge-sm text-[10px]">{order.cartItems?.length || 0}</span></td>
                  <td className="font-bold text-gray-800">KES {order.total.toLocaleString()}</td>
                  <td className="text-right pr-4 sm:pr-6"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;