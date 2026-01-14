import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, Plus } from 'lucide-react';

// NEW COMPONENTS
import StatusBadge from '../../components/common/StatusBadge';
import { ActionGroup, EditBtn, DeleteBtn } from '../../components/common/ActionButtons';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Modal from '../../components/common/Modal';

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Inventory</h1>
          <p className="text-gray-500">Manage your product listings and stock levels.</p>
        </div>
        <button className="btn btn-primary btn-sm gap-2 text-white">
          <Plus size={16} /> Add Product
        </button>
      </div>

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
                        <img src={product.image} alt={product.title} />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{product.title}</div>
                      <div className="text-xs text-gray-500">Ref: {product._id.slice(-6)}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-ghost badge-sm">{product.category}</span></td>
                <td className="font-bold text-gray-700">KES {product.price.toLocaleString()}</td>
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
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to remove "${selectedProduct?.title}" from your inventory?`}
        confirmText="Delete Product"
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
      >
        {/* Simple Edit Form Mock */}
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
    </div>
  );
};

export default SupplierProducts;