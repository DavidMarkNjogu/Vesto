import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Info, ShoppingBag, Truck } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  // Fallback if accessed directly without state
  if (!orderData) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">No order details found.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card bg-white shadow-xl max-w-lg w-full border-t-4 border-success animate-fade-in-up">
        <div className="card-body text-center p-8">
          
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle className="w-12 h-12 text-success" strokeWidth={2} />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8">
            Thank you <span className="font-semibold text-gray-800">{orderData.firstName}</span>. Your order has been received and is being processed.
          </p>
          
          {/* Order Details Card */}
          <div className="bg-gray-50 rounded-xl p-5 text-sm space-y-3 mb-8 text-left border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-500">Order Reference</span>
              <span className="font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">
                {orderData.id}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-bold text-primary text-lg">KES {orderData.total.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery To</span>
              <span className="font-medium text-gray-800">{orderData.location}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-800">M-PESA</span>
            </div>
          </div>

          {/* Next Steps Info */}
          <div className="flex gap-4 mb-8 text-left">
             <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1 text-blue-800 font-bold text-xs uppercase">
                    <Info size={14} /> Processing
                </div>
                <p className="text-xs text-blue-700">We are packing your shoes. You will get an SMS when dispatched.</p>
             </div>
             <div className="flex-1 bg-purple-50 p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1 text-purple-800 font-bold text-xs uppercase">
                    <Truck size={14} /> Delivery
                </div>
                <p className="text-xs text-purple-700">Estimated delivery within 24-48 hours to your region.</p>
             </div>
          </div>

          <div className="space-y-3">
            <button
              className="btn btn-primary w-full shadow-lg"
              onClick={() => navigate('/')}
            >
              <ShoppingBag size={18} className="mr-2" /> Continue Shopping
            </button>
            <button
              className="btn btn-ghost w-full text-gray-500 hover:bg-gray-100"
              onClick={() => navigate('/track-order')} // Future proofing
            >
              Track Order Status
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;