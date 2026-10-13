import React from 'react';
import { 
  ShieldCheck, AlertTriangle, Lock, PhoneCall, 
  HelpCircle, CheckCircle, ArrowLeft, Store 
} from 'lucide-react';

interface SafetyHelpPageProps {
  navigate: (route: string) => void;
}

export const SafetyHelpPage: React.FC<SafetyHelpPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition mr-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              TradeNaija Trust, Safety & Help Center
            </h1>
            <p className="text-xs text-slate-500">
              Guidance for buyers and sellers across Nigeria
            </p>
          </div>
        </div>

        {/* 1. Safety Tips for Nigerian Buyers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Buyer Protection Guidelines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <h4 className="font-bold text-slate-900 mb-1">1. Inspect Before You Pay</h4>
              <p>Whenever meeting a seller locally (such as in Computer Village Ikeja, Alaba Market, or shopping malls), always test electronic devices, verify IMEI numbers, and inspect fabrics before payment.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <h4 className="font-bold text-slate-900 mb-1">2. Keep Chat in TradeNaija</h4>
              <p>Keep negotiations within the TradeNaija private message system so our safety desk has verified records if any disputes arise.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <h4 className="font-bold text-slate-900 mb-1">3. Check Verified Seller Badges</h4>
              <p>Merchants with green "Verified" badges have verified Nigerian phone numbers, business names, or physical store stalls.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <h4 className="font-bold text-slate-900 mb-1">4. Never Share Bank OTPs or PINs</h4>
              <p>TradeNaija administrators will NEVER ask for your bank tokens, ATM PIN, or email passwords under any circumstances.</p>
            </div>
          </div>
        </div>

        {/* 2. Prohibited Items */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Prohibited & Restricted Items in Nigeria</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The following items are strictly prohibited on TradeNaija under Nigerian law and our merchant code of conduct:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 list-disc pl-5">
            <li>Weapons, firearms, ammunition, or fireworks</li>
            <li>Stolen property or items without proof of legitimate ownership</li>
            <li>Counterfeit currency, forged documents, or fake certificates</li>
            <li>Unregistered prescription drugs or controlled narcotics</li>
            <li>Pirated software or unauthorized decoders</li>
            <li>Endangered wildlife or illegal ivory</li>
          </ul>
        </div>

        {/* 3. Customer Care & Support */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black">Need assistance or want to report fraud?</h3>
            <p className="text-xs text-orange-100 mt-1 max-w-md">
              Our Nigerian trust and safety team reviews reports 24/7. Contact us directly or flag suspicious listings from the product page.
            </p>
          </div>

          <button
            onClick={() => navigate('/marketplace')}
            className="bg-white text-orange-600 font-black text-xs px-6 py-3 rounded-2xl hover:bg-orange-50 transition shadow-xs whitespace-nowrap"
          >
            Explore Verified Goods
          </button>
        </div>
      </div>
    </div>
  );
};
