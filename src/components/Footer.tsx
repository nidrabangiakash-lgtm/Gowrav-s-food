import { useApp } from '@/context/AppContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Footer = () => {
  const { dispatch, state } = useApp();
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();

  return (
    <footer
      ref={ref}
      className={`section-band border-t border-border text-center space-y-4 relative overflow-hidden scroll-fade-up ${isVisible ? 'visible' : ''}`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 hero-gradient-bg opacity-50 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Section divider */}
        <div className="section-divider mx-auto max-w-xs mb-6" />

        <p className="font-heading text-xl text-foreground">
          Gowrav's Special <span className="text-gradient">Biryani</span>
        </p>

        <p className="text-muted-foreground font-body text-sm">
          Stall No. 4 &nbsp;|&nbsp; Vasu: 8688046895 &nbsp;|&nbsp; Harsha: +91 93810 03436
        </p>

        <div className="flex items-center justify-center gap-6 text-muted-foreground pt-2">
          {[
            { name: 'Instagram', icon: '📸' },
            { name: 'WhatsApp', icon: '💬' },
            { name: 'YouTube', icon: '🎬' },
          ].map(s => (
            <span
              key={s.name}
              className="flex items-center gap-1.5 text-xs font-body hover:text-primary transition-all duration-300 cursor-pointer hover:scale-110"
            >
              <span>{s.icon}</span>
              {s.name}
            </span>
          ))}
        </div>

        <p className="text-muted-foreground/40 font-body text-xs pt-4">
          Made with 🔥 and lots of spice
        </p>

        {!state.isAdmin && (
          <button
            onClick={() => dispatch({ type: 'SET_ADMIN', isAdmin: true })}
            className="text-xs text-muted-foreground/30 font-body hover:text-muted-foreground/60 transition-colors mt-2"
          >
            Admin
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;
