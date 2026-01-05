import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-primary transition-colors">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;