import { useEffect, useState, useRef } from 'react';
import api from '../../../utils/api';
import { 
  Package, Plus, Edit, Trash2, X, Upload, Image as ImageIcon, 
  RefreshCw, AlertCircle, Search, Check 
} from 'lucide-react';
import { optimizeImage, removeBackground, convertToBase64, validateImage } from '../../../utils/imageOptimizer';
import StatusBadge from '../../../components/common/StatusBadge';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import Modal from '../../../components/common/Modal';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  const getInitialFormState = () => ({
    title: '', price: '', image: '', description: '', category: '', rating: '', buyingPrice: '',
    images: [], colors: [], sizes: {}
  });
  const [productForm, setProductForm] = useState(getInitialFormState());
  
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAngles, setImageAngles] = useState({ front: null, side: null, back: null, top: null, bottom: null });
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleImageUpload = async (file, angle = 'main') => {
    const validation = validateImage(file);
    if (!validation.valid) return setErrorModal({ isOpen: true, title: 'Upload Error', message: validation.error });

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
      setErrorModal({ isOpen: true, title: 'Upload Failed', message: 'Could not process image.' });
    } finally {
      setUploadingImages(false);
    }
  };

  const processSubmission = async () => {
    if (!productForm.title || !productForm.price) throw new Error("Title and Price are required.");

    const allImages = { main: productForm.image, ...imageAngles };
    const formData = {
      ...productForm,
      images: Object.values(allImages).filter(img => img !== null),
      image: productForm.image || imageAngles.front
    };

    if (editingProduct) {
      await api.put(`/admin/products/${editingProduct._id}`, formData);
    } else {
      await api.post('/admin/products', formData);
    }
    
    closeForm();
    fetchProducts();
    setSuccessModal({ 
      isOpen: true, 
      title: editingProduct ? 'Product Updated' : 'Product Created', 
      message: `Successfully ${editingProduct ? 'updated' : 'added'} "${formData.title}" to inventory.` 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await processSubmission();
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      setErrorModal({ isOpen: true, title: 'Save Failed', message: msg });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/products/${deleteModal.productId}`);
      setDeleteModal({ isOpen: false, productId: null });
      fetchProducts();
      setSuccessModal({ isOpen: true, title: 'Deleted', message: 'Product removed from inventory.' });
    } catch (err) {
      setErrorModal({ isOpen: true, title: 'Delete Failed', message: 'Could not delete product.' });
    }
  };

  const closeForm = () => {
    setShowProductForm(false);
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
    // Note: Deep populate of angles would happen here if stored separately
    setShowProductForm(true);
  };

  if (loading) return <div className="p-12 flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Inventory</h1>
          <p className="text-xs text-gray-500">Manage stock & prices.</p>
        </div>
        <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search products..." className="input input-bordered input-sm pl-9 w-full" />
          </div>
          <button 
            onClick={() => { closeForm(); setShowProductForm(true); }} 
            className="btn btn-primary btn-sm gap-2 text-white w-full sm:w-auto shadow-md"
          >
            <Plus size={16}/> Add Product
          </button>
        </div>
      </div>

      {/* Main Table - Scrollable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase font-bold">
              <tr>
                <th className="pl-4 sm:pl-6">Product</th>
                <th>Category</th>
                <th>Price</th>
                <th className="hidden sm:table-cell">Buying Price</th>
                <th className="hidden md:table-cell">Stock Ref</th>
                <th className="text-right pr-4 sm:pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 border-b border-gray-50">
                  <td className="pl-4 sm:pl-6">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover border" onError={(e)=>e.target.src='https://via.placeholder.com/40'}/>
                      <div className="max-w-[120px] sm:max-w-xs truncate">
                        <div className="font-bold text-gray-800 truncate">{p.title}</div>
                        <div className="text-[10px] text-gray-500 truncate md:hidden">#{p._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-ghost badge-sm text-[10px]">{p.category}</span></td>
                  <td className="font-mono font-bold">KES {Number(p.price).toLocaleString()}</td>
                  <td className="hidden sm:table-cell font-mono text-gray-500">KES {Number(p.buyingPrice || 0).toLocaleString()}</td>
                  <td className="hidden md:table-cell font-mono text-[10px] text-gray-400">#{p._id.slice(-6).toUpperCase()}</td>
                  <td className="text-right pr-4 sm:pr-6">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button onClick={() => handleEdit(p)} className="btn btn-square btn-xs btn-ghost text-blue-600"><Edit size={14}/></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, productId: p._id, productName: p.title })} className="btn btn-square btn-xs btn-ghost text-red-600"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CONFIRMATION MODALS (Unchanged logic) --- */}
      <ConfirmationModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} 
        onConfirm={handleDelete}
        title="Delete Product?"
        message={`Delete "${deleteModal.productName}" permanently?`}
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        zIndex="z-[200]"
      />
      <ConfirmationModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        onConfirm={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        confirmText="OK"
        confirmColor="bg-gray-600 hover:bg-gray-700"
        zIndex="z-[200]"
      />
      <Modal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ ...successModal, isOpen: false })} title={successModal.title} size="sm" zIndex="z-[200]">
        <div className="text-center p-4">
          <Check size={32} className="text-green-600 mx-auto mb-2" strokeWidth={3} />
          <p className="text-gray-600 font-medium mb-4">{successModal.message}</p>
          <button onClick={() => setSuccessModal({ ...successModal, isOpen: false })} className="btn btn-primary btn-sm w-full text-white">OK</button>
        </div>
      </Modal>

      {/* --- PRODUCT FORM MODAL --- */}
      {showProductForm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog">
          <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeForm}></div>
            
            <div className="relative bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-primary px-4 sm:px-8 py-4 flex justify-between items-center text-white shadow-md shrink-0">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-white/10 rounded-lg"><Edit size={18} /></div>
                   <h3 className="font-bold text-lg sm:text-xl">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                </div>
                <button onClick={closeForm} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"><X size={20}/></button>
              </div>
              
              {/* Scrollable Form Body */}
              <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-gray-50 custom-scrollbar">
                <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  
                  {/* LEFT: Info */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wider border-b pb-2">
                        <Package size={16} className="text-primary"/> Info
                      </h4>
                      <div className="form-control mb-3">
                        <label className="label py-1"><span className="label-text font-bold text-gray-700 text-xs sm:text-sm">Title</span></label>
                        <input type="text" className="input input-bordered w-full input-sm sm:input-md" placeholder="e.g. Nike Air" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="form-control">
                          <label className="label py-1"><span className="label-text font-bold text-gray-700 text-xs sm:text-sm">Price</span></label>
                          <input type="number" className="input input-bordered w-full input-sm sm:input-md" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                        </div>
                        <div className="form-control">
                          <label className="label py-1"><span className="label-text font-bold text-gray-700 text-xs sm:text-sm">Buy Price</span></label>
                          <input type="number" className="input input-bordered w-full input-sm sm:input-md" value={productForm.buyingPrice} onChange={e => setProductForm({...productForm, buyingPrice: e.target.value})} required />
                        </div>
                      </div>
                      <div className="form-control mb-3">
                        <label className="label py-1"><span className="label-text font-bold text-gray-700 text-xs sm:text-sm">Category</span></label>
                        <select className="select select-bordered w-full select-sm sm:select-md" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                          <option value="">Select...</option><option>Sneakers</option><option>Boots</option><option>Formal</option><option>Sandals</option>
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label py-1"><span className="label-text font-bold text-gray-700 text-xs sm:text-sm">Description</span></label>
                        <textarea className="textarea textarea-bordered h-24 text-xs sm:text-sm" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}></textarea>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Images */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wider border-b pb-2">
                        <ImageIcon size={16} className="text-primary"/> Gallery
                      </h4>
                      <div className="form-control mb-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer bg-gray-50 hover:bg-blue-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                          {imagePreview ? (
                            <img src={imagePreview} className="h-32 sm:h-40 mx-auto object-contain rounded-lg"/>
                          ) : (
                            <div className="py-6">
                              <Upload className="mx-auto text-gray-400 mb-2 w-6 h-6"/><p className="text-xs sm:text-sm font-bold text-gray-600">Upload Main</p>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {if(e.target.files[0]) handleImageUpload(e.target.files[0], 'main')}} />
                        </div>
                        {uploadingImages && <progress className="progress progress-primary w-full mt-2 h-1" />}
                      </div>

                      {/* Angles Grid */}
                      <div className="grid grid-cols-5 gap-2">
                        {['front', 'side', 'back', 'top', 'bottom'].map((angle) => (
                          <div key={angle} className="aspect-square border border-dashed border-gray-300 rounded-lg flex items-center justify-center relative hover:bg-blue-50 bg-white cursor-pointer overflow-hidden">
                            {imageAngles[angle] ? (
                              <>
                                <img src={imageAngles[angle]} className="w-full h-full object-cover" />
                                <button type="button" onClick={(e) => {e.stopPropagation(); setImageAngles(prev => ({...prev, [angle]: null}))}} className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity"><X size={12}/></button>
                              </>
                            ) : (
                              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-1">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {if(e.target.files[0]) handleImageUpload(e.target.files[0], angle)}} />
                                <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase">{angle}</span>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-white px-4 sm:px-8 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button className="btn btn-ghost hover:bg-gray-100 btn-sm" onClick={closeForm}>Cancel</button>
                <button type="submit" form="product-form" className="btn btn-primary text-white shadow-lg btn-sm px-6">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
// import { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import { 
//   Package, Plus, Edit, Trash2, X, Upload, Image as ImageIcon, 
//   RefreshCw, AlertCircle, Search, Check 
// } from 'lucide-react';
// import { optimizeImage, removeBackground, convertToBase64, validateImage } from '../../../utils/imageOptimizer';
// import StatusBadge from '../../../components/common/StatusBadge';
// import ConfirmationModal from '../../../components/common/ConfirmationModal';
// import Modal from '../../../components/common/Modal';

// const ProductList = () => {
//   // --- STATE ---
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Modal States
//   const [showProductForm, setShowProductForm] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
  
//   // Feedback States
//   const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });
//   const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
//   const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

//   // Form State
//   const getInitialFormState = () => ({
//     title: '', price: '', image: '', description: '', category: '', rating: '', buyingPrice: '',
//     images: [], colors: [], sizes: {}
//   });
//   const [productForm, setProductForm] = useState(getInitialFormState());
  
//   // Image Upload State
//   const [uploadingImages, setUploadingImages] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [imageAngles, setImageAngles] = useState({ front: null, side: null, back: null, top: null, bottom: null });
//   const fileInputRef = useRef(null);

//   // --- INITIALIZATION ---
//   useEffect(() => { fetchProducts(); }, []);

//   const fetchProducts = async () => {
//     try {
//       const res = await api.get('/products');
//       setProducts(res.data);
//     } catch (err) { console.error(err); } 
//     finally { setLoading(false); }
//   };

//   // --- IMAGE LOGIC (Exact replica from Dashboard) ---
//   const handleImageUpload = async (file, angle = 'main') => {
//     const validation = validateImage(file);
//     if (!validation.valid) return setErrorModal({ isOpen: true, title: 'Upload Error', message: validation.error });

//     setUploadingImages(true);
//     try {
//       const optimizedBlob = await optimizeImage(file);
//       const processedBlob = await removeBackground(optimizedBlob);
//       const base64 = await convertToBase64(processedBlob);
      
//       if (angle === 'main') {
//         setProductForm(prev => ({ ...prev, image: base64 }));
//         setImagePreview(base64);
//       } else {
//         setImageAngles(prev => ({ ...prev, [angle]: base64 }));
//       }
//     } catch (error) {
//       setErrorModal({ isOpen: true, title: 'Upload Failed', message: 'Could not process image.' });
//     } finally {
//       setUploadingImages(false);
//     }
//   };

//   // --- CRUD HANDLERS ---
//   const processSubmission = async () => {
//     if (!productForm.title || !productForm.price) throw new Error("Title and Price are required.");

//     const allImages = { main: productForm.image, ...imageAngles };
//     const formData = {
//       ...productForm,
//       images: Object.values(allImages).filter(img => img !== null),
//       image: productForm.image || imageAngles.front
//     };

//     if (editingProduct) {
//       await axios.put(`http://localhost:5000/api/admin/products/${editingProduct._id}`, formData);
//     } else {
//       await axios.post('http://localhost:5000/api/admin/products', formData);
//     }
    
//     closeForm();
//     fetchProducts();
//     setSuccessModal({ 
//       isOpen: true, 
//       title: editingProduct ? 'Product Updated' : 'Product Created', 
//       message: `Successfully ${editingProduct ? 'updated' : 'added'} "${formData.title}" to inventory.` 
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await processSubmission();
//     } catch (error) {
//       const msg = error.response?.data?.error || error.message;
//       setErrorModal({ isOpen: true, title: 'Save Failed', message: msg });
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await axios.delete(`http://localhost:5000/api/admin/products/${deleteModal.productId}`);
//       setDeleteModal({ isOpen: false, productId: null });
//       fetchProducts();
//       setSuccessModal({ isOpen: true, title: 'Deleted', message: 'Product removed from inventory.' });
//     } catch (err) {
//       setErrorModal({ isOpen: true, title: 'Delete Failed', message: 'Could not delete product.' });
//     }
//   };

//   // --- HELPERS ---
//   const closeForm = () => {
//     setShowProductForm(false);
//     setEditingProduct(null);
//     setProductForm(getInitialFormState());
//     setImageAngles({ front: null, side: null, back: null, top: null, bottom: null });
//     setImagePreview(null);
//   };

//   const handleEdit = (product) => {
//     setEditingProduct(product);
//     setProductForm({
//       title: product.title, price: product.price, image: product.image,
//       description: product.description || '', category: product.category || '',
//       rating: product.rating || '', buyingPrice: product.buyingPrice || '',
//       images: product.images || [], colors: product.colors || [], sizes: product.sizes || {}
//     });
//     setImagePreview(product.image);
//     if (product.images && product.images.length > 0) {
//       setImageAngles({
//         front: product.images[0] || null,
//         side: product.images[1] || null,
//         back: product.images[2] || null,
//         top: product.images[3] || null,
//         bottom: product.images[4] || null
//       });
//     }
//     setShowProductForm(true);
//   };

//   if (loading) return <div className="p-12 flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Page Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//         <div>
//           <h1 className="text-xl font-bold text-gray-800">Inventory Management</h1>
//           <p className="text-sm text-gray-500">Track stock, prices, and product details.</p>
//         </div>
//         <div className="flex gap-3">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input type="text" placeholder="Search products..." className="input input-bordered input-sm pl-9 w-64" />
//           </div>
//           <button 
//             onClick={() => { closeForm(); setShowProductForm(true); }} 
//             className="btn btn-primary btn-sm gap-2 text-white shadow-md hover:scale-105 transition-transform"
//           >
//             <Plus size={16}/> Add Product
//           </button>
//         </div>
//       </div>

//       {/* Main Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="table w-full">
//             <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
//               <tr>
//                 <th className="pl-6">Product</th>
//                 <th>Category</th>
//                 <th>Price</th>
//                 <th>Buying Price</th>
//                 <th>Stock Ref</th>
//                 <th className="text-right pr-6">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {products.map(p => (
//                 <tr key={p._id} className="hover:bg-gray-50 border-b border-gray-50 last:border-none group">
//                   <td className="pl-6">
//                     <div className="flex items-center gap-3">
//                       <img src={p.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" onError={(e)=>e.target.src='https://via.placeholder.com/40'}/>
//                       <div>
//                         <div className="font-bold text-sm text-gray-800">{p.title}</div>
//                         <div className="text-[10px] text-gray-500">{p.variants?.length || 0} Variants • {p.images?.length > 0 ? `+${p.images.length} images` : 'Main only'}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td><span className="badge badge-ghost badge-sm text-xs font-medium">{p.category}</span></td>
//                   <td className="font-mono text-sm font-bold text-gray-700">KES {Number(p.price).toLocaleString()}</td>
//                   <td className="font-mono text-sm text-gray-500">KES {Number(p.buyingPrice || 0).toLocaleString()}</td>
//                   <td className="font-mono text-xs text-gray-400">#{p._id.slice(-6).toUpperCase()}</td>
//                   <td className="text-right pr-6">
//                     <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
//                       <button onClick={() => handleEdit(p)} className="btn btn-square btn-xs btn-ghost text-blue-600 hover:bg-blue-50"><Edit size={14}/></button>
//                       <button onClick={() => setDeleteModal({ isOpen: true, productId: p._id, productName: p.title })} className="btn btn-square btn-xs btn-ghost text-red-600 hover:bg-red-50"><Trash2 size={14}/></button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* --- MODALS --- */}
      
//       <ConfirmationModal 
//         isOpen={deleteModal.isOpen} 
//         onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} 
//         onConfirm={handleDelete}
//         title="Delete Product?"
//         message={`Are you sure you want to permanently delete "${deleteModal.productName}"? This cannot be undone.`}
//         confirmText="Delete Permanently"
//         confirmColor="bg-red-600 hover:bg-red-700"
//         zIndex="z-[200]"
//       />
      
//       <ConfirmationModal
//         isOpen={errorModal.isOpen}
//         onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
//         onConfirm={() => setErrorModal({ ...errorModal, isOpen: false })}
//         title={errorModal.title}
//         message={errorModal.message}
//         confirmText="OK"
//         confirmColor="bg-gray-600 hover:bg-gray-700"
//         zIndex="z-[200]"
//       />

//       <Modal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ ...successModal, isOpen: false })} title={successModal.title} size="sm" zIndex="z-[200]">
//         <div className="text-center p-4">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
//             <Check size={32} className="text-green-600" strokeWidth={3} />
//           </div>
//           <p className="text-gray-600 font-medium mb-6">{successModal.message}</p>
//           <button onClick={() => setSuccessModal({ ...successModal, isOpen: false })} className="btn btn-primary btn-sm w-full text-white">OK, Great!</button>
//         </div>
//       </Modal>

//       {/* --- THE VIBRANT PRODUCT FORM (Exact Replica) --- */}
//       {showProductForm && (
//         <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog">
//           <div className="flex min-h-screen items-center justify-center p-4">
//             <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={closeForm}></div>
            
//             <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
//               {/* Vibrant Header */}
//               <div className="bg-primary px-8 py-5 flex justify-between items-center text-white shadow-md">
//                 <div className="flex items-center gap-3">
//                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
//                       {editingProduct ? <Edit size={20} /> : <Plus size={20} />}
//                    </div>
//                    <div>
//                       <h3 className="font-bold text-xl tracking-tight leading-none">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
//                       <p className="text-primary-content/70 text-xs mt-1">Fill in details to update your inventory.</p>
//                    </div>
//                 </div>
//                 <button onClick={closeForm} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"><X size={24}/></button>
//               </div>
              
//               <div className="p-8 overflow-y-auto flex-1 bg-gray-50 custom-scrollbar">
//                 <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
//                   {/* LEFT: Product Info */}
//                   <div className="space-y-6">
//                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//                       <h4 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wider border-b pb-2">
//                         <Package size={16} className="text-primary"/> Product Information
//                       </h4>
//                       <div className="form-control mb-4">
//                         <label className="label"><span className="label-text font-bold text-gray-700">Product Title</span></label>
//                         <input type="text" className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. Vesto Air Max" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} required />
//                       </div>
//                       <div className="grid grid-cols-2 gap-4 mb-4">
//                         <div className="form-control">
//                           <label className="label"><span className="label-text font-bold text-gray-700">Selling Price</span></label>
//                           <div className="relative">
//                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">KES</span>
//                             <input type="number" className="input input-bordered w-full pl-12" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
//                           </div>
//                         </div>
//                         <div className="form-control">
//                           <label className="label"><span className="label-text font-bold text-gray-700">Buying Price</span></label>
//                           <div className="relative">
//                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">KES</span>
//                             <input type="number" className="input input-bordered w-full pl-12" value={productForm.buyingPrice} onChange={e => setProductForm({...productForm, buyingPrice: e.target.value})} required />
//                           </div>
//                         </div>
//                       </div>
//                       <div className="form-control mb-4">
//                         <label className="label"><span className="label-text font-bold text-gray-700">Category</span></label>
//                         <select className="select select-bordered w-full font-medium" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
//                           <option value="">Select Category...</option><option>Sneakers</option><option>Boots</option><option>Formal</option><option>Sandals</option><option>Athletic</option>
//                         </select>
//                       </div>
//                       <div className="form-control">
//                         <label className="label"><span className="label-text font-bold text-gray-700">Description</span></label>
//                         <textarea className="textarea textarea-bordered h-32 resize-none text-sm leading-relaxed" placeholder="Describe material, fit, and key features..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}></textarea>
//                       </div>
//                     </div>
//                   </div>

//                   {/* RIGHT: Images */}
//                   <div className="space-y-6">
//                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//                       <h4 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wider border-b pb-2">
//                         <ImageIcon size={16} className="text-primary"/> Product Gallery
//                       </h4>
//                       <div className="form-control mb-6">
//                         <label className="label"><span className="label-text font-bold text-gray-700">Main Product Image</span></label>
//                         <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-primary/50 transition-all duration-300 group" onClick={() => fileInputRef.current?.click()}>
//                           {imagePreview ? (
//                             <div className="relative">
//                               <img src={imagePreview} className="h-48 mx-auto object-contain rounded-lg shadow-sm"/>
//                               <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-lg backdrop-blur-sm"><span className="btn btn-sm btn-white gap-2"><RefreshCw size={14}/> Change</span></div>
//                             </div>
//                           ) : (
//                             <div className="py-10">
//                               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform"><Upload className="w-8 h-8 text-primary"/></div>
//                               <p className="text-base font-bold text-gray-700">Click to upload main image</p>
//                               <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
//                             </div>
//                           )}
//                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {if(e.target.files[0]) handleImageUpload(e.target.files[0], 'main')}} />
//                         </div>
//                         {uploadingImages && <progress className="progress progress-primary w-full mt-2 h-1" />}
//                       </div>

//                       {/* Angles Grid */}
//                       <div className="form-control">
//                         <label className="label flex justify-between items-end"><span className="label-text font-bold text-gray-700">Additional Angles</span><span className="label-text-alt text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">Optional</span></label>
//                         <div className="grid grid-cols-5 gap-3 mt-1">
//                           {['front', 'side', 'back', 'top', 'bottom'].map((angle) => (
//                             <div key={angle} className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center relative hover:border-primary/50 hover:bg-blue-50 transition-all bg-white group cursor-pointer">
//                               {imageAngles[angle] ? (
//                                 <>
//                                   <img src={imageAngles[angle]} className="w-full h-full object-cover rounded-lg" />
//                                   <button type="button" onClick={(e) => {e.stopPropagation(); setImageAngles(prev => ({...prev, [angle]: null}))}} className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error shadow-sm scale-0 group-hover:scale-100 transition-transform"><X size={10} /></button>
//                                 </>
//                               ) : (
//                                 <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
//                                   <input type="file" accept="image/*" className="hidden" onChange={(e) => {if(e.target.files[0]) handleImageUpload(e.target.files[0], angle)}} />
//                                   <ImageIcon size={16} className="text-gray-300 group-hover:text-primary mb-1 transition-colors"/>
//                                   <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary uppercase tracking-wide transition-colors">{angle}</span>
//                                 </label>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                         <div className="alert alert-info mt-4 py-3 flex items-start shadow-sm border border-blue-100 bg-blue-50 text-blue-800">
//                           <AlertCircle size={18} className="shrink-0 mt-0.5" />
//                           <div><h3 className="font-bold text-xs">Pro Tip:</h3><p className="text-xs mt-0.5 opacity-90">Images are automatically optimized. Multiple angles boost conversion.</p></div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </form>
//               </div>

//               <div className="bg-white px-8 py-5 border-t border-gray-200 flex justify-end gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
//                 <button type="button" className="btn btn-ghost hover:bg-gray-100 font-medium text-gray-600 px-6" onClick={closeForm}>Cancel</button>
//                 <button type="submit" form="product-form" className="btn btn-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all px-8 text-base font-bold">
//                   {editingProduct ? 'Update Product' : 'Create Product'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductList;