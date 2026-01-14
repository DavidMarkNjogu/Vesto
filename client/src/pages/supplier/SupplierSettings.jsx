import { Save, User, MapPin, CreditCard, Bell } from 'lucide-react';

const SupplierSettings = () => {
  return (
    <div className="max-w-4xl space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-500">Manage your profile, location, and payment preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><User size={16} /></div>
          <h3 className="font-bold text-gray-800">Business Profile</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500 uppercase">Company Name</label>
            <input type="text" defaultValue="Nike Distributor LTD" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input type="email" defaultValue="supplier@nike.com" className="input input-bordered" disabled />
          </div>
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500 uppercase">Phone Number</label>
            <input type="tel" defaultValue="+254 700 000 000" className="input input-bordered" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><CreditCard size={16} /></div>
          <h3 className="font-bold text-gray-800">Payment Details</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500 uppercase">M-PESA Paybill / Till</label>
            <input type="text" defaultValue="554433" className="input input-bordered" />
          </div>
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500 uppercase">Settlement Schedule</label>
            <select className="select select-bordered">
              <option>Daily</option>
              <option>Weekly (Mondays)</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary text-white gap-2 px-8">
          <Save size={18} /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default SupplierSettings;
