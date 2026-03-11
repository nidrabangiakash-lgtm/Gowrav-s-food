import { useApp } from '@/context/AppContext';

const StickyCartIcon = () => {
  const { state } = useApp();
  const count = state.cart.reduce((sum, c) => sum + c.quantity, 0);

  if (count === 0 || state.isAdmin) return null;

  const scrollToCart = () => {
    document.getElementById('order-summary')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      id="cart-icon"
      onClick={scrollToCart}
      className="fixed top-4 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 animate-cart-bounce group"
    >
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full animate-glow-ring pointer-events-none" />

      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:scale-110 transition-transform"
      >
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-chili text-secondary-foreground text-xs font-body font-bold flex items-center justify-center animate-count-up shadow-md">
        {count}
      </span>
    </button>
  );
};

export default StickyCartIcon;
