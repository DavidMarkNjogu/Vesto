import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Package, Search, Plus, Save, Edit2, Trash2 } from 'lucide-react';

// COMPONENTS (Ensure these exist in client/src/components/common)
import StatusBadge from '../../components/common/StatusBadge';
import { ActionGroup, EditBtn, DeleteBtn } from '../../components/common/ActionButtons';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Modal from '../../components/common/Modal';

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for Add Modal

  // Form State for New Product
  const [newProduct, setNewProduct] = useState({ title: '', category: 'Sneakers', price: '', stock: 10 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Replace with your real API endpoint if needed
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/products/${selectedProduct._id}`);
      setProducts(prev => prev.filter(p => p._id !== selectedProduct._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // HANDLER: Add New Product
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    // Simulate API call
    const mockProduct = { 
      ...newProduct, 
      _id: `NEW-${Date.now()}`, 
      image: 'https://via.placeholder.com/150' 
    };
    
    // Optimistic Update (Add to list immediately)
    setProducts([mockProduct, ...products]);
    setIsAddModalOpen(false);
    setNewProduct({ title: '', category: 'Sneakers', price: '', stock: 10 }); // Reset form
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Inventory</h1>
          <p className="text-gray-500">Manage your product listings and stock levels.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} // Opens the Modal
          className="btn btn-primary btn-sm gap-2 text-white shadow-lg hover:-translate-y-0.5 transition-transform"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search products..." className="input input-bordered input-sm w-full pl-9" />
          </div>
        </div>
        
        <table className="table w-full">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8"><span className="loading loading-spinner text-primary"></span></td></tr>
            ) : products.map(product => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12 bg-gray-100">
                        <img src={product.image} alt={product.title} onError={(e) => e.target.src='https://via.placeholder.com/50'} />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{product.title}</div>
                      <div className="text-xs text-gray-500">Ref: {product._id.slice(-6)}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-ghost badge-sm">{product.category}</span></td>
                <td className="font-bold text-gray-700">KES {Number(product.price).toLocaleString()}</td>
                <td><StatusBadge status="active" /></td>
                <td>
                  <ActionGroup>
                    <EditBtn onClick={() => handleEditClick(product)} />
                    <DeleteBtn onClick={() => handleDeleteClick(product)} />
                  </ActionGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Delete Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to remove "${selectedProduct?.title}"?`}
        confirmText="Delete Product"
      />

      {/* 2. Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
      >
        <div className="space-y-4">
          <div>
            <label className="label text-xs font-bold text-gray-500 uppercase">Product Title</label>
            <input type="text" defaultValue={selectedProduct?.title} className="input input-bordered w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-xs font-bold text-gray-500 uppercase">Price</label>
              <input type="number" defaultValue={selectedProduct?.price} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label text-xs font-bold text-gray-500 uppercase">Stock</label>
              <input type="number" defaultValue="10" className="input input-bordered w-full" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button className="btn btn-primary text-white" onClick={() => setIsEditModalOpen(false)}>Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* 3. Add Product Modal (The Fix) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="label text-xs font-bold text-gray-500 uppercase">Product Title</label>
            <input 
              type="text" 
              required
              className="input input-bordered w-full" 
              placeholder="e.g. Nike Air Max"
              value={newProduct.title}
              onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-xs font-bold text-gray-500 uppercase">Category</label>
              <select 
                className="select select-bordered w-full"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option>Sneakers</option>
                <option>Boots</option>
                <option>Formal</option>
              </select>
            </div>
            <div>
              <label className="label text-xs font-bold text-gray-500 uppercase">Price (KES)</label>
              <input 
                type="number" 
                required
                className="input input-bordered w-full" 
                placeholder="4500"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="btn btn-primary text-white gap-2">
              <Save size={18} /> Create Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupplierProducts;