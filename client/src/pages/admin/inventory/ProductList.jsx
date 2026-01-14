import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  Package, Plus, Edit, Trash2, X, Upload, Image as ImageIcon, 
  RefreshCw, AlertCircle, Search 
} from 'lucide-react';
import { optimizeImage, removeBackground, convertToBase64, validateImage } from '../../../utils/imageOptimizer';
import StatusBadge from '../../../components/common/StatusBadge';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import Modal from '../../../components/common/Modal';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  // Form State
  const getInitialFormState = () => ({
    title: '', price: '', image: '', description: '', category: '', rating: '', buyingPrice: '',
    images: [], colors: [], sizes: {}
  });
  const [productForm, setProductForm] = useState(getInitialFormState());
  
  // Image State
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAngles, setImageAngles] = useState({ front: null, side: null, back: null, top: null, bottom: null });
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleImageUpload = async (file, angle = 'main') => {
    const validation = validateImage(file);
    if (!validation.valid) return setErrorModal({ isOpen: true, message: validation.error });

    setUploadingImages(true);
    try {
      const optimizedBlob = await optimizeImage(file);
      const processedBlob = await removeBackground(optimizedBlob);
      const base64 = await convertToBase64(processedBlob);
      
      if (angle === 'main') {
        setProductForm(prev => ({ ...prev, image: base64 }));
        setImagePreview(base64);
      } else {
        setImageAngles(prev => ({ ...prev, [angle]: base64 }));
      }
    } catch (error) {
      setErrorModal({ isOpen: true, message: 'Image processing failed.' });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const allImages = { main: productForm.image, ...imageAngles };
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
      setSuccessModal({ isOpen: true, message: 'Inventory updated successfully.' });
      fetchProducts();
      resetForm();
    } catch (err) {
      setErrorModal({ isOpen: true, message: 'Failed to save product.' });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm(getInitialFormState());
    setImageAngles({ front: null, side: null, back: null, top: null, bottom: null });
    setImagePreview(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title, price: product.price, image: product.image,
      description: product.description || '', category: product.category || '',
      rating: product.rating || '', buyingPrice: product.buyingPrice || '',
      images: product.images || [], colors: product.colors || [], sizes: product.sizes || {}
    });
    setImagePreview(product.image);
    // Populate angles logic would go here
    setShowProductForm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/products/${deleteModal.productId}`);
      setDeleteModal({ isOpen: false, productId: null });
      fetchProducts();
      setSuccessModal({ isOpen: true, message: 'Product deleted.' });
    } catch (err) {
      setErrorModal({ isOpen: true, message: 'Delete failed.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Inventory Management</h1>
        <button onClick={() => { resetForm(); setShowProductForm(true); }} className="btn btn-primary btn-sm gap-2 text-white">
          <Plus size={16}/> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
              <tr><th className="pl-6">Product</th><th>Category</th><th>Price</th><th>Stock Ref</th><th className="text-right pr-6">Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="pl-6">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 rounded object-cover border" onError={(e)=>e.target.src='https://via.placeholder.com/40'}/>
                      <div><div className="font-bold text-sm">{p.title}</div><div className="text-[10px] text-gray-500">#{p._id.slice(-6)}</div></div>
                    </div>
                  </td>
                  <td><span className="badge badge-ghost badge-sm">{p.category}</span></td>
                  <td className="font-mono text-sm font-bold">KES {Number(p.price).toLocaleString()}</td>
                  <td className="text-xs text-gray-500">In Stock</td>
                  <td className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="btn btn-square btn-xs btn-ghost text-blue-600"><Edit size={14}/></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, productId: p._id })} className="btn btn-square btn-xs btn-ghost text-red-600"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CONFIRMATION & FEEDBACK MODALS --- */}
      <ConfirmationModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, productId: null })} 
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to remove this product?"
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
      
      <Modal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false })} title="Success" size="sm">
        <div className="text-center p-4">
          <p className="text-green-600 font-medium mb-4">{successModal.message}</p>
          <button onClick={() => setSuccessModal({ isOpen: false })} className="btn btn-primary btn-sm w-full text-white">OK</button>
        </div>
      </Modal>

      {/* --- VIBRANT PRODUCT FORM MODAL --- */}
      {showProductForm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowProductForm(false)}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Vibrant Header */}
              <div className="bg-primary px-8 py-5 flex justify-between items-center text-white shadow-md">
                <h3 className="font-bold text-xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setShowProductForm(false)} className="btn btn-sm btn-circle btn-ghost text-white"><X size={24}/></button>
              </div>
              
              <div className="p-8 overflow-y-auto bg-gray-50 custom-scrollbar">
                <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Info */}
                  <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Package size={16} className="text-primary"/> Product Info</h4>
                    <div className="form-control">
                      <label className="label font-bold text-gray-700">Title</label>
                      <input type="text" className="input input-bordered w-full" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label font-bold text-gray-700">Price</label>
                        <input type="number" className="input input-bordered w-full" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                      </div>
                      <div className="form-control">
                        <label className="label font-bold text-gray-700">Category</label>
                        <select className="select select-bordered w-full" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                          <option>Sneakers</option><option>Boots</option><option>Formal</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right: Images */}
                  <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><ImageIcon size={16} className="text-primary"/> Gallery</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                      {imagePreview ? <img src={imagePreview} className="h-40 mx-auto object-contain"/> : <div className="py-4"><Upload className="mx-auto text-gray-400 mb-2"/><p className="text-sm font-bold text-gray-600">Upload Main Image</p></div>}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {if(e.target.files[0]) handleImageUpload(e.target.files[0], 'main')}} />
                    </div>
                    {uploadingImages && <progress className="progress progress-primary w-full h-1" />}
                    <div className="alert alert-info py-2 text-xs flex gap-2"><AlertCircle size={14}/> Images are optimized automatically.</div>
                  </div>
                </form>
              </div>

              <div className="bg-white px-8 py-5 border-t border-gray-200 flex justify-end gap-4">
                <button className="btn btn-ghost" onClick={() => setShowProductForm(false)}>Cancel</button>
                <button type="submit" form="product-form" className="btn btn-primary text-white shadow-lg px-8">Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;