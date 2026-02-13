// import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-gray-950 text-white min-h-[85vh] flex items-center overflow-hidden">
      
      {/* 1. Ambient Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-60" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none opacity-40" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Typography & Actions */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="space-y-8"
        >
          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-gray-300">Vesto Season 6 / 2026</span>
          </motion.div>

          <motion.h1 
            variants={{ hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="text-6xl sm:text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter"
          >
            WALK ON <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-gray-500">
              LIGHTNING.
            </span>
          </motion.h1>

          <motion.p 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="text-lg sm:text-xl text-gray-400 max-w-lg leading-relaxed font-light"
          >
            Engineered for the streets of Nairobi. Verified authentic brands, instant MPESA checkout, and same-day delivery.
          </motion.p>

          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/products" className="btn btn-primary btn-lg rounded-full text-white px-10 border-none shadow-[0_0_40px_-10px_rgba(var(--p),0.5)] hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(var(--p),0.6)] transition-all duration-300">
              Shop Collection <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/products?category=Sneakers" className="btn btn-ghost btn-lg rounded-full text-white hover:bg-white/10 border border-white/10 backdrop-blur-sm px-8">
              <Zap className="mr-2 w-5 h-5 text-yellow-400" /> Flash Deals
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Floating 3D-style Visual */}
        <motion.div 
          initial={{ opacity: 0, x: 50, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="relative hidden lg:block"
        >
          {/* Main Image with Hover Tilt */}
          <motion.div
            whileHover={{ scale: 1.02, rotate: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative z-10"
          >
             <img 
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2024&auto=format&fit=crop" 
              alt="Hero Shoe" 
              className="w-full max-w-xl mx-auto drop-shadow-2xl rounded-3xl"
              style={{ filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.5))" }}
            />
          </motion.div>

          {/* Floating Glass Card - Stock Status */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute -bottom-6 -left-6 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl z-20"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bestseller</p>
                <p className="font-bold text-white text-lg">Nike Air Max 97</p>
                <p className="text-xs text-green-400 mt-1">Selling Fast 🔥</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
// import { Link } from 'react-router-dom';
// import { ArrowRight, Sparkles } from 'lucide-react';

// const Hero = () => {
//   return (
//     <div className="relative bg-gray-900 text-white overflow-hidden min-h-[600px] flex items-center">
//       {/* Background Image with Cinematic Overlay */}
//       <div className="absolute inset-0 z-0">
//         <img 
//           src="https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2070&auto=format&fit=crop" 
//           alt="Sneaker Background" 
//           className="w-full h-full object-cover opacity-50"
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent"></div>
//         <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
//       </div>

//       <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
//         <div className="max-w-3xl animate-fade-in-up">
//           <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold mb-8 uppercase tracking-wide">
//             <Sparkles size={14} className="text-secondary" /> New Collection 2026
//           </div>
          
//           <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
//             Step Into Your <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Next Chapter.</span>
//           </h1>
          
//           <p className="text-base sm:text-lg text-gray-300 mb-10 leading-relaxed max-w-xl font-light">
//             Premium footwear delivered to your doorstep. Authentic brands, verified quality, and seamless MPESA checkout. Experience the Vesto standard.
//           </p>
          
//           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//             <Link 
//               to="/products" 
//               className="btn btn-primary border-none text-white btn-lg px-8 shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 rounded-full font-bold"
//             >
//               Shop Now <ArrowRight size={20} />
//             </Link>
//             <Link 
//               to="/products?category=Sneakers" 
//               className="btn btn-outline text-white hover:bg-white hover:text-gray-900 border-white/30 hover:border-white btn-lg px-8 rounded-full font-bold backdrop-blur-sm transition-all duration-300"
//             >
//               View Sneakers
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hero;