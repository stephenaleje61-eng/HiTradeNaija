import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, 
  Store, LogOut, ArrowLeft, Check, Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { NIGERIAN_STATES_AND_CITIES, formatNigerianPhone } from '../data/nigeria-data';

interface AccountPageProps {
  navigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate }) => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { showToast } = useNotification();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/account');
    }
  }, [isAuthenticated, navigate]);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [isPhonePublic, setIsPhonePublic] = useState(user?.isPhonePublic ?? true);
  const [isWhatsappPublic, setIsWhatsappPublic] = useState(user?.isWhatsappPublic ?? true);
  const [state, setState] = useState(user?.state || 'Lagos');
  const [city, setCity] = useState(user?.city || 'Ikeja');
  const [address, setAddress] = useState(user?.address || '');
  const [role, setRole] = useState(user?.role || 'buyer');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setWhatsappNumber(user.whatsappNumber || '');
      setIsPhonePublic(user.isPhonePublic);
      setIsWhatsappPublic(user.isWhatsappPublic);
      setState(user.state);
      setCity(user.city);
      setAddress(user.address || '');
      setRole(user.role);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name,
        phone,
        whatsappNumber,
        isPhonePublic,
        isWhatsappPublic,
        state,
        city,
        address,
        role: role as any
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              My Profile & Settings
            </h1>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* User header pill */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{user?.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 uppercase">
                  {user?.role}
                </span>
                {user?.isVerifiedSeller && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="080 1234 5678"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nigerian State</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">City or LGA</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Street Delivery Address</label>
              <input
                type="text"
                placeholder="House number, street name, nearest bus stop or landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Contact Privacy Controls</span>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPhonePublic}
                  onChange={(e) => setIsPhonePublic(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <span>Allow public buyers to see my phone number on my listings</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWhatsappPublic}
                  onChange={(e) => setIsWhatsappPublic(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span>Allow public buyers to click "Chat on WhatsApp"</span>
              </label>
            </div>

            {user?.role === 'buyer' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Want to sell goods on TradeNaija?</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Activate your seller tools to manage stock, receive orders and list products.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
                >
                  Become a Seller
                </button>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black text-xs px-6 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-md shadow-orange-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
