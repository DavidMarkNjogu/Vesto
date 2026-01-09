import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../../store/cartStore';
import { ArrowLeft, ShoppingCart, Heart, Star, Check, Ruler, Plus, Minus, Info } from 'lucide-react';
import { offlineDB } from '../../utils/offlineDB';
import { isOnline } from '../../utils/offlineSync';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  // Data State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // UI State
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // --- INITIALIZATION ---
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
        
        // Auto-select defaults to reduce friction
        if (data) {
          if (data.variants?.length > 0) {
            const first = data.variants.find(v => v.stock > 0) || data.variants[0];
            setSelectedColor(first.color);
          } else if (data.colors?.length > 0) {
            setSelectedColor(data.colors[0]?.name || data.colors[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
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

  // --- HANDLERS ---
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    // Construct Cart Item
    const item = {
      id: currentVariant ? currentVariant.sku : `${product._id}-${selectedSize}-${selectedColor}`,
      productId: product._id,
      sku: currentVariant?.sku,
      title: product.title,
      price: currentVariant?.priceOverride || product.price,
      image: images[selectedImageIndex] || images[0],
      selectedSize,
      selectedColor,
      quantity
    };

    addItem(item);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><span className="loading loading-spinner text-primary"></span></div>;
  if (!product) return <div className="p-10 text-center">Product not found <button className="btn btn-link" onClick={() => navigate('/')}>Go Home</button></div>;

  const price = currentVariant?.priceOverride || product.price;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-10"> {/* Padding bottom for mobile sticky bar */}
      
      {/* 1. Header (Mobile Only) */}
      <div className="md:hidden sticky top-0 bg-white/90 backdrop-blur z-20 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
        <span className="font-bold text-gray-800 truncate max-w-[200px]">{product.title}</span>
        <button onClick={() => navigate('/cart')} className="p-2 text-primary"><ShoppingCart /></button>
      </div>

      <div className="container mx-auto px-0 md:px-4 py-0 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12">
          
          {/* 2. Image Gallery */}
          <div className="space-y-4 bg-gray-50 md:bg-transparent">
            {/* Main Image */}
            <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden md:rounded-2xl">
              <img 
                src={images[selectedImageIndex]} 
                className="w-full h-full object-cover object-center"
                alt={product.title}
              />
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>
            
            {/* Thumbnails (Scrollable) */}
            <div className="flex gap-3 overflow-x-auto px-4 md:px-0 pb-4 md:pb-0 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* 3. Product Info */}
          <div className="px-4 pt-6 md:pt-0 space-y-8">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                <p className="text-2xl font-bold text-primary whitespace-nowrap">KES {price.toLocaleString()}</p>
              </div>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Selectors */}
            <div className="space-y-6">
              {/* Color */}
              <div>
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Select Color</span>
                <div className="flex flex-wrap gap-3 mt-3">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                      className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === color 
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Select Size</span>
                  <button onClick={() => setShowSizeGuide(true)} className="text-xs text-primary underline flex items-center gap-1">
                    <Ruler size={14} /> Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {product.variants ? availableSizes.map((variant) => (
                    <button
                      key={variant.sku}
                      disabled={variant.stock === 0}
                      onClick={() => setSelectedSize(variant.size)}
                      className={`py-3 rounded-lg border text-sm font-bold transition-all ${
                        selectedSize === variant.size 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                          : variant.stock === 0 
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed decoration-slice' 
                            : 'border-gray-200 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {variant.size}
                    </button>
                  )) : (
                    // Fallback for non-variant products
                    availableSizes.map(size => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 rounded-lg border ${selectedSize === size ? 'bg-gray-900 text-white' : 'border-gray-200'}`}>{size}</button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 4. Desktop Action Bar */}
            <div className="hidden md:flex gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center border border-gray-300 rounded-xl h-14">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-gray-500 hover:text-gray-900"><Minus size={18} /></button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-gray-500 hover:text-gray-900"><Plus size={18} /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="flex-1 bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart - KES {(price * quantity).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-20 pb-safe">
        <div className="flex gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg h-12 w-28 justify-between px-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1"><Minus size={16} /></button>
            <span className="font-bold text-sm">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="p-1"><Plus size={16} /></button>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="flex-1 bg-gray-900 text-white h-12 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300"
          >
            {selectedSize ? `Add - KES ${(price * quantity).toLocaleString()}` : 'Select Size'}
          </button>
        </div>
      </div>

      {/* 6. Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 md:right-8 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50 animate-slide-in">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black"><Check size={18} strokeWidth={3} /></div>
          <div>
            <p className="font-bold">Added to Cart</p>
            <p className="text-xs text-gray-300">{product.title} - Size {selectedSize}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;