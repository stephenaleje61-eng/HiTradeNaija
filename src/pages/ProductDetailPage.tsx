import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Heart, ShoppingCart, MessageSquare, ShieldCheck, 
  MapPin, PhoneCall, ExternalLink, Truck, ShieldAlert, Star, 
  Check, Share2, AlertCircle, Plus, Minus, UserCheck, Flag, Clock 
} from 'lucide-react';
import { Product, Review } from '../types';
import { 
  formatNaira, formatNigerianPhone, generateWhatsAppLink, 
  formatExpiryBadge, isPostExpired 
} from '../data/nigeria-data';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { ContactSellerModal } from '../components/marketplace/ContactSellerModal';
import { api } from '../services/api';

interface ProductDetailPageProps {
  productId: string;
  navigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  navigate
}) => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { showToast } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProductAndReviews() {
      try {
        setLoading(true);
        const [prod, revs] = await Promise.all([
          api.getProductById(productId),
          api.getReviews(productId)
        ]);
        setProduct(prod);
        setReviews(revs || []);
      } catch (err: any) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProductAndReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse h-96"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">
          This listing may have been sold, paused, or removed by the seller.
        </p>
        <button
          onClick={() => navigate('/marketplace')}
          className="mt-5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isOwnProduct = user?.id === product.sellerId;
  const expired = product.status === 'expired' || isPostExpired(product.createdAt, product.expiresAt);

  const handleAddToCart = () => {
    if (expired) {
      showToast('This post has reached its 7-day expiration limit.', 'warning');
      return;
    }
    if (product.quantity <= 0) {
      showToast('This item is currently out of stock.', 'warning');
      return;
    }
    addToCart(product, buyQuantity);
    showToast(`Added ${buyQuantity}x "${product.title.substring(0, 20)}..." to your cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (expired) {
      showToast('This post has reached its 7-day expiration limit.', 'warning');
      return;
    }
    if (product.quantity <= 0) {
      showToast('This item is currently out of stock.', 'warning');
      return;
    }
    addToCart(product, buyQuantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to post a verified review.', 'info');
      navigate(`/auth?redirect=/product/${product.id}`);
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      const rev = await api.createReview({
        productId: product.id,
        rating: newRating,
        comment: newComment.trim()
      });
      setReviews(prev => [rev, ...prev]);
      setNewComment('');
      showToast('Thank you! Review published.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to post review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'info');
  };

  // Safe WhatsApp & Phone links
  const whatsAppLink = product.isWhatsappPublic && product.sellerWhatsapp
    ? generateWhatsAppLink(product.sellerWhatsapp, product.title)
    : null;

  const phoneCallLink = product.isPhonePublic && product.sellerPhone
    ? `tel:${product.sellerPhone.replace(/\s+/g, '')}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-orange-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">{product.category}</span>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition flex items-center gap-1 text-xs"
              title="Share listing"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Main Product Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Left: Images Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={product.images[selectedImageIdx] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                    product.condition === 'new' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {product.condition === 'new' ? 'Brand New' : 'Used'}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-orange-600 text-white shadow-xs">
                      Save {formatNaira(product.price - product.discountPrice!)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-600 text-pink-600' : ''}`} />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        selectedImageIdx === idx ? 'border-orange-600 ring-2 ring-orange-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <span>{product.category}</span>
                  {product.brand && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600 font-bold">{product.brand}</span>
                    </>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {product.title}
                </h1>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-orange-600">
                    {formatNaira(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-slate-400 line-through">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>

                {/* Location & Seller Badge */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>{product.city}, {product.state}</span>
                  </span>
                  {product.isVerifiedSeller && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Merchant</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                    <span>Stock: {product.quantity} available</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{formatExpiryBadge(product.createdAt, product.expiresAt)} (7-Day Limit)</span>
                  </span>
                </div>

                {expired && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Listing Expired (7-Day Duration Reached):</strong> All posts on TradeNaija automatically expire after 7 days to ensure fresh, in-stock items. The seller can renew this post from their seller dashboard.
                    </div>
                  </div>
                )}

                {/* Seller Profile Summary Card */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-sm">
                      {product.sellerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <span>{product.sellerStoreName || product.sellerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {product.city}, {product.state} • {product.viewsCount || 0} views
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/marketplace?sellerId=${product.sellerId}`)}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    View Store
                  </button>
                </div>

                {/* Description */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Description & Specifications
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* Delivery & Warranty info */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Delivery:</strong> {product.deliveryMethod || 'Nationwide Courier or Pickup'}</span>
                  </div>
                  {product.warranty && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>Warranty:</strong> {product.warranty}</span>
                    </div>
                  )}
                  {product.returnPolicy && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>Return Policy:</strong> {product.returnPolicy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Buying & Contact Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {/* Quantity selector */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Quantity:</span>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-black">{buyQuantity}</span>
                    <button
                      onClick={() => setBuyQuantity(Math.min(product.quantity, buyQuantity + 1))}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Purchase Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3.5 rounded-2xl transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Buy Now ({formatNaira(displayPrice * buyQuantity)})</span>
                  </button>
                </div>

                {/* Contact Seller Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                    <span>Chat on TradeNaija</span>
                  </button>

                  {/* WhatsApp button only when seller has chosen to display */}
                  {whatsAppLink ? (
                    <a
                      href={whatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2"
                    >
                      <span>WA Chat on WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : phoneCallLink ? (
                    <a
                      href={phoneCallLink}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call {formatNigerianPhone(product.sellerPhone!)}</span>
                    </a>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 text-slate-500 text-[11px] p-2 rounded-2xl text-center flex items-center justify-center">
                      <span>Seller uses in-app chat only</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Verified Reviews ({reviews.length})</h3>
              <p className="text-xs text-slate-500">Feedback from real buyers across Nigeria</p>
            </div>
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">Leave a Verified Review</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star className={`w-5 h-5 ${newRating >= star ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Describe product quality, delivery speed, or seller honesty..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:border-orange-500 outline-none text-slate-800"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </form>

          {/* Reviews List */}
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No reviews yet. Be the first verified buyer to leave feedback!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactSellerModal
          product={product}
          onClose={() => setShowContactModal(null as any)}
          navigate={navigate}
        />
      )}
    </div>
  );
};
