
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';
import { ArrowLeft, ShoppingCart, Heart, Star, Check, Ruler } from 'lucide-react';
import { offlineDB } from '../utils/offlineDB';
import { isOnline } from '../utils/offlineSync';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // SELECTION STATE
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null); // The specific SKU
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkWishlist();
  }, [id]);

  // LEARNING MOMENT: Every time Color or Size changes, we try to find the matching Variant (SKU)
  useEffect(() => {
    if (product && product.variants && selectedColor && selectedSize) {
      const variant = product.variants.find(
        v => v.color === selectedColor && v.size === selectedSize
      );
      setSelectedVariant(variant || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize, product]);

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
        // Auto-select the first available color to avoid empty state
        if (productData.variants && productData.variants.length > 0) {
          const firstColor = productData.variants[0].color;
          setSelectedColor(firstColor);
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

  // HELPER: Extract unique colors from the variants array
  const getUniqueColors = () => {
    if (!product?.variants) return [];
    // Set is a Javascript object that only keeps unique values
    return [...new Set(product.variants.map(v => v.color))];
  };

  // HELPER: Get sizes ONLY for the selected color
  const getAvailableSizes = () => {
    if (!product?.variants || !selectedColor) return [];
    return product.variants
      .filter(v => v.color === selectedColor)
      .sort((a, b) => Number(a.size) - Number(b.size)); // Sort 40, 41, 42...
  };

  const handleAddToCart = () => {
    // Validation: We need a specific SKU (Variant), not just a generic product
if (!selectedVariant) {
      alert('Please select a valid size and color');
      return;
    }

    if (selectedVariant.stock < quantity) {
      alert(`Sorry, only ${selectedVariant.stock} items left in stock`);
      return;
    }

    // 2. Construct Item - THE FIX
const itemToAdd = {
      id: selectedVariant.sku,   // CHANGED: Use SKU as the unique Cart ID
      productId: product._id,    // NEW: Keep reference to Parent ID separate
      sku: selectedVariant.sku,  // The Variant Key
      title: product.title,
      price: selectedVariant.priceOverride || product.price,
      image: product.images[selectedImageIndex] || product.images[0], // Use selected image
      selectedSize: selectedVariant.size,
      selectedColor: selectedVariant.color,
      quantity,
    };

    addItem(itemToAdd);
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const uniqueColors = getUniqueColors();
  const availableSizes = getAvailableSizes();
  const currentPrice = selectedVariant?.priceOverride || product.price;

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4">
        <button className="btn btn-ghost mb-4" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* IMAGE SECTION */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-lg h-[500px]">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">{product.title}</h1>
            <p className="text-4xl font-bold text-secondary">KES {currentPrice.toLocaleString()}</p>

            {/* COLOR SELECTION */}
            <div>
              <h3 className="font-bold mb-2">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize(null); // Reset size because "Red 42" might exist but "Blue 42" might not
                    }}
                    className={`px-6 py-2 border rounded-full font-medium transition-all ${
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

            {/* SIZE SELECTION */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Size: {selectedSize || 'Select'}</h3>
                <button className="text-primary underline text-sm" onClick={() => setShowSizeGuide(true)}>Size Guide</button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {availableSizes.map((variant) => {
                  const isOutOfStock = variant.stock === 0;
                  return (
                    <button
                      key={variant.sku}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(variant.size)}
                      className={`py-3 border rounded-lg ${
                        selectedSize === variant.size 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary' 
                          : 'border-gray-200 hover:border-primary'
                      } ${isOutOfStock ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
              {/* STOCK STATUS */}
              {selectedVariant && (
                <p className={`text-sm mt-2 ${selectedVariant.stock < 5 ? 'text-warning' : 'text-success'}`}>
                  {selectedVariant.stock === 0 ? 'Out of Stock' : 
                   selectedVariant.stock < 5 ? `Hurry! Only ${selectedVariant.stock} left!` : 'In Stock'}
                </p>
              )}
            </div>

            {/* ADD TO CART */}
            <div className="flex gap-4 pt-4">
              <button
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="btn btn-primary flex-1 btn-lg shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* NOTIFICATION */}
      {showCartNotification && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success text-white shadow-xl">
            <Check />
            <span>Added to cart successfully.</span>
          </div>
        </div>
      )}
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


