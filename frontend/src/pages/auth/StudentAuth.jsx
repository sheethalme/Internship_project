import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Eye, EyeOff, GraduationCap, ArrowLeft, User, Mail, Lock, Hash, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const DEPARTMENTS = ['Computer Science', 'Business Administration', 'Commerce', 'Psychology', 'Media Studies', 'Law', 'Engineering', 'Economics', 'English Literature', 'History', 'Mathematics', 'Physics', 'Chemistry', 'Sociology', 'Political Science'];

export default function StudentAuth() {
  const navigate = useNavigate();
  const { loginStudent, registerStudent, user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: '', email: '', password: '', rollNumber: '', department: 'Computer Science', yearOfStudy: '1',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) navigate('/student', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  }, [mode]);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (mode === 'register') {
      if (!form.name.trim()) e.name = 'Name required';
      if (!form.rollNumber.trim()) e.rollNumber = 'Roll number required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = mode === 'login'
      ? await loginStudent(form.email, form.password)
      : await registerStudent(form);
    setLoading(false);
    if (result.success) {
      toast(mode === 'login' ? 'Welcome back! 👋' : 'Account created! Welcome to GourmetGo 🎉', 'success');
      navigate('/student');
    } else {
      toast(result.error || 'Something went wrong', 'error');
      setErrors({ general: result.error });
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Back */}
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div ref={formRef} className="glass-card p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center shadow-gold">
              <GraduationCap size={24} className="text-navy-900" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Student Portal</h1>
              <p className="text-gold-500 text-xs font-semibold">GourmetGo · Christ University</p>
            </div>
          </div>

          {/* Tab Switch */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === m ? 'bg-gold-500 text-navy-900' : 'text-white/50 hover:text-white'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="text" placeholder="Full Name" value={form.name} onChange={set('name')} className="input-dark pl-10" />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <div className="relative">
                    <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="text" placeholder="Roll Number (e.g. CHR2024CS001)" value={form.rollNumber} onChange={set('rollNumber')} className="input-dark pl-10" />
                  </div>
                  {errors.rollNumber && <p className="text-red-400 text-xs mt-1">{errors.rollNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 z-10" />
                    <select value={form.department} onChange={set('department')} className="input-dark pl-9 appearance-none">
                      {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-navy-900">{d}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 z-10" />
                    <select value={form.yearOfStudy} onChange={set('yearOfStudy')} className="input-dark pl-9 appearance-none">
                      {[1, 2, 3, 4, 5].map(y => <option key={y} value={y} className="bg-navy-900">Year {y}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="email" placeholder="University Email" value={form.email} onChange={set('email')} className="input-dark pl-10" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={set('password')} className="input-dark pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {errors.general && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/50 text-xs text-center">Demo: <span className="text-gold-400 font-mono">aarav.sharma@christuniversity.in</span> / <span className="text-gold-400 font-mono">student123</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
