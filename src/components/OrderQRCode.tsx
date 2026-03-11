import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Order } from '@/types/menu';

interface OrderQRCodeProps {
    order: Order;
    onOrderMore: () => void;
}

const OrderQRCode = ({ order, onOrderMore }: OrderQRCodeProps) => {
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const handleDownload = useCallback(() => {
        const svgElement = qrContainerRef.current?.querySelector('svg');
        if (!svgElement) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const padding = 40;
        const qrSize = 280;
        const headerHeight = 80;
        const detailsHeight = 180;
        const cautionHeight = 70;
        const totalHeight = padding + headerHeight + qrSize + detailsHeight + cautionHeight + padding;
        const totalWidth = qrSize + padding * 2;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // Background
        ctx.fillStyle = '#1a0f0a';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Header
        ctx.fillStyle = '#e6a417';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Gowrav's Special Biryani", totalWidth / 2, padding + 25);

        ctx.fillStyle = '#a8917a';
        ctx.font = '13px sans-serif';
        ctx.fillText('PRE-BOOKING CONFIRMATION', totalWidth / 2, padding + 50);

        // QR Code
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();

        img.onload = () => {
            const qrX = (totalWidth - qrSize) / 2;
            const qrY = padding + headerHeight;

            // White background for QR
            ctx.fillStyle = '#ffffff';
            ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 8);
            ctx.fill();
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

            // Order details
            const detailsY = qrY + qrSize + 30;
            ctx.textAlign = 'left';
            ctx.fillStyle = '#f5ebe0';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(`Name: ${order.name}`, padding, detailsY);
            ctx.fillText(`Phone: ${order.phone}`, padding, detailsY + 24);
            ctx.fillText(`Order ID: #${order.id.slice(-6)}`, padding, detailsY + 48);
            ctx.fillText(`Total: ₹${order.total}`, padding, detailsY + 72);

            ctx.fillStyle = '#e6a417';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText(`Pickup: ${formatDate(order.validDate)}`, padding, detailsY + 100);

            // Items
            ctx.fillStyle = '#a8917a';
            ctx.font = '12px sans-serif';
            const itemsText = order.items.map(i => `${i.menuItem.name} ×${i.quantity}`).join(', ');
            ctx.fillText(itemsText.substring(0, 50) + (itemsText.length > 50 ? '...' : ''), padding, detailsY + 124);

            // Caution bar
            const cautionY = detailsY + detailsHeight - 20;
            ctx.fillStyle = '#92400e';
            ctx.roundRect(padding - 10, cautionY, totalWidth - padding * 2 + 20, 45, 6);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠ ONE-TIME USE ONLY', totalWidth / 2, cautionY + 17);
            ctx.fillStyle = '#fde68a';
            ctx.font = '10px sans-serif';
            ctx.fillText(`Valid only on: ${formatDate(order.validDate)}`, totalWidth / 2, cautionY + 33);

            // Download
            const link = document.createElement('a');
            link.download = `gowravs-order-${order.id.slice(-6)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            URL.revokeObjectURL(url);
        };

        img.src = url;
    }, [order]);

    return (
        <div className="space-y-5 animate-fade-in-up">
            {/* Success header */}
            <div className="text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-heading text-foreground mb-1">Order Placed!</h2>
                <p className="text-muted-foreground font-body text-sm">
                    Your pre-booking is confirmed. Save the QR below for pickup.
                </p>
            </div>

            {/* QR Code card */}
            <div className="glass-card rounded-xl p-6 text-center">
                <div
                    ref={qrContainerRef}
                    className="inline-block bg-white p-4 rounded-xl shadow-lg mb-4"
                >
                    <QRCodeSVG
                        value={order.qrData}
                        size={200}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#1a0f0a"
                    />
                </div>

                <p className="text-foreground font-body font-semibold mb-1">Order #{order.id.slice(-6)}</p>
                <p className="text-muted-foreground font-body text-sm mb-1">
                    {order.name} • {order.phone}
                </p>
                <p className="text-primary font-heading text-lg mb-1">₹{order.total}</p>

                {/* Items */}
                <div className="text-left bg-muted/30 rounded-lg p-3 mt-3 space-y-1">
                    {order.items.map(ci => (
                        <p key={ci.menuItem.id} className="text-foreground/80 font-body text-sm">
                            {ci.menuItem.name} × {ci.quantity} — ₹{ci.menuItem.preBookPrice * ci.quantity}
                        </p>
                    ))}
                </div>
            </div>

            {/* Pickup date badge */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                <p className="text-primary font-body font-bold text-sm tracking-wide uppercase mb-1">
                    📅 Pickup Date
                </p>
                <p className="text-foreground font-heading text-xl">{formatDate(order.validDate)}</p>
                <p className="text-muted-foreground font-body text-xs mt-1">
                    Show this QR at Stall No. 4 to collect your order
                </p>
            </div>

            {/* ⚠️ CAUTION BOX */}
            <div className="bg-amber-900/30 border-2 border-amber-500/50 rounded-xl p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <span className="text-amber-400 font-body font-bold text-sm uppercase tracking-wider">
                        Important — Read Carefully
                    </span>
                    <span className="text-2xl">⚠️</span>
                </div>
                <ul className="text-amber-200/90 font-body text-sm space-y-1 text-left max-w-xs mx-auto">
                    <li>• This QR code is <strong>one-time use only</strong></li>
                    <li>• Valid <strong>only on {formatDate(order.validDate)}</strong></li>
                    <li>• Cannot be used after scanning once</li>
                    <li>• <strong>Download and save</strong> this QR before leaving</li>
                </ul>
            </div>

            {/* Download button */}
            <button
                onClick={handleDownload}
                className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-body font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 animate-pulse-glow relative overflow-hidden group"
            >
                <span className="relative z-10">📥 Download QR Code</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>

            {/* Order more */}
            <button
                onClick={onOrderMore}
                className="w-full py-2.5 rounded-lg border border-border text-muted-foreground font-body text-sm hover:text-foreground hover:border-primary/30 transition-colors"
            >
                ← Order More
            </button>
        </div>
    );
};

function formatDate(isoDate: string): string {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default OrderQRCode;
