import { LayoutDashboard, Package, ShoppingBag, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isCollapsed, setIsCollapsed, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'overview', title: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', title: 'Products', icon: Package },
    { id: 'orders', title: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className={`bg-primary text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} h-screen fixed left-0 top-0 overflow-y-auto z-20 flex flex-col shadow-xl`}>
      {/* Header */}
      <div className="p-4 mb-6 bg-white/10 mx-3 mt-3 rounded-xl flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
             <span className="text-primary font-bold text-xl">V</span>
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
                <h1 className="font-bold text-white leading-tight tracking-wide">VESTO</h1>
                <p className="text-[10px] text-white/70 uppercase tracking-widest">Admin</p>
            </div>
          )}
        </div>
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
        >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium group relative ${
              activeTab === item.id 
                ? 'bg-secondary text-white shadow-md translate-x-1' 
                : 'hover:bg-white/10 text-white/80 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            
            {!isCollapsed && <span>{item.title}</span>}
            
            {/* Tooltip for Collapsed State */}
            {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.title}
                </div>
            )}
          </button>
        ))}
      </nav>
      
      {/* Footer User Info */}
      <div className="p-4 bg-black/20 mt-auto border-t border-white/5">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-secondary border-2 border-white/20 flex items-center justify-center text-xs font-bold shadow-sm">
                AD
            </div>
            {!isCollapsed && (
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold truncate">Admin User</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <LogOut size={10} /> Logout
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;