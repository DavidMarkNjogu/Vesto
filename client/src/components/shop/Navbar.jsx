import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const Navbar = () => {
  const { items } = useCartStore();
  const cartCount = (items || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">Vesto</Link>
        <Link to="/cart" className="btn btn-ghost relative">
          <ShoppingCart />
          {cartCount > 0 && (
            <span className="badge badge-secondary badge-sm absolute top-0 right-0">{cartCount}</span>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;