import { useApp } from '@/context/AppContext';

const AdminDashboard = () => {
  const { state } = useApp();

  const today = new Date().toDateString();
  const todayOrders = state.orders.filter(o => o.timestamp.toDateString() === today);
  const totalRevenue = todayOrders.filter(o => o.status === 'Confirmed').reduce((s, o) => s + o.total, 0);
  const pending = todayOrders.filter(o => o.status === 'Pending').length;

  const stats = [
    { label: 'Orders Today', value: todayOrders.length, icon: '📋' },
    { label: 'Revenue', value: `₹${totalRevenue}`, icon: '💰' },
    { label: 'Pending', value: pending, icon: '⏳' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">{s.icon}</div>
          <p className="text-2xl font-heading text-primary">{s.value}</p>
          <p className="text-muted-foreground font-body text-sm">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
