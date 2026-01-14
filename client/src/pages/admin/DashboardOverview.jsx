import { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

const DashboardOverview = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, todayOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, ordRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products'),
          axios.get('http://localhost:5000/api/admin/orders')
        ]);
        
        const products = prodRes.data || [];
        const orders = ordRes.data || [];
        
        // Calculate Stats
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const today = new Date().toDateString();
        const todayCount = orders.filter(o => new Date(o.timestamp).toDateString() === today).length;

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: revenue,
          todayOrders: todayCount
        });

        setRecentOrders(orders.slice(0, 5));
        setTopProducts(products.slice(0, 5));
      } catch (err) {
        console.error("Dashboard data error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><span className="loading loading-spinner text-primary"></span></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" trend="up" trendValue="+12%" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="blue" trend="up" trendValue="+5%" />
        <StatCard title="Inventory Count" value={stats.totalProducts} icon={Package} color="purple" />
        <StatCard title="Today's Activity" value={stats.todayOrders} icon={TrendingUp} color="orange" subtitle="New Orders" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
          </div>
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 border-b border-gray-50 last:border-none">
                  <td className="font-mono text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="font-medium text-sm">{order.phone}</div>
                    <div className="text-[10px] text-gray-400">{new Date(order.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="font-bold text-gray-700">KES {order.total.toLocaleString()}</td>
                  <td><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Inventory */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="font-bold text-gray-800">Top Inventory</h3></div>
          <div className="p-4 space-y-4">
            {topProducts.map(product => (
              <div key={product._id} className="flex items-center gap-3">
                <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" onError={(e)=>e.target.src='https://via.placeholder.com/40'}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{product.title}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <p className="text-xs font-bold text-primary">KES {Number(product.price).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;