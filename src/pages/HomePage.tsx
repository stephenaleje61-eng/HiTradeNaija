import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Truck, Store, ArrowRight, 
  Flame, PlusCircle, CheckCircle, Smartphone, Tv, Laptop, 
  Shirt, ShoppingBag, Home as HomeIcon, ChevronRight
} from 'lucide-react';
import { Product, Category, User } from '../types';
import { ProductCard } from '../components/marketplace/ProductCard';
import { ContactSellerModal } from '../components/marketplace/ContactSellerModal';
import { formatNaira, INITIAL_CATEGORIES } from '../data/nigeria-data';
import { api } from '../services/api';

interface HomePageProps {
  navigate: (route: string) => void;
  onSearch: (q: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, onSearch }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [verifiedSellers, setVerifiedSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactModalProduct, setContactModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [productsRes, sellersRes] = await Promise.all([
          api.getProducts({ limit: 20 }),
          api.getSellers()
        ]);

        const all = productsRes.products || [];
        setLatestProducts(all);
        setFeaturedProducts(all.filter(p => p.isFeatured || p.price > 100000).slice(0, 4));
        setFlashDeals(all.filter(p => p.isFlashDeal || (p.discountPrice && p.discountPrice < p.price)).slice(0, 4));
        setVerifiedSellers(sellersRes.slice(0, 3));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* 1. HERO SECTION & PROMINENT WELCOME */}
      <section className="bg-gradient-to-b from-orange-50 via-white to-slate-50 border-b border-orange-100 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message Box prominently displayed as requested */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-orange-600/10 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
              <svg width="400" height="400" viewBox="0 0 200 200" fill="currentColor">
                <circle cx="100" cy="100" r="80" />
              </svg>
            </div>

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/20 text-orange-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>NIGERIA'S NUMBER ONE COMMUNITY MARKETPLACE</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                WELCOME TO TRADENAIJA — YOUR MARKETPLACE, YOUR COMMUNITY!
              </h1>

              <p className="mt-3 text-sm sm:text-base md:text-lg text-orange-100 font-medium leading-relaxed">
                Buy smart, sell easily, discover trusted products across Nigeria, connect directly with sellers and grow your business with TradeNaija.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-orange-600" />
                  <span>Explore Marketplace</span>
                </button>

                <button
                  onClick={() => navigate('/sell')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell Your Goods (Post Free)</span>
                </button>

                <button
                  onClick={() => navigate('/deals')}
                  className="bg-black/30 hover:bg-black/40 text-white font-bold text-sm px-4 py-3.5 rounded-2xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>Daily Deals</span>
                </button>
              </div>

              {/* Nigerian Highlights Trust Bar */}
              <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-orange-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Verified Sellers Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Nationwide Waybill & Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-orange-200 shrink-0" />
                  <span>Alaba & Computer Village Hubs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Paystack & Flutterwave Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs text-slate-500">Popular shopping categories across Nigeria</p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {INITIAL_CATEGORIES.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/marketplace?category=${encodeURIComponent(cat.name)}`)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition text-center cursor-pointer group flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-600 text-orange-600 group-hover:text-white flex items-center justify-center transition mb-2 shadow-xs">
                {cat.iconName === 'Smartphone' && <Smartphone className="w-6 h-6" />}
                {cat.iconName === 'Tv' && <Tv className="w-6 h-6" />}
                {cat.iconName === 'Laptop' && <Laptop className="w-6 h-6" />}
                {cat.iconName === 'Shirt' && <Shirt className="w-6 h-6" />}
                {cat.iconName === 'ShoppingBag' && <ShoppingBag className="w-6 h-6" />}
                {cat.iconName === 'Home' && <HomeIcon className="w-6 h-6" />}
                {!['Smartphone', 'Tv', 'Laptop', 'Shirt', 'ShoppingBag', 'Home'].includes(cat.iconName) && (
                  <Store className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FLASH SALES & DAILY DEALS */}
      {flashDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-3xl p-5 text-white mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-amber-300">
                <Flame className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black">TradeNaija Flash Sales</h2>
                  <span className="text-[10px] font-black uppercase bg-white text-red-700 px-2 py-0.5 rounded-full">
                    Limited Stock
                  </span>
                </div>
                <p className="text-xs text-orange-100">Discounted prices verified on real Nigerian inventory</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/deals')}
              className="bg-white text-red-600 hover:bg-orange-50 font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              View All Deals
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {flashDeals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                navigate={navigate}
                onOpenContactModal={(p) => setContactModalProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. FEATURED STORES & VERIFIED SELLERS */}
      {verifiedSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Verified Nigerian Merchants</h2>
              <p className="text-xs text-slate-500">Trusted stores from Lagos, Kano, Abuja and major commercial centers</p>
            </div>
            <button
              onClick={() => navigate('/marketplace?verified=true')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Verified Sellers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verifiedSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => navigate(`/marketplace?sellerId=${seller.id}`)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={seller.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={seller.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-sm font-black text-slate-900 truncate">{seller.storeName || seller.name}</h4>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>📍 {seller.city}, {seller.state}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {seller.storeBio || 'Verified merchant selling high quality items with nationwide delivery across Nigeria.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Verified Merchant
                  </span>
                  <span className="text-orange-600 font-bold hover:underline flex items-center gap-0.5">
                    View Store <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. LATEST PRODUCTS MARKETPLACE FEED */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Latest Marketplace Additions</h2>
            <p className="text-xs text-slate-500">Real listings posted by sellers across Nigeria</p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({latestProducts.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse p-4"></div>
            ))}
          </div>
        ) : latestProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products posted yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first Nigerian merchant to post goods on TradeNaija and reach buyers nationwide.
            </p>
            <button
              onClick={() => navigate('/sell')}
              className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Post Your Goods Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                navigate={navigate}
                onOpenContactModal={(p) => setContactModalProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. HOW TRADENAIJA WORKS (PROMINENT TRUST & EDUCATION) */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Safe & Smart Nigerian Trading
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              How TradeNaija Connects Nigeria
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Combining the speed and variety of Temu and Jumia with direct Nigerian community connection and verified sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-orange-500/20">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Discover or Post Goods</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Browse thousands of items from phones to fashion across Lagos, Abuja, Kano, and Port Harcourt. Post your goods free in 2 minutes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-500/20">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Chat Directly & Negotiate</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Send private messages on TradeNaija or connect on WhatsApp. Confirm item availability, ask questions, or negotiate directly with sellers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-blue-500/20">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Safe Pay & Fast Delivery</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Prepare orders with Paystack/Flutterwave, Bank Transfer, or physical pickup. Nationwide waybill delivery via trusted couriers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Seller Modal */}
      {contactModalProduct && (
        <ContactSellerModal
          product={contactModalProduct}
          onClose={() => setContactModalProduct(null)}
          navigate={navigate}
        />
      )}
    </div>
  );
};
