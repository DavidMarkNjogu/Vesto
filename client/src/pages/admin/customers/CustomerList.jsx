import { useState } from 'react';
import { Users, Search, Mail, Phone, MapPin } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';

const MOCK_CUSTOMERS = [
  { _id: 'C001', name: 'Alice Wambui', email: 'alice@example.com', phone: '0712 345 678', location: 'Nairobi', orders: 12, status: 'active' },
  { _id: 'C002', name: 'Brian K.', email: 'brian@example.com', phone: '0722 000 000', location: 'Mombasa', orders: 3, status: 'active' },
];

const CustomerList = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Customer Directory</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search..." className="input input-bordered input-sm w-full pl-9" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="table w-full">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr><th className="pl-6">Customer</th><th>Contact</th><th>Location</th><th>Orders</th><th>Status</th></tr>
          </thead>
          <tbody>
            {MOCK_CUSTOMERS.map(c => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="pl-6 font-bold text-gray-800">{c.name}</td>
                <td className="text-sm"><div className="flex items-center gap-1"><Mail size={12}/>{c.email}</div></td>
                <td className="text-sm text-gray-600"><MapPin size={12} className="inline mr-1"/>{c.location}</td>
                <td className="font-bold">{c.orders}</td>
                <td><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;