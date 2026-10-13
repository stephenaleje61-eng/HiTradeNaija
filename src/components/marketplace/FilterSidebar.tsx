import React from 'react';
import { Filter, RotateCcw, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { NIGERIAN_STATES_AND_CITIES, INITIAL_CATEGORIES, formatNaira } from '../../data/nigeria-data';

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedCondition: string;
  setSelectedCondition: (cond: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onReset: () => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedState,
  setSelectedState,
  selectedCondition,
  setSelectedCondition,
  verifiedOnly,
  setVerifiedOnly,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onReset,
  isMobileDrawer = false,
  onCloseMobile
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-4 space-y-6 ${isMobileDrawer ? 'h-full overflow-y-auto' : ''}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-orange-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort Option */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">Sort Results</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none font-medium text-slate-800"
        >
          <option value="newest">Latest Listings (Newest)</option>
          <option value="popular">Most Popular & Enquired</option>
          <option value="price_asc">Price: Low to High (₦)</option>
          <option value="price_desc">Price: High to Low (₦)</option>
        </select>
      </div>

      {/* Verified Sellers Toggle */}
      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <div>
            <div className="text-xs font-bold text-slate-900">Verified Sellers Only</div>
            <div className="text-[10px] text-slate-500">Identity & business verified</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={verifiedOnly}
          onChange={(e) => setVerifiedOnly(e.target.checked)}
          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
        />
      </div>

      {/* Condition: All / New / Used */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          <span>Product Condition</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: '', label: 'All' },
            { id: 'new', label: 'Brand New' },
            { id: 'used', label: 'Used' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedCondition(item.id)}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                selectedCondition === item.id
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location (Nigerian State) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>Nigerian State / Region</span>
        </label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none text-slate-800"
        >
          <option value="">All Nigeria (Nationwide)</option>
          {NIGERIAN_STATES_AND_CITIES.map((loc) => (
            <option key={loc.state} value={loc.state}>
              {loc.state}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">Category</label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === ''
                ? 'bg-orange-50 text-orange-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition truncate ${
                selectedCategory === cat.name
                  ? 'bg-orange-50 text-orange-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range (₦) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">Price Range (₦)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Min (₦)</span>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Max (₦)</span>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {isMobileDrawer && onCloseMobile && (
        <button
          onClick={onCloseMobile}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl transition"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
};
