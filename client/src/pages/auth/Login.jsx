import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Lock, Mail, ArrowRight, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(formData.email, formData.password);
      
      // Navigate based on origin or role
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
      // Error is handled in store and displayed below
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column: Brand/Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-center px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 z-0"></div>
        <div className="relative z-10 animate-fade-in-up">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Internal Portal</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Vesto<span className="text-primary">.</span></h1>
          <p className="text-xl text-gray-400 max-w-md leading-relaxed">
            Secure access for administrators and fulfillment partners. Manage inventory, track orders, and synchronize supply chains.
          </p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-md space-y-8 bg-white p-8 lg:p-0 rounded-2xl shadow-xl lg:shadow-none">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Please enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="alert alert-error bg-red-50 text-red-700 border-red-100 text-sm py-3 px-4 rounded-lg flex items-center gap-2 animate-pulse">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  className="input input-bordered w-full pl-10 h-12 bg-gray-50 focus:bg-white transition-colors" 
                  placeholder="name@vesto.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  className="input input-bordered w-full pl-10 h-12 bg-gray-50 focus:bg-white transition-colors" 
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
              className="btn btn-primary w-full h-12 text-lg text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all rounded-xl"
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
            <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center lg:text-left">Demo Access</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div 
                className="p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setFormData({ email: 'admin@vesto.com', password: 'admin123' })}
              >
                <p className="font-bold text-gray-700">Admin</p>
                <p className="text-gray-500">admin@vesto.com</p>
                <p className="text-gray-400 font-mono mt-1">admin123</p>
              </div>
              <div 
                className="p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setFormData({ email: 'supplier@nike.com', password: 'nike123' })}
              >
                <p className="font-bold text-gray-700">Supplier</p>
                <p className="text-gray-500">supplier@nike.com</p>
                <p className="text-gray-400 font-mono mt-1">nike123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;