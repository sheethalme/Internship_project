import { useState } from 'react';
import { Store, Edit2, X, Check, Star } from 'lucide-react';
import { useCanteens } from '../../contexts/CanteenContext';
import { useToast } from '../../contexts/ToastContext';
import { getCapacityInfo } from '../../data/mockData';

export default function AdminCanteens() {
  const { canteens, updateCanteen, updateCanteenStatus } = useCanteens();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (c) => {
    setEditing(c.canteen_id);
    setEditData({ name: c.name, description: c.description, operating_hours: c.operating_hours });
  };

  const saveEdit = (id) => {
    updateCanteen(id, editData);
    setEditing(null);
    toast('Canteen updated!', 'success');
  };

  const forceClose = (c) => {
    updateCanteenStatus(c.canteen_id, c.status === 'open' ? 'closed' : 'open');
    toast(c.status === 'open' ? `${c.name} force-closed` : `${c.name} re-opened`, c.status === 'open' ? 'warning' : 'success');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Canteen Management</h1>
        <p className="text-white/50 text-sm mt-1">Manage all 4 campus canteens</p>
      </div>

      <div className="space-y-4">
        {canteens.map(c => {
          const cap = getCapacityInfo(c.active_orders || 0, c.max_capacity);
          return (
            <div key={c.canteen_id} className="glass-card overflow-hidden">
              <div className="relative h-32 overflow-hidden">
                <img src={c.banner_image} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-white font-black text-lg">{c.name}</h3>
                    <p className="text-white/60 text-sm">{c.cuisine}</p>
                  </div>
                  <span className={`badge-${cap.color === 'green' ? 'green' : cap.color === 'yellow' ? 'yellow' : 'red'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {c.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {editing === c.canteen_id ? (
                  <div className="space-y-3">
                    <input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} className="input-dark text-sm" placeholder="Canteen name" />
                    <input value={editData.description} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))} className="input-dark text-sm" placeholder="Description" />
                    <input value={editData.operating_hours} onChange={e => setEditData(p => ({ ...p, operating_hours: e.target.value }))} className="input-dark text-sm" placeholder="Operating hours" />
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(null)} className="btn-outline flex-1 text-sm py-2"><X size={14} /></button>
                      <button onClick={() => saveEdit(c.canteen_id)} className="btn-gold flex-1 text-sm py-2"><Check size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1"><Star size={13} className="text-gold-400" /> {c.avg_rating}</div>
                        <span>{c.active_orders || 0} active orders</span>
                        <span>{c.operating_hours}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(c)} className="p-2 hover:bg-blue-500/20 rounded-xl text-white/40 hover:text-blue-400 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => forceClose(c)} className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${c.status === 'open' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                          {c.status === 'open' ? 'Force Close' : 'Re-open'}
                        </button>
                      </div>
                    </div>
                    <p className="text-white/50 text-sm">{c.description}</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
