import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import HeroSection from '@/components/HeroSection';
import MenuSection from '@/components/MenuSection';
import OrderSummary from '@/components/OrderSummary';
import StickyCartIcon from '@/components/StickyCartIcon';
import Footer from '@/components/Footer';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';

const AppContent = () => {
  const { state } = useApp();
  const [loggedIn, setLoggedIn] = useState(false);

  if (state.isAdmin && !loggedIn) {
    return <AdminLoginWrapper onLogin={() => setLoggedIn(true)} />;
  }

  if (state.isAdmin && loggedIn) {
    return <AdminPanel />;
  }

  return (
    <>
      <StickyCartIcon />
      <HeroSection />
      <MenuSection />
      <OrderSummary />
      <Footer />
    </>
  );
};

const AdminLoginWrapper = ({ onLogin }: { onLogin: () => void }) => {
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'harsha@food.in' && password === 'harshayadav@123') {
      onLogin();
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 animate-fade-in-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-heading text-foreground mb-1">Admin Login</h1>
          <p className="text-muted-foreground font-body text-sm">Gowrav's Special Biryani</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {error && <p className="text-destructive font-body text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-body font-bold transition-all hover:scale-[1.02]">
            Login
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_ADMIN', isAdmin: false })}
            className="w-full py-2 text-muted-foreground font-body text-sm hover:text-foreground transition-colors"
          >
            ← Back to Menu
          </button>
        </form>
      </div>
    </div>
  );
};

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
