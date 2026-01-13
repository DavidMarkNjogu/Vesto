import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import { ShoppingCart, Search, Star, SlidersHorizontal, Eye } from 'lucide-react';
import { syncProducts } from '../../utils/offlineSync';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Safe Store Access (THE FIX)
  const store = useCartStore();
  // Ensure items is always an array, even if store is corrupted
  const items = Array.isArray(store.items) ? store.items : [];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsData = await syncProducts();
      setProducts(productsData || []); 
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Unable to load products. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  // Robust Cart Count Logic
  const getProductCartCount = (productId) => {
    if (!items || items.length === 0) return 0; // Guard clause
    
    return items
      .filter(item => {
        // Handle both string IDs and MongoDB ObjectIds
        const itemId = item.productId || item.id;
        return String(itemId) === String(productId);
      })
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // ... (Rest of the component remains the same, just keeping the fix focused)

  // Derived Data
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category || 'Uncategorized'))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        (product.category || 'Uncategorized') === selectedCategory
      );
    }

    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'name': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: break;
    }
    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    if (hasHalfStar && fullStars < 5) stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header & Search */}
      <div className="bg-white shadow-sm sticky top-16 z-30 px-4 py-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 self-start md:self-center">
              Shop ({filteredProducts.length})
            </h1>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search shoes..."
                  className="input input-bordered input-sm w-full pl-9 focus:ring-1 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-sm btn-outline md:hidden"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>

          <div className="hidden md:flex gap-4 mt-4 items-center overflow-x-auto pb-2 scrollbar-hide">
            <select 
              className="select select-bordered select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            
            <select 
              className="select select-bordered select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <div className="md:hidden bg-white border-b border-gray-100 p-4 animate-slide-in">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`badge badge-lg ${selectedCategory === cat ? 'badge-primary text-white' : 'badge-ghost'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Sort By</label>
              <select 
                className="select select-bordered select-sm w-full mt-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            <button 
              className="btn btn-block btn-primary btn-sm text-white"
              onClick={() => setShowMobileFilters(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No products found matching your criteria.</p>
            <button 
              className="btn btn-link text-primary"
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const qtyInCart = getProductCartCount(product._id);
              return (
                <div
                  key={product._id}
                  className="card bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <figure className="relative h-64 overflow-hidden bg-gray-50">
                    <img
                      src={product.image || 'https://via.placeholder.com/400x300'}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      {product.category && (
                        <span className="badge badge-sm bg-white/90 backdrop-blur text-xs font-medium">
                          {product.category}
                        </span>
                      )}
                      {qtyInCart > 0 && (
                        <span className="badge badge-sm badge-secondary text-white shadow-md">
                          {qtyInCart} in Cart
                        </span>
                      )}
                    </div>
                  </figure>
                  
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <h2 className="card-title text-base font-bold text-gray-800 line-clamp-1">
                        {product.title}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-400">({product.rating || 0})</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Price</span>
                        <span className="text-xl font-bold text-primary">
                          KES {product.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <button 
                        className="btn btn-circle btn-sm btn-primary text-white shadow-lg hover:scale-105 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product._id}`);
                        }}
                      >
                        {qtyInCart > 0 ? <ShoppingCart size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;