import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle2, Truck, XCircle, 
  ArrowLeft, Store, MapPin, Phone, ExternalLink 
} from 'lucide-react';
import { Order } from '../types';
import { formatNaira, formatNigerianPhone } from '../data/nigeria-data';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

interface OrdersPageProps {
  navigate: (route: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ navigate }) => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not signed in
  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to view your orders.', 'info');
      navigate('/auth?redirect=/orders');
    }
  }, [isAuthenticated, navigate, showToast]);

  const loadOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getOrders(activeTab === 'seller');
      setOrders(res || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated, activeTab]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status}.`, 'success');
      loadOrders();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/marketplace')}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Orders & Deliveries
            </h1>
          </div>

          {/* Tab Selector if seller */}
          {isSeller && (
            <div className="flex p-1 bg-slate-200 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'buyer' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                My Purchases
              </button>
              <button
                onClick={() => setActiveTab('seller')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'seller' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Received Customer Orders
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'buyer'
                ? "You haven't placed any orders yet. Discover items from verified sellers!"
                : 'No customers have ordered from your store yet.'}
            </p>
            {activeTab === 'buyer' && (
              <button
                onClick={() => navigate('/marketplace')}
                className="mt-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Explore Marketplace
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">Order #{order.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'confirmed'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-orange-600">
                      {formatNaira(order.total)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Payment: {order.paymentMethod.replace('_', ' ')} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900">{item.title}</h4>
                          <span className="text-[11px] text-slate-500">
                            Quantity: {item.quantity} • {formatNaira(item.price)} each
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Delivery Info */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Delivery Destination:</span>
                    <p className="text-slate-600">
                      {order.shippingAddress.fullName} • {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Phone: {formatNigerianPhone(order.shippingAddress.phone)}
                    </span>
                  </div>

                  {/* Seller Status Controls if activeTab === 'seller' */}
                  {activeTab === 'seller' && (
                    <div className="flex flex-col justify-end items-start sm:items-end">
                      <span className="font-bold text-slate-700 block mb-1">Update Fulfillment:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'processing')}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-[11px] font-bold"
                        >
                          Processing
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'shipped')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold"
                        >
                          Shipped
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                        >
                          Delivered
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
