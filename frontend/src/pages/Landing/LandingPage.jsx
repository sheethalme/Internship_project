import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wifi, Zap, TrendingUp, Clock, Star, ChevronRight, Moon, Sun, GraduationCap, Store, Shield } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { getCapacityInfo } from '../../data/mockData';

gsap.registerPlugin(ScrollTrigger);

const TICKER_TEXT = '🟢 4 Canteens Open  ·  142 Orders Today  ·  Avg Wait: 8 mins  ·  🪙 GourmetCoins Active  ·  ⭐ Top Pick: Masala Dosa at Christ Bakery  ·  ';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const { canteens } = useCanteens();
  const heroRef = useRef(null);
  const logoRef = useRef(null);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);
  const canteensRef = useRef(null);
  const [tickerPos, setTickerPos] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo entrance
      gsap.fromTo(logoRef.current,
        { opacity: 0, scale: 0.5, rotateY: -30 },
        { opacity: 1, scale: 1, rotateY: 0, duration: 1.2, ease: 'back.out(1.7)' }
      );
      // Tagline
      gsap.fromTo(taglineRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' }
      );
      // CTAs
      gsap.fromTo(ctaRef.current?.children || [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.8, stagger: 0.15, ease: 'power3.out' }
      );

      // Features scroll animation
      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current.querySelectorAll('.feature-card'),
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.15,
            scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' }
          }
        );
      }

      // Canteen cards
      if (canteensRef.current) {
        gsap.fromTo(canteensRef.current.querySelectorAll('.canteen-card'),
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1, scale: 1, duration: 0.6, stagger: 0.1,
            scrollTrigger: { trigger: canteensRef.current, start: 'top 75%' }
          }
        );
      }

      // Floating background orbs
      gsap.to('.orb-1', { y: -20, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.orb-2', { y: 15, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1 });
      gsap.to('.orb-3', { y: -10, duration: 3.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.5 });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPos(p => p <= -100 ? 0 : p - 0.05);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Zap size={28} />, title: 'Smart Ordering', desc: 'AI-powered recommendations based on your preferences and campus demand patterns.' },
    { icon: <Clock size={28} />, title: 'Zero Wait Goals', desc: 'Pre-book your pickup slot. Get ready before you arrive. No more queue frustration.' },
    { icon: <TrendingUp size={28} />, title: 'Demand Forecasting', desc: 'Advanced analytics help canteens prepare exactly the right amount — less waste, faster service.' },
    { icon: <Wifi size={28} />, title: 'Live Tracking', desc: 'Real-time order status updates. Know when your food is being prepared, ready, or waiting.' },
  ];

  return (
    <div ref={heroRef} className={`min-h-screen overflow-x-hidden ${isDark ? 'bg-navy-900' : 'bg-slate-50'}`}>
      {/* Live Ticker */}
      <div className={`py-2 overflow-hidden relative ${isDark ? 'bg-navy-950/80 border-b border-white/5' : 'bg-navy-900 border-b border-navy-800'}`}>
        <div className="flex whitespace-nowrap">
          <span
            className="text-gold-400 text-xs font-medium px-4 inline-block"
            style={{ transform: `translateX(${tickerPos * 10}px)`, transition: 'none' }}
          >
            {TICKER_TEXT.repeat(5)}
          </span>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`flex items-center justify-between px-6 lg:px-12 py-4 sticky top-0 z-30 backdrop-blur-xl border-b ${isDark ? 'bg-navy-900/80 border-white/5' : 'bg-white/80 border-gray-200/60'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-gold">
            <span className="text-navy-900 font-black text-lg">G</span>
          </div>
          <div>
            <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-navy-900'}`}>GourmetGo</span>
            <p className="text-gold-500 text-[10px] font-semibold leading-none">Campus Eats, Elevated</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-gray-100 text-gray-600'}`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => navigate('/login/student')} className="btn-gold text-sm px-4 py-2 hidden sm:flex">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-16 pb-20 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="orb-1 absolute top-20 left-10 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
        <div className="orb-2 absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div ref={logoRef} className="mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-gold-500 to-gold-600 rounded-3xl flex items-center justify-center shadow-gold mx-auto mb-4 relative">
            <span className="text-navy-900 font-black text-5xl md:text-6xl">G</span>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
              <Wifi size={14} className="text-white" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gold-400 text-xs font-semibold">Christ University · Central Campus</span>
          </div>
        </div>

        {/* Tagline */}
        <div ref={taglineRef}>
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-none ${isDark ? 'text-white' : 'text-navy-900'}`}>
            Gourmet<span className="text-gradient-gold">Go</span>
          </h1>
          <p className="text-gold-400 text-xl md:text-2xl font-bold mb-3">Campus Eats, Elevated</p>
          <p className={`text-base md:text-lg max-w-xl mx-auto ${isDark ? 'text-white/60' : 'text-navy-600'}`}>
            Smart canteen ordering for Christ University. Pre-order, skip queues, track live — all in one place.
          </p>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={() => navigate('/login/student')}
            className="btn-gold flex items-center gap-3 text-base px-8 py-4"
          >
            <GraduationCap size={20} />
            I'm a Student
          </button>
          <button
            onClick={() => navigate('/login/vendor')}
            className="btn-outline flex items-center gap-3 text-base px-8 py-4"
          >
            <Store size={20} />
            I'm a Vendor
          </button>
          <button
            onClick={() => navigate('/login/admin')}
            className={`flex items-center gap-3 text-base px-8 py-4 rounded-xl font-semibold border transition-all hover:-translate-y-0.5 ${isDark ? 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white' : 'border-navy-200 text-navy-600 hover:bg-navy-50'}`}
          >
            <Shield size={20} />
            Admin Login
          </button>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className={`px-6 lg:px-12 py-20 ${isDark ? '' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-navy-900'}`}>
              Why <span className="text-gradient-gold">GourmetGo?</span>
            </h2>
            <p className={`text-base ${isDark ? 'text-white/60' : 'text-navy-600'} max-w-2xl mx-auto`}>
              A smarter campus dining experience built specifically for Christ University students and vendors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`feature-card group p-6 rounded-2xl border card-hover ${isDark ? 'glass-card' : 'bg-white border-gray-100 shadow-card'}`}>
                <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center text-gold-400 mb-4 group-hover:bg-gold-500/30 transition-colors">
                  {f.icon}
                </div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-navy-900'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-navy-600'}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Canteens Preview */}
      <section ref={canteensRef} className={`px-6 lg:px-12 py-20 ${isDark ? 'bg-navy-950/50' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-navy-900'}`}>
              Our <span className="text-gradient-gold">Canteens</span>
            </h2>
            <p className={`text-base ${isDark ? 'text-white/60' : 'text-navy-600'}`}>4 canteens, hundreds of options, zero wait.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {canteens.map((c) => {
              const cap = getCapacityInfo(c.active_orders, c.max_capacity);
              return (
                <div
                  key={c.canteen_id}
                  className={`canteen-card group card-hover rounded-2xl overflow-hidden border ${isDark ? 'glass-card border-white/10' : 'bg-white border-gray-100 shadow-card'}`}
                  onClick={() => navigate('/login/student')}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img src={c.banner_image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                    <div className={`absolute top-2 right-2 badge-${cap.color === 'green' ? 'green' : cap.color === 'yellow' ? 'yellow' : 'red'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                      {cap.label}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-navy-900'}`}>{c.name}</h3>
                    <p className={`text-xs mt-1 mb-3 ${isDark ? 'text-white/50' : 'text-navy-500'}`}>{c.cuisine}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-gold-400 fill-gold-400" />
                        <span className="text-gold-400 text-xs font-bold">{c.avg_rating}</span>
                      </div>
                      <span className={`text-xs ${isDark ? 'text-white/50' : 'text-navy-500'}`}>{c.active_orders} active orders</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate('/login/student')} className="btn-gold flex items-center gap-2 mx-auto">
              Start Ordering <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`px-6 lg:px-12 py-10 border-t ${isDark ? 'border-white/5 bg-navy-950' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center">
              <span className="text-navy-900 font-black text-base">G</span>
            </div>
            <div>
              <span className={`font-black ${isDark ? 'text-white' : 'text-navy-900'}`}>GourmetGo</span>
              <p className="text-gold-500 text-[10px] font-semibold">Campus Eats, Elevated</p>
            </div>
          </div>
          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-navy-500'}`}>Christ (Deemed to be University) · Hosur Rd, Bangalore – 560029</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-navy-400'}`}>Smart Canteen Demand Forecasting & Load Optimization System · 2025</p>
          </div>
          <div className={`text-sm font-semibold ${isDark ? 'text-white/40' : 'text-navy-400'}`}>
            © 2025 GourmetGo
          </div>
        </div>
      </footer>
    </div>
  );
}
