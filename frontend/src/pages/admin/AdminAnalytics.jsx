import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { useCanteens } from '../../contexts/CanteenContext';
import { DEMAND_FORECAST, HEATMAP_DATA, DAYS, HOURS, generateRevenueData, formatCurrency } from '../../data/mockData';

const FORECAST_COLOR = { Low: 'badge-green', Moderate: 'badge-yellow', High: 'badge-red', 'Very High': 'badge-red' };

export default function AdminAnalytics() {
  const { canteens } = useCanteens();
  const revenueData = generateRevenueData(7);

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

      {/* Revenue comparison */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">Campus Revenue (7 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} name="revenue" />
            <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Campus heatmap */}
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
              {HEATMAP_DATA[di]?.map((cell, hi) => (
                <div
                  key={hi}
                  className="heatmap-cell"
                  style={{ background: `rgba(245, 158, 11, ${Math.min(1, cell.value / 25)})` }}
                  title={`${day} ${HOURS[hi]}: ${cell.value} orders`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Demand Forecast Cards */}
      <div>
        <h3 className="text-white font-bold mb-4">7-Day Demand Forecast</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {canteens.map(c => (
            <div key={c.canteen_id} className="glass-card p-5">
              <h4 className="text-white font-bold mb-4">{c.name}</h4>
              <div className="space-y-2">
                {DEMAND_FORECAST[c.canteen_id]?.map((day, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-white/50 text-xs w-16 flex-shrink-0">{day.day}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                        style={{ width: `${Math.min(100, (day.expected_orders / 60) * 100)}%` }}
                      />
                    </div>
                    <span className="text-white/70 text-xs w-8 text-right">{day.expected_orders}</span>
                    <span className={`${FORECAST_COLOR[day.forecast]} text-[10px] w-16 text-center`}>{day.forecast}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canteen comparison */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">Canteen Comparison</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {canteens.map(c => (
            <div key={c.canteen_id} className="text-center p-4 rounded-xl bg-white/5">
              <p className="text-white font-bold text-sm mb-3">{c.name}</p>
              <p className="text-gold-400 text-3xl font-black">{c.avg_rating}</p>
              <p className="text-white/40 text-xs">Avg Rating</p>
              <div className="mt-3 text-sm">
                <p className="text-white/70">{c.active_orders || 0} active</p>
                <p className="text-white/40 text-xs">orders now</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
