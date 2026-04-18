import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Store, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function VendorAuth() {
  const navigate = useNavigate();
  const { loginVendor, user } = useAuth();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => { if (user) navigate('/vendor', { replace: true }); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('All fields required'); return; }
    setLoading(true);
    const result = await loginVendor(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast('Welcome back! 🍳', 'success');
      navigate('/vendor');
    } else {
      setError(result.error);
      toast(result.error, 'error');
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const DEMO_CREDS = [
    { name: 'Christ Bakery', email: 'bakery@christuniversity.in', pass: 'bakery123' },
    { name: "Michael's Corner", email: 'michaels@christuniversity.in', pass: 'michaels123' },
    { name: 'Mingos', email: 'mingos@christuniversity.in', pass: 'mingos123' },
    { name: 'Freshateria', email: 'freshateria@christuniversity.in', pass: 'fresh123' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gold-500/5 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="glass-card p-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glass">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Vendor Portal</h1>
              <p className="text-blue-400 text-xs font-semibold">GourmetGo · Canteen Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="email" placeholder="Vendor Email" value={form.email} onChange={set('email')} className="input-dark pl-10" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={set('password')} className="input-dark pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30"><p className="text-red-400 text-sm">{error}</p></div>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:from-blue-400 hover:to-purple-500 transition-all hover:-translate-y-0.5 disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in...</span> : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-white/40 text-xs text-center mb-3">Demo Vendor Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDS.map(c => (
                <button key={c.email} onClick={() => setForm({ email: c.email, password: c.pass })} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors">
                  <p className="text-white/80 text-xs font-medium truncate">{c.name}</p>
                  <p className="text-white/40 text-[10px] truncate">{c.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
