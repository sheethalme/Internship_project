import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCanteens } from '../../contexts/CanteenContext';
import { api } from '../../api';
import { formatCurrency, DAYS, HOURS } from '../../data/mockData';

// Convert MySQL DAYOFWEEK (1=Sun..7=Sat) → Mon-first index (0=Mon..6=Sun)
const mysqlDayToIdx = (d) => (d - 2 + 7) % 7;

function buildHeatmapGrid(rawRows) {
  const grid = Array.from({ length: 7 }, () => Array.from({ length: HOURS.length }, () => ({ value: 0 })));
  rawRows.forEach(({ day, hour, order_count }) => {
    const di = mysqlDayToIdx(day);
    const hi = hour - 7; // HOURS starts at 7:00
    if (di >= 0 && di < 7 && hi >= 0 && hi < HOURS.length) {
      grid[di][hi] = { value: order_count };
    }
  });
  return grid;
}

export default function AdminAnalytics() {
  const { canteens } = useCanteens();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(setData).catch(() => {});
  }, []);

  const revenueData = (data?.revenue_7days || []).map(r => ({
    day: new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    revenue: parseFloat(r.revenue),
    orders: parseInt(r.orders),
  }));

  const heatmapGrid = buildHeatmapGrid(data?.heatmap || []);
  const maxHeat = Math.max(1, ...heatmapGrid.flat().map(c => c.value));

  const canteenStats = data?.canteen_stats || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="glass-card p-3 text-xs">
        <p className="text-white font-bold">{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}</p>)}
      </div>
    );
    return null;
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics & Forecasting</h1>
        <p className="text-white/50 text-sm mt-1">Campus-wide demand insights</p>
      </div>

      {/* Revenue chart */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">Campus Revenue (Last 7 Days)</h3>
        {revenueData.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No order data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar dataKey="orders"  fill="#3b82f6" radius={[4, 4, 0, 0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Heatmap */}
      <div className="glass-card p-5 overflow-x-auto">
        <h3 className="text-white font-bold mb-4">Campus-wide Peak Hours Heatmap</h3>
        <div className="min-w-max">
          <div className="flex gap-1 mb-1">
            <div className="w-10 flex-shrink-0" />
            {HOURS.map((h, i) => (
              <div key={h} className="w-8 text-center text-[10px] text-white/30">{i % 2 === 0 ? h.split(':')[0] : ''}</div>
            ))}
          </div>
          {DAYS.map((day, di) => (
            <div key={day} className="flex gap-1 mb-1 items-center">
              <div className="w-10 text-xs text-white/40 flex-shrink-0">{day}</div>
              {heatmapGrid[di]?.map((cell, hi) => (
                <div
                  key={hi}
                  className="heatmap-cell"
                  style={{ background: `rgba(245, 158, 11, ${Math.min(1, cell.value / maxHeat)})` }}
                  title={`${day} ${HOURS[hi]}: ${cell.value} orders`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
          <div className="w-4 h-4 rounded bg-gold-500/10 border border-gold-500/20" /><span>Low</span>
          <div className="w-4 h-4 rounded bg-gold-500/40" /><span>Medium</span>
          <div className="w-4 h-4 rounded bg-gold-500" /><span>High</span>
        </div>
      </div>

      {/* Canteen comparison — real data */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">Canteen Comparison</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {canteenStats.length > 0 ? canteenStats.map(c => (
            <div key={c.canteen_id} className="text-center p-4 rounded-xl bg-white/5">
              <p className="text-white font-bold text-sm mb-2 truncate">{c.name}</p>
              <p className="text-gold-400 text-3xl font-black">{parseFloat(c.avg_rating || 0).toFixed(1)}</p>
              <p className="text-white/40 text-xs mb-2">Avg Rating</p>
              <p className="text-white/70 text-sm font-bold">{c.total_orders}</p>
              <p className="text-white/40 text-xs">total orders</p>
              <p className="text-white/70 text-sm font-bold mt-1">{formatCurrency(c.revenue)}</p>
              <p className="text-white/40 text-xs">total revenue</p>
              <p className="text-white/70 text-sm font-bold mt-1">{c.active_orders || 0}</p>
              <p className="text-white/40 text-xs">active now</p>
            </div>
          )) : canteens.map(c => (
            <div key={c.canteen_id} className="text-center p-4 rounded-xl bg-white/5">
              <p className="text-white font-bold text-sm mb-2 truncate">{c.name}</p>
              <p className="text-gold-400 text-3xl font-black">{c.avg_rating || '—'}</p>
              <p className="text-white/40 text-xs">Avg Rating</p>
              <p className="text-white/70 text-sm mt-2">{c.active_orders || 0} active</p>
              <p className="text-white/40 text-xs">orders now</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
