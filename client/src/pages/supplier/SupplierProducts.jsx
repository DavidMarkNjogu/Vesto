import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, Plus, Edit2, Archive } from 'lucide-react';

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch /api/supplier/products
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
              <th>Stock Status</th>
              <th>Actions</th>
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
                      <div className="mask mask-squircle w-12 h-12">
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
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">In Stock (8)</span>
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-square btn-ghost btn-sm text-gray-400 hover:text-blue-500"><Edit2 size={16}/></button>
                    <button className="btn btn-square btn-ghost btn-sm text-gray-400 hover:text-red-500"><Archive size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierProducts;