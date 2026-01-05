import { Search, Bell, Settings } from 'lucide-react';

const AdminTopbar = ({ isCollapsed, title }) => {
  return (
    <div className={`h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 transition-all duration-300 fixed top-0 right-0 z-10 ${isCollapsed ? 'left-20' : 'left-64'}`}>
      
      {/* Breadcrumb / Title */}
      <div>
         <h2 className="text-xl font-bold text-gray-800 capitalize tracking-tight">{title}</h2>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search database..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <button className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border-2 border-white animate-pulse"></span>
            </button>

            <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;