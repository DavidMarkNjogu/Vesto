import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import { ShoppingCart, Search, Star, SlidersHorizontal, Eye, X } from 'lucide-react';
import { syncProducts } from '../../utils/offlineSync';

// Animation Variants
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const store = useCartStore();
  const items = Array.isArray(store.items) ? store.items : [];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await syncProducts();
        setProducts(data || []);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    load();
  }, []);

  const getProductCartCount = (productId) => {
    return items
      .filter(item => String(item.productId || item.id) === String(productId))
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category || 'Uncategorized'))], [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (searchTerm) filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedCategory !== 'All') filtered = filtered.filter(p => (p.category || 'Uncategorized') === selectedCategory);
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Glass Header */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900 hidden md:block tracking-tight">
              SHOP <span className="text-gray-400 text-lg font-medium ml-2">({filteredProducts.length})</span>
            </h1>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search kicks..."
                  className="input input-bordered w-full pl-10 rounded-full bg-gray-100/50 border-gray-200 focus:bg-white focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className={`btn btn-circle md:hidden ${showMobileFilters ? 'btn-neutral' : 'btn-ghost bg-gray-100'}`}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                {showMobileFilters ? <X size={20}/> : <SlidersHorizontal size={20}/>}
              </button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex gap-3 items-center">
              <select className="select select-bordered rounded-full bg-white border-gray-200" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select className="select select-bordered rounded-full bg-white border-gray-200" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase ml-1">Category</span>
                    <select className="select select-bordered select-sm w-full mt-1 rounded-xl bg-gray-50" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase ml-1">Sort</span>
                    <select className="select select-bordered select-sm w-full mt-1 rounded-xl bg-gray-50" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="default">Default</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
            <button className="btn btn-link text-primary mt-4" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>Clear All Filters</button>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => {
              const qtyInCart = getProductCartCount(product._id);
              return (
                <motion.div
                  key={product._id}
                  variants={itemAnim}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative aspect-[4/4] bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      {product.rating >= 4.5 && (
                        <span className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <Star size={10} className="fill-yellow-400 text-yellow-400"/> {product.rating}
                        </span>
                      )}
                      {qtyInCart > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                          {qtyInCart} in Cart
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xl font-black text-gray-900">
                        <span className="text-xs font-normal text-gray-400 mr-1">KES</span>
                        {Number(product.price).toLocaleString()}
                      </span>
                      <button 
                        className="btn btn-circle btn-sm btn-primary text-white shadow-lg hover:scale-110 transition-transform"
                        onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
                      >
                        {qtyInCart > 0 ? <ShoppingCart size={16} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

// import { useEffect, useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import useCartStore from '../../store/cartStore';
// import { ShoppingCart, Search, Star, SlidersHorizontal, Eye, X } from 'lucide-react';
// import { syncProducts } from '../../utils/offlineSync';

// const ProductList = () => {
//   const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [sortBy, setSortBy] = useState('default');
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
  
//   const store = useCartStore();
//   const items = Array.isArray(store.items) ? store.items : [];

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const data = await syncProducts();
//         setProducts(data || []);
//       } catch (e) { console.error(e); } 
//       finally { setLoading(false); }
//     };
//     load();
//   }, []);

//   const getProductCartCount = (productId) => {
//     return items
//       .filter(item => String(item.productId || item.id) === String(productId))
//       .reduce((sum, item) => sum + (item.quantity || 0), 0);
//   };

//   const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category || 'Uncategorized'))], [products]);

//   const filteredProducts = useMemo(() => {
//     let filtered = [...products];
//     if (searchTerm) filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
//     if (selectedCategory !== 'All') filtered = filtered.filter(p => (p.category || 'Uncategorized') === selectedCategory);
//     if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
//     if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
//     if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
//     return filtered;
//   }, [products, searchTerm, selectedCategory, sortBy]);

//   if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       {/* Sticky Header */}
//       <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
//         <div className="container mx-auto px-4 py-3">
//           <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
//             <h1 className="text-xl font-bold text-gray-800 hidden md:block">Shop ({filteredProducts.length})</h1>
            
//             <div className="flex gap-2 w-full md:w-auto">
//               <div className="relative flex-1 md:w-80">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   className="input input-bordered input-sm w-full pl-9 rounded-full bg-gray-50 focus:bg-white transition-colors"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <button 
//                 className={`btn btn-sm btn-circle md:hidden ${showMobileFilters ? 'btn-neutral' : 'btn-outline border-gray-200'}`}
//                 onClick={() => setShowMobileFilters(!showMobileFilters)}
//               >
//                 {showMobileFilters ? <X size={16}/> : <SlidersHorizontal size={16}/>}
//               </button>
//             </div>

//             {/* Desktop Filters */}
//             <div className="hidden md:flex gap-3 items-center">
//               <select className="select select-bordered select-sm rounded-full bg-gray-50" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
//                 {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//               </select>
//               <select className="select select-bordered select-sm rounded-full bg-gray-50" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
//                 <option value="default">Sort By</option>
//                 <option value="price-low">Price: Low to High</option>
//                 <option value="price-high">Price: High to Low</option>
//               </select>
//             </div>
//           </div>

//           {/* Mobile Filters Panel */}
//           {showMobileFilters && (
//             <div className="md:hidden mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2">
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <span className="text-xs font-bold text-gray-400 uppercase ml-1">Category</span>
//                   <select className="select select-bordered select-sm w-full mt-1 rounded-lg" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
//                     {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <span className="text-xs font-bold text-gray-400 uppercase ml-1">Sort</span>
//                   <select className="select select-bordered select-sm w-full mt-1 rounded-lg" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
//                     <option value="default">Default</option>
//                     <option value="price-low">Price: Low to High</option>
//                     <option value="price-high">Price: High to Low</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Product Grid */}
//       <div className="container mx-auto px-4 py-6">
//         {filteredProducts.length === 0 ? (
//           <div className="text-center py-20">
//             <p className="text-gray-500 text-lg">No products found.</p>
//             <button className="btn btn-link text-primary" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>Clear Filters</button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {filteredProducts.map((product) => {
//               const qtyInCart = getProductCartCount(product._id);
//               return (
//                 <div
//                   key={product._id}
//                   className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
//                   onClick={() => navigate(`/product/${product._id}`)}
//                 >
//                   <div className="relative aspect-[4/3] sm:aspect-square bg-gray-100 overflow-hidden">
//                     <img
//                       src={product.image}
//                       alt={product.title}
//                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                       loading="lazy"
//                     />
//                     {/* Top Badges */}
//                     <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
//                       {product.rating >= 4.5 && (
//                         <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
//                           <Star size={10} className="fill-yellow-400 text-yellow-400"/> {product.rating}
//                         </span>
//                       )}
//                       {qtyInCart > 0 && (
//                         <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
//                           {qtyInCart} in Cart
//                         </span>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="p-4 flex flex-col flex-1">
//                     <div className="mb-2">
//                       <p className="text-xs text-gray-500 font-medium">{product.category}</p>
//                       <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
//                         {product.title}
//                       </h3>
//                     </div>
                    
//                     <div className="mt-auto flex items-center justify-between">
//                       <span className="text-lg font-black text-gray-900">
//                         KES {Number(product.price).toLocaleString()}
//                       </span>
//                       <button 
//                         className="btn btn-circle btn-sm btn-primary text-white shadow-md hover:scale-110 transition-transform"
//                         onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
//                       >
//                         {qtyInCart > 0 ? <ShoppingCart size={16} /> : <Eye size={16} />}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductList;
// import { useEffect, useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import useCartStore from '../../store/cartStore';
// import { ShoppingCart, Search, Star, SlidersHorizontal, Eye } from 'lucide-react';
// import { syncProducts } from '../../utils/offlineSync';

// const ProductList = () => {
//   const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Search & Filter State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [sortBy, setSortBy] = useState('default');
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
  
//   // Safe Store Access (THE FIX)
//   const store = useCartStore();
//   // Ensure items is always an array, even if store is corrupted
//   const items = Array.isArray(store.items) ? store.items : [];

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const productsData = await syncProducts();
//       setProducts(productsData || []); 
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       setError('Unable to load products. Using cached data.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Robust Cart Count Logic
//   const getProductCartCount = (productId) => {
//     if (!items || items.length === 0) return 0; // Guard clause
    
//     return items
//       .filter(item => {
//         // Handle both string IDs and MongoDB ObjectIds
//         const itemId = item.productId || item.id;
//         return String(itemId) === String(productId);
//       })
//       .reduce((sum, item) => sum + (item.quantity || 0), 0);
//   };

//   // ... (Rest of the component remains the same, just keeping the fix focused)

//   // Derived Data
//   const categories = useMemo(() => {
//     const cats = ['All', ...new Set(products.map(p => p.category || 'Uncategorized'))];
//     return cats;
//   }, [products]);

//   const filteredProducts = useMemo(() => {
//     let filtered = [...products];

//     if (searchTerm) {
//       filtered = filtered.filter(product =>
//         product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
//       );
//     }

//     if (selectedCategory !== 'All') {
//       filtered = filtered.filter(product => 
//         (product.category || 'Uncategorized') === selectedCategory
//       );
//     }

//     switch (sortBy) {
//       case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
//       case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
//       case 'rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
//       case 'name': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
//       default: break;
//     }
//     return filtered;
//   }, [products, searchTerm, selectedCategory, sortBy]);

//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating || 0);
//     const hasHalfStar = (rating || 0) % 1 >= 0.5;
//     for (let i = 0; i < fullStars; i++) stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
//     if (hasHalfStar && fullStars < 5) stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
//     return stars;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <span className="loading loading-spinner loading-lg text-primary"></span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       {/* Header & Search */}
//       <div className="bg-white shadow-sm sticky top-16 z-30 px-4 py-4">
//         <div className="container mx-auto">
//           <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
//             <h1 className="text-2xl font-bold text-gray-800 self-start md:self-center">
//               Shop ({filteredProducts.length})
//             </h1>
            
//             <div className="flex gap-2 w-full md:w-auto">
//               <div className="relative flex-1 md:w-64">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search shoes..."
//                   className="input input-bordered input-sm w-full pl-9 focus:ring-1 focus:ring-primary"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <button 
//                 className="btn btn-sm btn-outline md:hidden"
//                 onClick={() => setShowMobileFilters(!showMobileFilters)}
//               >
//                 <SlidersHorizontal size={16} />
//               </button>
//             </div>
//           </div>

//           <div className="hidden md:flex gap-4 mt-4 items-center overflow-x-auto pb-2 scrollbar-hide">
//             <select 
//               className="select select-bordered select-sm"
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//             >
//               {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//             </select>
            
//             <select 
//               className="select select-bordered select-sm"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//             >
//               <option value="default">Sort: Default</option>
//               <option value="price-low">Price: Low to High</option>
//               <option value="price-high">Price: High to Low</option>
//               <option value="rating">Top Rated</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {showMobileFilters && (
//         <div className="md:hidden bg-white border-b border-gray-100 p-4 animate-slide-in">
//           <div className="space-y-4">
//             <div>
//               <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {categories.map(cat => (
//                   <button 
//                     key={cat}
//                     onClick={() => setSelectedCategory(cat)}
//                     className={`badge badge-lg ${selectedCategory === cat ? 'badge-primary text-white' : 'badge-ghost'}`}
//                   >
//                     {cat}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <label className="text-xs font-bold text-gray-500 uppercase">Sort By</label>
//               <select 
//                 className="select select-bordered select-sm w-full mt-2"
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//               >
//                 <option value="default">Default</option>
//                 <option value="price-low">Price: Low to High</option>
//                 <option value="price-high">Price: High to Low</option>
//               </select>
//             </div>
//             <button 
//               className="btn btn-block btn-primary btn-sm text-white"
//               onClick={() => setShowMobileFilters(false)}
//             >
//               Apply Filters
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="container mx-auto px-4 py-6">
//         {filteredProducts.length === 0 ? (
//           <div className="text-center py-20 bg-white rounded-xl shadow-sm">
//             <p className="text-gray-500">No products found matching your criteria.</p>
//             <button 
//               className="btn btn-link text-primary"
//               onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
//             >
//               Reset Filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {filteredProducts.map((product) => {
//               const qtyInCart = getProductCartCount(product._id);
//               return (
//                 <div
//                   key={product._id}
//                   className="card bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
//                   onClick={() => navigate(`/product/${product._id}`)}
//                 >
//                   <figure className="relative h-64 overflow-hidden bg-gray-50">
//                     <img
//                       src={product.image || 'https://via.placeholder.com/400x300'}
//                       alt={product.title}
//                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                       loading="lazy"
//                     />
//                     <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
//                       {product.category && (
//                         <span className="badge badge-sm bg-white/90 backdrop-blur text-xs font-medium">
//                           {product.category}
//                         </span>
//                       )}
//                       {qtyInCart > 0 && (
//                         <span className="badge badge-sm badge-secondary text-white shadow-md">
//                           {qtyInCart} in Cart
//                         </span>
//                       )}
//                     </div>
//                   </figure>
                  
//                   <div className="card-body p-4">
//                     <div className="flex justify-between items-start">
//                       <h2 className="card-title text-base font-bold text-gray-800 line-clamp-1">
//                         {product.title}
//                       </h2>
//                     </div>
                    
//                     <div className="flex items-center gap-1 mt-1">
//                       {renderStars(product.rating)}
//                       <span className="text-xs text-gray-400">({product.rating || 0})</span>
//                     </div>

//                     <div className="mt-4 flex items-center justify-between">
//                       <div className="flex flex-col">
//                         <span className="text-xs text-gray-400">Price</span>
//                         <span className="text-xl font-bold text-primary">
//                           KES {product.price.toLocaleString()}
//                         </span>
//                       </div>
                      
//                       <button 
//                         className="btn btn-circle btn-sm btn-primary text-white shadow-lg hover:scale-105 transition-transform"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           navigate(`/product/${product._id}`);
//                         }}
//                       >
//                         {qtyInCart > 0 ? <ShoppingCart size={16} /> : <Eye size={16} />}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductList;



