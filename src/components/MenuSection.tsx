import { useApp } from '@/context/AppContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import MenuCard from './MenuCard';

const MenuSection = () => {
  const { state } = useApp();
  const available = state.menuItems.filter(m => m.available);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.05 });

  return (
    <section id="menu-section" className="section-band max-w-5xl mx-auto relative">
      {/* Top divider */}
      <div className="section-divider mx-auto max-w-md mb-12" />

      {/* Header with scroll animation */}
      <div
        ref={headerRef}
        className={`text-center mb-10 scroll-fade-up ${headerVisible ? 'visible' : ''}`}
      >
        <span className="inline-block text-primary font-body text-sm tracking-widest uppercase mb-3">
          — Our Specials —
        </span>
        <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-2">
          The Menu
        </h2>
        <p className="text-muted-foreground font-body max-w-md mx-auto">
          Pre-book prices shown. Grab yours before they're gone.
        </p>
      </div>

      {/* Grid with staggered scroll animation */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {available.map((item, i) => (
          <div
            key={item.id}
            className={`scroll-scale-in ${gridVisible ? 'visible' : ''}`}
            style={{ transitionDelay: gridVisible ? `${i * 0.1}s` : '0s' }}
          >
            <MenuCard item={item} />
          </div>
        ))}
      </div>

      {available.length === 0 && (
        <p className="text-center text-muted-foreground font-body py-12">No items available right now. Check back soon!</p>
      )}
    </section>
  );
};

export default MenuSection;
