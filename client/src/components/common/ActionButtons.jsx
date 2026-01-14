import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Download, ShieldCheck, CreditCard } from 'lucide-react';

const ActionButton = ({ onClick, to, icon: Icon, title, variant = 'primary', disabled = false }) => {
  const baseClass = "p-2 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "text-blue-600 hover:bg-blue-50",
    danger: "text-red-600 hover:bg-red-50",
    neutral: "text-gray-600 hover:bg-gray-100",
    success: "text-green-600 hover:bg-green-50"
  };

  if (to && !disabled) {
    return (
      <Link to={to} className={`${baseClass} ${variants[variant]}`} title={title}>
        <Icon size={18} />
      </Link>
    );
  }

  return (
    <button 
      type="button" 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClass} ${variants[variant]}`}
      title={title}
    >
      <Icon size={18} />
    </button>
  );
};

export const ActionGroup = ({ children }) => (
  <div className="flex items-center justify-end space-x-2">
    {children}
  </div>
);

// Preset Exports
export const ViewBtn = (props) => <ActionButton icon={Eye} title="View Details" variant="primary" {...props} />;
export const EditBtn = (props) => <ActionButton icon={Pencil} title="Edit" variant="neutral" {...props} />;
export const DeleteBtn = (props) => <ActionButton icon={Trash2} title="Delete" variant="danger" {...props} />;
export const DownloadBtn = (props) => <ActionButton icon={Download} title="Download" variant="neutral" {...props} />;
export const VerifyBtn = (props) => <ActionButton icon={ShieldCheck} title="Verify" variant="success" {...props} />;
export const PayBtn = (props) => <ActionButton icon={CreditCard} title="Pay" variant="primary" {...props} />;