import { useState } from 'react';
import { Search, Mail, MapPin } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';

const MOCK_CUSTOMERS = [
  { _id: 'C001', name: 'Alice Wambui', email: 'alice@example.com', location: 'Nairobi', orders: 12, status: 'active' },
  { _id: 'C002', name: 'Brian K.', email: 'brian@example.com', location: 'Mombasa', orders: 3, status: 'active' },
];

const CustomerList = () => {
  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <h1 className="text-xl font-bold text-gray-800">Customers</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search customers..." className="input input-bordered input-sm w-full pl-9" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase font-bold">
              <tr>
                <th className="pl-4 sm:pl-6">Name</th>
                <th className="hidden sm:table-cell">Contact</th>
                <th>Loc</th>
                <th>Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm">
              {MOCK_CUSTOMERS.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 border-b border-gray-50">
                  <td className="pl-4 sm:pl-6 font-bold text-gray-800">{c.name}</td>
                  <td className="hidden sm:table-cell text-gray-500"><div className="flex items-center gap-1"><Mail size={12}/>{c.email}</div></td>
                  <td className="text-gray-600"><div className="flex items-center gap-1"><MapPin size={12} className="sm:hidden"/> <span className="hidden sm:inline">{c.location}</span><span className="sm:hidden">{c.location.substring(0,3)}</span></div></td>
                  <td className="font-bold">{c.orders}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;