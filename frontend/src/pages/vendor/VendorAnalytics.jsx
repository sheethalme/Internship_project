import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Truck } from 'lucide-react';
import { api } from '../../api';
import { formatCurrency, DAYS, HOURS } from '../../data/mockData';

// MySQL DAYOFWEEK (1=Sun..7=Sat) → Mon-first index
const mysqlDayToIdx = (d) => (d - 2 + 7) % 7;

function buildHeatmapGrid(rawRows) {
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 12 }, () => ({ value: 0 })));
  rawRows.forEach(({ day, hour, count }) => {
    const di = mysqlDayToIdx(day);
    const hi = hour - 7;
    if (di >= 0 && di < 7 && hi >= 0 && hi < 12) grid[di][hi] = { value: count };
  });
  return grid;
}

export default function VendorAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/vendor/analytics').then(setData).catch(() => {});
  }, []);

  // Revenue chart — last 7 days from real data
  const revenueData = (data?.revenue || []).slice(-7).map(r => ({
    day: new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    revenue: parseFloat(r.revenue),
    orders: parseInt(r.orders),
  }));

  // Fulfillment split
  const fulfillmentSplit = data?.fulfillment_split || [];
  const pickupCount   = fulfillmentSplit.find(r => r.fulfillment_type === 'pickup')?.count   || 0;
  const deliveryCount = fulfillmentSplit.find(r => r.fulfillment_type === 'delivery')?.count || 0;
  const deliveryRevenue = data?.delivery_revenue || 0;

  // Order completion
  const comp = data?.completion || {};
  const completed = parseInt(comp.completed || 0);
  const pending   = parseInt(comp.pending   || 0);
  const cancelled = parseInt(comp.cancelled || 0);
  const compTotal = completed + pending + cancelled || 1;
  const donutCompletion = [
    { name: 'Completed', value: Math.round((completed / compTotal) * 100), color: '#22c55e' },
    { name: 'Pending',   value: Math.round((pending   / compTotal) * 100), color: '#f59e0b' },
    { name: 'Cancelled', value: Math.round((cancelled / compTotal) * 100), color: '#ef4444' },
  ];

  const donutFulfillment = [
    { name: 'Pickup',   value: pickupCount   || 0, color: '#3b82f6' },
    { name: 'Delivery', value: deliveryCount || 0, color: '#f97316' },
  ];

  const topItems = data?.top_items || [];

  const heatmapGrid = buildHeatmapGrid(data?.heatmap || []);
  const maxHeat = Math.max(1, ...heatmapGrid.flat().map(c => c.value));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="glass-card p-3 text-sm">
        <p className="text-white font-bold">{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}</p>)}
      </div>
    );
    return null;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-black text-white">Analytics</h1>

      {/* Delivery revenue stat */}
      <div className="glass-card p-5 flex items-center gap-5 border border-orange-500/20 bg-orange-500/5">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <Truck size={22} className="text-orange-400" />
        </div>
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Delivery Revenue Collected</p>
          <p className="text-white text-2xl font-black mt-0.5">{formatCurrency(deliveryRevenue)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-white/50 text-xs">Delivery orders</p>
          <p className="text-orange-400 font-bold text-lg">{deliveryCount}</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">Revenue (₹) — Last 7 Days</h3>
        {revenueData.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No order data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top items */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4">🏆 Top Items</h3>
          {topItems.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">No order data yet</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${i === 0 ? 'bg-gold-500 text-navy-900' : i === 1 ? 'bg-gray-400/30 text-gray-300' : 'bg-amber-700/30 text-amber-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-white/50 text-xs">{item.order_count} orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order completion donut */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4">Order Completion</h3>
          <div className="flex items-center gap-6">
            <PieChart width={120} height={120}>
              <Pie data={donutCompletion} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value">
                {donutCompletion.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-2">
              {donutCompletion.map(d => (
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

      {/* Delivery vs Pickup */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Truck size={16} className="text-orange-400" /> Delivery vs Pickup Split
        </h3>
        {(pickupCount + deliveryCount) === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No orders yet</p>
        ) : (
          <div className="flex items-center gap-8">
            <PieChart width={140} height={140}>
              <Pie data={donutFulfillment} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value">
                {donutFulfillment.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-3 flex-1">
              {donutFulfillment.map(d => {
                const total = donutFulfillment.reduce((s, x) => s + x.value, 0) || 1;
                const pct = Math.round((d.value / total) * 100);
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{d.name}</span>
                        <span className="text-white font-bold">{d.value} orders ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-white/40 pt-1">Total delivery fees: <span className="text-orange-400 font-semibold">{formatCurrency(deliveryRevenue)}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Peak hours heatmap */}
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
              {heatmapGrid[di]?.map((cell, hi) => (
                <div key={hi} className="heatmap-cell"
                  style={{ background: `rgba(245, 158, 11, ${Math.min(1, cell.value / maxHeat)})` }}
                  title={`${day} ${HOURS[hi]}: ${cell.value} orders`} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
          <div className="w-4 h-4 rounded bg-gold-500/10 border border-gold-500/20" /><span>Low</span>
          <div className="w-4 h-4 rounded bg-gold-500/40" /><span>Medium</span>
          <div className="w-4 h-4 rounded bg-gold-500" /><span>High</span>
        </div>
      </div>
    </div>
  );
}
