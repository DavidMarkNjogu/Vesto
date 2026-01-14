import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-[95vw]'
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal Panel */}
        <div 
          className={`relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${sizeClasses[size] || sizeClasses.md}`}
          onClick={(e) => e.stopPropagation()} 
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold leading-6 text-gray-900">
              {title}
            </h3>
            <button 
              type="button" 
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 focus:outline-none transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;