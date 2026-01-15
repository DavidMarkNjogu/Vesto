import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminTopbar = ({ isCollapsed }) => {
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Close dropdowns when clicking outside
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      className={`fixed top-0 right-0 z-40 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
        <Search className="text-gray-400 w-4 h-4 mr-2" />
        <input 
          type="text" 
          placeholder="Global search..." 
          className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
        />
        <div className="flex text-[10px] text-gray-400 font-mono border border-gray-300 rounded px-1.5">⌘K</div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="btn btn-ghost btn-circle btn-sm text-gray-500 relative"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-50">
                <h3 className="font-bold text-sm text-gray-800">Notifications</h3>
              </div>
              <div className="py-2">
                <div className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <p className="text-sm font-medium text-gray-800">New Order #1234</p>
                  <p className="text-xs text-gray-500 mt-0.5">Alice placed an order for KES 4,500</p>
                  <p className="text-[10px] text-gray-400 mt-1">2 mins ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <p className="text-sm font-medium text-gray-800">Low Stock Alert</p>
                  <p className="text-xs text-gray-500 mt-0.5">Nike Air Max is running low (3 items)</p>
                  <p className="text-[10px] text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-50 text-center">
                <button className="text-xs text-primary font-bold hover:underline">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700 leading-none">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 mt-1">Administrator</p>
            </div>
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
              {(user?.name?.charAt(0) || 'A')}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-xs text-gray-500 uppercase font-bold">Signed in as</p>
                <p className="text-sm font-bold text-gray-800 truncate">{user?.email || 'admin@vesto.com'}</p>
              </div>
              
              <Link to="/admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                <SettingsIcon size={16} /> Settings
              </Link>
              <Link to="/admin/customers" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                <User size={16} /> Profile
              </Link>
              
              <div className="border-t border-gray-50 my-1"></div>
              
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;