import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Truck, CreditCard, Lock, PhoneCall, HelpCircle, MapPin } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Value Propositions / Trust Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Verified Nigerian Sellers</h4>
              <p className="text-xs text-slate-400 mt-1">Identity, CAC & location verified merchant badge.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Nationwide Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">GIG Logistics, waybill parks and doorstep dispatch.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Secure Nigerian Payments</h4>
              <p className="text-xs text-slate-400 mt-1">Paystack, Flutterwave, transfer & escrow ready.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Buyer & Seller Protection</h4>
              <p className="text-xs text-slate-400 mt-1">Direct private messaging & transparent seller profiles.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          <div className="col-span-2">
            <Logo size="lg" className="text-white" />
            <p className="text-xs text-slate-400 mt-3 max-w-sm leading-relaxed">
              TradeNaija is Nigeria's premier shopping, selling, and marketplace community. 
              Connecting genuine Nigerian merchants with millions of smart buyers across all 36 States & the FCT.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <MapPin className="w-4 h-4" />
              <span>Covering Lagos, Abuja, Port Harcourt, Kano, Ibadan & Nationwide</span>
            </div>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Shop TradeNaija</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/marketplace')} className="hover:text-orange-400">Marketplace Feed</button></li>
              <li><button onClick={() => navigate('/categories')} className="hover:text-orange-400">All Categories</button></li>
              <li><button onClick={() => navigate('/deals')} className="hover:text-orange-400">Daily Deals & Flash Sales</button></li>
              <li><button onClick={() => navigate('/marketplace?condition=new')} className="hover:text-orange-400">Brand New Items</button></li>
              <li><button onClick={() => navigate('/marketplace?condition=used')} className="hover:text-orange-400">Tested UK & Nigerian Used</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Sell on TradeNaija</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/sell')} className="hover:text-orange-400 font-semibold text-emerald-400">Sell Your Goods (Post Free)</button></li>
              <li><button onClick={() => navigate('/seller')} className="hover:text-orange-400">Seller Dashboard</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-orange-400">Seller Verification Guide</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-orange-400">Alaba & Computer Village Hubs</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-orange-400">Prohibited Items Policy</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Trust & Support</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate('/help')} className="hover:text-orange-400">Safety & Anti-Scam Tips</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-orange-400">Payment & Escrow Rules</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-orange-400">Terms of Service</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-orange-400">Privacy & Data Policy</button></li>
              <li><button onClick={() => navigate('/help')} className="hover:text-orange-400">Report Abuse or Scam</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and compliance */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} TradeNaija Nigeria. Buy Smart. Sell Easy. Trade Everywhere.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>🇳🇬 Built for Nigerian Commerce</span>
            <span>•</span>
            <span>RC / BN Compliant System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
