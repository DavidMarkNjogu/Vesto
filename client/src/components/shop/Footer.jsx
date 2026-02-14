import { Facebook, Twitter, Instagram, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-20 pb-10 border-t border-gray-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-white tracking-tighter">
              Vesto<span className="text-primary">.</span>
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Defining the future of footwear in East Africa. Authentic brands, verified sellers, and swift delivery.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/products" className="hover:text-primary transition-colors">New Arrivals</a></li>
              <li><a href="/products" className="hover:text-primary transition-colors">Best Sellers</a></li>
              <li><a href="/products" className="hover:text-primary transition-colors">Sneakers</a></li>
              <li><a href="/products" className="hover:text-primary transition-colors">Accessories</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/track-order" className="hover:text-primary transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns & Exchanges</a></li>
              <li><a href="/login" className="hover:text-primary transition-colors">Partner Login</a></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Instagram size={18}/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Twitter size={18}/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Facebook size={18}/></a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">© 2026 Vesto Kenya. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// const Footer = () => (
//   <footer className="bg-neutral text-neutral-content p-10 mt-auto">
//     <div className="container mx-auto">
//       <p>Vesto © 2026 - Built for Kenya</p>
//     </div>
//   </footer>
// );
// export default Footer;