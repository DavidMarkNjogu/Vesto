import { DollarSign, TrendingDown } from 'lucide-react';
import StatCard from '../../../components/admin/StatCard';

const ProfitLoss = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Profit & Loss Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Gross Revenue" value="KES 1.2M" icon={DollarSign} color="green" trend="up" trendValue="+15%" />
        <StatCard title="Expenses" value="KES 350K" icon={TrendingDown} color="red" trend="down" trendValue="-2%" />
        <StatCard title="Net Profit" value="KES 850K" icon={DollarSign} color="blue" trend="up" trendValue="+10%" />
      </div>
      {/* Add detailed charts/tables here later */}
    </div>
  );
};

export default ProfitLoss;