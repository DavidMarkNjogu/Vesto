import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { optimizeImage, removeBackground, convertToBase64, validateImage } from '../utils/imageOptimizer';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/admin/orders')
      ]);
      
      setProducts(productsRes.data);
      setOrders(ordersRes.data || []);
      
      // Calculate stats
      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const today = new Date().toDateString();
      const todayOrders = ordersRes.data?.filter(order => 
        new Date(order.timestamp).toDateString() === today
      ).length || 0;

      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: ordersRes.data?.length || 0,
        totalRevenue,
        todayOrders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ 
        title: '', price: '', image: '', description: '', category: '', rating: '', buyingPrice: '',
        images: [], colors: [], sizes: {}
      });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-200">Manage your store</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalProducts}</p>
                </div>
                <Package className="w-12 h-12 text-primary opacity-50" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-secondary">{stats.totalOrders}</p>
                </div>
                <ShoppingBag className="w-12 h-12 text-secondary opacity-50" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-success">KES {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-12 h-12 text-success opacity-50" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Today's Orders</p>
                  <p className="text-3xl font-bold text-info">{stats.todayOrders}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-info opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Phone</th>
                        <th>Total</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id}>
                          <td className="font-mono text-xs">{order._id?.slice(-8)}</td>
                          <td>{order.phone}</td>
                          <td className="font-bold">KES {order.total?.toLocaleString()}</td>
                          <td>{new Date(order.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Top Products</h2>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product) => (
                    <div key={product._id} className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{product.title}</p>
                        <p className="text-sm text-gray-600">KES {product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Product Management</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({ 
                      title: '', price: '', image: '', description: '', category: '', rating: '', buyingPrice: '',
                      images: [], colors: [], sizes: {}
                    });
                    setImageAngles({ front: null, side: null, back: null, top: null, bottom: null });
                    setImagePreview(null);
                    setShowProductForm(true);
                  }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>

              {showProductForm && (
                <div className="modal modal-open">
                  <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <form onSubmit={handleProductSubmit}>
                      <div className="form-control mb-4">
                        <label className="label">
                          <span className="label-text">Title</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={productForm.title}
                          onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Price (KES)</span>
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Buying Price (KES)</span>
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={productForm.buyingPrice}
                            onChange={(e) => setProductForm({ ...productForm, buyingPrice: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      {/* Image Upload Section */}
                      <div className="form-control mb-4">
                        <label className="label">
                          <span className="label-text font-bold">Main Product Image</span>
                        </label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleImageUpload(file, 'main');
                            }}
                            className="file-input file-input-bordered flex-1"
                          />
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </button>
                        </div>
                        {uploadingImages && (
                          <progress className="progress progress-primary w-full mt-2" value={uploadProgress} max="100"></progress>
                        )}
                        {imagePreview && (
                          <div className="mt-4 relative">
                            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                            <button
                              type="button"
                              className="btn btn-sm btn-circle btn-error absolute -top-2 -right-2"
                              onClick={() => {
                                setImagePreview(null);
                                setProductForm({ ...productForm, image: '' });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="mt-2">
                          <input
                            type="url"
                            className="input input-bordered w-full"
                            placeholder="Or enter image URL"
                            value={productForm.image}
                            onChange={(e) => {
                              setProductForm({ ...productForm, image: e.target.value });
                              setImagePreview(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      {/* Multiple Angle Images */}
                      <div className="form-control mb-4">
                        <label className="label">
                          <span className="label-text font-bold">Product Images (Different Angles)</span>
                          <span className="label-text-alt text-gray-500">Optional - Upload front, side, back, top, bottom views</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {['front', 'side', 'back', 'top', 'bottom'].map((angle) => (
                            <div key={angle} className="border-2 border-dashed border-gray-300 rounded p-2 text-center">
                              <p className="text-xs font-semibold mb-2 capitalize">{angle}</p>
                              {imageAngles[angle] ? (
                                <div className="relative">
                                  <img src={imageAngles[angle]} alt={angle} className="w-full h-20 object-cover rounded" />
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-circle btn-error absolute -top-1 -right-1"
                                    onClick={() => setImageAngles({ ...imageAngles, [angle]: null })}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) handleImageUpload(file, angle);
                                    }}
                                  />
                                  <div className="flex flex-col items-center justify-center h-20 text-gray-400 hover:text-primary transition-colors">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-xs">Upload</span>
                                  </div>
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="alert alert-info mt-2">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">
                            Images are automatically optimized and background removed. 
                            You can upload 1-5 images depending on what you have available.
                          </span>
                        </div>
                      </div>
                      <div className="form-control mb-4">
                        <label className="label">
                          <span className="label-text">Description</span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Category</span>
                          </label>
                          <select
                            className="select select-bordered"
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          >
                            <option value="">Select Category</option>
                            <option value="Sneakers">Sneakers</option>
                            <option value="Boots">Boots</option>
                            <option value="Athletic">Athletic</option>
                            <option value="Formal">Formal</option>
                            <option value="Sandals">Sandals</option>
                          </select>
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Rating</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            className="input input-bordered"
                            value={productForm.rating}
                            onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="modal-action">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProduct(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {editingProduct ? 'Update' : 'Create'} Product
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="font-semibold">{product.title}</td>
                        <td>
                          <span className="badge badge-secondary">{product.category || 'N/A'}</span>
                        </td>
                        <td className="font-bold">KES {product.price.toLocaleString()}</td>
                        <td>{product.rating || 'N/A'}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-sm btn-error"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Order Management</h2>
                <button className="btn btn-ghost btn-sm" onClick={fetchDashboardData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="font-mono text-xs">{order._id?.slice(-8)}</td>
                        <td>{order.phone}</td>
                        <td>{order.location}</td>
                        <td>{order.cartItems?.length || 0} items</td>
                        <td className="font-bold">KES {order.total?.toLocaleString()}</td>
                        <td>{new Date(order.timestamp).toLocaleString()}</td>
                        <td>
                          <span className="badge badge-success">Completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

