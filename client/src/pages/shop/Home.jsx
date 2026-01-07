import { useEffect } from 'react';
import Hero from '../../components/Hero';
import FeaturedProducts from '../../components/FeaturedProducts';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      {/* 1. Hero Section (Visual Hook) */}
      <Hero />

      {/* 2. Value Proposition (The "Trust" Layer) */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Countrywide Delivery</h3>
                <p className="text-sm text-gray-500">To your nearest Sacco stage</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Genuine Quality</h3>
                <p className="text-sm text-gray-500">Verified importers only</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Same Day Dispatch</h3>
                <p className="text-sm text-gray-500">Order before 2 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Local Pickup</h3>
                <p className="text-sm text-gray-500">Available in Nakuru CBD</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Collection (The "Sales" Layer) */}
      <div className="py-8">
        <FeaturedProducts />
      </div>

      {/* 4. Newsletter / CTA (The "Retention" Layer) */}
      <section className="bg-primary text-white py-16 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Vesto Movement</h2>
          <p className="mb-8 text-white/80 max-w-2xl mx-auto">
            Get exclusive access to new drops, discounts, and community events. 
            No spam, just fresh kicks.
          </p>
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="input text-gray-800 w-full focus:outline-none" 
            />
            <button className="btn btn-secondary text-white">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;