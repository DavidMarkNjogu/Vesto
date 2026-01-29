// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { 
//   Package, Clock, CheckCircle, TrendingUp, AlertCircle, 
//   Loader, Printer, RefreshCw, DollarSign, Activity 
// } from 'lucide-react';

// const SupplierDashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [stats, setStats] = useState({
//     pending: 0,
//     completed: 0,
//     revenue: 0,
//     performance: '100%'
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setRefreshing(true);
//     try {
//       const res = await api.get('/supplier/orders');
//       if (Array.isArray(res.data)) {
//         const allOrders = res.data;
//         setOrders(allOrders);
//         calculateStats(allOrders);
//       }
//     } catch (err) {
//       console.error("Dashboard fetch error:", err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const calculateStats = (data) => {
//     const pending = data.filter(o => o.status === 'Paid').length;
//     const completed = data.filter(o => o.status === 'Ready' || o.status === 'Shipped').length;
    
//     // Calculate Revenue (Assuming Supplier gets 70% of order total)
//     const totalRevenue = data
//       .filter(o => o.status !== 'Cancelled')
//       .reduce((sum, o) => sum + (o.total || 0), 0) * 0.7;

//     setStats({
//       pending,
//       completed,
//       revenue: Math.floor(totalRevenue),
//       performance: '98%'
//     });
//   };

//   const markReady = async (orderId) => {
//     try {
//       setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Ready' } : o));
//       calculateStats(orders.map(o => o._id === orderId ? { ...o, status: 'Ready' } : o));
//       await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'Ready' });
//     } catch (err) {
//       console.error("Failed to update status", err);
//       fetchData(); 
//     }
//   };

//   const handlePrint = (order) => {
//     // Simulate printing a Packing Slip
//     const printWindow = window.open('', '', 'width=600,height=600');
//     printWindow.document.write(`
//       <html>
//         <head><title>Packing Slip - ${order._id}</title></head>
//         <body style="font-family: monospace; padding: 20px;">
//           <h1>PACKING SLIP</h1>
//           <hr/>
//           <p><strong>Order Ref:</strong> ${order._id}</p>
//           <p><strong>Customer:</strong> ${order.firstName} ${order.lastName}</p>
//           <p><strong>Phone:</strong> ${order.phone}</p>
//           <p><strong>Location:</strong> ${order.location}</p>
//           <hr/>
//           <h3>ITEMS:</h3>
//           <ul>
//             ${order.cartItems.map(item => `<li>${item.title} (Size: ${item.selectedSize}) x${item.quantity}</li>`).join('')}
//           </ul>
//           <hr/>
//           <p>Authorized by: Vesto Supplier Portal</p>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const urgentOrders = orders.filter(o => o.status === 'Paid');
//   const recentActivity = orders.slice(0, 3); // Top 3 most recent

//   const statCards = [
//     { title: 'Pending Dispatch', value: stats.pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
//     { title: 'Est. Earnings', value: `KES ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
//     { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
//     { title: 'On-Time Rate', value: stats.performance, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
//   ];

//   if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-primary" /></div>;

