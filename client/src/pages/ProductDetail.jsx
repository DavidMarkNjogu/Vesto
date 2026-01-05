import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';
import { ArrowLeft, ShoppingCart, Heart, Star, Check, X, Ruler, Plus, Minus } from 'lucide-react';
import { offlineDB } from '../utils/offlineDB';
import { isOnline } from '../utils/offlineSync';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // UI State
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkWishlist();
  }, [id]);

  const fetchProduct = async () => {
    try {
      let productData;
      if (isOnline()) {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        productData = response.data;
      } else {
        productData = await offlineDB.getProduct(id);
      }
      
      if (productData) {
        setProduct(productData);
        // Default Color Logic: Adapted for Variant Architecture
        if (productData.variants && productData.variants.length > 0) {
          // Get the first available color
          const firstVariant = productData.variants.find(v => v.stock > 0) || productData.variants[0];
          setSelectedColor(firstVariant.color);
        } else if (productData.colors && productData.colors.length > 0) {
           // Fallback for old data structure
           setSelectedColor(productData.colors[0]?.name || productData.colors[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    const inList = await offlineDB.isInWishlist(id);
    setInWishlist(inList);
  };

  // --- LOGIC: HELPER FUNCTIONS FOR VARIANTS ---

  // Get unique colors from variants
  const availableColors = useMemo(() => {
    if (!product) return [];
    if (product.variants) {
      return [...new Set(product.variants.map(v => v.color))];
    }
    // Fallback to old data
    return product.colors ? product.colors.map(c => c.name || c) : [];
  }, [product]);

  // Get sizes specific to the selected color
  const availableSizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    
    if (product.variants) {
      return product.variants
        .filter(v => v.color === selectedColor)
        .sort((a, b) => Number(a.size) - Number(b.size)); // Numeric sort
    }
    
    // Fallback to old data
    return product.sizes ? Object.keys(product.sizes) : ['39', '40', '41', '42', '43', '44'];
  }, [product, selectedColor]);

  // Find the specific SKU based on selection
  const currentVariant = useMemo(() => {
    if (!product || !product.variants || !selectedSize || !selectedColor) return null;
    return product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
  }, [product, selectedSize, selectedColor]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    // New SKU Logic
    if (product.variants && !currentVariant) {
        alert('Selected combination is unavailable');
        return;
    }

    if (currentVariant && currentVariant.stock < quantity) {
        alert(`Sorry, only ${currentVariant.stock} items left in stock.`);
        return;
    }

    const itemToAdd = {
      id: currentVariant ? currentVariant.sku : product._id, // Use SKU if available
      productId: product._id,
      sku: currentVariant ? currentVariant.sku : product._id,
      title: product.title,
      price: currentVariant ? (currentVariant.priceOverride || product.price) : product.price,
      image: product.images ? (product.images[selectedImageIndex] || product.images[0]) : product.image,
      selectedSize,
      selectedColor,
      quantity,
    };

    addItem(itemToAdd);
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  const toggleWishlist = async () => {
    if (inWishlist) {
      await offlineDB.removeFromWishlist(product._id);
    } else {
      await offlineDB.addToWishlist(product);
    }
    setInWishlist(!inWishlist);
  };

  const getStockStatus = (size) => {
    // New Logic for Variants
    if (product.variants) {
        const variant = product.variants.find(v => v.size === size && v.color === selectedColor);
        if (!variant) return 'unavailable';
        if (variant.stock === 0) return 'out-of-stock';
        if (variant.stock < 5) return 'low-stock';
        return 'available';
    }
    // Old Logic Fallback
    if (!product.sizes || !product.sizes[size]) return 'available';
    const stock = product.sizes[size].stock;
    if (stock === 0) return 'out-of-stock';
    if (stock < 5) return 'low-stock';
    return 'available';
  };

  const getSizeLabel = (size) => {
    const status = getStockStatus(size);
    if (status === 'out-of-stock') return 'Out of Stock';
    if (status === 'low-stock') return 'Low Stock';
    return 'Available';
  };

  // Image Gallery Logic
  const getImagesForDisplay = () => {
    if (product.images && product.images.length > 0) return product.images;
    return [product.image];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-bg"><div className="text-center"><p className="text-xl mb-4">Product not found</p><button className="btn btn-primary" onClick={() => navigate('/')}>Back to Shop</button></div></div>;

  const images = getImagesForDisplay();
  const currentPrice = currentVariant?.priceOverride || product.price;

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button className="btn btn-ghost mb-4" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery - Nike Style */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-lg h-[500px]">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.title}
                className="w-full h-full object-contain"
              />
              {product.rating && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{product.rating}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                    selectedImageIndex === index ? 'border-primary' : 'border-gray-300'
                  }`}
                >
                  <img src={img} alt={`${product.title} view ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
              {product.category && <span className="badge badge-secondary">{product.category}</span>}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-secondary">KES {currentPrice.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-2xl text-gray-400 line-through">KES {product.originalPrice.toLocaleString()}</p>
              )}
              {product.originalPrice && <span className="badge badge-error">SALE</span>}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-gray-600">({product.rating})</span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-bold text-lg mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Color Selection - ADAPTED FOR VARIANTS */}
            <div>
                <h3 className="font-bold text-lg mb-2">Color: {selectedColor || 'Select'}</h3>
                <div className="flex gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize(null); // Reset size on color change
                        setSelectedImageIndex(0);
                      }}
                      className={`px-4 py-2 border rounded-full font-semibold transition-all ${
                        selectedColor === color
                          ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                          : 'bg-white text-gray-700 hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
            </div>

            {/* Size Selection - ADAPTED FOR VARIANTS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Size: {selectedSize || 'Select Size'}</h3>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowSizeGuide(true)}>
                  <Ruler className="w-4 h-4 mr-1" /> Sizing Guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.variants ? (
                   // Render based on filtered variants
                   availableSizes.map((variant) => {
                      const size = variant.size;
                      const status = getStockStatus(size);
                      const isOutOfStock = status === 'out-of-stock';
                      const isLowStock = status === 'low-stock';
                      return (
                        <button
                          key={variant.sku}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          disabled={isOutOfStock}
                          className={`btn ${selectedSize === size ? 'btn-primary' : isOutOfStock ? 'btn-disabled opacity-50 line-through' : 'btn-outline'} ${isLowStock && !isOutOfStock ? 'border-warning' : ''}`}
                          title={getSizeLabel(size)}
                        >
                          {size}
                        </button>
                      );
                   })
                ) : (
                    // Fallback Render (Old Way)
                    (product.sizes ? Object.keys(product.sizes) : []).map(size => (
                        <button key={size} className="btn btn-outline">{size}</button>
                    ))
                )}
              </div>
              {selectedSize && (
                <p className="text-sm text-gray-600 mt-2">
                  {getSizeLabel(selectedSize)}
                  {getStockStatus(selectedSize) === 'low-stock' && <span className="text-warning ml-2">⚠️ Hurry, only a few left!</span>}
                </p>
              )}
            </div>

            {/* Quantity Selector - RESTORED AND IMPROVED */}
            <div>
              <h3 className="font-bold text-lg mb-2">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="join border border-base-300 rounded-lg">
                    <button className="btn btn-ghost join-item px-3" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Minus className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost join-item no-animation cursor-default font-bold text-lg w-12">
                        {quantity}
                    </button>
                    <button 
                        className="btn btn-ghost join-item px-3" 
                        onClick={() => setQuantity(Math.min(currentVariant?.stock || 5, quantity + 1))}
                        disabled={currentVariant && quantity >= currentVariant.stock}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                {quantity > 1 && <span className="text-gray-500 font-medium">Total: KES {(currentPrice * quantity).toLocaleString()}</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                className="btn btn-primary flex-1 text-lg"
                onClick={handleAddToCart}
                disabled={!currentVariant || currentVariant.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {currentVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                className="btn btn-secondary flex-1 text-lg"
                onClick={() => {
                   if (currentVariant?.stock > 0) {
                       handleAddToCart();
                       navigate('/checkout');
                   }
                }}
                disabled={!currentVariant || currentVariant.stock === 0}
              >
                Buy It Now
              </button>
              <button className={`btn btn-ghost ${inWishlist ? 'text-red-500' : ''}`} onClick={toggleWishlist}>
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Pickup Info - Kicks Kenya Style */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h4 className="font-bold">Pickup Available</h4>
                <p className="text-sm">Nakuru - Usually ready in 1 hour</p>
                <p className="text-xs text-gray-600">Check availability at other stores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Size Guide Modal - RESTORED */}
        {showSizeGuide && (
          <div className="modal modal-open bg-black/50 backdrop-blur-sm">
            <div className="modal-box max-w-2xl relative">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setShowSizeGuide(false)}>
                  <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Ruler className="text-primary"/> Sizing Guide</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-center">
                  <thead>
                    <tr className="bg-base-200">
                      <th>EU Size</th><th>UK Size</th><th>US Size</th><th>Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { eu: '36', uk: '3.5', us: '4', cm: '23' },
                      { eu: '37', uk: '4', us: '5', cm: '23.5' },
                      { eu: '38', uk: '5', us: '6', cm: '24' },
                      { eu: '39', uk: '6', us: '7', cm: '24.5' },
                      { eu: '40', uk: '7', us: '8', cm: '25' },
                      { eu: '41', uk: '7.5', us: '9', cm: '25.5' },
                      { eu: '42', uk: '8', us: '10', cm: '26' },
                      { eu: '43', uk: '9', us: '11', cm: '26.5' },
                      { eu: '44', uk: '10', us: '12', cm: '27' },
                      { eu: '45', uk: '11', us: '13', cm: '27.5' },
                    ].map((row) => (
                      <tr key={row.eu} className={selectedSize === row.eu ? "bg-primary/20 font-bold" : ""}>
                        <td className="font-bold">{row.eu}</td><td>{row.uk}</td><td>{row.us}</td><td>{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-action">
                <button className="btn btn-primary" onClick={() => setShowSizeGuide(false)}>Got it</button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Notification - Nike Style */}
        {showCartNotification && (
          <div className="fixed top-20 right-4 z-50 animate-slide-in">
            <div className="card bg-base-100 shadow-2xl w-80 border border-primary">
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Added to Cart</p>
                    <p className="text-sm text-gray-600">{product.title}</p>
                    <p className="text-xs text-gray-500">Size: {selectedSize} | Qty: {quantity}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-sm btn-ghost flex-1" onClick={() => { setShowCartNotification(false); navigate('/checkout'); }}>View Cart</button>
                  <button className="btn btn-sm btn-primary flex-1" onClick={() => setShowCartNotification(false)}>Keep Shopping</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import useCartStore from '../store/cartStore';
// import { ArrowLeft, ShoppingCart, Heart, Star, Check, X, Ruler } from 'lucide-react';
// import { offlineDB } from '../utils/offlineDB';
// import { syncProducts, isOnline } from '../utils/offlineSync';

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addItem } = useCartStore();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedSize, setSelectedSize] = useState(null);
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [showSizeGuide, setShowSizeGuide] = useState(false);
//   const [inWishlist, setInWishlist] = useState(false);
//   const [showCartNotification, setShowCartNotification] = useState(false);

//   useEffect(() => {
//     fetchProduct();
//     checkWishlist();
//   }, [id]);

//   const fetchProduct = async () => {
//     try {
//       let productData;
      
//       if (isOnline()) {
//         const response = await axios.get(`http://localhost:5000/api/products/${id}`);
//         productData = response.data;
//       } else {
//         productData = await offlineDB.getProduct(id);
//       }
      
//       if (productData) {
//         setProduct(productData);
//         // Set default color if available
//         if (productData.colors && productData.colors.length > 0) {
//           setSelectedColor(productData.colors[0]);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching product:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkWishlist = async () => {
//     const inList = await offlineDB.isInWishlist(id);
//     setInWishlist(inList);
//   };

//   const handleAddToCart = () => {
//     if (!selectedSize) {
//       alert('Please select a size');
//       return;
//     }

//     const itemToAdd = {
//       ...product,
//       id: product._id,
//       selectedSize,
//       selectedColor,
//       quantity,
//     };

//     addItem(itemToAdd);
//     setShowCartNotification(true);
    
//     // Auto-hide notification after 3 seconds
//     setTimeout(() => setShowCartNotification(false), 3000);
//   };

//   const toggleWishlist = async () => {
//     if (inWishlist) {
//       await offlineDB.removeFromWishlist(product._id);
//     } else {
//       await offlineDB.addToWishlist(product);
//     }
//     setInWishlist(!inWishlist);
//   };

//   const getStockStatus = (size) => {
//     if (!product.sizes || !product.sizes[size]) return 'available';
//     const stock = product.sizes[size].stock;
//     if (stock === 0) return 'out-of-stock';
//     if (stock < 5) return 'low-stock';
//     return 'available';
//   };

//   const getSizeLabel = (size) => {
//     const status = getStockStatus(size);
//     if (status === 'out-of-stock') return 'Out of Stock';
//     if (status === 'low-stock') return 'Low Stock';
//     return 'Available';
//   };

//   const getImagesForColor = () => {
//     if (!product.images) return [product.image];
//     if (selectedColor && product.images[selectedColor]) {
//       return product.images[selectedColor];
//     }
//     return product.images.default || [product.image];
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-bg">
//         <span className="loading loading-spinner loading-lg text-primary"></span>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-bg">
//         <div className="text-center">
//           <p className="text-xl mb-4">Product not found</p>
//           <button className="btn btn-primary" onClick={() => navigate('/')}>
//             Back to Shop
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const images = getImagesForColor();
//   const sizes = product.sizes ? Object.keys(product.sizes) : ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

//   return (
//     <div className="min-h-screen bg-bg py-8">
//       <div className="container mx-auto px-4">
//         {/* Back Button */}
//         <button
//           className="btn btn-ghost mb-4"
//           onClick={() => navigate('/')}
//         >
//           <ArrowLeft className="w-5 h-5 mr-2" />
//           Back to Shop
//         </button>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Image Gallery - Nike Style */}
//           <div className="space-y-4">
//             {/* Main Image */}
//             <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
//               <img
//                 src={images[selectedImageIndex] || product.image}
//                 alt={product.title}
//                 className="w-full h-[600px] object-contain"
//               />
//               {product.rating && (
//                 <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded flex items-center gap-1">
//                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                   <span className="font-bold">{product.rating}</span>
//                 </div>
//               )}
//             </div>

//             {/* Thumbnail Gallery - Left Side Nike Style */}
//             <div className="flex gap-2 overflow-x-auto">
//               {images.map((img, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setSelectedImageIndex(index)}
//                   className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
//                     selectedImageIndex === index
//                       ? 'border-primary'
//                       : 'border-gray-300'
//                   }`}
//                 >
//                   <img
//                     src={img}
//                     alt={`${product.title} view ${index + 1}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Product Info */}
//           <div className="space-y-6">
//             <div>
//               <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
//               {product.category && (
//                 <span className="badge badge-secondary">{product.category}</span>
//               )}
//             </div>

//             {/* Price */}
//             <div className="flex items-center gap-4">
//               <p className="text-4xl font-bold text-secondary">
//                 KES {product.price.toLocaleString()}
//               </p>
//               {product.originalPrice && (
//                 <p className="text-2xl text-gray-400 line-through">
//                   KES {product.originalPrice.toLocaleString()}
//                 </p>
//               )}
//               {product.originalPrice && (
//                 <span className="badge badge-error">SALE</span>
//               )}
//             </div>

//             {/* Rating */}
//             {product.rating && (
//               <div className="flex items-center gap-2">
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`w-5 h-5 ${
//                         i < Math.floor(product.rating)
//                           ? 'fill-yellow-400 text-yellow-400'
//                           : 'text-gray-300'
//                       }`}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-gray-600">({product.rating})</span>
//               </div>
//             )}

//             {/* Description */}
//             {product.description && (
//               <div>
//                 <h3 className="font-bold text-lg mb-2">Description</h3>
//                 <p className="text-gray-600">{product.description}</p>
//               </div>
//             )}

//             {/* Color Selection */}
//             {product.colors && product.colors.length > 0 && (
//               <div>
//                 <h3 className="font-bold text-lg mb-2">Color: {selectedColor?.name || 'Select Color'}</h3>
//                 <div className="flex gap-3">
//                   {product.colors.map((color) => (
//                     <button
//                       key={color.name}
//                       onClick={() => {
//                         setSelectedColor(color);
//                         setSelectedImageIndex(0);
//                       }}
//                       className={`w-12 h-12 rounded-full border-4 ${
//                         selectedColor?.name === color.name
//                           ? 'border-primary scale-110'
//                           : 'border-gray-300'
//                       }`}
//                       style={{ backgroundColor: color.hex }}
//                       title={color.name}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Size Selection - Kicks Kenya Style */}
//             <div>
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="font-bold text-lg">Size: {selectedSize || 'Select Size'}</h3>
//                 <button
//                   className="btn btn-sm btn-ghost"
//                   onClick={() => setShowSizeGuide(true)}
//                 >
//                   <Ruler className="w-4 h-4 mr-1" />
//                   Sizing Guide
//                 </button>
//               </div>
//               <div className="grid grid-cols-5 gap-2">
//                 {sizes.map((size) => {
//                   const status = getStockStatus(size);
//                   const isOutOfStock = status === 'out-of-stock';
//                   const isLowStock = status === 'low-stock';
                  
//                   return (
//                     <button
//                       key={size}
//                       onClick={() => !isOutOfStock && setSelectedSize(size)}
//                       disabled={isOutOfStock}
//                       className={`btn ${
//                         selectedSize === size
//                           ? 'btn-primary'
//                           : isOutOfStock
//                           ? 'btn-disabled opacity-50 line-through'
//                           : 'btn-outline'
//                       } ${isLowStock && !isOutOfStock ? 'border-warning' : ''}`}
//                       title={getSizeLabel(size)}
//                     >
//                       {size}
//                     </button>
//                   );
//                 })}
//               </div>
//               {selectedSize && (
//                 <p className="text-sm text-gray-600 mt-2">
//                   {getSizeLabel(selectedSize)}
//                   {getStockStatus(selectedSize) === 'low-stock' && (
//                     <span className="text-warning ml-2">⚠️ Hurry, only a few left!</span>
//                   )}
//                 </p>
//               )}
//             </div>

//             {/* Quantity */}
//             <div>
//               <h3 className="font-bold text-lg mb-2">Quantity</h3>
//               <div className="flex items-center gap-4">
//                 <button
//                   className="btn btn-outline"
//                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                 >
//                   -
//                 </button>
//                 <span className="text-xl font-bold w-12 text-center">{quantity}</span>
//                 <button
//                   className="btn btn-outline"
//                   onClick={() => setQuantity(quantity + 1)}
//                 >
//                   +
//                 </button>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-4">
//               <button
//                 className="btn btn-primary flex-1 text-lg"
//                 onClick={handleAddToCart}
//               >
//                 <ShoppingCart className="w-5 h-5 mr-2" />
//                 Add to Cart
//               </button>
//               <button
//                 className="btn btn-secondary flex-1 text-lg"
//                 onClick={() => {
//                   handleAddToCart();
//                   navigate('/checkout');
//                 }}
//               >
//                 Buy It Now
//               </button>
//               <button
//                 className={`btn btn-ghost ${inWishlist ? 'text-red-500' : ''}`}
//                 onClick={toggleWishlist}
//               >
//                 <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
//               </button>
//             </div>

//             {/* Pickup Info - Kicks Kenya Style */}
//             <div className="card bg-base-200">
//               <div className="card-body">
//                 <h4 className="font-bold">Pickup Available</h4>
//                 <p className="text-sm">Nakuru - Usually ready in 1 hour</p>
//                 <p className="text-xs text-gray-600">Check availability at other stores</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Size Guide Modal */}
//         {showSizeGuide && (
//           <div className="modal modal-open">
//             <div className="modal-box max-w-2xl">
//               <h3 className="font-bold text-lg mb-4">Sizing Guide</h3>
//               <div className="overflow-x-auto">
//                 <table className="table table-zebra">
//                   <thead>
//                     <tr>
//                       <th>EU Size</th>
//                       <th>UK Size</th>
//                       <th>US Size</th>
//                       <th>Foot Length (cm)</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {[
//                       { eu: '36', uk: '3.5', us: '4', cm: '23' },
//                       { eu: '37', uk: '4', us: '5', cm: '23.5' },
//                       { eu: '38', uk: '5', us: '6', cm: '24' },
//                       { eu: '39', uk: '6', us: '7', cm: '24.5' },
//                       { eu: '40', uk: '7', us: '8', cm: '25' },
//                       { eu: '41', uk: '7.5', us: '9', cm: '25.5' },
//                       { eu: '42', uk: '8', us: '10', cm: '26' },
//                       { eu: '43', uk: '9', us: '11', cm: '26.5' },
//                       { eu: '44', uk: '10', us: '12', cm: '27' },
//                       { eu: '45', uk: '11', us: '13', cm: '27.5' },
//                     ].map((row) => (
//                       <tr key={row.eu}>
//                         <td className="font-bold">{row.eu}</td>
//                         <td>{row.uk}</td>
//                         <td>{row.us}</td>
//                         <td>{row.cm}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               <div className="modal-action">
//                 <button className="btn" onClick={() => setShowSizeGuide(false)}>
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Cart Notification - Nike Style */}
//         {showCartNotification && (
//           <div className="fixed top-20 right-4 z-50 animate-slide-in">
//             <div className="card bg-base-100 shadow-2xl w-80 border border-primary">
//               <div className="card-body">
//                 <div className="flex items-center gap-4">
//                   <div className="flex-shrink-0">
//                     <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
//                       <Check className="w-8 h-8 text-white" />
//                     </div>
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-bold">Added to Cart</p>
//                     <p className="text-sm text-gray-600">{product.title}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2 mt-4">
//                   <button
//                     className="btn btn-sm btn-ghost flex-1"
//                     onClick={() => {
//                       setShowCartNotification(false);
//                       navigate('/checkout');
//                     }}
//                   >
//                     View Cart
//                   </button>
//                   <button
//                     className="btn btn-sm btn-primary flex-1"
//                     onClick={() => setShowCartNotification(false)}
//                   >
//                     Continue Shopping
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductDetail;


