import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ArrowRight, ShoppingBag } from 'lucide-react';
import { syncProducts } from '../utils/offlineSync';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const productsData = await syncProducts();
      const featured = (productsData || [])
        .filter(p => (p.rating || 0) >= 4.5)
        .slice(0, 4);
      setProducts(featured);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  if (products.length === 0) return null;

  return (
    <section id="products" className="bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 sm:mb-12 gap-4">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Featured Drops
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Our most popular and highly rated selections for the week.
            </p>
          </div>
          <Link to="/products" className="text-primary font-bold hover:text-primary/80 flex items-center gap-2 group text-sm sm:text-base">
            View All Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden border border-gray-100 flex flex-col"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-900 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {product.rating}
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Featured
                  </span>
                </div>
                
                {/* Desktop Hover Action */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden lg:block">
                  <button className="btn btn-primary w-full shadow-lg border-none text-white gap-2 rounded-xl">
                    <ShoppingBag size={18} /> View Options
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-black text-gray-900">
                    KES {Number(product.price).toLocaleString()}
                  </span>
                  <div className="lg:hidden w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-900">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;