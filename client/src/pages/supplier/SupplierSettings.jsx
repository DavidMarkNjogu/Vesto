import { useState } from 'react';
import { Save, User, CreditCard, Bell, Shield, Mail } from 'lucide-react';

const SupplierSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Simple, clean tab navigation
  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: User },
    { id: 'payment', label: 'Payment & Payouts', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-sm text-gray-500">Manage your supplier details and preferences.</p>
        </div>
        <button className="btn btn-primary text-white gap-2 shadow-md w-full sm:w-auto">
          <Save size={18} /> <span className="hidden sm:inline">Save Changes</span>
          <span className="sm:hidden">Save</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <nav className="flex flex-row md:flex-col p-2 gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 md:flex-none justify-center md:justify-start ${
                  activeTab === tab.id 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h2 className="text-sm font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2 uppercase tracking-wide">Business Details</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 text-2xl font-bold border-2 border-teal-100">
                  ND
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Nike Distributor LTD</h3>
                  <p className="text-xs text-gray-500 mb-2">Supplier ID: #SUP-882</p>
                  <button className="btn btn-xs btn-outline">Change Logo</button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Company Name</label>
                  <input type="text" defaultValue="Nike Distributor LTD" className="input input-bordered" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input type="email" defaultValue="supplier@nike.com" className="input input-bordered pl-10" disabled />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-500 uppercase">Support Phone</label>
                    <input type="tel" defaultValue="+254 700 000 000" className="input input-bordered" />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Physical Address</label>
                  <textarea className="textarea textarea-bordered h-24 resize-none" defaultValue="Industrial Area, Enterprise Road, Nairobi, Kenya"></textarea>
                </div>
              </div>
            </div>
          )}
          
          {/* PAYMENT TAB */}
          {activeTab === 'payment' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h2 className="text-sm font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2 uppercase tracking-wide">Payout Preferences</h2>
              
              <div className="alert alert-info bg-blue-50 text-blue-800 border-blue-100 mb-6 text-sm">
                <Shield size={16} className="shrink-0" />
                <span>Payouts are processed automatically every Monday via M-PESA.</span>
              </div>

              <div className="grid grid-cols-1 gap-5 max-w-lg">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Payment Method</label>
                  <select className="select select-bordered w-full">
                    <option>M-PESA (Till/Paybill)</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">M-PESA Paybill/Till Number</label>
                  <input type="text" defaultValue="882299" className="input input-bordered font-mono tracking-widest" />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Account Name (Verification)</label>
                  <input type="text" defaultValue="NIKE DISTRIBUTORS" className="input input-bordered bg-gray-50" disabled />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h2 className="text-sm font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2 uppercase tracking-wide">Login Security</h2>
              <div className="space-y-4 max-w-md">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">Current Password</label>
                  <input type="password" placeholder="••••••••" className="input input-bordered" />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">New Password</label>
                  <input type="password" placeholder="••••••••" className="input input-bordered" />
                </div>
                <div className="pt-4">
                  <button className="btn btn-outline btn-error btn-sm w-full">Sign out of all devices</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SupplierSettings;