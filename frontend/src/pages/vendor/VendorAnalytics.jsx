import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { generateRevenueData, HEATMAP_DATA, DAYS, HOURS, formatCurrency } from '../../data/mockData';

const PERIODS = ['Today', 'This Week', 'This Month'];

export default function VendorAnalytics() {
  const { user } = useAuth();
  const { getMenu } = useCanteens();
  const [period, setPeriod] = useState('This Week');
  const menu = getMenu(user?.canteen_id);
  const revenueData = generateRevenueData(7);
  const topItems = [...menu].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 5);
  const bottomItems = [...menu].sort((a, b) => a.avg_rating - b.avg_rating).slice(0, 3);
  const heatmap = HEATMAP_DATA;

  const donutData = [
    { name: 'Completed', value: 68, color: '#22c55e' },
    { name: 'Pending', value: 18, color: '#f59e0b' },
    { name: 'Cancelled', value: 14, color: '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="text-white font-bold">{label}</p>
          {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <div className="flex rounded-xl bg-white/5 p-1 gap-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-gold-500 text-navy-900' : 'text-white/50 hover:text-white'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">Revenue (₹)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top items */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4">🏆 Top Items</h3>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={item.item_id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${i === 0 ? 'bg-gold-500 text-navy-900' : i === 1 ? 'bg-gray-400/30 text-gray-300' : 'bg-amber-700/30 text-amber-400'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span>⭐ {item.avg_rating}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order completion donut */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4">Order Completion</h3>
          <div className="flex items-center gap-6">
            <PieChart width={120} height={120}>
              <Pie data={donutData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value">
                {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-2">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-white/70">{d.name}</span>
                  <span className="text-white font-bold ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours Heatmap */}
      <div className="glass-card p-5 overflow-x-auto">
        <h3 className="text-white font-bold mb-4">Peak Hours Heatmap</h3>
        <div className="min-w-max">
          <div className="flex gap-1 mb-1">
            <div className="w-10 flex-shrink-0" />
            {HOURS.slice(0, 12).map(h => (
              <div key={h} className="w-8 text-center text-[10px] text-white/30">{h.split(':')[0]}</div>
            ))}
          </div>
          {DAYS.map((day, di) => (
            <div key={day} className="flex gap-1 mb-1 items-center">
              <div className="w-10 text-xs text-white/40 flex-shrink-0">{day}</div>
              {heatmap[di]?.slice(0, 12).map((cell, hi) => (
                <div
                  key={hi}
                  className="heatmap-cell"
                  style={{ background: `rgba(245, 158, 11, ${Math.min(1, cell.value / 20)})` }}
                  title={`${day} ${HOURS[hi]}: ${cell.value} orders`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
          <div className="w-4 h-4 rounded bg-gold-500/10 border border-gold-500/20" />
          <span>Low</span>
          <div className="w-4 h-4 rounded bg-gold-500/40" />
          <span>Medium</span>
          <div className="w-4 h-4 rounded bg-gold-500" />
          <span>High</span>
        </div>
      </div>

      {/* Bottom items */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">⚠️ Under-performing Items</h3>
        <div className="space-y-3">
          {bottomItems.map(item => (
            <div key={item.item_id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
              <div>
                <p className="text-white text-sm font-medium">{item.name}</p>
                <p className="text-white/50 text-xs">⭐ {item.avg_rating} · {formatCurrency(item.price)}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-400">Consider removing</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