//   return (
//     <div className="space-y-8 animate-fade-in pb-10">
//       {/* Header */}
//       <div className="flex justify-between items-end">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Supplier Overview</h1>
//           <p className="text-gray-500 mt-1">
//             Welcome back, <span className="font-bold text-gray-700">Nike Distributor</span>. Here is what's happening today.
//           </p>
//         </div>
//         <button 
//           onClick={fetchData} 
//           disabled={refreshing}
//           className="btn btn-sm btn-outline gap-2"
//         >
//           <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
//           {refreshing ? 'Syncing...' : 'Refresh Data'}
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statCards.map((stat, idx) => (
//           <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
//             <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm`}>
//               <stat.icon size={28} />
//             </div>
//             <div>
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
//               <h3 className="text-2xl font-black text-gray-800 mt-1">{stat.value}</h3>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main: Dispatch Queue */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
//               <div className="flex items-center gap-3">
//                 <Package className="text-gray-400" size={20} />
//                 <h3 className="font-bold text-lg text-gray-800">Urgent Dispatch Queue</h3>
//               </div>
//               {urgentOrders.length > 0 && (
//                 <span className="badge badge-error text-white font-bold animate-pulse">
//                   {urgentOrders.length} Actions Needed
//                 </span>
//               )}
//             </div>
            
//             <div className="overflow-x-auto">
//               <table className="table w-full">
//                 <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
//                   <tr>
//                     <th className="pl-6">Order Ref</th>
//                     <th>Items</th>
//                     <th>Customer</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-sm">
//                   {urgentOrders.length === 0 ? (
//                     <tr>
//                       <td colSpan="4" className="text-center py-12 text-gray-400">
//                         <CheckCircle className="mx-auto w-10 h-10 mb-3 opacity-20" />
//                         <p className="font-medium">All caught up! No pending orders.</p>
//                       </td>
//                     </tr>
//                   ) : (
//                     urgentOrders.map((order) => (
//                       <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
//                         <td className="pl-6">
//                           <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
//                             #{order._id.slice(-6).toUpperCase()}
//                           </span>
//                         </td>
//                         <td>
//                           <div className="flex flex-col">
//                             <span className="font-bold text-gray-800">{order.cartItems[0]?.title}</span>
//                             <span className="text-xs text-gray-500">
//                               Size: {order.cartItems[0]?.selectedSize}
//                               {order.cartItems.length > 1 && ` (+${order.cartItems.length - 1} others)`}
//                             </span>
//                           </div>
//                         </td>
//                         <td>
//                           <div className="text-xs">
//                             <p className="font-bold text-gray-700">{order.location}</p>
//                             <p className="text-gray-500">{order.phone}</p>
//                           </div>
//                         </td>
//                         <td>
//                           <div className="flex gap-2">
//                             <button 
//                               onClick={() => handlePrint(order)}
//                               className="btn btn-square btn-ghost btn-sm text-gray-400 hover:text-gray-600 tooltip tooltip-left"
//                               data-tip="Print Label"
//                             >
//                               <Printer size={16} />
//                             </button>
//                             <button 
//                               onClick={() => markReady(order._id)}
//                               className="btn btn-sm btn-primary text-white shadow-md hover:shadow-lg transition-all"
//                             >
//                               Mark Ready
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar: Recent Activity */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center gap-3 mb-6">
//               <Activity className="text-primary" size={20} />
//               <h3 className="font-bold text-lg text-gray-800">Recent Activity</h3>
//             </div>
            
//             <div className="space-y-6">
//               {recentActivity.map((order, i) => (
//                 <div key={i} className="flex gap-4 relative">
//                   {i !== recentActivity.length - 1 && (
//                     <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-100"></div>
//                   )}
//                   <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-white shadow-sm ${
//                     order.status === 'Paid' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
//                   }`}>
//                     {order.status === 'Paid' ? <Clock size={16} /> : <CheckCircle size={16} />}
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold text-gray-800">
//                       Order #{order._id.slice(-6).toUpperCase()}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-0.5">
//                       {order.status === 'Paid' ? 'New order received' : 'Marked as ready for pickup'}
//                     </p>
//                     <p className="text-[10px] text-gray-400 mt-1 font-mono">
//                       {new Date(order.timestamp).toLocaleTimeString()}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
            
//             <div className="mt-6 pt-6 border-t border-gray-100">
//               <button className="btn btn-block btn-light btn-sm text-gray-500">View All History</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SupplierDashboard;
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Package, Clock, CheckCircle, TrendingUp, AlertCircle, 
  Loader, Printer, RefreshCw, DollarSign, Activity 
} from 'lucide-react';

const SupplierDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    revenue: 0,
    performance: '100%'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/supplier/orders');
      if (Array.isArray(res.data)) {
        const allOrders = res.data;
        setOrders(allOrders);
        calculateStats(allOrders);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (data) => {
    const pending = data.filter(o => o.status === 'Paid').length;
    const completed = data.filter(o => o.status === 'Ready' || o.status === 'Shipped').length;
    
    // Calculate Revenue (Original Logic)
    const totalRevenue = data
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0) * 0.7;

    setStats({
      pending,
      completed,
      revenue: Math.floor(totalRevenue),
      performance: '98%'
    });
  };

  const markReady = async (orderId) => {
    try {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Ready' } : o));
      calculateStats(orders.map(o => o._id === orderId ? { ...o, status: 'Ready' } : o));
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'Ready' });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchData(); 
    }
  };

  const handlePrint = (order) => {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head><title>Packing Slip - ${order._id}</title></head>
        <body style="font-family: monospace; padding: 20px;">
          <h1>PACKING SLIP</h1><hr/>
          <p><strong>Order Ref:</strong> ${order._id}</p>
          <p><strong>Customer:</strong> ${order.firstName} ${order.lastName}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          <p><strong>Location:</strong> ${order.location}</p><hr/>
          <h3>ITEMS:</h3>
          <ul>${order.cartItems.map(item => `<li>${item.title} (Size: ${item.selectedSize}) x${item.quantity}</li>`).join('')}</ul>
          <hr/><p>Authorized by: Vesto Supplier Portal</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const urgentOrders = orders.filter(o => o.status === 'Paid');
  const recentActivity = orders.slice(0, 3); 

  const statCards = [
    { title: 'Pending Dispatch', value: stats.pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Est. Earnings', value: `KES ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'On-Time Rate', value: stats.performance, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Supplier Overview</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Welcome back, <span className="font-bold text-gray-700">Nike Distributor</span>. Here is what's happening today.
          </p>
        </div>
        <button onClick={fetchData} disabled={refreshing} className="btn btn-sm btn-outline gap-2 w-full sm:w-auto">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Dispatch Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Package className="text-gray-400" size={20} />
                <h3 className="font-bold text-lg text-gray-800">Urgent Dispatch Queue</h3>
              </div>
              {urgentOrders.length > 0 && <span className="badge badge-error text-white font-bold animate-pulse">{urgentOrders.length} Actions</span>}
            </div>
            
            {/* Scrollable Table */}
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                  <tr><th className="pl-6">Order Ref</th><th>Items</th><th className="hidden sm:table-cell">Customer</th><th>Action</th></tr>
                </thead>
                <tbody className="text-sm">
                  {urgentOrders.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-12 text-gray-400">All caught up!</td></tr>
                  ) : (
                    urgentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="pl-6"><span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">#{order._id.slice(-6).toUpperCase()}</span></td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{order.cartItems[0]?.title}</span>
                            <span className="text-xs text-gray-500">Size: {order.cartItems[0]?.selectedSize} {order.cartItems.length > 1 && `+${order.cartItems.length-1}`}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <div className="text-xs">
                            <p className="font-bold text-gray-700">{order.location}</p>
                            <p className="text-gray-500">{order.phone}</p>
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button onClick={() => handlePrint(order)} className="btn btn-square btn-ghost btn-sm text-gray-400 hover:text-gray-600"><Printer size={16} /></button>
                            <button onClick={() => markReady(order._id)} className="btn btn-sm btn-primary text-white shadow-md">Mark Ready</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-primary" size={20} />
              <h3 className="font-bold text-lg text-gray-800">Recent Activity</h3>
            </div>
            <div className="space-y-6">
              {recentActivity.map((order, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== recentActivity.length - 1 && <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-100"></div>}
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-white shadow-sm ${order.status === 'Paid' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {order.status === 'Paid' ? <Clock size={16} /> : <CheckCircle size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.status === 'Paid' ? 'New order received' : 'Marked as ready for pickup'}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{new Date(order.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;