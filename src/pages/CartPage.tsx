import React from 'react';
import { 
  ShoppingCart, Trash2, ArrowRight, ShieldCheck, 
  Truck, ArrowLeft, Heart, Plus, Minus, MapPin 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira, NIGERIAN_STATES_AND_CITIES } from '../data/nigeria-data';

interface CartPageProps {
  navigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { 
    cart, removeFromCart, updateQuantity, clearCart, 
    cartCount, cartSubtotal, selectedDeliveryState, setSelectedDeliveryState, 
    estimatedShippingFee, wishlist, addToCart 
  } = useCart();
  const { isAuthenticated } = useAuth();

  const total = cartSubtotal + estimatedShippingFee;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/marketplace')}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Shopping Cart ({cartCount})
            </h1>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:underline font-bold"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Your TradeNaija Cart is Empty</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Explore thousands of genuine phones, electronics, fashion, and Nigerian goods from verified merchants.
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              Start Shopping Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const itemPrice = item.product.discountPrice || item.product.price;

                return (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer"
                        onClick={() => navigate(`/product/${item.product.id}`)}
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-400">
                          {item.product.category} • {item.product.sellerStoreName || item.product.sellerName}
                        </div>
                        <h3
                          onClick={() => navigate(`/product/${item.product.id}`)}
                          className="text-sm font-bold text-slate-900 truncate hover:text-orange-600 cursor-pointer"
                        >
                          {item.product.title}
                        </h3>
                        <div className="text-base font-black text-orange-600 mt-1">
                          {formatNaira(itemPrice)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-orange-500" />
                          <span>Dispatches from {item.product.city}, {item.product.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal & Delete */}
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">
                          {formatNaira(itemPrice * item.quantity)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 mt-1 font-semibold"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Delivery Estimation */}
            <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              {/* Delivery State Selector for Live Fee Calc */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>Delivery Destination State</span>
                </label>
                <select
                  value={selectedDeliveryState}
                  onChange={(e) => setSelectedDeliveryState(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium"
                >
                  {NIGERIAN_STATES_AND_CITIES.map((loc) => (
                    <option key={loc.state} value={loc.state}>
                      {loc.state}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Shipping recalculated automatically for {selectedDeliveryState}.
                </p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-slate-900">{formatNaira(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Waybill & Dispatch</span>
                  <span className="font-bold text-slate-900">{formatNaira(estimatedShippingFee)}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Due (₦)</span>
                  <span className="font-black text-lg text-orange-600">{formatNaira(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/auth?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                🛡️ Verified checkout protected by TradeNaija merchant guarantees.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
