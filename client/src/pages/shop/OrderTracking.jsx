import { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck } from 'lucide-react';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState(null); // 'processing', 'shipped', 'delivered'
  const [loading, setLoading] = useState(false);

  // Mock tracking logic for MVP
  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStatus('processing'); // Default mock response
      setLoading(false);
    }, 1500);
  };

  const steps = [
    { id: 'processing', label: 'Processing', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  // Helper to determine active step
  const getStepClass = (stepId) => {
    if (status === stepId) return 'text-primary';
    // Simple logic: if status is 'shipped', processing is also done
    if (status === 'shipped' && stepId === 'processing') return 'text-primary';
    if (status === 'delivered') return 'text-primary';
    return 'text-gray-300';
  };

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your Order ID sent via SMS/Email</p>
        </div>

        {/* Tracking Form */}
        <div className="card bg-white shadow-xl mb-8">
          <div className="card-body">
            <form onSubmit={handleTrack} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. 67A8B9"
                  className="input input-bordered w-full pl-10 focus:ring-primary uppercase font-mono"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary text-white px-8"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Track'}
              </button>
            </form>
          </div>
        </div>

        {/* Tracking Result */}
        {status && (
          <div className="card bg-white shadow-xl animate-fade-in-up">
            <div className="card-body">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Order ID</p>
                  <p className="font-mono text-xl font-bold text-gray-800">{orderId}</p>
                </div>
                <div className="badge badge-info gap-2 text-white">
                  <Clock size={12} /> Expected: 24h
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative flex justify-between items-center px-4">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 transform -translate-y-1/2"></div>
                
                {steps.map((step, index) => {
                  const isActive = getStepClass(step.id) === 'text-primary';
                  return (
                    <div key={step.id} className="flex flex-col items-center bg-white px-2">
                      <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center mb-2 transition-all duration-500 ${isActive ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-300'}`}>
                        <step.icon size={20} />
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-sm text-gray-800 mb-2">Latest Update</h4>
                <p className="text-sm text-gray-600">
                  Your order is currently being processed at our Nakuru Fulfillment Center. 
                  Rider assignment is pending.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;