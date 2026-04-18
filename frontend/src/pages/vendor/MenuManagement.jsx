import { useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, RefreshCw, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../data/mockData';

const CATEGORIES = ['meals', 'snacks', 'beverages', 'healthy', 'bakery'];

export default function MenuManagement() {
  const { user } = useAuth();
  const { getMenu, toggleMenuItem, restockItem, updateMenuItem, addMenuItem, deleteMenuItem } = useCanteens();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'meals', is_veg: true, prep_time_mins: 10, daily_stock_limit: 30 });
  const [filter, setFilter] = useState('all');

  const canteen_id = user?.canteen_id;
  const menu = getMenu(canteen_id);
  const filtered = filter === 'all' ? menu : menu.filter(i => i.category === filter);

  const startEdit = (item) => {
    setEditing(item.item_id);
    setEditData({ price: item.price, prep_time_mins: item.prep_time_mins, daily_stock_limit: item.daily_stock_limit });
  };

  const saveEdit = (item) => {
    updateMenuItem(canteen_id, item.item_id, {
      price: parseFloat(editData.price),
      prep_time_mins: parseInt(editData.prep_time_mins),
      daily_stock_limit: parseInt(editData.daily_stock_limit),
    });
    setEditing(null);
    toast('Item updated!', 'success');
  };

  const handleToggle = (item) => {
    toggleMenuItem(canteen_id, item.item_id);
    toast(`${item.name} ${item.is_available ? 'disabled' : 'enabled'}`, item.is_available ? 'warning' : 'success');
  };

  const handleRestock = (item) => {
    restockItem(canteen_id, item.item_id);
    toast(`${item.name} restocked to ${item.daily_stock_limit}`, 'success');
  };

  const handleDelete = (item) => {
    if (confirm(`Delete "${item.name}"?`)) {
      deleteMenuItem(canteen_id, item.item_id);
      toast(`${item.name} removed`, 'info');
    }
  };

  const handleAdd = () => {
    if (!newItem.name || !newItem.price) { toast('Name and price required', 'warning'); return; }
    addMenuItem(canteen_id, { ...newItem, price: parseFloat(newItem.price) });
    setNewItem({ name: '', price: '', category: 'meals', is_veg: true, prep_time_mins: 10, daily_stock_limit: 30 });
    setShowAddForm(false);
    toast('New item added!', 'success');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Menu Management</h1>
          <p className="text-white/50 text-sm mt-1">{menu.length} items · {menu.filter(i => !i.is_available).length} unavailable</p>
        </div>
        <button onClick={() => setShowAddForm(p => !p)} className="btn-gold text-sm flex items-center gap-2">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card p-5 animate-fade-in">
          <h3 className="text-white font-bold mb-4">New Menu Item</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Item Name" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} className="input-dark col-span-2" />
            <input placeholder="Price (₹)" type="number" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} className="input-dark" />
            <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} className="input-dark appearance-none">
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-navy-900 capitalize">{c}</option>)}
            </select>
            <input placeholder="Prep time (mins)" type="number" value={newItem.prep_time_mins} onChange={e => setNewItem(p => ({ ...p, prep_time_mins: e.target.value }))} className="input-dark" />
            <input placeholder="Daily stock limit" type="number" value={newItem.daily_stock_limit} onChange={e => setNewItem(p => ({ ...p, daily_stock_limit: e.target.value }))} className="input-dark" />
            <div className="flex items-center gap-3 col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
                <input type="checkbox" checked={newItem.is_veg} onChange={e => setNewItem(p => ({ ...p, is_veg: e.target.checked }))} className="accent-green-500" />
                Vegetarian
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAddForm(false)} className="btn-outline flex-1 text-sm">Cancel</button>
            <button onClick={handleAdd} className="btn-gold flex-1 text-sm">Add Item</button>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['all', ...CATEGORIES].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-gold-500 text-navy-900' : 'glass-card text-white/60 hover:text-white'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.item_id} className={`glass-card p-4 ${!item.is_available ? 'opacity-60' : ''}`}>
            {editing === item.item_id ? (
              <div className="space-y-3">
                <p className="text-white font-bold">{item.name}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Price (₹)</p>
                    <input type="number" value={editData.price} onChange={e => setEditData(p => ({ ...p, price: e.target.value }))} className="input-dark text-sm py-2" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Prep (mins)</p>
                    <input type="number" value={editData.prep_time_mins} onChange={e => setEditData(p => ({ ...p, prep_time_mins: e.target.value }))} className="input-dark text-sm py-2" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Daily Stock</p>
                    <input type="number" value={editData.daily_stock_limit} onChange={e => setEditData(p => ({ ...p, daily_stock_limit: e.target.value }))} className="input-dark text-sm py-2" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className="btn-outline flex-1 text-sm py-2"><X size={14} /></button>
                  <button onClick={() => saveEdit(item)} className="btn-gold flex-1 text-sm py-2"><Check size={14} /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full m-auto mt-0.5 ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-white font-semibold truncate">{item.name}</p>
                    {!item.is_available && <span className="badge-red text-[10px]">Unavailable</span>}
                    {item.stock_remaining <= 5 && item.is_available && <span className="badge-yellow text-[10px]">Low Stock</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap text-xs text-white/50">
                    <span className="text-gold-400 font-bold">{formatCurrency(item.price)}</span>
                    <span>~{item.prep_time_mins} mins</span>
                    <span className={`font-medium ${item.stock_remaining <= 5 ? 'text-red-400' : 'text-white/50'}`}>{item.stock_remaining}/{item.daily_stock_limit} remaining</span>
                    <span className="capitalize">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleRestock(item)} title="Restock" className="p-2 hover:bg-green-500/20 rounded-xl text-white/40 hover:text-green-400 transition-colors">
                    <RefreshCw size={14} />
                  </button>
                  <button onClick={() => startEdit(item)} title="Edit" className="p-2 hover:bg-blue-500/20 rounded-xl text-white/40 hover:text-blue-400 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleToggle(item)} title="Toggle" className="p-2 hover:bg-gold-500/20 rounded-xl text-white/40 hover:text-gold-400 transition-colors">
                    {item.is_available ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => handleDelete(item)} title="Delete" className="p-2 hover:bg-red-500/20 rounded-xl text-white/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
