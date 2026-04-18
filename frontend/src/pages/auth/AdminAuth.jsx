import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function AdminAuth() {
  const navigate = useNavigate();
  const { loginAdmin, user } = useAuth();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => { if (user) navigate('/admin', { replace: true }); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginAdmin(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast('Welcome, Admin 🛡️', 'success');
      navigate('/admin');
    } else {
      setError(result.error);
      toast(result.error, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-900 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-red-500/5 blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="glass-card p-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-glass">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Admin Portal</h1>
              <p className="text-red-400 text-xs font-semibold">GourmetGo · Superuser Access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="email" placeholder="Admin Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-dark pl-10" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input-dark pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30"><p className="text-red-400 text-sm">{error}</p></div>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold hover:from-red-400 hover:to-orange-500 transition-all hover:-translate-y-0.5 disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Authenticating...</span> : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/40 text-xs text-center">Demo: <span className="text-red-400 font-mono">admin@christuniversity.in</span> / <span className="text-red-400 font-mono">admin2024</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
