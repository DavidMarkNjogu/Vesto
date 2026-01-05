import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  Plus, Edit, Trash2, X, Upload, Image as ImageIcon, 
  Package, ShoppingBag, DollarSign, TrendingUp, RefreshCw, Check, AlertCircle
} from 'lucide-react';
import { optimizeImage, removeBackground, convertToBase64, validateImage } from '../utils/imageOptimizer';

// DESIGN SYSTEM IMPORTS
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import StatCard from '../components/admin/StatCard';

const Dashboard = () => {
  // --- LAYOUT STATE ---
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // --- DATA STATE ---
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FORM STATE ---
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Helper for clean resets
  const getInitialFormState = () => ({
    title: '',
    price: '',
    image: '',
    description: '',
    category: '',
    rating: '',
    buyingPrice: '',
    images: [], // Multiple images for different angles
    colors: [],
    sizes: {}
  });

  const [productForm, setProductForm] = useState(getInitialFormState());
  
  // --- IMAGE UPLOAD STATE ---
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [imageAngles, setImageAngles] = useState({
    front: null,
    side: null,
    back: null,
    top: null,
    bottom: null
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/admin/orders') // Ensure this route exists in server
      ]);
      
      const prodData = productsRes.data || [];
      const ordData = ordersRes.data || [];

      setProducts(prodData);
      setOrders(ordData);
      
      // Calculate stats
      const totalRevenue = ordData.reduce((sum, order) => sum + (order.total || 0), 0);
      const today = new Date().toDateString();
      const todayOrders = ordData.filter(order => 
        new Date(order.timestamp).toDateString() === today
      ).length;

      setStats({
        totalProducts: prodData.length,
        totalOrders: ordData.length,
        totalRevenue,
        todayOrders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback for demo if API fails
      setStats({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, todayOrders: 0 });
    } finally {
      setLoading(false);
    }
  };

  // --- IMAGE LOGIC (Preserved from Vesto) ---
  const handleImageUpload = async (file, angle = 'main') => {
    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploadingImages(true);
    setUploadProgress(0);

    try {
      // Optimize image
      setUploadProgress(25);
      const optimizedBlob = await optimizeImage(file);
      
      // Remove background (optional - can be toggled)
      setUploadProgress(50);
      const processedBlob = await removeBackground(optimizedBlob);
      
      // Convert to base64 for storage
      setUploadProgress(75);
      const base64 = await convertToBase64(processedBlob);
      
      setUploadProgress(100);
      
      if (angle === 'main') {
        setProductForm({ ...productForm, image: base64 });
        setImagePreview(base64);
      } else {
        setImageAngles({ ...imageAngles, [angle]: base64 });
      }
      
      setTimeout(() => {
        setUploadProgress(0);
        setUploadingImages(false);
      }, 500);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  // --- PRODUCT SUBMIT LOGIC (Preserved) ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine all images
      const allImages = {
        main: productForm.image,
        ...imageAngles
      };
      
      const formData = {
        ...productForm,
        images: Object.values(allImages).filter(img => img !== null),
        image: productForm.image || imageAngles.front
      };

      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/admin/products/${editingProduct._id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/admin/products', formData);
      }
      
      // Clean Reset
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm(getInitialFormState());
      setImageAngles({ front: null, side: null, back: null, top: null, bottom: null });
      setImagePreview(null);
      
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      price: product.price,
      image: product.image,
      description: product.description || '',
      category: product.category || '',
      rating: product.rating || '',
      buyingPrice: product.buyingPrice || '',
      images: product.images || [],
      colors: product.colors || [],
      sizes: product.sizes || {}
    });
    setImagePreview(product.image);
    if (product.images && product.images.length > 0) {
      const angles = {
        front: product.images[0] || null,
        side: product.images[1] || null,
        back: product.images[2] || null,
        top: product.images[3] || null,
        bottom: product.images[4] || null
      };
      setImageAngles(angles);
    }
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  // --- RENDER CONTENT SWITCHER ---
  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Products" value={stats.totalProducts} icon={Package} colorClass="bg-azure-500" />
              <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} colorClass="bg-orange-500" />
              <StatCard title="Total Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} colorClass="bg-emerald-500" />
              <StatCard title="Today's Orders" value={stats.todayOrders} icon={TrendingUp} colorClass="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Recent Orders Widget */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-bold text-gray-800">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm text-primary hover:underline font-medium">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr><th>ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="font-mono text-xs text-gray-500">#{order._id?.slice(-6)}</td>
                            <td className="font-medium text-gray-700">{order.phone}</td>
                            <td className="font-bold text-gray-800">KES {order.total?.toLocaleString()}</td>
                            <td><span className="badge badge-sm badge-success bg-green-100 text-green-800 border-none">Paid</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* Inventory Snapshot Widget */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="font-bold text-gray-800">Inventory Snapshot</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {products.slice(0, 5).map(product => (
                      <div key={product._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                        <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shadow-sm" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 line-clamp-1">{product.title}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                        <p className="font-bold text-primary">KES {product.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                   <h3 className="font-bold text-lg text-gray-800">Product Inventory</h3>
                   <p className="text-sm text-gray-500">Manage your catalog</p>
                </div>
                <button 
                  className="btn btn-primary btn-sm gap-2 text-white shadow-md hover:scale-105 transition-transform"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm(getInitialFormState());
                    setImageAngles({ front: null, side: null, back: null, top: null, bottom: null });
                    setImagePreview(null);
                    setShowProductForm(true);
                  }}
                >
                   <Plus size={16} /> Add Product
                </button>
             </div>
             
             <div className="overflow-x-auto">
               <table className="table table-zebra w-full">
                 <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                   <tr>
                     <th className="pl-6 py-4">Product</th>
                     <th>Category</th>
                     <th>Price</th>
                     <th>Buying Price</th>
                     <th>Stock Ref</th>
                     <th className="text-right pr-6">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {products.map((product) => (
                     <tr key={product._id} className="hover:bg-gray-50 group transition-colors">
                       <td className="pl-6 py-3">
                         <div className="flex items-center gap-3">
                           <div className="avatar">
                             <div className="w-12 h-12 rounded-lg shadow-sm border border-gray-100">
                               <img src={product.image} alt={product.title} />
                             </div>
                           </div>
                           <div>
                             <div className="font-bold text-gray-800">{product.title}</div>
                             {/* Show Variants Count if available */}
                             <div className="text-xs text-gray-500">
                               {product.variants ? `${product.variants.length} Variants` : 'No Variants'}
                             </div>
                           </div>
                         </div>
                       </td>
                       <td><span className="badge badge-ghost badge-sm font-medium">{product.category}</span></td>
                       <td className="font-mono font-medium text-gray-700">KES {product.price.toLocaleString()}</td>
                       <td className="font-mono text-gray-500">KES {product.buyingPrice?.toLocaleString() || '-'}</td>
                       <td className="text-xs text-gray-400 font-mono">#{product._id.slice(-6)}</td>
                       <td className="text-right pr-6">
                         <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleEditProduct(product)} className="btn btn-square btn-xs btn-ghost hover:bg-blue-50 hover:text-blue-600 transition-colors">
                             <Edit size={14} />
                           </button>
                           <button onClick={() => handleDeleteProduct(product._id)} className="btn btn-square btn-xs btn-ghost hover:bg-red-50 hover:text-red-600 transition-colors">
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Order History</h3>
                <button onClick={fetchDashboardData} className="btn btn-ghost btn-sm gap-2 hover:bg-gray-100">
                   <RefreshCw size={14} /> Refresh
                </button>
             </div>
             <div className="overflow-x-auto">
               <table className="table table-zebra w-full">
                 <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                   <tr><th>Order #</th><th>Date</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th></tr>
                 </thead>
                 <tbody>
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="font-mono text-xs text-gray-500">#{order._id.slice(-8)}</td>
                        <td className="text-sm text-gray-600">{new Date(order.timestamp).toLocaleDateString()}</td>
                        <td className="font-medium text-gray-800">
                            {order.phone} 
                            <div className="text-xs text-gray-500">{order.location}</div>
                        </td>
                        <td>
                          <div className="tooltip" data-tip={order.cartItems?.map(i => `${i.title} (${i.size})`).join(', ')}>
                             <span className="badge badge-ghost border-gray-200">{order.cartItems?.length || 0} items</span>
                          </div>
                        </td>
                        <td className="font-bold text-gray-800">KES {order.total.toLocaleString()}</td>
                        <td>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check size={10}/> Paid
                            </span>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg font-sans overflow-hidden">
      {/* 1. LAYOUT: Sidebar */}
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* 2. LAYOUT: Main Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        
        {/* 3. LAYOUT: Topbar */}
        <AdminTopbar isCollapsed={isCollapsed} title={activeTab} />

        {/* 4. CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 mt-16 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {renderContent()}
        </main>
      </div>

      {/* 5. MODAL: Product Form (Preserved Original Logic, Updated Styling) */}
      {showProductForm && (
        <div className="modal modal-open backdrop-blur-sm bg-black/40 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="modal-box w-11/12 max-w-4xl p-0 overflow-hidden rounded-xl shadow-2xl">
            {/* Modal Header */}
            <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg tracking-wide">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button 
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }} 
                className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleProductSubmit} className="p-8 max-h-[80vh] overflow-y-auto bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Left Column: Details */}
                 <div className="space-y-5">
                    <div className="form-control">
                      <label className="label text-xs font-bold uppercase text-gray-500 tracking-wider">Product Title</label>
                      <input 
                        type="text" 
                        className="input input-bordered focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        value={productForm.title} 
                        onChange={e => setProductForm({...productForm, title: e.target.value})} 
                        required 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500 tracking-wider">Selling Price</label>
                        <input 
                          type="number" 
                          className="input input-bordered focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          value={productForm.price} 
                          onChange={e => setProductForm({...productForm, price: e.target.value})} 
                          required 
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500 tracking-wider">Buying Price</label>
                        <input 
                          type="number" 
                          className="input input-bordered focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          value={productForm.buyingPrice} 
                          onChange={e => setProductForm({...productForm, buyingPrice: e.target.value})} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-gray-500 tracking-wider">Category</label>
                        <select 
                          className="select select-bordered focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                          value={productForm.category} 
                          onChange={e => setProductForm({...productForm, category: e.target.value})}
                        >
                          <option value="">Select Category</option>
                          <option value="Sneakers">Sneakers</option>
                          <option value="Boots">Boots</option>
                          <option value="Formal">Formal</option>
                          <option value="Sandals">Sandals</option>
                          <option value="Athletic">Athletic</option>
                        </select>
                    </div>

                    <div className="form-control">
                      <label className="label text-xs font-bold uppercase text-gray-500 tracking-wider">Description</label>
                      <textarea 
                        className="textarea textarea-bordered h-32 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        value={productForm.description} 
                        onChange={e => setProductForm({...productForm, description: e.target.value})}
                      ></textarea>
                    </div>
                 </div>

                 {/* Right Column: Images */}
                 <div className="space-y-5">
                    <div className="form-control mb-4">
                        <label className="label">
                          <span className="label-text font-bold">Main Product Image</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-primary/50 transition-all duration-300">
                            {imagePreview ? (
                                <div className="relative group">
                                    <img src={imagePreview} className="w-full h-64 object-contain mx-auto rounded-lg" />
                                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-lg backdrop-blur-sm transition-all">
                                        <button 
                                          type="button" 
                                          onClick={() => fileInputRef.current?.click()} 
                                          className="btn btn-sm bg-white text-gray-800 hover:bg-gray-100 border-none"
                                        >
                                          Change Image
                                        </button>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-circle btn-error absolute -top-2 -right-2 shadow-md"
                                      onClick={() => {
                                        setImagePreview(null);
                                        setProductForm({ ...productForm, image: '' });
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Click to upload main image</p>
                                    <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={e => {
                                const file = e.target.files[0];
                                if (file) handleImageUpload(file, 'main');
                              }} 
                            />
                        </div>
                        {uploadingImages && <progress className="progress progress-primary w-full mt-2" />}
                    </div>

                    {/* Multiple Angle Images - Restored */}
                    <div className="form-control mb-4">
                        <label className="label">
                          <span className="label-text font-bold">Additional Angles</span>
                          <span className="label-text-alt text-gray-500">Optional</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {['front', 'side', 'back', 'top', 'bottom'].map((angle) => (
                            <div key={angle} className="border-2 border-dashed border-gray-300 rounded p-1 text-center hover:border-primary/30 transition-colors">
                              {imageAngles[angle] ? (
                                <div className="relative">
                                  <img src={imageAngles[angle]} alt={angle} className="w-full h-16 object-cover rounded" />
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-circle btn-error absolute -top-1 -right-1"
                                    onClick={() => setImageAngles({ ...imageAngles, [angle]: null })}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer block h-16 flex flex-col items-center justify-center">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) handleImageUpload(file, angle);
                                    }}
                                  />
                                  <ImageIcon className="w-4 h-4 text-gray-400 mb-1" />
                                  <span className="text-[9px] text-gray-500 capitalize">{angle}</span>
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="alert alert-info mt-3 py-2 text-xs flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span>Images are automatically optimized and background removed.</span>
                        </div>
                    </div>
                 </div>
              </div>
              
              <div className="modal-action border-t border-gray-100 mt-8 pt-6">
                <button 
                  type="button" 
                  className="btn btn-ghost hover:bg-gray-100" 
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-8 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
// import { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import { 
//   BarChart3, 
//   Package, 
//   ShoppingBag, 
//   Users, 
//   TrendingUp, 
//   DollarSign,
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   RefreshCw,
//   Upload,
//   Image as ImageIcon,
//   X,
//   Check,
//   AlertCircle
// } from 'lucide-react';
// import { optimizeImage, removeBackground, convertToBase64, validateImage } from '../utils/imageOptimizer';

// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     totalOrders: 0,
//     totalRevenue: 0,
//     todayOrders: 0
//   });
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [showProductForm, setShowProductForm] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [productForm, setProductForm] = useState({
//     title: '',
//     price: '',
//     image: '',
//     description: '',
//     category: '',
//     rating: '',
//     buyingPrice: '',
//     images: [], // Multiple images for different angles
//     colors: [],
//     sizes: {}
//   });
//   const [uploadingImages, setUploadingImages] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const fileInputRef = useRef(null);
//   const [imageAngles, setImageAngles] = useState({
//     front: null,
//     side: null,
//     back: null,
//     top: null,
//     bottom: null
//   });

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const [productsRes, ordersRes] = await Promise.all([
//         axios.get('http://localhost:5000/api/products'),
//         axios.get('http://localhost:5000/api/admin/orders')
//       ]);
      
//       setProducts(productsRes.data);
//       setOrders(ordersRes.data || []);
      
//       // Calculate stats
//       const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
//       const today = new Date().toDateString();
//       const todayOrders = ordersRes.data?.filter(order => 
//         new Date(order.timestamp).toDateString() === today
//       ).length || 0;

//       setStats({
//         totalProducts: productsRes.data.length,
//         totalOrders: ordersRes.data?.length || 0,
//         totalRevenue,
//         todayOrders
//       });
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageUpload = async (file, angle = 'main') => {
//     const validation = validateImage(file);
//     if (!validation.valid) {
//       alert(validation.error);
//       return;
//     }

//     setUploadingImages(true);
//     setUploadProgress(0);

//     try {
//       // Optimize image
//       setUploadProgress(25);
//       const optimizedBlob = await optimizeImage(file);
      
//       // Remove background (optional - can be toggled)
//       setUploadProgress(50);
//       const processedBlob = await removeBackground(optimizedBlob);
      
//       // Convert to base64 for storage
//       setUploadProgress(75);
//       const base64 = await convertToBase64(processedBlob);
      
//       setUploadProgress(100);
      
//       if (angle === 'main') {
//         setProductForm({ ...productForm, image: base64 });
//         setImagePreview(base64);
//       } else {
//         setImageAngles({ ...imageAngles, [angle]: base64 });
//       }
      
//       setTimeout(() => {
//         setUploadProgress(0);
//         setUploadingImages(false);
//       }, 500);
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       alert('Failed to upload image');
//       setUploadingImages(false);
//       setUploadProgress(0);
//     }
//   };

//   const handleProductSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Combine all images
//       const allImages = {
//         main: productForm.image,
//         ...imageAngles
//       };
      
//       const formData = {
//         ...productForm,
//         images: Object.values(allImages).filter(img => img !== null),
//         image: productForm.image || imageAngles.front
//       };

//       if (editingProduct) {
//         await axios.put(`http://localhost:5000/api/admin/products/${editingProduct._id}`, formData);
//       } else {
//         await axios.post('http://localhost:5000/api/admin/products', formData);
//       }
//       setShowProductForm(false);
//       setEditingProduct(null);
//       setProductForm({ 
//         title: '', price: '', image: '', description: '', category: '', rating: '', buyingPrice: '',
//         images: [], colors: [], sizes: {}
//       });
//       setImageAngles({ front: null, side: null, back: null, top: null, bottom: null });
//       setImagePreview(null);
//       fetchDashboardData();
//     } catch (error) {
//       console.error('Error saving product:', error);
//       alert('Error saving product');
//     }
//   };

//   const handleEditProduct = (product) => {
//     setEditingProduct(product);
//     setProductForm({
//       title: product.title,
//       price: product.price,
//       image: product.image,
//       description: product.description || '',
//       category: product.category || '',
//       rating: product.rating || '',
//       buyingPrice: product.buyingPrice || '',
//       images: product.images || [],
//       colors: product.colors || [],
//       sizes: product.sizes || {}
//     });
//     setImagePreview(product.image);
//     if (product.images && product.images.length > 0) {
//       const angles = {
//         front: product.images[0] || null,
//         side: product.images[1] || null,
//         back: product.images[2] || null,
//         top: product.images[3] || null,
//         bottom: product.images[4] || null
//       };
//       setImageAngles(angles);
//     }
//     setShowProductForm(true);
//   };

//   const handleDeleteProduct = async (id) => {
//     if (!confirm('Are you sure you want to delete this product?')) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/admin/products/${id}`);
//       fetchDashboardData();
//     } catch (error) {
//       console.error('Error deleting product:', error);
//       alert('Error deleting product');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-bg">
//         <span className="loading loading-spinner loading-lg text-primary"></span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-bg">
//       {/* Header */}
//       <div className="bg-primary text-white shadow-lg">
//         <div className="container mx-auto px-4 py-6">
//           <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//           <p className="text-gray-200">Manage your store</p>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-600">Total Products</p>
//                   <p className="text-3xl font-bold text-primary">{stats.totalProducts}</p>
//                 </div>
//                 <Package className="w-12 h-12 text-primary opacity-50" />
//               </div>
//             </div>
//           </div>

//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-600">Total Orders</p>
//                   <p className="text-3xl font-bold text-secondary">{stats.totalOrders}</p>
//                 </div>
//                 <ShoppingBag className="w-12 h-12 text-secondary opacity-50" />
//               </div>
//             </div>
//           </div>

//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-600">Total Revenue</p>
//                   <p className="text-3xl font-bold text-success">KES {stats.totalRevenue.toLocaleString()}</p>
//                 </div>
//                 <DollarSign className="w-12 h-12 text-success opacity-50" />
//               </div>
//             </div>
//           </div>

//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-600">Today's Orders</p>
//                   <p className="text-3xl font-bold text-info">{stats.todayOrders}</p>
//                 </div>
//                 <TrendingUp className="w-12 h-12 text-info opacity-50" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="tabs tabs-boxed mb-6">
//           <button
//             className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
//             onClick={() => setActiveTab('overview')}
//           >
//             Overview
//           </button>
//           <button
//             className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`}
//             onClick={() => setActiveTab('products')}
//           >
//             Products
//           </button>
//           <button
//             className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
//             onClick={() => setActiveTab('orders')}
//           >
//             Orders
//           </button>
//         </div>

//         {/* Overview Tab */}
//         {activeTab === 'overview' && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="card bg-base-100 shadow-xl">
//               <div className="card-body">
//                 <h2 className="card-title">Recent Orders</h2>
//                 <div className="overflow-x-auto">
//                   <table className="table table-zebra">
//                     <thead>
//                       <tr>
//                         <th>Order ID</th>
//                         <th>Phone</th>
//                         <th>Total</th>
//                         <th>Date</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {orders.slice(0, 5).map((order) => (
//                         <tr key={order._id}>
//                           <td className="font-mono text-xs">{order._id?.slice(-8)}</td>
//                           <td>{order.phone}</td>
//                           <td className="font-bold">KES {order.total?.toLocaleString()}</td>
//                           <td>{new Date(order.timestamp).toLocaleDateString()}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>

//             <div className="card bg-base-100 shadow-xl">
//               <div className="card-body">
//                 <h2 className="card-title">Top Products</h2>
//                 <div className="space-y-4">
//                   {products.slice(0, 5).map((product) => (
//                     <div key={product._id} className="flex items-center gap-4">
//                       <img
//                         src={product.image}
//                         alt={product.title}
//                         className="w-16 h-16 object-cover rounded"
//                       />
//                       <div className="flex-1">
//                         <p className="font-semibold">{product.title}</p>
//                         <p className="text-sm text-gray-600">KES {product.price.toLocaleString()}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Products Tab */}
//         {activeTab === 'products' && (
//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="card-title">Product Management</h2>
//                 <button
//                   className="btn btn-primary"
//                   onClick={() => {
//                     setEditingProduct(null);
//                     setProductForm({ 
//                       title: '', price: '', image: '', description: '', category: '', rating: '', buyingPrice: '',
//                       images: [], colors: [], sizes: {}
//                     });
//                     setImageAngles({ front: null, side: null, back: null, top: null, bottom: null });
//                     setImagePreview(null);
//                     setShowProductForm(true);
//                   }}
//                 >
//                   <Plus className="w-5 h-5 mr-2" />
//                   Add Product
//                 </button>
//               </div>

//               {showProductForm && (
//                 <div className="modal modal-open">
//                   <div className="modal-box">
//                     <h3 className="font-bold text-lg mb-4">
//                       {editingProduct ? 'Edit Product' : 'Add New Product'}
//                     </h3>
//                     <form onSubmit={handleProductSubmit}>
//                       <div className="form-control mb-4">
//                         <label className="label">
//                           <span className="label-text">Title</span>
//                         </label>
//                         <input
//                           type="text"
//                           className="input input-bordered"
//                           value={productForm.title}
//                           onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
//                           required
//                         />
//                       </div>
//                       <div className="grid grid-cols-2 gap-4 mb-4">
//                         <div className="form-control">
//                           <label className="label">
//                             <span className="label-text">Price (KES)</span>
//                           </label>
//                           <input
//                             type="number"
//                             className="input input-bordered"
//                             value={productForm.price}
//                             onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
//                             required
//                           />
//                         </div>
//                         <div className="form-control">
//                           <label className="label">
//                             <span className="label-text">Buying Price (KES)</span>
//                           </label>
//                           <input
//                             type="number"
//                             className="input input-bordered"
//                             value={productForm.buyingPrice}
//                             onChange={(e) => setProductForm({ ...productForm, buyingPrice: e.target.value })}
//                             required
//                           />
//                         </div>
//                       </div>
//                       {/* Image Upload Section */}
//                       <div className="form-control mb-4">
//                         <label className="label">
//                           <span className="label-text font-bold">Main Product Image</span>
//                         </label>
//                         <div className="flex gap-4 items-center">
//                           <input
//                             type="file"
//                             accept="image/*"
//                             ref={fileInputRef}
//                             onChange={(e) => {
//                               const file = e.target.files[0];
//                               if (file) handleImageUpload(file, 'main');
//                             }}
//                             className="file-input file-input-bordered flex-1"
//                           />
//                           <button
//                             type="button"
//                             className="btn btn-outline"
//                             onClick={() => fileInputRef.current?.click()}
//                           >
//                             <Upload className="w-4 h-4 mr-2" />
//                             Upload
//                           </button>
//                         </div>
//                         {uploadingImages && (
//                           <progress className="progress progress-primary w-full mt-2" value={uploadProgress} max="100"></progress>
//                         )}
//                         {imagePreview && (
//                           <div className="mt-4 relative">
//                             <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
//                             <button
//                               type="button"
//                               className="btn btn-sm btn-circle btn-error absolute -top-2 -right-2"
//                               onClick={() => {
//                                 setImagePreview(null);
//                                 setProductForm({ ...productForm, image: '' });
//                               }}
//                             >
//                               <X className="w-4 h-4" />
//                             </button>
//                           </div>
//                         )}
//                         <div className="mt-2">
//                           <input
//                             type="url"
//                             className="input input-bordered w-full"
//                             placeholder="Or enter image URL"
//                             value={productForm.image}
//                             onChange={(e) => {
//                               setProductForm({ ...productForm, image: e.target.value });
//                               setImagePreview(e.target.value);
//                             }}
//                           />
//                         </div>
//                       </div>

//                       {/* Multiple Angle Images */}
//                       <div className="form-control mb-4">
//                         <label className="label">
//                           <span className="label-text font-bold">Product Images (Different Angles)</span>
//                           <span className="label-text-alt text-gray-500">Optional - Upload front, side, back, top, bottom views</span>
//                         </label>
//                         <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
//                           {['front', 'side', 'back', 'top', 'bottom'].map((angle) => (
//                             <div key={angle} className="border-2 border-dashed border-gray-300 rounded p-2 text-center">
//                               <p className="text-xs font-semibold mb-2 capitalize">{angle}</p>
//                               {imageAngles[angle] ? (
//                                 <div className="relative">
//                                   <img src={imageAngles[angle]} alt={angle} className="w-full h-20 object-cover rounded" />
//                                   <button
//                                     type="button"
//                                     className="btn btn-xs btn-circle btn-error absolute -top-1 -right-1"
//                                     onClick={() => setImageAngles({ ...imageAngles, [angle]: null })}
//                                   >
//                                     <X className="w-3 h-3" />
//                                   </button>
//                                 </div>
//                               ) : (
//                                 <label className="cursor-pointer">
//                                   <input
//                                     type="file"
//                                     accept="image/*"
//                                     className="hidden"
//                                     onChange={(e) => {
//                                       const file = e.target.files[0];
//                                       if (file) handleImageUpload(file, angle);
//                                     }}
//                                   />
//                                   <div className="flex flex-col items-center justify-center h-20 text-gray-400 hover:text-primary transition-colors">
//                                     <ImageIcon className="w-6 h-6 mb-1" />
//                                     <span className="text-xs">Upload</span>
//                                   </div>
//                                 </label>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                         <div className="alert alert-info mt-2">
//                           <AlertCircle className="w-4 h-4" />
//                           <span className="text-xs">
//                             Images are automatically optimized and background removed. 
//                             You can upload 1-5 images depending on what you have available.
//                           </span>
//                         </div>
//                       </div>
//                       <div className="form-control mb-4">
//                         <label className="label">
//                           <span className="label-text">Description</span>
//                         </label>
//                         <textarea
//                           className="textarea textarea-bordered"
//                           value={productForm.description}
//                           onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
//                         />
//                       </div>
//                       <div className="grid grid-cols-2 gap-4 mb-4">
//                         <div className="form-control">
//                           <label className="label">
//                             <span className="label-text">Category</span>
//                           </label>
//                           <select
//                             className="select select-bordered"
//                             value={productForm.category}
//                             onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
//                           >
//                             <option value="">Select Category</option>
//                             <option value="Sneakers">Sneakers</option>
//                             <option value="Boots">Boots</option>
//                             <option value="Athletic">Athletic</option>
//                             <option value="Formal">Formal</option>
//                             <option value="Sandals">Sandals</option>
//                           </select>
//                         </div>
//                         <div className="form-control">
//                           <label className="label">
//                             <span className="label-text">Rating</span>
//                           </label>
//                           <input
//                             type="number"
//                             min="0"
//                             max="5"
//                             step="0.1"
//                             className="input input-bordered"
//                             value={productForm.rating}
//                             onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
//                           />
//                         </div>
//                       </div>
//                       <div className="modal-action">
//                         <button
//                           type="button"
//                           className="btn btn-ghost"
//                           onClick={() => {
//                             setShowProductForm(false);
//                             setEditingProduct(null);
//                           }}
//                         >
//                           Cancel
//                         </button>
//                         <button type="submit" className="btn btn-primary">
//                           {editingProduct ? 'Update' : 'Create'} Product
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               )}

//               <div className="overflow-x-auto">
//                 <table className="table table-zebra">
//                   <thead>
//                     <tr>
//                       <th>Image</th>
//                       <th>Title</th>
//                       <th>Category</th>
//                       <th>Price</th>
//                       <th>Rating</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {products.map((product) => (
//                       <tr key={product._id}>
//                         <td>
//                           <img
//                             src={product.image}
//                             alt={product.title}
//                             className="w-16 h-16 object-cover rounded"
//                           />
//                         </td>
//                         <td className="font-semibold">{product.title}</td>
//                         <td>
//                           <span className="badge badge-secondary">{product.category || 'N/A'}</span>
//                         </td>
//                         <td className="font-bold">KES {product.price.toLocaleString()}</td>
//                         <td>{product.rating || 'N/A'}</td>
//                         <td>
//                           <div className="flex gap-2">
//                             <button
//                               className="btn btn-sm btn-primary"
//                               onClick={() => handleEditProduct(product)}
//                             >
//                               <Edit className="w-4 h-4" />
//                             </button>
//                             <button
//                               className="btn btn-sm btn-error"
//                               onClick={() => handleDeleteProduct(product._id)}
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Orders Tab */}
//         {activeTab === 'orders' && (
//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="card-title">Order Management</h2>
//                 <button className="btn btn-ghost btn-sm" onClick={fetchDashboardData}>
//                   <RefreshCw className="w-4 h-4 mr-2" />
//                   Refresh
//                 </button>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="table table-zebra">
//                   <thead>
//                     <tr>
//                       <th>Order ID</th>
//                       <th>Phone</th>
//                       <th>Location</th>
//                       <th>Items</th>
//                       <th>Total</th>
//                       <th>Date</th>
//                       <th>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {orders.map((order) => (
//                       <tr key={order._id}>
//                         <td className="font-mono text-xs">{order._id?.slice(-8)}</td>
//                         <td>{order.phone}</td>
//                         <td>{order.location}</td>
//                         <td>{order.cartItems?.length || 0} items</td>
//                         <td className="font-bold">KES {order.total?.toLocaleString()}</td>
//                         <td>{new Date(order.timestamp).toLocaleString()}</td>
//                         <td>
//                           <span className="badge badge-success">Completed</span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

