import { useState } from 'react';
import { useApp } from '@/context/AppContext';

const AdminLogin = () => {
  const { dispatch } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'gowrav@admin') {
      dispatch({ type: 'SET_ADMIN', isAdmin: true });
      setError('');
    } else {
      setError('Incorrect password');
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
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {error && <p className="text-destructive font-body text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-body font-bold transition-all hover:scale-[1.02]"
          >
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

export default AdminLogin;
