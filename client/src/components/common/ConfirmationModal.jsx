import Modal from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  confirmColor = 'bg-red-600 hover:bg-red-700' 
}) => {
  
  const isDanger = confirmColor.includes('red');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col">
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
          </div>
          <div className="mt-1">
            <p className="text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${confirmColor}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;