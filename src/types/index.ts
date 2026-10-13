export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  isPhonePublic: boolean;
  isWhatsappPublic: boolean;
  role: UserRole;
  isVerifiedSeller: boolean;
  storeName?: string;
  storeBio?: string;
  storeBanner?: string;
  avatarUrl?: string;
  state: string;
  city: string;
  address?: string;
  isBlocked?: boolean;
  createdAt: string;
}

export type ProductCondition = 'new' | 'used';
export type ListingStatus = 'published' | 'pending_review' | 'paused' | 'sold' | 'rejected' | 'archived' | 'expired';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  condition: ProductCondition;
  category: string;
  subcategory?: string;
  brand?: string;
  images: string[];
  state: string;
  city: string;
  sellerId: string;
  sellerName: string;
  sellerStoreName?: string;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  isPhonePublic: boolean;
  isWhatsappPublic: boolean;
  isVerifiedSeller: boolean;
  deliveryMethod?: string;
  deliveryFee?: number;
  pickupAvailable: boolean;
  warranty?: string;
  returnPolicy?: string;
  status: ListingStatus;
  viewsCount: number;
  enquiriesCount: number;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  flashDealDiscount?: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  subcategories: string[];
  bannerUrl?: string;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'paystack' | 'flutterwave' | 'bank_transfer' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    state: string;
    city: string;
    streetAddress: string;
    additionalNotes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCountForBuyer: number;
  unreadCountForSeller: number;
  isBlocked: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  expiresAt?: string;
  read: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface PublicChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderCity?: string;
  senderState?: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
  expiresAt: string;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  senderCity?: string;
  senderState?: string;
  receiverId: string;
  receiverName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface OnlineUser {
  id: string;
  name: string;
  role: string;
  city?: string;
  state?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'message' | 'listing' | 'security' | 'promo';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface AbuseReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'product' | 'user' | 'message';
  targetId: string;
  targetTitleOrName: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface NigerianLocation {
  state: string;
  cities: string[];
}
