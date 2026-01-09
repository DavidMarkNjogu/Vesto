import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2070&auto=format&fit=crop" 
          alt="Sneaker Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
      </div>

      <div className="relative container mx-auto px-4 py-24 md:py-32 flex flex-col justify-center h-full">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6 border border-primary/20">
            New Collection 2026
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Step Into Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Next Chapter</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
            Premium footwear delivered to your doorstep. Authentic brands, verified quality, and seamless MPESA checkout.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/products" 
              className="btn btn-primary btn-lg text-white border-none shadow-lg shadow-primary/25 hover:-translate-y-1 transition-transform"
            >
              Shop Now <ArrowRight size={20} />
            </Link>
            <Link 
              to="/products?category=Sneakers" 
              className="btn btn-outline btn-lg text-white hover:bg-white hover:text-gray-900 hover:border-white transition-all"
            >
              View Sneakers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;