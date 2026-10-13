import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingCart, Heart, MessageSquare, Bell, User, MapPin, 
  PlusCircle, ShieldCheck, Store, LogOut, ChevronDown, Check,
  Sparkles, X
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { NIGERIAN_STATES_AND_CITIES } from '../../data/nigeria-data';
import { api } from '../../services/api';

interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  navigate,
  onSearch,
  searchQuery = '',
  setSearchQuery
}) => {
  const { user, isAuthenticated, logout, quickLoginAs, isAdmin } = useAuth();
  const { cartCount, wishlistCount, selectedDeliveryState, setSelectedDeliveryState } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [selectedCity, setSelectedCity] = useState<string>('');

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Poll conversations unread messages count if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadMessagesCount(0);
      return;
    }
    const checkUnread = async () => {
      try {
        const convs = await api.getConversations();
        const unread = convs.reduce((sum, c) => {
          if (c.buyerId === user?.id) return sum + (c.unreadCountForBuyer || 0);
          if (c.sellerId === user?.id) return sum + (c.unreadCountForSeller || 0);
          return sum;
        }, 0);
        setUnreadMessagesCount(unread);
      } catch {
        // silent
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  // Search input handling
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(searchQuery);
    }
    if (currentRoute !== '/' && currentRoute !== '/marketplace') {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchChange = (val: string) => {
    if (setSearchQuery) setSearchQuery(val);
    if (val.trim().length > 1) {
      const popularTerms = [
        'iPhone 15', 'Dell Laptop', 'Solar Inverter', 'Senator Wears', 
        'Ankara Fabric', 'Chelsea Boots', 'Samsung Galaxy', 'Generator', 
        'Office Chair', 'Alaba Tech', 'Computer Village'
      ];
      const matches = popularTerms.filter(t => t.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (term: string) => {
    if (setSearchQuery) setSearchQuery(term);
    setShowSuggestions(false);
    if (onSearch) onSearch(term);
    navigate(`/marketplace?search=${encodeURIComponent(term)}`);
  };

  const handleStateSelect = (stateName: string) => {
    setSelectedDeliveryState(stateName);
    const stateObj = NIGERIAN_STATES_AND_CITIES.find(s => s.state === stateName);
    if (stateObj && stateObj.cities.length > 0) {
      setSelectedCity(stateObj.cities[0]);
    }
    setShowLocationModal(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* 1. TOP ANNOUNCEMENT BAR: PROMINENT WELCOME MESSAGE */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white py-1.5 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1 text-center md:text-left">
          <div className="flex items-center gap-1.5 justify-center">
            <span className="font-extrabold tracking-wide uppercase bg-black/20 px-2 py-0.5 rounded text-[11px]">
              WELCOME TO TRADENAIJA — YOUR MARKETPLACE, YOUR COMMUNITY!
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-orange-100 text-[11px]">
            <span>🇳🇬 Nigeria's Verified Commerce Platform</span>
            <span>•</span>
            <button 
              onClick={() => setShowLocationModal(true)} 
              className="hover:underline flex items-center gap-1 text-white font-semibold cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>Deliver to: {selectedDeliveryState} {selectedCity ? `(${selectedCity})` : ''}</span>
            </button>
            <span>•</span>
            <button 
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Quick Test Switcher</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK DEMO SWITCHER BAR */}
      {showDemoAccounts && (
        <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 text-xs animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">⚡ Fast Role Testing:</span>
              <span className="text-slate-300">Click to test TradeNaija as any role without manual credentials:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={async () => {
                  await quickLoginAs('chioma@gmail.com');
                  setShowDemoAccounts(false);
                }}
                className="bg-emerald-700 hover:bg-emerald-600 px-2.5 py-1 rounded text-white font-medium flex items-center gap-1 transition"
              >
                <span>👤 Buyer (Chioma - Abuja)</span>
              </button>
              <button
                onClick={async () => {
                  await quickLoginAs('emeka@alabatech.ng');
                  setShowDemoAccounts(false);
                }}
                className="bg-orange-600 hover:bg-orange-500 px-2.5 py-1 rounded text-white font-medium flex items-center gap-1 transition"
              >
                <span>🏪 Seller (Emeka - Alaba Market)</span>
              </button>
              <button
                onClick={async () => {
                  await quickLoginAs('admin@tradenaija.ng');
                  setShowDemoAccounts(false);
                }}
                className="bg-purple-700 hover:bg-purple-600 px-2.5 py-1 rounded text-white font-medium flex items-center gap-1 transition"
              >
                <span>🛡️ Administrator</span>
              </button>
              <button
                onClick={() => setShowDemoAccounts(false)}
                className="text-slate-400 hover:text-white p-1 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER ROW */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-6">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="cursor-pointer shrink-0"
        >
          <Logo showSlogan={false} />
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative w-full flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products, phones, electronics, fabrics, sellers, or states..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 text-sm pl-4 pr-24 py-2.5 rounded-full border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    if (setSearchQuery) setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-14 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                title="Search TradeNaija"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="text-[11px] font-bold text-slate-400 px-3 pb-1 uppercase tracking-wider">
                Trending Searches in Nigeria
              </div>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm text-slate-700 flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5 text-orange-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls & Navigation Shortcuts */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          {/* Post Your Goods / Sell Button (Clearly visible as required) */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/auth?redirect=/sell');
              } else {
                navigate('/sell');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-3.5 py-2 rounded-full shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Sell Your Goods</span>
          </button>

          {/* Marketplace Button (Clearly visible as required) */}
          <button
            onClick={() => navigate('/marketplace')}
            className={`hidden md:flex items-center gap-1.5 text-xs md:text-sm font-bold px-3 py-2 rounded-full border transition cursor-pointer ${
              currentRoute === '/marketplace'
                ? 'bg-orange-50 border-orange-400 text-orange-700'
                : 'border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600'
            }`}
          >
            <Store className="w-4 h-4 text-orange-600" />
            <span>Marketplace</span>
          </button>

          {/* Messages Button with Unread Badge */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/auth?redirect=/messages');
              } else {
                navigate('/messages');
              }
            }}
            className="relative p-2 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Private Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-orange-600 hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 8).map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          setShowNotifMenu(false);
                          if (notif.link) navigate(notif.link);
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                          !notif.read ? 'bg-orange-50/50 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-slate-900">{notif.title}</span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={() => navigate('/cart?tab=wishlist')}
            className="hidden sm:block relative p-2 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart */}
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 text-slate-700 hover:text-orange-600 hover:bg-slate-100 rounded-full transition cursor-pointer flex items-center gap-1"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-slate-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Login */}
          <div className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 pl-2 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 max-w-[80px] truncate hidden md:inline">
                  {user?.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Profile Dropdown */}
            {showProfileMenu && isAuthenticated && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 uppercase">
                      {user?.role}
                    </span>
                    {user?.isVerifiedSeller && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      navigate('/account');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Account & Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/orders');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-400" />
                    <span>My Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/seller');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium text-emerald-700"
                  >
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>Seller Dashboard</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-purple-700 font-bold"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <hr className="my-1 border-slate-100" />

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. DESKTOP MAIN NAVIGATION BAR */}
      <nav className="hidden lg:block bg-slate-50 border-t border-slate-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className={`hover:text-orange-600 transition ${currentRoute === '/' ? 'text-orange-600 font-bold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/categories')}
              className={`hover:text-orange-600 transition ${currentRoute === '/categories' ? 'text-orange-600 font-bold' : ''}`}
            >
              Categories
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className={`hover:text-orange-600 transition flex items-center gap-1 ${currentRoute === '/marketplace' ? 'text-orange-600 font-bold' : ''}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Marketplace
            </button>
            <button
              onClick={() => navigate('/deals')}
              className={`hover:text-orange-600 transition text-orange-600 font-bold flex items-center gap-1 ${currentRoute === '/deals' ? 'underline' : ''}`}
            >
              🔥 Deals & Flash Sales
            </button>
            <button
              onClick={() => navigate(isAuthenticated ? '/sell' : '/auth?redirect=/sell')}
              className={`hover:text-emerald-700 transition text-emerald-700 font-bold flex items-center gap-1 ${currentRoute === '/sell' ? 'underline' : ''}`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Sell Your Goods
            </button>
            <button
              onClick={() => navigate(isAuthenticated ? '/messages' : '/auth?redirect=/messages')}
              className={`hover:text-orange-600 transition flex items-center gap-1.5 ${currentRoute === '/messages' ? 'text-orange-600 font-bold' : ''}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Chat & Messages</span>
            </button>
            <button
              onClick={() => navigate(isAuthenticated ? '/orders' : '/auth?redirect=/orders')}
              className={`hover:text-orange-600 transition ${currentRoute === '/orders' ? 'text-orange-600 font-bold' : ''}`}
            >
              Orders
            </button>
            <button
              onClick={() => navigate(isAuthenticated ? '/account' : '/auth')}
              className={`hover:text-orange-600 transition ${currentRoute === '/account' ? 'text-orange-600 font-bold' : ''}`}
            >
              My Account
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-purple-700 hover:text-purple-900 font-bold transition flex items-center gap-1"
              >
                Admin Control
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => navigate('/help')} className="hover:text-slate-800">
              Safety & Verification
            </button>
            <span>|</span>
            <button onClick={() => navigate('/help')} className="hover:text-slate-800">
              Help Center
            </button>
          </div>
        </div>
      </nav>

      {/* LOCATION SELECTION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-base">Select Your Nigerian Location</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 my-3">
              Choose your state to see local sellers, accurate doorstep delivery estimates, and pickup points across Nigeria.
            </p>
            <div className="overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1 py-1">
              {NIGERIAN_STATES_AND_CITIES.map(loc => (
                <button
                  key={loc.state}
                  onClick={() => handleStateSelect(loc.state)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                    selectedDeliveryState === loc.state
                      ? 'bg-orange-50 border-orange-500 text-orange-800 ring-1 ring-orange-500'
                      : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{loc.state}</span>
                  {selectedDeliveryState === loc.state && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowLocationModal(false)}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
