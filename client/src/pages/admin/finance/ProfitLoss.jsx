import { DollarSign, TrendingDown } from 'lucide-react';
import StatCard from '../../../components/admin/StatCard';

const ProfitLoss = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h1 className="text-xl font-bold text-gray-800">Profit & Loss</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Gross Revenue" value="KES 1.2M" icon={DollarSign} color="green" trend="up" trendValue="+15%" />
        <StatCard title="Expenses" value="KES 350K" icon={TrendingDown} color="red" trend="down" trendValue="-2%" />
        <StatCard title="Net Profit" value="KES 850K" icon={DollarSign} color="blue" trend="up" trendValue="+10%" />
      </div>
    </div>
  );
};

export default ProfitLoss;