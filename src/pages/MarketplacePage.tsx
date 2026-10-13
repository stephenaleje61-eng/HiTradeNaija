import React, { useState, useEffect } from 'react';
import { 
  Store, Filter, Search, RotateCcw, ArrowLeft, 
  MapPin, SlidersHorizontal, X, PlusCircle 
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/marketplace/ProductCard';
import { FilterSidebar } from '../components/marketplace/FilterSidebar';
import { ContactSellerModal } from '../components/marketplace/ContactSellerModal';
import { api } from '../services/api';

interface MarketplacePageProps {
  navigate: (route: string) => void;
  initialQuery?: string;
  initialCategory?: string;
  initialState?: string;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  navigate,
  initialQuery = '',
  initialCategory = '',
  initialState = ''
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [state, setState] = useState(initialState);
  const [condition, setCondition] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Mobile drawer filter
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [contactProduct, setContactProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        search,
        category,
        state,
        condition,
        sort: sortBy
      };
      if (verifiedOnly) params.verifiedSellerOnly = true;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.getProducts(params);
      setProducts(res.products || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, state, condition, verifiedOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setState('');
    setCondition('');
    setVerifiedOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    // will trigger useEffect
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Marketplace Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition mr-1"
                  title="Return to homepage"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  TradeNaija Community Marketplace
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-8">
                Discover genuine goods, buy smart, or contact verified sellers across all 36 States & FCT.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition"
              >
                <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                <span>Filters</span>
              </button>

              <button
                onClick={() => navigate('/sell')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your Goods</span>
              </button>
            </div>
          </div>

          {/* Quick Search & Active Filters Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search marketplace listings, brands, or cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none text-slate-800"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Active Filter Chips */}
          {(category || state || condition || verifiedOnly || search) && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active:</span>
              {search && (
                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-lg border border-orange-200 flex items-center gap-1">
                  Query: "{search}"
                  <button onClick={() => { setSearch(''); fetchProducts(); }} className="hover:text-orange-900">✕</button>
                </span>
              )}
              {category && (
                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-lg border border-orange-200 flex items-center gap-1">
                  {category}
                  <button onClick={() => setCategory('')} className="hover:text-orange-900">✕</button>
                </span>
              )}
              {state && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                  📍 {state}
                  <button onClick={() => setState('')} className="hover:text-emerald-900">✕</button>
                </span>
              )}
              {condition && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                  {condition === 'new' ? 'Brand New' : 'Used'}
                  <button onClick={() => setCondition('')} className="hover:text-slate-900">✕</button>
                </span>
              )}
              {verifiedOnly && (
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  Verified Sellers Only
                  <button onClick={() => setVerifiedOnly(false)} className="hover:text-emerald-900">✕</button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-orange-600 hover:underline font-bold ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-20">
            <FilterSidebar
              selectedCategory={category}
              setSelectedCategory={setCategory}
              selectedState={state}
              setSelectedState={setState}
              selectedCondition={condition}
              setSelectedCondition={setCondition}
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={handleResetFilters}
            />
          </div>

          {/* Product Feed Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-medium">
              <span>Showing {products.length} {products.length === 1 ? 'item' : 'items'} across Nigeria</span>
              <button
                onClick={() => navigate('/')}
                className="text-orange-600 hover:underline font-bold"
              >
                ← Return to Homepage
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse p-4"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No matching listings found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing your filters or search keywords, or post your goods in this category.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => navigate('/sell')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    Post First Listing
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    navigate={navigate}
                    onOpenContactModal={(p) => setContactProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 my-3">
              <FilterSidebar
                selectedCategory={category}
                setSelectedCategory={setCategory}
                selectedState={state}
                setSelectedState={setState}
                selectedCondition={condition}
                setSelectedCondition={setCondition}
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onReset={handleResetFilters}
                isMobileDrawer={true}
                onCloseMobile={() => setShowMobileFilters(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {contactProduct && (
        <ContactSellerModal
          product={contactProduct}
          onClose={() => setContactProduct(null)}
          navigate={navigate}
        />
      )}
    </div>
  );
};
