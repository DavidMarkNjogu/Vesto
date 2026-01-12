import { Search, Filter, Printer } from 'lucide-react';

const MyShipments = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Shipments</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search orders..." className="input input-bordered input-sm w-full pl-9" />
          </div>
          <button className="btn btn-sm btn-outline gap-2"><Filter size={14}/> Filter</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="tabs tabs-boxed bg-transparent p-4">
          <a className="tab tab-active">Pending (3)</a>
          <a className="tab">Ready for Pickup (5)</a>
          <a className="tab">Completed (124)</a>
        </div>
        
        {/* Placeholder List */}
        <div className="p-8 text-center text-gray-500">
            <p>Shipment list functionality coming in next phase.</p>
        </div>
      </div>
    </div>
  );
};

export default MyShipments;