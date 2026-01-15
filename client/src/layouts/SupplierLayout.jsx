import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Package, LogOut, Menu, X, Settings, Box } from 'lucide-react';
import useAuthStore from '../store/authStore';

const SupplierLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { path: '/supplier', title: 'Dashboard', icon: Package },
    { path: '/supplier/shipments', title: 'My Shipments', icon: Truck },
    { path: '/supplier/products', title: 'Inventory', icon: Box },
    { path: '/supplier/settings', title: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 flex flex-col shadow-xl`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-slate-950/30">
          <span className="text-xl font-bold tracking-tight">Vesto<span className="text-teal-400">Partner</span></span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                location.pathname === item.path 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-slate-950/30">
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full px-4 py-2 hover:bg-red-500/10 rounded-lg"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600 p-2 -ml-2">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">Nike Distributor LTD</p>
              <p className="text-xs text-gray-500">Supplier ID: #SUP-882</p>
            </div>
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold border border-teal-100 shadow-sm">
              ND
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupplierLayout;

// import { useState } from 'react';
// import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// import { Truck, Package, LogOut, Menu, X, Settings, Box } from 'lucide-react';
// import useAuthStore from '../store/authStore';

// const SupplierLayout = () => {
//   const [isSidebarOpen, setSidebarOpen] = useState(true);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const logout = useAuthStore((state) => state.logout);

//   const menuItems = [
//     { path: '/supplier', title: 'Dashboard', icon: Package },
//     { path: '/supplier/shipments', title: 'My Shipments', icon: Truck },
//     { path: '/supplier/products', title: 'Inventory', icon: Box }, // NEW
//     { path: '/supplier/settings', title: 'Settings', icon: Settings }, // NEW
//   ];

//   return (
//     <div className="flex h-screen bg-gray-50 font-sans">
//       {/* Sidebar */}
//       <aside 
//         className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${
//           isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         } md:relative md:translate-x-0`}
//       >
//         <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
//           <span className="text-xl font-bold tracking-tight">Vesto<span className="text-secondary">Partner</span></span>
//           <button onClick={() => setSidebarOpen(false)} className="md:hidden">
//             <X size={20} />
//           </button>
//         </div>

//         <nav className="p-4 space-y-2">
//           {menuItems.map((item) => (
//             <button
//               key={item.path}
//               onClick={() => navigate(item.path)}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                 location.pathname === item.path 
//                   ? 'bg-secondary text-white shadow-lg' 
//                   : 'hover:bg-white/10 text-slate-400 hover:text-white'
//               }`}
//             >
//               <item.icon size={20} />
//               <span className="font-medium">{item.title}</span>
//             </button>
//           ))}
//         </nav>

//         <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
//           <button 
//             onClick={logout}
//             className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2 hover:bg-white/5 rounded-lg"
//           >
//             <LogOut size={20} />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
//           <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
//             <Menu size={24} />
//           </button>
//           <div className="flex items-center gap-4 ml-auto">
//             <div className="text-right hidden sm:block">
//               <p className="text-sm font-bold text-gray-800">Nike Distributor LTD</p>
//               <p className="text-xs text-gray-500">Supplier ID: #SUP-882</p>
//             </div>
//             <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">
//               ND
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 overflow-y-auto p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default SupplierLayout;