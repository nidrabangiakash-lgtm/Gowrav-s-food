import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types/menu';

const statusColors: Record<Order['status'], string> = {
  Pending: 'bg-primary/20 text-primary',
  Confirmed: 'bg-green-500/20 text-green-400',
  Cancelled: 'bg-destructive/20 text-destructive',
};

const AdminOrders = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<Order['status'] | 'All'>('All');

  const filtered = filter === 'All' ? state.orders : state.orders.filter(o => o.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', 'Pending', 'Confirmed', 'Cancelled'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg font-body text-sm transition-colors ${
              filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground font-body text-center py-8">No orders yet.</p>
      )}

      {filtered.map(order => (
        <div key={order.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-foreground font-body font-semibold">{order.name}</p>
              <p className="text-muted-foreground font-body text-sm">{order.phone}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-xs font-body font-bold ${statusColors[order.status]}`}>
              {order.status}
            </span>
          </div>

          <div className="space-y-1">
            {order.items.map(ci => (
              <p key={ci.menuItem.id} className="text-foreground/80 font-body text-sm">
                {ci.menuItem.name} × {ci.quantity} — ₹{ci.menuItem.preBookPrice * ci.quantity}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">UTR: {order.utr}</span>
            <span className="text-primary font-body font-bold">₹{order.total}</span>
          </div>

          {order.status === 'Pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => dispatch({ type: 'UPDATE_ORDER_STATUS', orderId: order.id, status: 'Confirmed' })}
                className="flex-1 py-2 rounded-lg bg-green-600/20 text-green-400 font-body text-sm font-semibold hover:bg-green-600/30 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => dispatch({ type: 'UPDATE_ORDER_STATUS', orderId: order.id, status: 'Cancelled' })}
                className="flex-1 py-2 rounded-lg bg-destructive/20 text-destructive font-body text-sm font-semibold hover:bg-destructive/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
