import { useRef, useState } from 'react';
import { MenuItem } from '@/types/menu';
import { useApp } from '@/context/AppContext';

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard = ({ item }: MenuCardProps) => {
  const { state, dispatch } = useApp();
  const cartItem = state.cart.find(c => c.menuItem.id === item.id);
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleAdd = () => {
    dispatch({ type: 'ADD_TO_CART', item });

    // Fly animation
    if (imgRef.current) {
      const imgRect = imgRef.current.getBoundingClientRect();
      const cartIcon = document.getElementById('cart-icon');
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        const flyX = cartRect.left - imgRect.left;
        const flyY = cartRect.top - imgRect.top;

        const clone = imgRef.current.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        clone.style.left = `${imgRect.left}px`;
        clone.style.top = `${imgRect.top}px`;
        clone.style.width = `${imgRect.width}px`;
        clone.style.height = `${imgRect.height}px`;
        clone.style.zIndex = '9999';
        clone.style.borderRadius = '8px';
        clone.style.pointerEvents = 'none';
        clone.style.setProperty('--fly-x', `${flyX}px`);
        clone.style.setProperty('--fly-y', `${flyY}px`);
        clone.classList.add('item-fly');
        document.body.appendChild(clone);

        clone.addEventListener('animationend', () => {
          clone.remove();
          cartIcon.classList.add('cart-wiggle');
          setTimeout(() => cartIcon.classList.remove('cart-wiggle'), 400);
        });
      }
    }
  };

  if (!item.available) return null;

  const savings = item.livePrice - item.preBookPrice;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group rounded-xl bg-card border border-border overflow-hidden card-glow"
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'translateY(-4px)' : ''}`,
        transition: 'transform 0.2s ease-out, box-shadow 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          ref={imgRef}
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Veg/Non-veg badge */}
        <div className="absolute top-3 left-3">
          <div
            className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center backdrop-blur-sm ${item.category === 'veg' ? 'border-green-500 bg-green-500/10' : 'border-chili bg-chili/10'
              }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${item.category === 'veg' ? 'bg-green-500' : 'bg-chili'
                }`}
            />
          </div>
        </div>
        {/* Savings badge */}
        {savings > 0 && (
          <div className="absolute top-3 right-3 bg-chili text-secondary-foreground text-xs font-body font-bold px-2.5 py-1 rounded-md shadow-lg backdrop-blur-sm">
            Save ₹{savings}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading text-lg text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
          {item.name}
        </h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-primary font-body font-bold text-xl">₹{item.preBookPrice}</span>
          <span className="text-muted-foreground font-body text-sm line-through">₹{item.livePrice}</span>
        </div>

        {!cartItem ? (
          <button
            onClick={handleAdd}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-body font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-primary/20 relative overflow-hidden group/btn"
          >
            <span className="relative z-10">Add to Cart</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
          </button>
        ) : (
          <div className="flex items-center justify-between bg-muted rounded-lg p-1">
            <button
              onClick={() => dispatch({ type: 'UPDATE_QUANTITY', itemId: item.id, quantity: cartItem.quantity - 1 })}
              className="w-10 h-10 rounded-md bg-card text-primary font-bold text-lg transition-all hover:bg-primary/10 hover:scale-110 active:scale-90"
            >
              −
            </button>
            <span className="text-foreground font-body font-bold text-lg animate-count-up">{cartItem.quantity}</span>
            <button
              onClick={() => dispatch({ type: 'UPDATE_QUANTITY', itemId: item.id, quantity: cartItem.quantity + 1 })}
              className="w-10 h-10 rounded-md bg-card text-primary font-bold text-lg transition-all hover:bg-primary/10 hover:scale-110 active:scale-90"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
