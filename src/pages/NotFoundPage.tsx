import React from 'react';
import { Store, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  navigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 font-black text-2xl">
          404
        </div>
        <h2 className="text-xl font-black text-slate-900">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The Nigerian marketplace page or product listing you were looking for could not be found or has moved.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Store className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};
