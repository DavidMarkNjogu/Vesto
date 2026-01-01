import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <div className="hero min-h-[70vh] bg-gradient-to-br from-primary to-secondary text-white">
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-4xl">
          <h1 className="mb-5 text-5xl md:text-7xl font-bold">
            Step Into Style
          </h1>
          <p className="mb-8 text-xl md:text-2xl">
            Premium Quality Footwear for Every Occasion
            <br />
            <span className="text-lg opacity-90">Made in Kenya, for Kenya</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn btn-lg btn-secondary">
              Shop Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/#products" className="btn btn-lg btn-outline btn-secondary">
              Browse Collection
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Free Pickup in Nairobi CBD</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>M-PESA Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Guest Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;


