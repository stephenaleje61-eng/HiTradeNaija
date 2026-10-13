import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Truck, Check, ArrowLeft, 
  MapPin, Phone, Building, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatNaira, NIGERIAN_STATES_AND_CITIES } from '../data/nigeria-data';
import { api } from '../services/api';

interface CheckoutPageProps {
  navigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { user, isAuthenticated } = useAuth();
  const { cart, cartSubtotal, estimatedShippingFee, clearCart, selectedDeliveryState } = useCart();
  const { showToast } = useNotification();

  // Redirect if empty or unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to proceed with checkout.', 'info');
      navigate('/auth?redirect=/checkout');
    } else if (cart.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, cart.length, navigate, showToast]);

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(selectedDeliveryState || user?.state || 'Lagos');
  const [city, setCity] = useState(user?.city || 'Ikeja');
  const [streetAddress, setStreetAddress] = useState(user?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'bank_transfer' | 'cash_on_delivery'>('paystack');
  const [submitting, setSubmitting] = useState(false);

  const total = cartSubtotal + estimatedShippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !state || !city || !streetAddress) {
      showToast('Please complete all shipping address fields and Nigerian phone number.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName,
          phone,
          state,
          city,
          streetAddress,
          additionalNotes: deliveryNotes
        },
        paymentMethod,
        notes: deliveryNotes
      };

      const res = await api.createOrder(orderPayload);
      clearCart();
      showToast(`Order #${res.id} placed successfully!`, 'success');
      navigate(`/orders`);
    } catch (err: any) {
      showToast(err.message || 'Failed to complete order.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <h1 className="text-2xl font-black text-slate-900 mb-6">
          Checkout & Delivery Details
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Form: Delivery Address & Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Nigerian Delivery Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="080 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nigerian State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none"
                  >
                    {NIGERIAN_STATES_AND_CITIES.map((loc) => (
                      <option key={loc.state} value={loc.state}>{loc.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City or Town / LGA *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikeja, Lekki, Maitama, Wuse, Bodija"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="Plot number, Street name, building or famous landmark..."
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Call before arrival, leave with security gate..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span>Select Payment Method</span>
              </h2>

              <div className="space-y-3">
                {/* Paystack */}
                <label className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition ${
                  paymentMethod === 'paystack'
                    ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      className="mt-1 accent-orange-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Paystack (Debit Card, Bank USSD & Bank Transfer)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Instant payment verification via Paystack Nigeria gateway.
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Instant
                  </span>
                </label>

                {/* Direct Bank Transfer */}
                <label className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="mt-1 accent-orange-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Direct Bank Transfer to TradeNaija Escrow
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Funds held securely until buyer inspects and confirms delivery.
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Escrow Protected
                  </span>
                </label>

                {/* Cash on Delivery */}
                <label className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="mt-1 accent-orange-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Pay on Delivery (Cash / POS on Inspection)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Available in Lagos, Abuja, and participating merchant hubs.
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    Physical
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Review Items ({cart.length})
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.map(item => (
                <div key={item.product.id} className="pt-2 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.title}</h4>
                    <div className="text-[11px] text-slate-500">
                      {item.quantity}x • {formatNaira(item.product.discountPrice || item.product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatNaira(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Waybill Delivery Fee</span>
                <span className="font-bold text-slate-900">{formatNaira(estimatedShippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="font-black text-base text-orange-600">{formatNaira(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition cursor-pointer"
            >
              {submitting ? 'Confirming Order...' : `Confirm & Place Order (${formatNaira(total)})`}
            </button>

            <div className="text-[11px] text-slate-400 text-center leading-relaxed">
              🔒 100% Secure Nigerian Order Preparation
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
