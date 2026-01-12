import { Package, Clock, CheckCircle, TrendingUp } from 'lucide-react';

const SupplierDashboard = () => {
  // Mock Data for now - will connect to API later
  const stats = [
    { title: 'Pending Shipments', value: 12, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Completed This Week', value: 45, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Total Products', value: 128, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Performance', value: '98%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Supplier Overview</h1>
        <p className="text-gray-500">Welcome back. You have <span className="text-primary font-bold">12 items</span> to dispatch.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Urgent Dispatch Required</h3>
          <span className="badge badge-warning text-xs">Action Needed</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th>Order Ref</th>
                <th>Item</th>
                <th>Variant</th>
                <th>Time Left</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: 'ORD-9921', item: 'Nike Air Force 1', variant: '42 / White', time: '2 hrs' },
                { id: 'ORD-9925', item: 'Jordan Retro 4', variant: '44 / Black', time: '4 hrs' },
                { id: 'ORD-9928', item: 'Timberland Boot', variant: '41 / Wheat', time: '5 hrs' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="font-mono font-bold">{row.id}</td>
                  <td>{row.item}</td>
                  <td><span className="badge badge-ghost">{row.variant}</span></td>
                  <td className="text-red-500 font-bold">{row.time}</td>
                  <td>
                    <button className="btn btn-xs btn-primary text-white">Mark Ready</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;