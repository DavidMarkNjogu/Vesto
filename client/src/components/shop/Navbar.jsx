import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, Heart } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const Navbar = () => {
  const { items } = useCartStore();
  const cartCount = (items || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-8">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter text-gray-900 flex-shrink-0 group">
          Vesto<span className="text-primary group-hover:text-primary/80 transition-colors">.</span>
        </Link>

        {/* Desktop Links - Centered */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
          <Link to="/products?category=Sneakers" className="hover:text-primary transition-colors">Sneakers</Link>
          <Link to="/products?category=Boots" className="hover:text-primary transition-colors">Boots</Link>
        </div>

        {/* Icons Area */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button className="btn btn-ghost btn-circle btn-sm hover:bg-gray-100 hidden sm:flex">
            <Search size={20} className="text-gray-600" />
          </button>
          
          <Link to="/wishlist" className="btn btn-ghost btn-circle btn-sm hover:bg-gray-100 hidden sm:flex">
            <Heart size={20} className="text-gray-600" />
          </Link>

          <Link to="/login" className="btn btn-ghost btn-circle btn-sm hover:bg-gray-100 hidden sm:flex">
            <User size={20} className="text-gray-600" />
          </Link>

          <Link to="/cart" className="btn btn-ghost btn-circle btn-sm hover:bg-gray-100 relative group">
            <ShoppingCart size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white transform group-hover:scale-110 transition-transform">
                {cartCount}
              </span>
            )}
          </Link>

          <button className="btn btn-ghost btn-circle btn-sm md:hidden hover:bg-gray-100">
            <Menu size={24} className="text-gray-900" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// import { Link } from 'react-router-dom';
// import { ShoppingCart } from 'lucide-react';
// import useCartStore from '../../store/cartStore';

// const Navbar = () => {
//   const { items } = useCartStore();
//   const cartCount = (items || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

//   return (
//     <nav className="bg-white shadow-sm sticky top-0 z-50">
//       <div className="container mx-auto px-4 h-16 flex items-center justify-between">
//         <Link to="/" className="text-2xl font-bold text-primary">Vesto</Link>
//         <Link to="/cart" className="btn btn-ghost relative">
//           <ShoppingCart />
//           {cartCount > 0 && (
//             <span className="badge badge-secondary badge-sm absolute top-0 right-0">{cartCount}</span>
//           )}
//         </Link>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;