import React, { useState, useEffect } from 'react';
import { Home, Grid, Store, MessageSquare, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

interface BottomNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, navigate }) => {
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const convs = await api.getConversations();
        const count = convs.reduce((sum, c) => sum + (c.unreadCountForBuyer || 0) + (c.unreadCountForSeller || 0), 0);
        setUnreadMessages(count);
      } catch {
        // silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const navItems = [
    { label: 'Home', icon: Home, route: '/' },
    { label: 'Categories', icon: Grid, route: '/categories' },
    { label: 'Marketplace', icon: Store, route: '/marketplace' },
    { 
      label: 'Live Chat', 
      icon: MessageSquare, 
      route: isAuthenticated ? '/messages' : '/auth?redirect=/messages',
      badge: unreadMessages > 0 ? unreadMessages : undefined 
    },
    { 
      label: 'Account', 
      icon: User, 
      route: isAuthenticated ? '/account' : '/auth' 
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route || (item.route !== '/' && currentRoute.startsWith(item.route));

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition select-none ${
                isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-orange-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Sticky Mobile Cart Shortcut if items in cart */}
        {cartCount > 0 && (
          <button
            onClick={() => navigate('/cart')}
            className="relative flex flex-col items-center justify-center py-1 px-2 text-slate-700"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              <span className="absolute -top-1 -right-2 bg-orange-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="text-[10px] mt-0.5 text-orange-600 font-bold">Cart</span>
          </button>
        )}
      </div>
    </div>
  );
};
