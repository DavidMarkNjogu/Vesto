import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, 
  Settings, LogOut, ChevronLeft, ChevronRight, PieChart
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { path: '/admin', title: 'Overview', icon: LayoutDashboard, exact: true },
    { path: '/admin/orders', title: 'Orders', icon: ShoppingBag },
    { path: '/admin/inventory', title: 'Inventory', icon: Package },
    { path: '/admin/customers', title: 'Customers', icon: Users },
    { path: '/admin/finance', title: 'Finance', icon: PieChart },
    { path: '/admin/settings', title: 'Settings', icon: Settings },
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
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Vesto<span className="text-primary font-black">.</span>
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
                ? 'bg-primary text-white shadow-lg shadow-primary/25 font-medium' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <item.icon size={20} className={isCollapsed ? 'mx-auto' : ''} />
            {!isCollapsed && <span>{item.title}</span>}
            
            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
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

export default AdminSidebar;
// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   LayoutDashboard, ShoppingBag, Package, Users, 
//   Settings, LogOut, BarChart3, ChevronLeft, ChevronRight 
// } from 'lucide-react';
// import useAuthStore from '../../store/authStore';

// const AdminSidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const logout = useAuthStore((state) => state.logout);
  
//   // Local state for UI collapse (Restored from Old Code)
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Expanded Menu Items (From New Code)
//   const menuItems = [
//     { path: '/admin', title: 'Overview', icon: LayoutDashboard },
//     { path: '/admin/orders', title: 'Orders', icon: ShoppingBag },
//     { path: '/admin/inventory', title: 'Inventory', icon: Package },
//     { path: '/admin/customers', title: 'Customers', icon: Users },
//     { path: '/admin/finance', title: 'Finance', icon: BarChart3 },
//     { path: '/admin/settings', title: 'Settings', icon: Settings },
//   ];

//   return (
//     <div 
//       className={`h-screen bg-teal-900 text-white flex flex-col fixed left-0 top-0 border-r border-teal-800 transition-all duration-300 shadow-xl z-20 ${
//         isCollapsed ? 'w-20' : 'w-64'
//       }`}
//     >
//       {/* --- HEADER --- */}
//       <div className="h-16 flex items-center justify-between px-4 border-b border-teal-800 bg-teal-900/50 backdrop-blur-sm">
//         <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
//           <span className="text-xl font-bold tracking-tight whitespace-nowrap">
//             Vesto<span className="text-teal-400">Admin</span>
//           </span>
//         </div>
        
//         {/* Toggle Button (Restored) */}
//         <button 
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className={`p-1.5 rounded-lg hover:bg-teal-800 text-teal-200 hover:text-white transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
//         >
//           {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>

//       {/* --- NAVIGATION --- */}
//       <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
//         {menuItems.map((item) => {
//           const isActive = location.pathname === item.path;
//           return (
//             <button
//               key={item.path}
//               onClick={() => navigate(item.path)}
//               className={`group w-full flex items-center relative rounded-lg transition-all duration-200 ${
//                 isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
//               } ${
//                 isActive 
//                   ? 'bg-teal-800 text-white shadow-lg shadow-teal-900/20' 
//                   : 'text-teal-100 hover:bg-teal-800/50 hover:text-white'
//               }`}
//             >
//               {/* Icon */}
//               <item.icon 
//                 size={22} 
//                 strokeWidth={isActive ? 2.5 : 2} 
//                 className={`transition-transform duration-300 ${isActive && !isCollapsed ? 'scale-110' : ''}`}
//               />
              
//               {/* Text Label (Hidden if Collapsed) */}
//               <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
//                 isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'
//               }`}>
//                 {item.title}
//               </span>

//               {/* Tooltip for Collapsed Mode (Restored) */}
//               {isCollapsed && (
//                 <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-gray-700">
//                   {item.title}
//                 </div>
//               )}
//             </button>
//           );
//         })}
//       </nav>

//       {/* --- FOOTER / LOGOUT --- */}
//       <div className="p-3 border-t border-teal-800 bg-teal-900">
//         <button 
//           onClick={logout} // WIRED UP: Uses authStore action
//           className={`flex items-center w-full rounded-lg transition-colors group hover:bg-red-500/10 ${
//             isCollapsed ? 'justify-center py-3 px-2' : 'gap-3 px-4 py-3'
//           }`}
//         >
//           <LogOut 
//             size={20} 
//             className="text-teal-200 group-hover:text-red-400 transition-colors" 
//           />
          
//           {!isCollapsed && (
//             <span className="font-medium text-teal-200 group-hover:text-red-300 transition-colors">
//               Logout
//             </span>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdminSidebar;