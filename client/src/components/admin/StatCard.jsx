import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }) => {
  const isPositive = trend === 'up';
  
  // Color mapping for dynamic backgrounds
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-gray-800 mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.text}`}>
          <Icon size={24} />
        </div>
      </div>
      
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend && (
            <span className={`flex items-center font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {trendValue}
            </span>
          )}
          <span className="text-gray-400 font-medium">{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;