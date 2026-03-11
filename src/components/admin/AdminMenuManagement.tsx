import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MenuItem } from '@/types/menu';

const AdminMenuManagement = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  const [name, setName] = useState('');
  const [preBookPrice, setPreBookPrice] = useState('');
  const [livePrice, setLivePrice] = useState('');
  const [category, setCategory] = useState<'veg' | 'non-veg'>('non-veg');
  const [imageUrl, setImageUrl] = useState('');

  const resetForm = () => {
    setName(''); setPreBookPrice(''); setLivePrice(''); setCategory('non-veg'); setImageUrl('');
    setEditItem(null); setShowForm(false);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setName(item.name);
    setPreBookPrice(String(item.preBookPrice));
    setLivePrice(String(item.livePrice));
    setCategory(item.category);
    setImageUrl(item.imageUrl);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: MenuItem = {
      id: editItem?.id || Date.now().toString(),
      name,
      preBookPrice: Number(preBookPrice),
      livePrice: Number(livePrice),
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
      available: editItem?.available ?? true,
    };

    if (editItem) {
      dispatch({ type: 'UPDATE_MENU_ITEM', item });
    } else {
      dispatch({ type: 'ADD_MENU_ITEM', item });
    }
    resetForm();
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";

  return (
    <div className="space-y-4">
      <button
        onClick={() => { resetForm(); setShowForm(!showForm); }}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-body font-semibold text-sm"
      >
        {showForm ? 'Cancel' : '+ Add Item'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in-up">
          <input placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Pre-book ₹" value={preBookPrice} onChange={e => setPreBookPrice(e.target.value)} required type="number" className={inputClass} />
            <input placeholder="Live ₹" value={livePrice} onChange={e => setLivePrice(e.target.value)} required type="number" className={inputClass} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value as 'veg' | 'non-veg')} className={inputClass}>
            <option value="non-veg">Non-Veg</option>
            <option value="veg">Veg</option>
          </select>
          <input placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={inputClass} />
          <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-body font-semibold text-sm">
            {editItem ? 'Update Item' : 'Add Item'}
          </button>
        </form>
      )}

      {state.menuItems.map(item => (
        <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-body font-medium text-sm truncate">{item.name}</p>
            <p className="text-muted-foreground font-body text-xs">₹{item.preBookPrice} / ₹{item.livePrice}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Availability toggle */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_ITEM_AVAILABILITY', itemId: item.id })}
              className={`w-10 h-6 rounded-full transition-colors relative ${item.available ? 'bg-green-600' : 'bg-muted'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-foreground absolute top-1 transition-all ${item.available ? 'left-5' : 'left-1'}`} />
            </button>
            <button onClick={() => openEdit(item)} className="text-primary font-body text-xs hover:underline">Edit</button>
            <button onClick={() => dispatch({ type: 'DELETE_MENU_ITEM', itemId: item.id })} className="text-destructive font-body text-xs hover:underline">Del</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMenuManagement;
