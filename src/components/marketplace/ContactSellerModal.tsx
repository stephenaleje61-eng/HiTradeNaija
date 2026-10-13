import React, { useState } from 'react';
import { 
  X, MessageSquare, PhoneCall, ShieldAlert, Send, 
  ExternalLink, CheckCircle, ShieldCheck, Flag 
} from 'lucide-react';
import { Product } from '../../types';
import { formatNaira, formatNigerianPhone, generateWhatsAppLink } from '../../data/nigeria-data';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

interface ContactSellerModalProps {
  product: Product;
  onClose: () => void;
  navigate: (route: string) => void;
}

export const ContactSellerModal: React.FC<ContactSellerModalProps> = ({
  product,
  onClose,
  navigate
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const [messageText, setMessageText] = useState(
    `Hello, I saw your product "${product.title}" on TradeNaija. Is it still available?`
  );
  const [sending, setSending] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('Suspicious pricing or possible counterfeit');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  const isOwnProduct = user?.id === product.sellerId;

  // Real in-app message submission
  const handleSendInAppMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to send messages directly on TradeNaija.', 'info');
      navigate(`/auth?redirect=/product/${product.id}`);
      return;
    }

    if (isOwnProduct) {
      showToast('You cannot chat with yourself.', 'warning');
      return;
    }

    try {
      setSending(true);
      const res = await api.startConversation(product.id, messageText);
      showToast('Message sent! Opening your private inbox.', 'success');
      onClose();
      navigate(`/messages?conversationId=${res.conversation.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleReportProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setReporting(true);
      await api.submitReport({
        targetType: 'product',
        targetId: product.id,
        targetTitleOrName: product.title,
        reason: reportReason,
        details: reportDetails
      });
      showToast('Report submitted. TradeNaija safety desk will inspect this listing.', 'success');
      setShowReportForm(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report.', 'error');
    } finally {
      setReporting(false);
    }
  };

  // WhatsApp link generated safely if seller's whatsapp is public
  const whatsAppLink = product.isWhatsappPublic && product.sellerWhatsapp
    ? generateWhatsAppLink(product.sellerWhatsapp, product.title)
    : null;

  // Phone Call link if seller's phone is public
  const phoneCallLink = product.isPhonePublic && product.sellerPhone
    ? `tel:${product.sellerPhone.replace(/\s+/g, '')}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              TradeNaija Direct Connect
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Contact Seller
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-3 space-y-4">
          {/* Product Overview Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
              <div className="text-sm font-black text-orange-600 mt-0.5">
                {formatNaira(product.discountPrice || product.price)}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>Seller: {product.sellerStoreName || product.sellerName}</span>
                {product.isVerifiedSeller && (
                  <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {!showReportForm ? (
            <>
              {/* Option 1: In-App Chat (Recommended & Protected) */}
              <div className="border border-orange-200 bg-orange-50/40 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Send In-App Message (Private & Logged)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>

                <form onSubmit={handleSendInAppMessage} className="space-y-2.5">
                  <textarea
                    rows={3}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your question or offer to the seller..."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={sending || isOwnProduct}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Sending...' : 'Send Message on TradeNaija'}</span>
                  </button>
                </form>
              </div>

              {/* External Direct Contacts (Only if seller opted in!) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Direct Merchant Contacts
                </div>

                {/* WhatsApp button only when seller has chosen to display */}
                {whatsAppLink ? (
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        WA
                      </div>
                      <div>
                        <div>Chat on WhatsApp</div>
                        <div className="text-[10px] font-normal text-emerald-700">
                          {formatNigerianPhone(product.sellerWhatsapp!)}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
                  </a>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                    <span>🔒 Seller chose TradeNaija in-app chat only (WhatsApp number hidden for privacy).</span>
                  </div>
                )}

                {/* Direct Phone Call only when seller has chosen to display */}
                {phoneCallLink ? (
                  <a
                    href={phoneCallLink}
                    className="w-full p-3 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div>Call Seller Directly</div>
                        <div className="text-[10px] font-normal text-blue-700">
                          {formatNigerianPhone(product.sellerPhone!)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-blue-600 underline">Tap to Call</span>
                  </a>
                ) : null}
              </div>

              {/* Safety Advice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>TradeNaija Safety Advisory:</strong> Never pay into personal accounts upfront before inspecting goods in safe public locations (e.g. Alaba Market stalls, Computer Village plazas, or shopping malls), or use TradeNaija verified checkout.
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setShowReportForm(true)}
                  className="text-slate-400 hover:text-red-600 flex items-center gap-1 font-medium transition"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Suspicious Listing</span>
                </button>
              </div>
            </>
          ) : (
            /* Report Form */
            <form onSubmit={handleReportProduct} className="space-y-3 p-2">
              <div className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                <Flag className="w-4 h-4" />
                <span>Report "{product.title.substring(0, 30)}..."</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Suspicious pricing or possible counterfeit">Suspicious pricing or possible counterfeit</option>
                  <option value="Seller requested upfront wire without escrow">Seller requested upfront wire without escrow</option>
                  <option value="Prohibited or illegal item in Nigeria">Prohibited or illegal item in Nigeria</option>
                  <option value="Duplicate or misleading information">Duplicate or misleading information</option>
                  <option value="Offensive content or harassment">Offensive content or harassment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional details</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why this listing violates Nigerian trade safety standards..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
                >
                  {reporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
