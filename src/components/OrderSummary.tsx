import { useState } from 'react';
import { useApp, getNextDayISO, getTodayISO } from '@/context/AppContext';
import { Order } from '@/types/menu';
import paymentQr from '@/assets/payment-qr.jpg';

const OrderSummary = () => {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [utr, setUtr] = useState('');

  const total = state.cart.reduce((sum, c) => sum + c.menuItem.preBookPrice * c.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !utr || state.cart.length === 0) return;

    const orderId = Date.now().toString();
    const bookingDate = getTodayISO();
    const validDate = getNextDayISO();

    const order: Order = {
      id: orderId,
      name,
      phone,
      items: [...state.cart],
      total,
      utr,
      status: 'Pending',
      timestamp: new Date(),
      bookingDate,
      validDate,
      qrData: '',
      qrScanned: false,
    };

    dispatch({ type: 'PLACE_ORDER', order });
    setName('');
    setPhone('');
    setUtr('');
  };

  if (state.cart.length === 0 && !state.showSuccess) return null;

  // Show simple success popup
  if (state.showSuccess) {
    return (
      <section id="order-summary" className="section-band max-w-lg mx-auto text-center">
        <div className="glass-card rounded-xl p-8 animate-fade-in-up">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-heading text-foreground mb-2">Order Placed!</h2>
          <p className="text-muted-foreground font-body mb-6">
            Visit to the stall on next day of prebooking
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_SHOW_SUCCESS', show: false })}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-body font-semibold hover:scale-105 transition-transform"
          >
            Order More
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="order-summary"
      className="section-band max-w-lg mx-auto"
    >
      {/* Section divider */}
      <div className="section-divider mx-auto max-w-xs mb-10" />

      <div className="text-center mb-6">
        <span className="inline-block text-primary font-body text-sm tracking-widest uppercase mb-2">
          — Pre-Book —
        </span>
        <h2 className="text-2xl md:text-3xl font-heading text-foreground">Your Order</h2>
      </div>

      {/* Cart items */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        {state.cart.map((c, i) => (
          <div
            key={c.menuItem.id}
            className="flex items-center justify-between animate-fade-in-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center gap-3">
              <img
                src={c.menuItem.imageUrl}
                alt={c.menuItem.name}
                className="w-12 h-12 rounded-lg object-cover ring-1 ring-primary/10"
              />
              <div>
                <p className="text-foreground font-body font-medium text-sm">{c.menuItem.name}</p>
                <p className="text-muted-foreground font-body text-xs">× {c.quantity}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary font-body font-bold">₹{c.menuItem.preBookPrice * c.quantity}</span>
              <button
                onClick={() => dispatch({ type: 'REMOVE_FROM_CART', itemId: c.menuItem.id })}
                className="text-muted-foreground hover:text-destructive text-xs transition-colors hover:scale-125 transform"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <div className="border-t border-primary/10 pt-3 flex justify-between">
          <span className="text-foreground font-body font-bold">Total</span>
          <span className="text-primary font-heading text-xl">₹{total}</span>
        </div>
      </div>

      {/* Payment section */}
      <div className="mt-6 glass-card rounded-xl p-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="relative z-10">
          <h3 className="font-heading text-lg text-foreground mb-3">Pay via UPI</h3>
          <div className="relative inline-block">
            <img
              src={paymentQr}
              alt="PhonePe QR Code"
              className="w-52 h-52 mx-auto rounded-lg object-contain mb-3 ring-2 ring-primary/20"
            />
            <div className="absolute -inset-2 rounded-xl border-2 border-primary/10 animate-glow-ring pointer-events-none" />
          </div>
          <p className="text-muted-foreground font-body text-sm">Scan & Pay Using PhonePe</p>
          <p className="text-muted-foreground font-body text-sm mt-1">Mobile: +91 9381003436</p>
          <p className="text-primary font-body font-bold mt-2 text-lg">Amount: ₹{total}</p>
        </div>
      </div>

      {/* ⚠️ PRE-BOOKING NOTE */}
      <div className="mt-4 bg-amber-900/20 border border-amber-500/40 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <span className="text-amber-400 font-body font-bold text-sm">Pre-Booking Notice</span>
        </div>
        <ul className="text-amber-200/80 font-body text-sm space-y-1">
          <li>• This is a <strong>pre-booking</strong> — your food will be ready for <strong>pickup the next day</strong></li>
          <li>• Please provide your exact Name and Phone Number above</li>
          <li>• State your Name and Phone Number at <strong>Stall No. 4</strong> to collect your order</li>
        </ul>
      </div>

      {/* Checkout form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {[
          { type: 'text', placeholder: 'UTR / Transaction Reference', value: utr, setter: setUtr },
          { type: 'text', placeholder: 'Your Name', value: name, setter: setName },
          { type: 'tel', placeholder: 'Phone Number', value: phone, setter: setPhone },
        ].map((field, i) => (
          <input
            key={field.placeholder}
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            onChange={e => field.setter(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-muted/80 border border-border text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-300 backdrop-blur-sm animate-fade-in-up"
            style={{ animationDelay: `${0.1 * i}s` }}
          />
        ))}
        <button
          type="submit"
          className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-body font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 animate-pulse-glow relative overflow-hidden group"
        >
          <span className="relative z-10">Pre-Book Now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </form>
    </section>
  );
};

export default OrderSummary;
