import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PostProductPage } from './pages/PostProductPage';
import { MessagesPage } from './pages/MessagesPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AuthPages } from './pages/AuthPages';
import { AccountPage } from './pages/AccountPage';
import { SafetyHelpPage } from './pages/SafetyHelpPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');
  const [currentSearch, setCurrentSearch] = useState(() => window.location.search || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setCurrentSearch(window.location.search || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    const [path, search] = to.split('?');
    window.history.pushState({}, '', to);
    setCurrentPath(path || '/');
    setCurrentSearch(search ? `?${search}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  };

  // Parse query params helper
  const searchParams = new URLSearchParams(currentSearch);

  // Render current view
  const renderView = () => {
    if (currentPath === '/') {
      return <HomePage navigate={navigate} onSearch={handleGlobalSearch} />;
    }

    if (currentPath === '/marketplace') {
      return (
        <MarketplacePage
          navigate={navigate}
          initialQuery={searchParams.get('search') || searchQuery}
          initialCategory={searchParams.get('category') || ''}
          initialState={searchParams.get('state') || ''}
        />
      );
    }

    if (currentPath.startsWith('/product/')) {
      const productId = currentPath.split('/')[2];
      return <ProductDetailPage productId={productId} navigate={navigate} />;
    }

    if (currentPath === '/deals') {
      return (
        <MarketplacePage
          navigate={navigate}
          initialQuery=""
          initialCategory=""
          initialState=""
        />
      );
    }

    if (currentPath === '/sell') {
      return <PostProductPage navigate={navigate} />;
    }

    if (currentPath === '/messages' || currentPath === '/chat' || currentPath === '/live-chat') {
      const convId = searchParams.get('conversationId') || undefined;
      const tabParam = (searchParams.get('tab') as any) || undefined;
      return <MessagesPage navigate={navigate} initialConversationId={convId} initialTab={tabParam} />;
    }

    if (currentPath === '/cart') {
      return <CartPage navigate={navigate} />;
    }

    if (currentPath === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    if (currentPath === '/orders') {
      return <OrdersPage navigate={navigate} />;
    }

    if (currentPath === '/seller') {
      return <SellerDashboardPage navigate={navigate} />;
    }

    if (currentPath === '/admin') {
      return <AdminDashboardPage navigate={navigate} />;
    }

    if (currentPath === '/categories') {
      return <CategoriesPage navigate={navigate} />;
    }

    if (currentPath === '/account') {
      return <AccountPage navigate={navigate} />;
    }

    if (currentPath === '/auth') {
      const mode = (searchParams.get('mode') as any) || 'login';
      const redirect = searchParams.get('redirect') || '/';
      return <AuthPages navigate={navigate} initialMode={mode} redirectUrl={redirect} />;
    }

    if (currentPath === '/help') {
      return <SafetyHelpPage navigate={navigate} />;
    }

    return <NotFoundPage navigate={navigate} />;
  };

  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-orange-500 selection:text-white font-sans">
            <Header
              currentRoute={currentPath}
              navigate={navigate}
              onSearch={handleGlobalSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            <main className="flex-1">
              {renderView()}
            </main>

            <Footer navigate={navigate} />
            <BottomNav currentRoute={currentPath} navigate={navigate} />
          </div>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
