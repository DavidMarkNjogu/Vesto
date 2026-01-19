import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../../components/Hero';
import FeaturedProducts from '../../components/FeaturedProducts';
import { Truck, ShieldCheck, Clock, MapPin, ArrowRight } from 'lucide-react';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { icon: Truck, title: "Countrywide Delivery", desc: "To your nearest Sacco stage", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: ShieldCheck, title: "Genuine Quality", desc: "Verified importers only", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Clock, title: "Same Day Dispatch", desc: "Order before 2 PM", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: MapPin, title: "Local Pickup", desc: "Available in Nakuru CBD", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Value Proposition */}
      <section className="py-12 bg-white border-b border-gray-100 relative z-20 -mt-8 mx-4 sm:mx-8 rounded-xl shadow-lg sm:shadow-sm sm:mt-0 sm:static">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((f, i) => (
              <div key={i} className="flex items-start sm:items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Collection */}
      <div className="py-12 sm:py-16">
        <FeaturedProducts />
      </div>

      {/* 4. Newsletter / CTA */}
      <section className="bg-gray-900 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-4 block">Stay in the Loop</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tight">Join the Vesto Movement</h2>
          <p className="mb-10 text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Get exclusive access to new drops, discounts, and community events. 
            No spam, just fresh kicks delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="input input-lg bg-white/10 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:bg-white/20 w-full rounded-full text-sm" 
            />
            <button className="btn btn-primary btn-lg rounded-full px-8 text-white shadow-lg hover:shadow-primary/25 border-none">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

// import { useEffect } from 'react';
// import Hero from '../../components/Hero';
// import FeaturedProducts from '../../components/FeaturedProducts';
// import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

// const Home = () => {
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   return (
//     <div className="min-h-screen bg-bg">
//       {/* 1. Hero Section (Visual Hook) */}
//       <Hero />

//       {/* 2. Value Proposition (The "Trust" Layer) */}
//       <section className="py-12 bg-white border-b border-gray-100">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
//               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
//                 <Truck className="w-6 h-6" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-gray-800">Countrywide Delivery</h3>
//                 <p className="text-sm text-gray-500">To your nearest Sacco stage</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
//               <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
//                 <ShieldCheck className="w-6 h-6" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-gray-800">Genuine Quality</h3>
//                 <p className="text-sm text-gray-500">Verified importers only</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
//               <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
//                 <Clock className="w-6 h-6" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-gray-800">Same Day Dispatch</h3>
//                 <p className="text-sm text-gray-500">Order before 2 PM</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
//               <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600">
//                 <MapPin className="w-6 h-6" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-gray-800">Local Pickup</h3>
//                 <p className="text-sm text-gray-500">Available in Nakuru CBD</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 3. Featured Collection (The "Sales" Layer) */}
//       <div className="py-8">
//         <FeaturedProducts />
//       </div>

//       {/* 4. Newsletter / CTA (The "Retention" Layer) */}
//       <section className="bg-primary text-white py-16 mt-8">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl font-bold mb-4">Join the Vesto Movement</h2>
//           <p className="mb-8 text-white/80 max-w-2xl mx-auto">
//             Get exclusive access to new drops, discounts, and community events. 
//             No spam, just fresh kicks.
//           </p>
//           <div className="flex justify-center gap-2 max-w-md mx-auto">
//             <input 
//               type="email" 
//               placeholder="Enter your email" 
//               className="input text-gray-800 w-full focus:outline-none" 
//             />
//             <button className="btn btn-secondary text-white">Subscribe</button>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;