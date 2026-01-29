import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useCartStore from '../../store/cartStore';
import { ArrowLeft, ShoppingCart, CheckCircle, Ruler, Plus, Minus, X, Footprints } from 'lucide-react';
import { offlineDB } from '../../utils/offlineDB';
import { isOnline } from '../../utils/offlineSync';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  // --- STATE ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // --- INIT ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        let data;
        if (isOnline()) {
          const res = await axios.get(`http://localhost:5000/api/products/${id}`).catch(() => null);
          data = res?.data;
        } 
        if (!data) data = await offlineDB.getProduct(id);
        
        setProduct(data);
        
        if (data) {
          if (data.variants?.length > 0) {
            const first = data.variants.find(v => v.stock > 0) || data.variants[0];
            setSelectedColor(first.color);
          } else if (data.colors?.length > 0) {
            setSelectedColor(data.colors[0]?.name || data.colors[0]);
          }
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // --- DERIVED STATE ---
  const images = useMemo(() => {
    if (!product) return [];
    if (product.images?.length > 0) return product.images;
    return [product.image];
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product) return [];
    if (product.variants) return [...new Set(product.variants.map(v => v.color))];
    return product.colors?.map(c => c.name || c) || [];
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product) return [];
    if (product.variants && selectedColor) {
      return product.variants
        .filter(v => v.color === selectedColor)
        .sort((a, b) => Number(a.size) - Number(b.size));
    }
    return product.sizes ? Object.keys(product.sizes) : ['39', '40', '41', '42', '43', '44'];
  }, [product, selectedColor]);

  const currentVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
  }, [product, selectedSize, selectedColor]);

  const getButtonTooltip = () => {
    if (!selectedSize) return "Please select a size first";
    if (currentVariant && currentVariant.stock === 0) return "Out of stock";
    return "";
  };

  // --- HANDLER (FIXED) ---
  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    // Safety check for size type
    if (typeof selectedSize === 'object') {
        console.error("Critical Error: Object detected in size selection");
        return;
    }

    const item = {
      id: currentVariant ? currentVariant.sku : `${product._id}-${selectedSize}-${selectedColor}`,
      productId: product._id,
      sku: currentVariant?.sku,
      title: product.title,
      price: currentVariant?.priceOverride || product.price,
      image: images[selectedImageIndex] || images[0],
      selectedSize, // This is now guaranteed to be a string
      selectedColor,
      quantity
    };
    addItem(item);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><span className="loading loading-spinner text-primary"></span></div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  const price = currentVariant?.priceOverride || product.price;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-10 relative">
      {/* 1. Mobile Header */}
      <div className="md:hidden sticky top-0 bg-white/90 backdrop-blur z-30 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
        <span className="font-bold text-gray-800 truncate">{product.title}</span>
        <button onClick={() => navigate('/cart')} className="p-2 text-primary"><ShoppingCart /></button>
      </div>

      <div className="container mx-auto px-0 md:px-4 py-0 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 2. Gallery */}
          <div className="bg-gray-50 md:bg-transparent">
            <div className="relative aspect-square md:rounded-2xl overflow-hidden">
              <img src={images[selectedImageIndex] || images[0]} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto p-4 md:px-0">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImageIndex === idx ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* 3. Details */}
          <div className="px-4 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="text-2xl font-bold text-primary mt-1">KES {price.toLocaleString()}</p>
              <p className="text-gray-500 mt-4 text-sm">{product.description}</p>
            </div>

            {/* Selectors */}
            <div className="space-y-4">
              <div>
                <span className="font-bold text-sm uppercase">Color</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableColors.map(color => (
                    <button 
                      key={color} 
                      onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                      className={`px-4 py-2 border rounded-lg text-sm ${selectedColor === color ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm uppercase">Size</span>
                  <button type="button" onClick={() => setShowSizeGuide(true)} className="text-xs text-primary underline flex items-center gap-1 cursor-pointer">
                    <Ruler size={14} /> Size Guide
                  </button>
                </div>
                
                {/* --- FIX: SIZE SELECTOR LOOP --- */}
                <div className="grid grid-cols-5 gap-2">
                  {availableSizes.map(size => {
                    // Extract safe string value
                    const sizeValue = typeof size === 'object' ? size.size : size;
                    const stock = typeof size === 'object' ? size.stock : 99;
                    const isDisabled = stock === 0;

                    return (
                        <button 
                        key={sizeValue}
                        onClick={() => setSelectedSize(sizeValue)} // Pass string only
                        disabled={isDisabled}
                        className={`py-2 border rounded-lg text-sm font-bold transition-colors ${
                            selectedSize === sizeValue 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : isDisabled
                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-400 text-gray-700'
                        }`}
                        >
                        {sizeValue}
                        </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Desktop Add to Cart */}
            <div className="hidden md:flex gap-4 pt-4 border-t">
              <div className={`flex-1 ${!selectedSize ? 'tooltip tooltip-open tooltip-primary' : ''}`} data-tip={getButtonTooltip()}>
                <button onClick={handleAddToCart} disabled={!selectedSize} className="w-full btn btn-primary btn-lg text-white shadow-lg">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t p-4 z-20 pb-safe">
        <div className={`w-full ${!selectedSize ? 'tooltip tooltip-top tooltip-primary' : ''}`} data-tip={getButtonTooltip()}>
           <button onClick={handleAddToCart} disabled={!selectedSize} className="w-full btn btn-primary text-white shadow-lg">
             {selectedSize ? `Add - KES ${(price * quantity).toLocaleString()}` : 'Select Size'}
           </button>
        </div>
      </div>

      {/* 5. SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2"><Ruler className="text-primary"/> Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} className="btn btn-sm btn-circle btn-ghost"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 border-b border-gray-100 bg-blue-50/30">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Footprints size={18} className="text-primary"/> How to Measure</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 ml-1">
                        <li>Place a piece of paper on the floor against a wall.</li>
                        <li>Stand on the paper with your heel firmly against the wall.</li>
                        <li>Mark the longest part of your foot (usually the big toe).</li>
                        <li>Measure the distance from the edge of the paper to the mark in <strong>cm</strong>.</li>
                    </ol>
                </div>
                <div className="p-0">
                    <table className="table w-full text-center">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr><th>EU</th><th>UK</th><th>US (M)</th><th>CM</th></tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                            {eu:'39', uk:'6', us:'7', cm:'24.5'},
                            {eu:'40', uk:'6.5', us:'7.5', cm:'25.0'},
                            {eu:'41', uk:'7.5', us:'8.5', cm:'26.0'},
                            {eu:'42', uk:'8', us:'9', cm:'26.5'},
                            {eu:'43', uk:'9', us:'10', cm:'27.5'},
                            {eu:'44', uk:'9.5', us:'10.5', cm:'28.0'},
                            {eu:'45', uk:'10.5', us:'11.5', cm:'29.0'},
                            ].map(r => (
                                <tr key={r.eu} className={selectedSize === r.eu ? 'bg-primary/10 font-bold border-l-4 border-primary' : 'hover:bg-gray-50'}>
                                    <td className="py-3">{r.eu}</td><td>{r.uk}</td><td>{r.us}</td><td className="font-mono">{r.cm}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="p-4 border-t bg-white">
               <button className="btn btn-primary btn-block text-white" onClick={() => setShowSizeGuide(false)}>Close Guide</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-24 right-4 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl z-[100] animate-bounce-in">
          <div className="flex items-center gap-3">
             <CheckCircle className="text-green-500" />
             <div><p className="font-bold">Added to Cart</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
// import { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import useCartStore from '../../store/cartStore';
// import { ArrowLeft, ShoppingCart, Heart, Star, Check, Ruler, Plus, Minus, Info, X } from 'lucide-react';
// import { offlineDB } from '../../utils/offlineDB';
// import { isOnline } from '../../utils/offlineSync';

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addItem } = useCartStore();
  
//   // --- STATE MANAGEMENT ---
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Selection State
//   const [selectedSize, setSelectedSize] = useState(null);
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);
//   const [quantity, setQuantity] = useState(1);
  
//   // UI State
//   const [showSizeGuide, setShowSizeGuide] = useState(false);
//   const [showSuccessToast, setShowSuccessToast] = useState(false);

//   // --- INITIALIZATION ---
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         let data;
//         // 1. Try Online
//         if (isOnline()) {
//           const res = await axios.get(`http://localhost:5000/api/products/${id}`).catch(() => null);
//           data = res?.data;
//         } 
//         // 2. Fallback to Offline
//         if (!data) data = await offlineDB.getProduct(id);
        
//         setProduct(data);
        
//         // 3. Auto-Select Defaults (Reduces user friction)
//         if (data) {
//           if (data.variants?.length > 0) {
//             const first = data.variants.find(v => v.stock > 0) || data.variants[0];
//             setSelectedColor(first.color);
//           } else if (data.colors?.length > 0) {
//             setSelectedColor(data.colors[0]?.name || data.colors[0]);
//           }
//         }
//       } catch (err) {
//         console.error('Failed to load product', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//     window.scrollTo(0, 0);
//   }, [id]);

//   // --- DERIVED STATE (Smart Logic) ---
//   const images = useMemo(() => {
//     if (!product) return [];
//     if (product.images?.length > 0) return product.images;
//     return [product.image];
//   }, [product]);

//   const availableColors = useMemo(() => {
//     if (!product) return [];
//     if (product.variants) return [...new Set(product.variants.map(v => v.color))];
//     return product.colors?.map(c => c.name || c) || [];
//   }, [product]);

//   const availableSizes = useMemo(() => {
//     if (!product) return [];
//     if (product.variants && selectedColor) {
//       return product.variants
//         .filter(v => v.color === selectedColor)
//         .sort((a, b) => Number(a.size) - Number(b.size));
//     }
//     return product.sizes ? Object.keys(product.sizes) : ['39', '40', '41', '42', '43', '44'];
//   }, [product, selectedColor]);

//   const currentVariant = useMemo(() => {
//     if (!product?.variants) return null;
//     return product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
//   }, [product, selectedSize, selectedColor]);

//   // Determine Tooltip Message
//   const getButtonTooltip = () => {
//     if (!selectedSize) return "Please select a size first";
//     if (currentVariant && currentVariant.stock === 0) return "Out of stock in this size";
//     return ""; // No tooltip if valid
//   };

//   // --- HANDLERS ---
//   const handleAddToCart = () => {
//     if (!selectedSize) {
//       // Fallback alert if tooltip is missed
//       return;
//     }
    
//     // Construct Cart Item with SKU logic
//     const item = {
//       id: currentVariant ? currentVariant.sku : `${product._id}-${selectedSize}-${selectedColor}`,
//       productId: product._id,
//       sku: currentVariant?.sku,
//       title: product.title,
//       price: currentVariant?.priceOverride || product.price,
//       image: images[selectedImageIndex] || images[0],
//       selectedSize,
//       selectedColor,
//       quantity
//     };

//     addItem(item);
//     setShowSuccessToast(true);
//     setTimeout(() => setShowSuccessToast(false), 3000);
//   };

//   if (loading) return <div className="min-h-screen flex justify-center items-center"><span className="loading loading-spinner text-primary"></span></div>;
//   if (!product) return <div className="p-10 text-center">Product not found <button className="btn btn-link" onClick={() => navigate('/')}>Go Home</button></div>;

//   const price = currentVariant?.priceOverride || product.price;

//   return (
//     <div className="min-h-screen bg-white pb-24 md:pb-10">
      
//       {/* 1. Mobile Header (Sticky) */}
//       <div className="md:hidden sticky top-0 bg-white/90 backdrop-blur z-20 px-4 py-3 flex items-center justify-between border-b border-gray-100">
//         <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
//         <span className="font-bold text-gray-800 truncate max-w-[200px]">{product.title}</span>
//         <button onClick={() => navigate('/cart')} className="p-2 text-primary"><ShoppingCart /></button>
//       </div>

//       <div className="container mx-auto px-0 md:px-4 py-0 md:py-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12">
          
//           {/* 2. Image Gallery */}
//           <div className="space-y-4 bg-gray-50 md:bg-transparent">
//             {/* Main Image */}
//             <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden md:rounded-2xl">
//               <img 
//                 src={images[selectedImageIndex] || images[0]} 
//                 className="w-full h-full object-cover object-center transition-opacity duration-300"
//                 alt={product.title}
//               />
//               <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
//                 {selectedImageIndex + 1} / {images.length}
//               </div>
//             </div>
            
//             {/* Thumbnails */}
//             <div className="flex gap-3 overflow-x-auto px-4 md:px-0 pb-4 md:pb-0 scrollbar-hide">
//               {images.map((img, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setSelectedImageIndex(idx)}
//                   className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-primary' : 'border-transparent'}`}
//                 >
//                   <img src={img} className="w-full h-full object-cover" />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* 3. Product Info & Actions */}
//           <div className="px-4 pt-6 md:pt-0 space-y-8">
//             <div>
//               <div className="flex justify-between items-start">
//                 <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
//                 <p className="text-2xl font-bold text-primary whitespace-nowrap">KES {price.toLocaleString()}</p>
//               </div>
//               <p className="text-gray-500 mt-2 text-sm leading-relaxed">{product.description}</p>
//             </div>

//             {/* Selectors */}
//             <div className="space-y-6">
//               {/* Color Selector */}
//               <div>
//                 <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Select Color</span>
//                 <div className="flex flex-wrap gap-3 mt-3">
//                   {availableColors.map(color => (
//                     <button
//                       key={color}
//                       onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
//                       className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
//                         selectedColor === color 
//                           ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' 
//                           : 'border-gray-200 hover:border-gray-300 text-gray-600'
//                       }`}
//                     >
//                       {color}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Size Selector */}
//               <div>
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Select Size</span>
//                   <button 
//                     onClick={() => setShowSizeGuide(true)} 
//                     className="text-xs text-primary underline flex items-center gap-1 hover:text-primary/80"
//                   >
//                     <Ruler size={14} /> Size Guide
//                   </button>
//                 </div>
//                 <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
//                   {product.variants ? availableSizes.map((variant) => (
//                     <button
//                       key={variant.sku}
//                       disabled={variant.stock === 0}
//                       onClick={() => setSelectedSize(variant.size)}
//                       className={`py-3 rounded-lg border text-sm font-bold transition-all ${
//                         selectedSize === variant.size 
//                           ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
//                           : variant.stock === 0 
//                             ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed decoration-slice' 
//                             : 'border-gray-200 hover:border-gray-400 text-gray-700'
//                       }`}
//                     >
//                       {variant.size}
//                     </button>
//                   )) : (
//                     // Fallback for non-variant products
//                     availableSizes.map(size => (
//                       <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 rounded-lg border ${selectedSize === size ? 'bg-gray-900 text-white' : 'border-gray-200'}`}>{size}</button>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* 4. Desktop Action Bar */}
//             <div className="hidden md:flex gap-4 pt-4 border-t border-gray-100">
//               <div className="flex items-center border border-gray-300 rounded-xl h-14">
//                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-gray-500 hover:text-gray-900"><Minus size={18} /></button>
//                 <span className="w-10 text-center font-bold">{quantity}</span>
//                 <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-gray-500 hover:text-gray-900"><Plus size={18} /></button>
//               </div>
              
//               {/* TOOLTIP WRAPPER FOR DESKTOP */}
//               <div 
//                 className={`flex-1 ${!selectedSize ? 'tooltip tooltip-open tooltip-primary' : ''}`} 
//                 data-tip={getButtonTooltip()}
//               >
//                 <button 
//                   onClick={handleAddToCart}
//                   disabled={!selectedSize || (currentVariant && currentVariant.stock === 0)}
//                   className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Add to Cart - KES {(price * quantity).toLocaleString()}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 5. Mobile Sticky Bottom Bar */}
//       <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
//         <div className="flex gap-3">
//           <div className="flex items-center border border-gray-200 rounded-lg h-12 w-28 justify-between px-2">
//             <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1"><Minus size={16} /></button>
//             <span className="font-bold text-sm">{quantity}</span>
//             <button onClick={() => setQuantity(quantity + 1)} className="p-1"><Plus size={16} /></button>
//           </div>
          
//           {/* TOOLTIP WRAPPER FOR MOBILE */}
//           <div 
//             className={`flex-1 ${!selectedSize ? 'tooltip tooltip-top tooltip-primary' : ''}`}
//             data-tip={getButtonTooltip()}
//           >
//             <button 
//               onClick={handleAddToCart}
//               disabled={!selectedSize}
//               className="w-full bg-gray-900 text-white h-12 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300"
//             >
//               {selectedSize ? `Add - KES ${(price * quantity).toLocaleString()}` : 'Select Size'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 6. REVAMPED SIZE GUIDE MODAL */}
//       {showSizeGuide && (
//         <div className="modal modal-open backdrop-blur-sm bg-black/60 z-50 animate-in fade-in zoom-in-95 duration-200">
//           <div className="modal-box w-11/12 max-w-2xl max-h-[85vh] bg-white p-0 rounded-xl shadow-2xl flex flex-col overflow-hidden">
//             {/* Header - Fixed */}
//             <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-10">
//               <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
//                 <Ruler className="text-primary" size={20} /> Size Guide
//               </h3>
//               <button 
//                 onClick={() => setShowSizeGuide(false)} 
//                 className="btn btn-sm btn-circle btn-ghost hover:bg-gray-100"
//               >
//                 <X size={20} />
//               </button>
//             </div>
            
//             {/* Scrollable Content */}
//             <div className="flex-1 overflow-y-auto p-6 bg-white">
//               <p className="text-sm text-gray-500 mb-4">
//                 Use this chart to find your perfect fit. We use standard EU sizing for all our shoes.
//               </p>
//               <div className="overflow-x-auto">
//                 <table className="table w-full text-center border-separate border-spacing-y-1">
//                   <thead className="text-gray-500 text-xs uppercase tracking-wide">
//                     <tr>
//                       <th className="pb-2 border-b border-gray-100">EU</th>
//                       <th className="pb-2 border-b border-gray-100">UK</th>
//                       <th className="pb-2 border-b border-gray-100">US Men</th>
//                       <th className="pb-2 border-b border-gray-100">US Women</th>
//                       <th className="pb-2 border-b border-gray-100">CM</th>
//                     </tr>
//                   </thead>
//                   <tbody className="text-sm">
//                     {[
//                       { eu: '36', uk: '3.5', usm: '4.5', usw: '6', cm: '23.0' },
//                       { eu: '37', uk: '4.0', usm: '5.0', usw: '6.5', cm: '23.5' },
//                       { eu: '38', uk: '5.0', usm: '6.0', usw: '7.5', cm: '24.0' },
//                       { eu: '39', uk: '6.0', usm: '7.0', usw: '8.5', cm: '24.5' },
//                       { eu: '40', uk: '6.5', usm: '7.5', usw: '9.0', cm: '25.0' },
//                       { eu: '41', uk: '7.5', usm: '8.5', usw: '10.0', cm: '26.0' },
//                       { eu: '42', uk: '8.0', usm: '9.0', usw: '10.5', cm: '26.5' },
//                       { eu: '43', uk: '9.0', usm: '10.0', usw: '11.5', cm: '27.5' },
//                       { eu: '44', uk: '9.5', usm: '10.5', usw: '12.0', cm: '28.0' },
//                       { eu: '45', uk: '10.5', usm: '11.5', usw: '13.0', cm: '29.0' },
//                     ].map((row) => (
//                       <tr 
//                         key={row.eu} 
//                         className={`hover:bg-gray-50 transition-colors ${
//                           selectedSize === row.eu 
//                             ? "bg-primary/5 font-bold text-primary" 
//                             : "text-gray-600"
//                         }`}
//                       >
//                         <td className="py-3 rounded-l-lg">{row.eu}</td>
//                         <td className="py-3">{row.uk}</td>
//                         <td className="py-3">{row.usm}</td>
//                         <td className="py-3">{row.usw}</td>
//                         <td className="py-3 rounded-r-lg">{row.cm}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
            
//             {/* Footer - Fixed */}
//             <div className="p-4 border-t border-gray-100 bg-white flex justify-end z-10">
//               <button 
//                 className="btn btn-primary btn-sm text-white px-8 rounded-lg shadow-lg hover:shadow-xl transition-all" 
//                 onClick={() => setShowSizeGuide(false)}
//               >
//                 Got it
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 7. Success Toast */}
//       {showSuccessToast && (
//         <div className="fixed top-20 right-4 md:right-8 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50 animate-slide-in">
//           <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black"><Check size={18} strokeWidth={3} /></div>
//           <div>
//             <p className="font-bold">Added to Cart</p>
//             <p className="text-xs text-gray-300">{product.title} - Size {selectedSize}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductDetail;