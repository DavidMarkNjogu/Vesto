import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, isAuthenticated, user } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'supplier') navigate('/supplier');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(formData.email, formData.password);
      
      // Smart Redirect Logic
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'supplier') {
        navigate('/supplier', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      // Error handled by store state
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left: Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 z-0"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="relative z-10 animate-fade-in-up">
          <div className="mb-8">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-xs font-bold tracking-widest border border-white/10 uppercase">
              Internal Portal
            </span>
          </div>
          <h1 className="text-6xl font-bold mb-6 tracking-tight">Vesto<span className="text-primary">.</span></h1>
          <p className="text-xl text-gray-400 max-w-md leading-relaxed">
            Secure access for administrators and fulfillment partners. Manage inventory, track orders, and synchronize supply chains.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-md space-y-8 bg-white p-10 lg:p-0 rounded-2xl shadow-xl lg:shadow-none border border-gray-100 lg:border-none">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Please enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="alert alert-error bg-red-50 text-red-700 border border-red-100 text-sm py-3 px-4 rounded-xl flex items-center gap-3 animate-pulse">
              <AlertCircle size={18} /> 
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  className="input input-bordered w-full pl-12 h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-xl" 
                  placeholder="name@vesto.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  className="input input-bordered w-full pl-12 h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-xl" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary w-full h-12 text-lg text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all rounded-xl mt-2"
            >
              {loading ? (
                <span className="loading loading-spinner text-white"></span>
              ) : (
                <>Sign In <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>

          {/* Quick Copy-Paste Credentials for Demo */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center lg:text-left">Quick Access (Demo)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div 
                className="p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all group"
                onClick={() => setFormData({ email: 'admin@vesto.com', password: 'admin123' })}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-gray-700">Admin</p>
                  <ArrowRight size={12} className="text-gray-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-gray-500">admin@vesto.com</p>
              </div>
              <div 
                className="p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all group"
                onClick={() => setFormData({ email: 'supplier@nike.com', password: 'nike123' })}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-gray-700">Supplier</p>
                  <ArrowRight size={12} className="text-gray-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-gray-500">supplier@nike.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;