import { useParams, useLocation } from 'react-router-dom';

const AdminPlaceholder = () => {
  const location = useLocation();
  const title = location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1);

  return (
    <div className="p-8">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
        <h1 className="text-3xl font-bold text-gray-300 mb-2">{title} Module</h1>
        <p className="text-gray-400">This feature is under development.</p>
      </div>
    </div>
  );
};

export default AdminPlaceholder;