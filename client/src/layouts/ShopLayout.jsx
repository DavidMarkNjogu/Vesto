import { Outlet } from 'react-router-dom';
// We will build these components next, using placeholders for now to prevent crash
import Navbar from '../components/shop/Navbar'; 
import Footer from '../components/shop/Footer';

const ShopLayout = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Navigation */}
      <Navbar /> 
      
      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ShopLayout;