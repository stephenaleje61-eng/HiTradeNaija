import React, { useState, useEffect } from 'react';
import { 
  Grid, ArrowLeft, ChevronRight, Store, Smartphone, 
  Tv, Laptop, Shirt, ShoppingBag, Sparkles, Home, Armchair, 
  UtensilsCrossed, Baby, HeartPulse, Car, Wheat, Trophy, BookOpen, Wrench 
} from 'lucide-react';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../data/nigeria-data';
import { api } from '../services/api';

interface CategoriesPageProps {
  navigate: (route: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.getCategories();
        setCategories(res);
      } catch {
        setCategories(INITIAL_CATEGORIES.map(c => ({ ...c, count: 0 })));
      } finally {
        setLoading(false);
      }
    }
    loadCats();
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-6 h-6" />;
      case 'Tv': return <Tv className="w-6 h-6" />;
      case 'Laptop': return <Laptop className="w-6 h-6" />;
      case 'Shirt': return <Shirt className="w-6 h-6" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Armchair': return <Armchair className="w-6 h-6" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-6 h-6" />;
      case 'Baby': return <Baby className="w-6 h-6" />;
      case 'HeartPulse': return <HeartPulse className="w-6 h-6" />;
      case 'Car': return <Car className="w-6 h-6" />;
      case 'Wheat': return <Wheat className="w-6 h-6" />;
      case 'Trophy': return <Trophy className="w-6 h-6" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6" />;
      case 'Wrench': return <Wrench className="w-6 h-6" />;
      default: return <Store className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition mr-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              All Nigerian Categories
            </h1>
            <p className="text-xs text-slate-500">
              Browse products by sector and subcategories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-orange-400 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs shrink-0">
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <div className="min-w-0">
                    <h3
                      onClick={() => navigate(`/marketplace?category=${encodeURIComponent(cat.name)}`)}
                      className="text-base font-black text-slate-900 hover:text-orange-600 cursor-pointer truncate"
                    >
                      {cat.name}
                    </h3>
                    <span className="text-xs text-emerald-600 font-bold">
                      {cat.count || 0} listings in Nigeria
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {cat.description}
                </p>

                {/* Subcategories pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cat.subcategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(`/marketplace?search=${encodeURIComponent(sub)}`)}
                      className="text-[11px] bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 px-2.5 py-1 rounded-lg transition font-medium"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate(`/marketplace?category=${encodeURIComponent(cat.name)}`)}
                className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600 hover:text-orange-700 transition"
              >
                <span>Browse {cat.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
