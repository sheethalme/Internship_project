import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Store, AlertCircle, RotateCcw, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCanteens } from '../../contexts/CanteenContext';
import { api } from '../../api';
import { formatCurrency, getCapacityInfo, DAYS } from '../../data/mockData';
import { Star } from 'lucide-react';

export default function AdminDashboard() {
  const { canteens } = useCanteens();
  const [dash, setDash]       = useState(null);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    api.get('/admin/dashboard').then(setDash).catch(() => {});
    api.get('/admin/analytics').then(d => {
      const chart = (d.revenue_7days || []).map(r => ({
        day: new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: parseFloat(r.revenue),
        orders:  parseInt(r.orders),
      }));
      setRevenueData(chart);
    }).catch(() => {});
  }, []);

  const kpis = [
    { icon: <ShoppingBag size={20} />, label: 'Orders Today',    value: dash?.total_orders    ?? '—', color: 'text-blue-400',   sub: 'All canteens' },
    { icon: <TrendingUp  size={20} />, label: 'Revenue Today',   value: dash ? formatCurrency(dash.revenue) : '—', color: 'text-green-400',  sub: 'All canteens' },
    { icon: <Store       size={20} />, label: 'Active Canteens', value: dash?.active_canteens ?? canteens.filter(c => c.status === 'open').length, color: 'text-gold-400',  sub: `${canteens.length} total` },
    { icon: <AlertCircle size={20} />, label: 'Open Grievances', value: dash?.open_grievances ?? '—', color: 'text-red-400',    sub: 'Needs attention' },
    { icon: <RotateCcw   size={20} />, label: 'Pending Refunds', value: dash?.pending_refunds ?? '—', color: 'text-yellow-400', sub: 'Awaiting approval' },
    { icon: <Clock       size={20} />, label: 'Avg Wait Time',   value: dash?.avg_wait_time   ?? '—', color: 'text-purple-400', sub: 'Campus average' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="glass-card p-3 text-xs">
        <p className="text-white font-bold">{label}</p>
        <p className="text-gold-400">Revenue: {formatCurrency(payload[0]?.value)}</p>
        <p className="text-blue-400">Orders: {payload[1]?.value}</p>
      </div>
    );
    return null;
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="stat-card">
            <div className={`${k.color} mb-2`}>{k.icon}</div>
            <p className="text-2xl font-black text-white">{k.value}</p>
            <p className="text-white/60 text-sm font-medium">{k.label}</p>
            <p className="text-white/30 text-xs">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">Campus-wide Revenue (Last 7 Days)</h3>
        {revenueData.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-10">No order data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orders"  fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Canteen status */}
      <div>
        <h3 className="text-white font-bold mb-4">Canteen Status</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {canteens.map(c => {
            const cap = getCapacityInfo(c.active_orders || 0, c.max_capacity);
            return (
              <div key={c.canteen_id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-bold text-sm truncate">{c.name}</p>
                  <span className={`badge-${cap.color === 'green' ? 'green' : cap.color === 'yellow' ? 'yellow' : 'red'} text-[10px]`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {cap.label}
                  </span>
                </div>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${cap.color === 'green' ? 'bg-green-500' : cap.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${cap.pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <div className="flex items-center gap-1"><Star size={10} className="text-gold-400" /> {c.avg_rating}</div>
                  <span>{c.active_orders || 0} orders</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
