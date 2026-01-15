import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Truck, Settings, 
  LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const SupplierSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { path: '/supplier', title: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/supplier/products', title: 'My Inventory', icon: Package },
    { path: '/supplier/shipments', title: 'Shipments', icon: Truck },
    { path: '/supplier/settings', title: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/50">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-white bg-clip-text text-transparent">
            Vesto<span className="text-teal-500 font-black">.</span>
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20 font-medium' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <item.icon size={20} className={isCollapsed ? 'mx-auto' : ''} />
            {!isCollapsed && <span>{item.title}</span>}
            
            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                {item.title}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default SupplierSidebar;