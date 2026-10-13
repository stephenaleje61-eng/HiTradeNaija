import React, { useState, useEffect } from 'react';
import { 
  Store, PlusCircle, Eye, MessageSquare, ShoppingBag, 
  Trash2, PauseCircle, PlayCircle, CheckCircle, Edit3, 
  ArrowLeft, ShieldCheck, MapPin, Settings, Clock, RotateCcw 
} from 'lucide-react';
import { Product } from '../types';
import { 
  formatNaira, formatNigerianPhone, formatExpiryBadge, isPostExpired 
} from '../data/nigeria-data';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

interface SellerDashboardPageProps {
  navigate: (route: string) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({ navigate }) => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [myListings, setMyListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStoreSettings, setShowStoreSettings] = useState(false);

  // Store profile edit fields
  const [storeName, setStoreName] = useState(user?.storeName || '');
  const [storeBio, setStoreBio] = useState(user?.storeBio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [isPhonePublic, setIsPhonePublic] = useState(user?.isPhonePublic ?? true);
  const [isWhatsappPublic, setIsWhatsappPublic] = useState(user?.isWhatsappPublic ?? true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/seller');
      return;
    }
    loadListings();
  }, [isAuthenticated]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const res = await api.getMyListings();
      setMyListings(res || []);
    } catch (err) {
      console.error('Failed to load seller listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'published' ? 'paused' : 'published';
    try {
      await api.updateProductStatus(product.id, nextStatus);
      showToast(`Listing ${nextStatus === 'published' ? 'resumed' : 'paused'}.`, 'info');
      loadListings();
    } catch (err: any) {
      showToast(err.message || 'Status update failed.', 'error');
    }
  };

  const handleMarkSold = async (product: Product) => {
    try {
      await api.updateProductStatus(product.id, 'sold');
      showToast('Product marked as sold!', 'success');
      loadListings();
    } catch (err: any) {
      showToast(err.message || 'Update failed.', 'error');
    }
  };

  const handleDeleteListing = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing from TradeNaija?')) return;
    try {
      await api.deleteProduct(productId);
      showToast('Listing removed permanently.', 'info');
      loadListings();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing.', 'error');
    }
  };

  const handleRelistListing = async (productId: string) => {
    try {
      await api.relistProduct(productId);
      showToast('Post renewed successfully for another 7 days!', 'success');
      loadListings();
    } catch (err: any) {
      showToast(err.message || 'Failed to renew listing.', 'error');
    }
  };

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await updateProfile({
        storeName,
        storeBio,
        phone,
        whatsappNumber,
        isPhonePublic,
        isWhatsappPublic
      });
      showToast('Store settings saved successfully.', 'success');
      setShowStoreSettings(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update store settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Real Stats calculated strictly from user's actual database records
  const totalViews = myListings.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalEnquiries = myListings.reduce((sum, p) => sum + (p.enquiriesCount || 0), 0);
  const activeCount = myListings.filter(p => p.status === 'published').length;
  const soldCount = myListings.filter(p => p.status === 'sold').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/marketplace')}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Seller Dashboard
              </h1>
              <span className="text-xs text-slate-500">
                {user?.storeName || user?.name} • 📍 {user?.city}, {user?.state}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStoreSettings(!showStoreSettings)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>Store Settings</span>
            </button>

            <button
              onClick={() => navigate('/sell')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Goods</span>
            </button>
          </div>
        </div>

        {/* Real Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Active Listings</span>
            <span className="text-2xl font-black text-slate-900">{activeCount}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Items Sold</span>
            <span className="text-2xl font-black text-emerald-600">{soldCount}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Total Views</span>
            <span className="text-2xl font-black text-blue-600">{totalViews}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Customer Enquiries</span>
            <span className="text-2xl font-black text-orange-600">{totalEnquiries}</span>
          </div>
        </div>

        {/* Store Settings Modal/Panel */}
        {showStoreSettings && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8 animate-in fade-in">
            <h3 className="text-sm font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-600" />
              <span>Edit Store Profile & Contact Visibility</span>
            </h3>

            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Alaba Tech Mega Hub"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Description / Bio</label>
                <textarea
                  rows={2}
                  value={storeBio}
                  onChange={(e) => setStoreBio(e.target.value)}
                  placeholder="Tell buyers what you sell, store stall location, or warranty guarantees..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPhonePublic}
                    onChange={(e) => setIsPhonePublic(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                  <span>Show phone number publicly on listings</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={isWhatsappPublic}
                    onChange={(e) => setIsWhatsappPublic(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span>Show "Chat on WhatsApp" button on listings</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStoreSettings(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition"
                >
                  {savingSettings ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">
              Your Marketplace Goods ({myListings.length})
            </h3>
            <span className="text-xs text-slate-400">Manage stock, prices and visibility</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading your listings...
            </div>
          ) : myListings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">No goods posted yet</p>
              <p className="mt-1">Post your goods to start receiving orders and messages from buyers.</p>
              <button
                onClick={() => navigate('/sell')}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                Post Your Goods Free
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {myListings.map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer"
                      onClick={() => navigate(`/product/${prod.id}`)}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          prod.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.status === 'paused'
                            ? 'bg-amber-100 text-amber-800'
                            : prod.status === 'sold'
                            ? 'bg-slate-200 text-slate-800'
                            : prod.status === 'expired'
                            ? 'bg-red-100 text-red-800 font-bold'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {prod.status}
                        </span>
                        <span className="text-[10px] text-slate-400">{prod.category}</span>
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-600" />
                          <span>{formatExpiryBadge(prod.createdAt, prod.expiresAt)}</span>
                        </span>
                      </div>
                      <h4
                        onClick={() => navigate(`/product/${prod.id}`)}
                        className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-orange-600 cursor-pointer mt-0.5"
                      >
                        {prod.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="font-black text-orange-600">{formatNaira(prod.discountPrice || prod.price)}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">Stock: {prod.quantity}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{prod.viewsCount || 0} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Relist Button if expired or completed 7 days */}
                    {(prod.status === 'expired' || isPostExpired(prod.createdAt, prod.expiresAt)) ? (
                      <button
                        onClick={() => handleRelistListing(prod.id)}
                        className="p-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        title="Relist for another 7 days"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Relist (7 Days)</span>
                      </button>
                    ) : (
                      <>
                        {prod.status !== 'sold' && (
                          <button
                            onClick={() => handleMarkSold(prod)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                            title="Mark as Sold"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">Mark Sold</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleStatus(prod)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                          title={prod.status === 'published' ? 'Pause Listing' : 'Publish Listing'}
                        >
                          {prod.status === 'published' ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span className="hidden sm:inline">Pause</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Resume</span>
                            </>
                          )}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDeleteListing(prod.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-red-600 text-xs font-bold transition"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
