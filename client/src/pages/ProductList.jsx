import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';
import { ShoppingCart, Plus, Minus, Search, Star, Filter, X } from 'lucide-react';
import { syncProducts, isOnline } from '../utils/offlineSync';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const { items, addItem, removeItem, updateQuantity } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsData = await syncProducts();
      setProducts(productsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Unable to load products. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantity = (productId) => {
    const item = items.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category || 'Uncategorized'))];
    return cats;
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        (product.category || 'Uncategorized') === selectedCategory
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-600">Loading amazing shoes...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-bg py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary mb-8 text-center">
            Vesto Shoes - Kenyan Shoe Store
          </h1>
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No products available</p>
            <p className="text-gray-500">Please check if the server is running and MongoDB is connected.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Products */}
      <FeaturedProducts />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-primary mb-2">
            All Products
          </h2>
          <p className="text-lg text-gray-600">Browse our complete collection</p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="badge badge-primary badge-lg">
              {filteredProducts.length} Products
            </div>
            {error && (
              <div className="badge badge-warning badge-lg">
                ⚠️ Demo Mode
              </div>
            )}
          </div>
          {error && (
            <div className="alert alert-info mt-4 max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search shoes..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="card bg-base-100 shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Category</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Sort By</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(searchTerm || selectedCategory !== 'All') && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <div className="badge badge-primary gap-2">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedCategory !== 'All' && (
                <div className="badge badge-secondary gap-2">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">No products found</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSortBy('default');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const quantity = getItemQuantity(product._id);
              return (
              <div
                key={product._id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-transparent hover:border-primary cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <figure className="relative overflow-hidden">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x300?text=Vesto+Shoes'}
                    alt={product.title}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {product.category && (
                      <div className="badge badge-secondary badge-sm">{product.category}</div>
                    )}
                    <div className="badge badge-primary badge-sm">New</div>
                  </div>
                  {product.rating && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold">{product.rating}</span>
                    </div>
                  )}
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-lg">{product.title}</h2>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  )}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                    </div>
                  )}
                  <p className="text-2xl font-bold text-secondary">
                    KES {product.price.toLocaleString()}
                  </p>
                  <div className="card-actions justify-end mt-4" onClick={(e) => e.stopPropagation()}>
                    {quantity === 0 ? (
                      <button
                        className="btn btn-primary w-full hover:btn-secondary transition-colors"
                        onClick={() => addItem(product)}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          className="btn btn-sm btn-outline hover:btn-error"
                          onClick={() => {
                            if (quantity === 1) {
                              removeItem(product._id);
                            } else {
                              updateQuantity(product._id, quantity - 1);
                            }
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center font-semibold text-lg">
                          {quantity}
                        </span>
                        <button
                          className="btn btn-sm btn-outline hover:btn-success"
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
