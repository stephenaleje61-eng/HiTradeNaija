import React from 'react';
import { 
  Heart, ShoppingCart, MessageSquare, ShieldCheck, MapPin, 
  PhoneCall, ExternalLink, Clock 
} from 'lucide-react';
import { Product } from '../../types';
import { formatNaira, generateWhatsAppLink, formatExpiryBadge } from '../../data/nigeria-data';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface ProductCardProps {
  product: Product;
  navigate: (route: string) => void;
  onOpenContactModal?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  navigate,
  onOpenContactModal
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const isFavorite = isInWishlist(product.id);
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.quantity <= 0) {
      showToast('This product is currently out of stock.', 'warning');
      return;
    }
    addToCart(product, 1);
    showToast(`Added "${product.title.substring(0, 24)}..." to your cart!`, 'success');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    showToast(isFavorite ? 'Removed from wishlist.' : 'Saved to wishlist!', 'info');
  };

  const handleContactSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenContactModal) {
      onOpenContactModal(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 sm:aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Condition Badge (New or Used) & Expiration Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs ${
            product.condition === 'new'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-white'
          }`}>
            {product.condition === 'new' ? 'Brand New' : 'Used'}
          </span>
          {hasDiscount && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-orange-600 text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900/80 text-amber-300 backdrop-blur-xs flex items-center gap-1 shadow-xs">
            <Clock className="w-2.5 h-2.5" />
            <span>{formatExpiryBadge(product.createdAt, product.expiresAt)}</span>
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition shadow-md ${
            isFavorite
              ? 'bg-pink-50 text-pink-600'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-pink-600 backdrop-blur-xs'
          }`}
          title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-600 text-pink-600' : ''}`} />
        </button>

        {/* Location Tag at bottom of image */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-medium text-white px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xs">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="truncate">{product.city}, {product.state}</span>
          </span>
          {product.isVerifiedSeller && (
            <span className="flex items-center gap-0.5 text-emerald-400 font-bold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Store name */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="truncate max-w-[130px] font-medium">{product.category}</span>
            <span className="text-[10px] text-slate-400">{product.viewsCount || 0} views</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition">
            {product.title}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-orange-600">
              {formatNaira(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatNaira(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
          {/* Quick WhatsApp or In-App Contact */}
          <button
            onClick={handleContactSeller}
            className="flex-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-bold py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
            title="Chat or negotiate with seller"
          >
            <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
            <span className="truncate">Contact Seller</span>
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold p-2 px-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1 shrink-0"
            title="Add to shopping cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
