import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useApp, getTodayISO } from '@/context/AppContext';
import { fetchOrderById, markOrderScanned } from '@/lib/firebaseUtils';
import { Order } from '@/types/menu';

type ScanState =
    | { status: 'idle' }
    | { status: 'scanning' }
    | { status: 'loading'; qrData: string }
    | { status: 'success'; order: Order }
    | { status: 'already_scanned'; order: Order }
    | { status: 'not_valid_today'; order: Order; validDate: string }
    | { status: 'not_found' }
    | { status: 'error'; message: string };

const AdminQRScanner = () => {
    const { state, dispatch } = useApp();
    const [scanState, setScanState] = useState<ScanState>({ status: 'idle' });
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const readerDivId = 'qr-reader';

    const startScanner = async () => {
        setScanState({ status: 'scanning' });

        try {
            // Explicitly request camera permissions first (this prompts the user)
            const cameras = await Html5Qrcode.getCameras();

            if (cameras && cameras.length > 0) {
                const html5Qrcode = new Html5Qrcode(readerDivId);
                scannerRef.current = html5Qrcode;

                await html5Qrcode.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        // Stop scanning immediately on success
                        try {
                            await html5Qrcode.stop();
                        } catch { /* ignore */ }
                        scannerRef.current = null;

                        handleQRResult(decodedText);
                    },
                    () => { /* ignore errors during scanning to avoid spamming console */ }
                );
            } else {
                setScanState({ status: 'error', message: 'No cameras found on your device.' });
            }
        } catch (err) {
            console.error('Scanner error:', err);
            setScanState({ status: 'error', message: 'Camera permission denied or not supported. Please ensure camera access is allowed in your browser settings.' });
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch { /* ignore */ }
            scannerRef.current = null;
        }
        setScanState({ status: 'idle' });
    };

    const handleQRResult = async (qrData: string) => {
        setScanState({ status: 'loading', qrData });

        try {
            // Decode QR data
            let decoded: { orderId: string; name: string; phone: string };
            try {
                decoded = JSON.parse(atob(qrData));
            } catch {
                setScanState({ status: 'error', message: 'Invalid QR code format.' });
                return;
            }

            const { orderId } = decoded;

            // First check local state
            let order = state.orders.find(o => o.id === orderId) || null;

            // If not found locally, try Firebase
            if (!order) {
                try {
                    order = await fetchOrderById(orderId);
                } catch {
                    // Firebase might be unavailable
                }
            }

            if (!order) {
                setScanState({ status: 'not_found' });
                return;
            }

            // Check if already scanned
            if (order.qrScanned) {
                setScanState({ status: 'already_scanned', order });
                return;
            }

            // Check if valid today
            const today = getTodayISO();
            if (order.validDate !== today) {
                setScanState({ status: 'not_valid_today', order, validDate: order.validDate });
                return;
            }

            // Valid scan! Mark as scanned
            dispatch({ type: 'SCAN_ORDER_QR', orderId });
            try {
                await markOrderScanned(orderId);
            } catch {
                console.warn('Could not update Firebase, but local state is updated');
            }

            setScanState({ status: 'success', order: { ...order, qrScanned: true } });

        } catch (err) {
            console.error('Error processing QR:', err);
            setScanState({ status: 'error', message: 'Error processing QR code.' });
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h3 className="font-heading text-xl text-foreground mb-1">QR Scanner</h3>
                <p className="text-muted-foreground font-body text-sm">
                    Scan customer QR codes to verify and serve pre-booked orders
                </p>
            </div>

            {/* Scanner area */}
            {(scanState.status === 'idle' || scanState.status === 'scanning') && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div
                        id={readerDivId}
                        className="w-full max-w-sm mx-auto"
                        style={{ minHeight: scanState.status === 'scanning' ? '300px' : '0' }}
                    />

                    <div className="p-4 text-center">
                        {scanState.status === 'idle' ? (
                            <button
                                onClick={startScanner}
                                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-body font-bold transition-all hover:scale-105"
                            >
                                📷 Start Scanner
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-primary font-body text-sm animate-pulse">Scanning... Point camera at QR code</p>
                                <button
                                    onClick={stopScanner}
                                    className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-body text-sm hover:text-foreground transition-colors"
                                >
                                    Stop Scanner
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Loading */}
            {scanState.status === 'loading' && (
                <div className="bg-card border border-border rounded-xl p-8 text-center animate-fade-in-up">
                    <div className="text-4xl mb-3 animate-spin-slow">⏳</div>
                    <p className="text-foreground font-body">Verifying order...</p>
                </div>
            )}

            {/* SUCCESS */}
            {scanState.status === 'success' && (
                <div className="bg-green-900/20 border-2 border-green-500/50 rounded-xl p-6 animate-fade-in-up space-y-4">
                    <div className="text-center">
                        <div className="text-5xl mb-2">✅</div>
                        <h3 className="font-heading text-xl text-green-400">Valid Order — Serve Now!</h3>
                    </div>
                    <OrderDetails order={scanState.order} />
                    <button
                        onClick={() => setScanState({ status: 'idle' })}
                        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-body font-semibold"
                    >
                        Scan Next
                    </button>
                </div>
            )}

            {/* ALREADY SCANNED */}
            {scanState.status === 'already_scanned' && (
                <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6 animate-fade-in-up space-y-4">
                    <div className="text-center">
                        <div className="text-5xl mb-2">🚫</div>
                        <h3 className="font-heading text-xl text-red-400">Already Scanned!</h3>
                        <p className="text-red-300/80 font-body text-sm mt-1">
                            This QR code has already been used. It cannot be scanned again.
                        </p>
                    </div>
                    <OrderDetails order={scanState.order} />
                    <button
                        onClick={() => setScanState({ status: 'idle' })}
                        className="w-full py-2.5 rounded-lg bg-muted text-foreground font-body font-semibold"
                    >
                        Scan Another
                    </button>
                </div>
            )}

            {/* NOT VALID TODAY */}
            {scanState.status === 'not_valid_today' && (
                <div className="bg-amber-900/20 border-2 border-amber-500/50 rounded-xl p-6 animate-fade-in-up space-y-4">
                    <div className="text-center">
                        <div className="text-5xl mb-2">📅</div>
                        <h3 className="font-heading text-xl text-amber-400">Not Valid Today</h3>
                        <p className="text-amber-300/80 font-body text-sm mt-1">
                            This order is valid for pickup on <strong>{formatDate(scanState.validDate)}</strong>, not today.
                        </p>
                    </div>
                    <OrderDetails order={scanState.order} />
                    <button
                        onClick={() => setScanState({ status: 'idle' })}
                        className="w-full py-2.5 rounded-lg bg-muted text-foreground font-body font-semibold"
                    >
                        Scan Another
                    </button>
                </div>
            )}

            {/* NOT FOUND */}
            {scanState.status === 'not_found' && (
                <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6 animate-fade-in-up text-center space-y-3">
                    <div className="text-5xl mb-2">❌</div>
                    <h3 className="font-heading text-xl text-red-400">Order Not Found</h3>
                    <p className="text-red-300/80 font-body text-sm">
                        This QR code does not match any order in our system.
                    </p>
                    <button
                        onClick={() => setScanState({ status: 'idle' })}
                        className="w-full py-2.5 rounded-lg bg-muted text-foreground font-body font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* ERROR */}
            {scanState.status === 'error' && (
                <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6 animate-fade-in-up text-center space-y-3">
                    <div className="text-5xl mb-2">⚠️</div>
                    <h3 className="font-heading text-xl text-red-400">Error</h3>
                    <p className="text-red-300/80 font-body text-sm">{scanState.message}</p>
                    <button
                        onClick={() => setScanState({ status: 'idle' })}
                        className="w-full py-2.5 rounded-lg bg-muted text-foreground font-body font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

// Order details sub-component
const OrderDetails = ({ order }: { order: Order }) => (
    <div className="bg-card/50 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
                <p className="text-muted-foreground font-body text-xs">Customer</p>
                <p className="text-foreground font-body font-semibold">{order.name}</p>
            </div>
            <div>
                <p className="text-muted-foreground font-body text-xs">Phone</p>
                <p className="text-foreground font-body font-semibold">{order.phone}</p>
            </div>
            <div>
                <p className="text-muted-foreground font-body text-xs">Order ID</p>
                <p className="text-foreground font-body font-semibold">#{order.id.slice(-6)}</p>
            </div>
            <div>
                <p className="text-muted-foreground font-body text-xs">Total</p>
                <p className="text-primary font-body font-bold">₹{order.total}</p>
            </div>
        </div>

        <div className="border-t border-border pt-2">
            <p className="text-muted-foreground font-body text-xs mb-2">Items Ordered</p>
            {(order.items || []).map(ci => (
                <div key={ci.menuItem?.id || Math.random()} className="flex justify-between text-sm py-0.5">
                    <span className="text-foreground font-body">
                        {ci.menuItem.name} × {ci.quantity}
                    </span>
                    <span className="text-primary font-body font-semibold">
                        ₹{ci.menuItem.preBookPrice * ci.quantity}
                    </span>
                </div>
            ))}
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
            <span className="text-muted-foreground font-body">UTR: {order.utr}</span>
            <span className="text-muted-foreground font-body">
                Booked: {formatDate(order.bookingDate)}
            </span>
        </div>
    </div>
);

function formatDate(isoDate: string): string {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default AdminQRScanner;
