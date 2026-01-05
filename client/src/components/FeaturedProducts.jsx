import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react';
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
      // OG FIX: Robust check to prevent crash if sync returns null
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
    <section id="products" className="py-16 bg-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg">
            Our most popular and highly rated shoes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <figure className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                />
                {product.rating && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">{product.rating}</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <div className="badge badge-secondary">Featured</div>
                </div>
              </figure>
              <div className="card-body">
                <Link to={`/product/${product._id}`}>
                  <h3 className="card-title line-clamp-1">{product.title}</h3>
                </Link>
                <p className="text-2xl font-bold text-secondary">
                  KES {product.price.toLocaleString()}
                </p>
                <div className="card-actions justify-end mt-4">
                  {/* OG FIX: Redirect to Detail Page instead of instant add.
                      This prevents adding items without a selected size/variant. */}
                  <button
                    className="btn btn-primary w-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product._id}`);
                    }}
                  >
                    View Options <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/" className="btn btn-outline btn-primary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;