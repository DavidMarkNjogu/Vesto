import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-gray-900 text-white overflow-hidden min-h-[600px] flex items-center">
      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2070&auto=format&fit=crop" 
          alt="Sneaker Background" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold mb-8 uppercase tracking-wide">
            <Sparkles size={14} className="text-secondary" /> New Collection 2026
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Step Into Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Next Chapter.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-300 mb-10 leading-relaxed max-w-xl font-light">
            Premium footwear delivered to your doorstep. Authentic brands, verified quality, and seamless MPESA checkout. Experience the Vesto standard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/products" 
              className="btn btn-primary border-none text-white btn-lg px-8 shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 rounded-full font-bold"
            >
              Shop Now <ArrowRight size={20} />
            </Link>
            <Link 
              to="/products?category=Sneakers" 
              className="btn btn-outline text-white hover:bg-white hover:text-gray-900 border-white/30 hover:border-white btn-lg px-8 rounded-full font-bold backdrop-blur-sm transition-all duration-300"
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