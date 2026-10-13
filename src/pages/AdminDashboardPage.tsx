import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Store, Package, AlertCircle, 
  Check, X, ArrowLeft, Ban, Star, Flame, Eye, Trash2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatNaira } from '../data/nigeria-data';
import { api } from '../services/api';
import { AbuseReport, Product, User } from '../types';

interface AdminDashboardPageProps {
  navigate: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      showToast('Access denied. Administrator privileges required.', 'error');
      navigate('/');
      return;
    }
    loadAdminData();
  }, [isAuthenticated, isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, reportsRes, prodRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminReports(),
        api.getProducts({ limit: 50 })
      ]);
      setStats(statsRes);
      setUsers(usersRes || []);
      setReports(reportsRes || []);
      setProducts(prodRes.products || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerified = async (targetUser: any) => {
    try {
      await api.updateAdminUser(targetUser.id, {
        isVerifiedSeller: !targetUser.isVerifiedSeller
      });
      showToast(`Updated verified seller status for ${targetUser.name}.`, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Update failed.', 'error');
    }
  };

  const handleToggleBlock = async (targetUser: any) => {
    try {
      await api.updateAdminUser(targetUser.id, {
        isBlocked: !targetUser.isBlocked
      });
      showToast(`User ${targetUser.name} ${targetUser.isBlocked ? 'unblocked' : 'suspended'}.`, 'info');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Update failed.', 'error');
    }
  };

  const handleModerateProduct = async (product: Product, updates: any) => {
    try {
      await api.moderateProduct(product.id, updates);
      showToast('Listing updated by administrator.', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.updateAdminReport(reportId, status);
      showToast(`Report marked as ${status}.`, 'info');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update report.', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-900">Administrator Access Required</h2>
          <p className="text-xs text-slate-500 mt-1">
            Please log in as an administrator (admin@tradenaija.ng) to access platform operations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                TradeNaija Admin Operations
              </h1>
              <span className="text-xs text-slate-500">
                Superuser Console • Logged in as {user?.email}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-200 rounded-2xl text-xs font-bold">
            {(['overview', 'users', 'products', 'reports'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl capitalize transition ${
                  activeTab === tab ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Total Users</span>
                <span className="text-2xl font-black text-slate-900">{stats.totalUsers}</span>
                <span className="text-[11px] text-slate-400 block mt-1">{stats.verifiedSellers} verified sellers</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Active Goods</span>
                <span className="text-2xl font-black text-emerald-600">{stats.activeProducts}</span>
                <span className="text-[11px] text-slate-400 block mt-1">{stats.totalProducts} total recorded</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Platform Orders</span>
                <span className="text-2xl font-black text-blue-600">{stats.totalOrders}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Processed nationwide</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Processed GMV (₦)</span>
                <span className="text-2xl font-black text-orange-600">{formatNaira(stats.totalSalesNaira)}</span>
                <span className="text-[11px] text-slate-400 block mt-1">{stats.pendingReports} pending reports</span>
              </div>
            </div>

            {/* Quick Action Queue */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 mb-3">Community Safety Status</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                TradeNaija runs with live server-side validation, persistent storage, and authenticated private messaging. All administrative actions (user suspension, badge verification, and listing moderation) take immediate effect across all feeds.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: USERS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Registered Nigerian Accounts ({users.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {users.map(u => (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{u.name}</span>
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded uppercase font-semibold text-[10px]">
                        {u.role}
                      </span>
                      {u.isVerifiedSeller && (
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold text-[10px]">
                          Verified Seller
                        </span>
                      )}
                      {u.isBlocked && (
                        <span className="bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-bold text-[10px]">
                          Suspended
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {u.email} • {u.phone || 'No phone'} • 📍 {u.city}, {u.state}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVerified(u)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-[11px] text-slate-700"
                    >
                      {u.isVerifiedSeller ? 'Revoke Badge' : 'Grant Verified'}
                    </button>
                    <button
                      onClick={() => handleToggleBlock(u)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] ${
                        u.isBlocked
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {u.isBlocked ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Listings Moderation Queue ({products.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {products.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{p.title}</h4>
                      <div className="text-[11px] text-slate-500">
                        {p.category} • {formatNaira(p.discountPrice || p.price)} • Seller: {p.sellerName} ({p.state})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleModerateProduct(p, { isFeatured: !p.isFeatured })}
                      className={`p-2 rounded-xl border transition ${
                        p.isFeatured ? 'bg-amber-100 text-amber-900 border-amber-300' : 'border-slate-200 text-slate-600'
                      }`}
                      title="Toggle Featured"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleModerateProduct(p, { isFlashDeal: !p.isFlashDeal })}
                      className={`p-2 rounded-xl border transition ${
                        p.isFlashDeal ? 'bg-red-100 text-red-900 border-red-300' : 'border-slate-200 text-slate-600'
                      }`}
                      title="Toggle Flash Deal"
                    >
                      <Flame className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleModerateProduct(p, { status: p.status === 'published' ? 'rejected' : 'published' })}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] ${
                        p.status === 'published' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {p.status === 'published' ? 'Reject/Hide' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Abuse & Scam Reports Queue ({reports.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No pending abuse reports.
                </div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-700">{r.reason}</span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] uppercase">
                          {r.status}
                        </span>
                      </div>
                      <div className="text-slate-700 mt-1">Target: {r.targetTitleOrName}</div>
                      {r.details && <p className="text-slate-500 mt-0.5">{r.details}</p>}
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Reported by {r.reporterName} on {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {r.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveReport(r.id, 'resolved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleResolveReport(r.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-[11px]"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
