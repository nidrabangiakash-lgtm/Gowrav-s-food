import { useApp } from '@/context/AppContext';
import { useParallax } from '@/hooks/useScrollAnimation';

const HeroSection = () => {
  const { state } = useApp();
  const scrollY = useParallax();
  const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0);

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCart = () => {
    document.getElementById('order-summary')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden hero-gradient-bg">
      {/* Parallax decorative top border */}
      <div
        className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-chili via-primary to-chili"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />

      {/* Floating food emojis with parallax */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[
          { emoji: '🍚', top: '12%', left: '8%', delay: '0s', size: '2.5rem' },
          { emoji: '🌶️', top: '20%', right: '12%', delay: '1s', size: '2rem' },
          { emoji: '🍗', top: '60%', left: '5%', delay: '2s', size: '2.2rem' },
          { emoji: '🔥', top: '75%', right: '8%', delay: '0.5s', size: '1.8rem' },
          { emoji: '🍛', top: '35%', right: '6%', delay: '3s', size: '2.8rem' },
          { emoji: '🧅', top: '50%', left: '12%', delay: '1.5s', size: '1.5rem' },
          { emoji: '🥘', top: '85%', left: '20%', delay: '2.5s', size: '2rem' },
          { emoji: '🌿', top: '15%', left: '45%', delay: '4s', size: '1.6rem' },
        ].map((item, i) => (
          <span
            key={i}
            className={`absolute opacity-20 select-none ${i % 2 === 0 ? 'animate-float' : 'animate-float-reverse'}`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              fontSize: item.size,
              animationDelay: item.delay,
              transform: `translateY(${scrollY * (0.1 + i * 0.03)}px)`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      {/* Spinning decorative ring */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full border border-primary/5 animate-spin-slow pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${scrollY * -0.15}px)`,
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full border border-chili/5 animate-spin-slow pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${scrollY * -0.1}px)`,
          animationDirection: 'reverse',
          animationDuration: '40s',
        }}
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Stall badge */}
        <div
          className="inline-block mb-6 px-5 py-2 rounded-full border border-primary/30 bg-primary/10 animate-badge-pop"
          style={{ animationDelay: '0.2s' }}
        >
          <span className="text-primary font-body text-sm tracking-widest uppercase">
            Stall No. 4 — College Campus
          </span>
        </div>

        {/* Title with text reveal */}
        <h1 className="text-5xl md:text-7xl font-heading text-foreground leading-tight mb-4">
          <span className="inline-block animate-text-reveal" style={{ animationDelay: '0.3s' }}>
            Gowrav's Special{' '}
          </span>
          <span
            className="inline-block text-gradient animate-text-reveal"
            style={{ animationDelay: '0.5s' }}
          >
            Biryani
          </span>
        </h1>

        <p
          className="text-xl md:text-2xl text-muted-foreground font-body mb-2 animate-text-reveal"
          style={{ animationDelay: '0.7s' }}
        >
          Delicious & Spicy!
        </p>

        {/* Pre-booking badge with glow */}
        <div
          className="inline-flex items-center gap-2 my-6 px-5 py-2.5 rounded-lg bg-chili/90 border border-chili animate-badge-pop relative overflow-hidden"
          style={{ animationDelay: '0.9s' }}
        >
          <div className="absolute inset-0 animate-shimmer" />
          <span className="relative text-secondary-foreground font-body font-semibold text-sm md:text-base">
            🔥 PRE-BOOKING OPEN — Save up to ₹20 per plate!
          </span>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 animate-fade-in-up"
          style={{ animationDelay: '1.1s' }}
        >
          <button
            onClick={scrollToMenu}
            className="group relative px-8 py-4 rounded-lg bg-primary text-primary-foreground font-body font-bold text-lg tracking-wide transition-all duration-300 hover:scale-105 animate-pulse-glow overflow-hidden"
          >
            <span className="relative z-10">Order Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          {cartCount > 0 && (
            <button
              onClick={scrollToCart}
              className="px-6 py-3 rounded-lg border border-primary/40 text-primary font-body font-semibold transition-all hover:bg-primary/10 hover:border-primary/60 hover:scale-105"
            >
              View Cart ({cartCount})
            </button>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up"
        style={{ animationDelay: '1.5s', opacity: scrollY > 100 ? 0 : 1, transition: 'opacity 0.3s' }}
      >
        <span className="text-muted-foreground/50 font-body text-xs tracking-widest uppercase">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-bounce" />
        </div>
      </div>

      {/* Bottom decorative line with parallax */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        style={{ transform: `translateY(${scrollY * -0.05}px)` }}
      />
    </section>
  );
};

export default HeroSection;
