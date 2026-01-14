const STATUS_CONFIG = {
  // Green (Success/Active)
  active: 'bg-green-100 text-green-800',
  ready: 'bg-green-100 text-green-800', // Vesto Specific
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
  success: 'bg-green-100 text-green-800',

  // Orange/Yellow (Pending)
  pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-orange-100 text-orange-800', // In Vesto, Paid means "Pending Shipment"
  processing: 'bg-yellow-100 text-yellow-800',

  // Red (Error)
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  
  // Gray (Neutral)
  draft: 'bg-gray-100 text-gray-800',
  unknown: 'bg-gray-100 text-gray-800',
};

const StatusBadge = ({ status }) => {
  const statusKey = status?.toString().toLowerCase();
  const className = STATUS_CONFIG[statusKey] || STATUS_CONFIG.unknown;

  return (
    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${className}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;