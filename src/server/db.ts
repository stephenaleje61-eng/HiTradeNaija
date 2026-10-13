import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  User, Product, Category, Conversation, Message, 
  Order, Notification, Review, AbuseReport,
  PublicChatMessage, FriendRequest
} from '../types';
import { INITIAL_CATEGORIES } from '../data/nigeria-data';

interface DatabaseSchema {
  users: User[];
  userPasswords: Record<string, string>; // userId -> passwordHash
  products: Product[];
  categories: Category[];
  conversations: Conversation[];
  messages: Message[];
  publicMessages: PublicChatMessage[];
  friendRequests: FriendRequest[];
  friends: { id: string; user1Id: string; user2Id: string; createdAt: string }[];
  orders: Order[];
  notifications: Notification[];
  reviews: Review[];
  reports: AbuseReport[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'tradenaija_db.json');

// Simple crypto hash helper
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'tradenaija_salt_2026').digest('hex');
}

export function generateToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`).toString('base64');
}

export function parseToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    return userId || null;
  } catch {
    return null;
  }
}

function getSeedData(): DatabaseSchema {
  const adminId = 'usr-admin-01';
  const seller1Id = 'usr-seller-01';
  const seller2Id = 'usr-seller-02';
  const seller3Id = 'usr-seller-03';
  const buyerId = 'usr-buyer-01';

  const defaultPasswordHash = hashPassword('TradeNaija123!');

  const users: User[] = [
    {
      id: adminId,
      name: 'TradeNaija Administrator',
      email: 'admin@tradenaija.ng',
      phone: '08020001122',
      whatsappNumber: '08020001122',
      isPhonePublic: true,
      isWhatsappPublic: true,
      role: 'admin',
      isVerifiedSeller: true,
      state: 'Lagos',
      city: 'Ikeja',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString()
    },
    {
      id: seller1Id,
      name: 'Emeka Okonkwo',
      email: 'emeka@alabatech.ng',
      phone: '08031234567',
      whatsappNumber: '08031234567',
      isPhonePublic: true,
      isWhatsappPublic: true,
      role: 'seller',
      isVerifiedSeller: true,
      storeName: 'Emeka Alaba Mega Hub',
      storeBio: 'Direct importer of genuine smartphones, laptops and solar backup power systems in Alaba International Market, Lagos.',
      state: 'Lagos',
      city: 'Alaba',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString()
    },
    {
      id: seller2Id,
      name: 'Aisha Babangida',
      email: 'aisha@kanotextiles.ng',
      phone: '08129876543',
      whatsappNumber: '08129876543',
      isPhonePublic: true,
      isWhatsappPublic: true,
      role: 'seller',
      isVerifiedSeller: true,
      storeName: 'Kano Royal Textiles & Senator Wears',
      storeBio: 'Premium hand-loomed Nigerian Senator fabrics, authentic Kano dyes, Swiss Voiles and custom bespoke tailoring.',
      state: 'Kano',
      city: 'Kano Municipal',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString()
    },
    {
      id: seller3Id,
      name: 'Oluwaseun Balogun',
      email: 'seun@cvillage.ng',
      phone: '09015554321',
      whatsappNumber: '09015554321',
      isPhonePublic: true,
      isWhatsappPublic: true,
      role: 'seller',
      isVerifiedSeller: true,
      storeName: 'Computer Village Tech Express',
      storeBio: 'Otigba Street, Ikeja. Tested UK used and Brand New MacBooks, Dell, HP and gaming consoles with warranty.',
      state: 'Lagos',
      city: 'Ikeja',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString()
    },
    {
      id: buyerId,
      name: 'Chioma Adeyemi',
      email: 'chioma@gmail.com',
      phone: '07034448899',
      whatsappNumber: '07034448899',
      isPhonePublic: false,
      isWhatsappPublic: false,
      role: 'buyer',
      isVerifiedSeller: false,
      state: 'Abuja (FCT)',
      city: 'Maitama',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString()
    }
  ];

  const userPasswords: Record<string, string> = {
    [adminId]: defaultPasswordHash,
    [seller1Id]: defaultPasswordHash,
    [seller2Id]: defaultPasswordHash,
    [seller3Id]: defaultPasswordHash,
    [buyerId]: defaultPasswordHash
  };

  const products: Product[] = [
    {
      id: 'prod-001',
      title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium (Dual SIM)',
      slug: 'apple-iphone-15-pro-max-256gb',
      description: 'Factory unlocked, pristine battery health 100%, original box and USB-C braided cable included. Inspected and verified.',
      price: 1850000,
      discountPrice: 1720000,
      quantity: 5,
      condition: 'new',
      category: 'Phones & Tablets',
      subcategory: 'Smartphones',
      brand: 'Apple',
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80'
      ],
      state: 'Lagos',
      city: 'Ikeja',
      sellerId: seller3Id,
      sellerName: 'Oluwaseun Balogun',
      sellerStoreName: 'Computer Village Tech Express',
      sellerPhone: '09015554321',
      sellerWhatsapp: '09015554321',
      isPhonePublic: true,
      isWhatsappPublic: true,
      isVerifiedSeller: true,
      deliveryMethod: 'Nationwide Courier (GIG Logistics) or Store Pickup',
      deliveryFee: 4500,
      pickupAvailable: true,
      warranty: '1 Year Apple Warranty',
      returnPolicy: '7 Days Return on hardware defects',
      status: 'published',
      viewsCount: 342,
      enquiriesCount: 28,
      isFeatured: true,
      isFlashDeal: true,
      flashDealDiscount: 7,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-002',
      title: 'Luminous 3.5kVA / 24V Pure Sine Wave Solar Hybrid Inverter',
      slug: 'luminous-3-5kva-inverter-solar',
      description: 'Rugged inverter engineered for Nigerian power conditions. Supports deep cycle tubular and lithium-ion batteries. Dual display for load and grid monitoring.',
      price: 485000,
      discountPrice: 440000,
      quantity: 8,
      condition: 'new',
      category: 'Electronics & Gadgets',
      subcategory: 'Generators & Inverters',
      brand: 'Luminous',
      images: [
        'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
      ],
      state: 'Lagos',
      city: 'Alaba',
      sellerId: seller1Id,
      sellerName: 'Emeka Okonkwo',
      sellerStoreName: 'Emeka Alaba Mega Hub',
      sellerPhone: '08031234567',
      sellerWhatsapp: '08031234567',
      isPhonePublic: true,
      isWhatsappPublic: true,
      isVerifiedSeller: true,
      deliveryMethod: 'Heavy Logistics or Alaba Pickup',
      deliveryFee: 12000,
      pickupAvailable: true,
      warranty: '2 Years Manufacturer Warranty',
      returnPolicy: '14 Days Replacement Guarantee',
      status: 'published',
      viewsCount: 512,
      enquiriesCount: 41,
      isFeatured: true,
      isFlashDeal: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-003',
      title: 'Luxury 7-Star Royal Kano Senator Fabric Material (4 Yards)',
      slug: 'luxury-kano-senator-fabric',
      description: 'Original high-thread-count cotton blend with smooth feel and sharp drape. Does not fade or shrink. Perfect for bespoke Nigerian Senator styles.',
      price: 38000,
      discountPrice: 32000,
      quantity: 35,
      condition: 'new',
      category: 'Fashion & Clothing',
      subcategory: 'Traditional & Ankara',
      brand: 'Heritage Kano',
      images: [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80'
      ],
      state: 'Kano',
      city: 'Kano Municipal',
      sellerId: seller2Id,
      sellerName: 'Aisha Babangida',
      sellerStoreName: 'Kano Royal Textiles & Senator Wears',
      sellerPhone: '08129876543',
      sellerWhatsapp: '08129876543',
      isPhonePublic: true,
      isWhatsappPublic: true,
      isVerifiedSeller: true,
      deliveryMethod: 'Waybill & Interstate Dispatch',
      deliveryFee: 3000,
      pickupAvailable: true,
      warranty: '100% Genuine Fabric Guarantee',
      returnPolicy: '3 Days return if unwashed and uncut',
      status: 'published',
      viewsCount: 289,
      enquiriesCount: 19,
      isFeatured: true,
      isFlashDeal: true,
      flashDealDiscount: 15,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-004',
      title: 'Dell XPS 15 9520 (Intel Core i7 12th Gen, 32GB RAM, 1TB SSD, RTX 3050)',
      slug: 'dell-xps-15-9520-i7-32gb',
      description: 'Clean UK Used with 4K UHD+ Touchscreen. Ultra-fast performance for software engineers, video creators and 3D rendering.',
      price: 980000,
      discountPrice: 920000,
      quantity: 3,
      condition: 'used',
      category: 'Computers & Accessories',
      subcategory: 'Laptops',
      brand: 'Dell',
      images: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
      ],
      state: 'Lagos',
      city: 'Ikeja',
      sellerId: seller3Id,
      sellerName: 'Oluwaseun Balogun',
      sellerStoreName: 'Computer Village Tech Express',
      sellerPhone: '09015554321',
      sellerWhatsapp: '09015554321',
      isPhonePublic: true,
      isWhatsappPublic: true,
      isVerifiedSeller: true,
      deliveryMethod: 'Express Courier or Pickup',
      deliveryFee: 4000,
      pickupAvailable: true,
      warranty: '6 Months Store Warranty',
      returnPolicy: '30 Days Software & Hardware Support',
      status: 'published',
      viewsCount: 410,
      enquiriesCount: 33,
      isFeatured: false,
      isFlashDeal: false,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-005',
      title: 'Handcrafted Nigerian Genuine Leather Chelsea Boots (Men)',
      slug: 'handcrafted-nigerian-leather-chelsea-boots',
      description: 'Artisanal cowhide leather boots crafted in Aba with durable rubber sole. Stylish, rugged and comfortable for work and occasions.',
      price: 45000,
      discountPrice: 38500,
      quantity: 12,
      condition: 'new',
      category: 'Shoes & Bags',
      subcategory: 'Men\'s Shoes',
      brand: 'Made in Aba Pride',
      images: [
        'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
      ],
      state: 'Abia',
      city: 'Aba',
      sellerId: seller1Id,
      sellerName: 'Emeka Okonkwo',
      sellerStoreName: 'Emeka Alaba Mega Hub',
      sellerPhone: '08031234567',
      sellerWhatsapp: '08031234567',
      isPhonePublic: true,
      isWhatsappPublic: true,
      isVerifiedSeller: true,
      deliveryMethod: 'Park Waybill or Doorstep Delivery',
      deliveryFee: 3500,
      pickupAvailable: true,
      warranty: '6 Months Soling Warranty',
      returnPolicy: 'Size exchange allowed within 5 days',
      status: 'published',
      viewsCount: 198,
      enquiriesCount: 14,
      isFeatured: false,
      isFlashDeal: true,
      flashDealDiscount: 14,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-006',
      title: 'Royal Oak Ergonomic Executive Office Chair with Lumbar Support',
      slug: 'royal-oak-ergonomic-office-chair',
      description: 'Breathable high-density mesh, 3D adjustable armrests, heavy-duty tilt lock mechanism and smooth silent casters.',
      price: 125000,
      discountPrice: 110000,
      quantity: 7,
      condition: 'new',
      category: 'Furniture',
      subcategory: 'Office Furniture',
      brand: 'Royal Oak',
      images: [
        'https://images.unsplash.com/photo-1580481077190-7361356a1421?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80'
      ],
      state: 'Abuja (FCT)',
      city: 'Garki',
      sellerId: seller1Id,
      sellerName: 'Emeka Okonkwo',
      sellerStoreName: 'Emeka Alaba Mega Hub',
      sellerPhone: '08031234567',
      sellerWhatsapp: '08031234567',
      isPhonePublic: true,
      isWhatsappPublic: true,
      isVerifiedSeller: true,
      deliveryMethod: 'Doorstep Truck Delivery',
      deliveryFee: 6000,
      pickupAvailable: true,
      warranty: '1 Year Frame Warranty',
      returnPolicy: '7 Days Return',
      status: 'published',
      viewsCount: 220,
      enquiriesCount: 16,
      isFeatured: false,
      isFlashDeal: false,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const convId = 'conv-001';
  const conversations: Conversation[] = [
    {
      id: convId,
      productId: 'prod-001',
      productTitle: 'Apple iPhone 15 Pro Max 256GB Natural Titanium (Dual SIM)',
      productPrice: 1720000,
      productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      buyerId: buyerId,
      buyerName: 'Chioma Adeyemi',
      sellerId: seller3Id,
      sellerName: 'Oluwaseun Balogun',
      lastMessageText: 'Yes ma, we have both Physical SIM and eSIM version in stock at Computer Village. We can deliver to Abuja via GIG Logistics tomorrow morning.',
      lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      unreadCountForBuyer: 1,
      unreadCountForSeller: 0,
      isBlocked: false,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const messages: Message[] = [
    {
      id: 'msg-001',
      conversationId: convId,
      senderId: buyerId,
      senderName: 'Chioma Adeyemi',
      text: 'Good afternoon, is this iPhone 15 Pro Max available for dispatch to Abuja?',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      read: true
    },
    {
      id: 'msg-002',
      conversationId: convId,
      senderId: seller3Id,
      senderName: 'Oluwaseun Balogun',
      text: 'Yes ma, we have both Physical SIM and eSIM version in stock at Computer Village. We can deliver to Abuja via GIG Logistics tomorrow morning.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: false
    }
  ];

  const orders: Order[] = [
    {
      id: 'ord-1001',
      buyerId: buyerId,
      buyerName: 'Chioma Adeyemi',
      buyerEmail: 'chioma@gmail.com',
      buyerPhone: '07034448899',
      shippingAddress: {
        fullName: 'Chioma Adeyemi',
        phone: '07034448899',
        state: 'Abuja (FCT)',
        city: 'Maitama',
        streetAddress: 'Plot 45, Aguiyi Ironsi Way, Maitama, Abuja'
      },
      items: [
        {
          productId: 'prod-003',
          title: 'Luxury 7-Star Royal Kano Senator Fabric Material (4 Yards)',
          price: 32000,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
          sellerId: seller2Id
        }
      ],
      subtotal: 64000,
      shippingFee: 3000,
      total: 67000,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      notes: 'Customer requested neat packaging for gift.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-001',
      userId: buyerId,
      title: 'Welcome to TradeNaija!',
      message: 'Your account is ready. Discover authentic Nigerian merchants and trade smart everywhere.',
      type: 'promo',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-002',
      userId: buyerId,
      title: 'New Message from Computer Village Tech Express',
      message: 'Oluwaseun Balogun replied regarding your iPhone enquiry.',
      type: 'message',
      link: '/messages',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rev-001',
      productId: 'prod-001',
      userId: buyerId,
      userName: 'Chioma Adeyemi',
      rating: 5,
      comment: 'Very honest seller! Picked up at their Computer Village shop, battery cycle was 0 and completely authentic.',
      verifiedPurchase: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ];

  return {
    users,
    userPasswords,
    products,
    categories: INITIAL_CATEGORIES,
    conversations,
    messages,
    orders,
    notifications,
    reviews,
    reports: [],
    publicMessages: [],
    friendRequests: [],
    friends: []
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
    // Run initial 7-day chat purge on boot
    this.purgeExpiredChatMessages();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure required collections exist
        return {
          users: parsed.users || [],
          userPasswords: parsed.userPasswords || {},
          products: parsed.products || [],
          categories: (parsed.categories && parsed.categories.length > 0) ? parsed.categories : INITIAL_CATEGORIES,
          conversations: parsed.conversations || [],
          messages: parsed.messages || [],
          publicMessages: parsed.publicMessages || [],
          friendRequests: parsed.friendRequests || [],
          friends: parsed.friends || [],
          orders: parsed.orders || [],
          notifications: parsed.notifications || [],
          reviews: parsed.reviews || [],
          reports: parsed.reports || []
        };
      }
    } catch (err) {
      console.error('Failed to read db file, initializing seed:', err);
    }

    const seed = getSeedData();
    this.saveData(seed);
    return seed;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const content = JSON.stringify(dataToSave || this.data, null, 2);
      fs.writeFileSync(DB_FILE, content, 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User, passwordHash: string): User {
    this.data.users.push(user);
    this.data.userPasswords[user.id] = passwordHash;
    this.saveData();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData();
    return this.data.users[idx];
  }

  verifyPassword(userId: string, password: string): boolean {
    const expected = this.data.userPasswords[userId];
    if (!expected) return false;
    return expected === hashPassword(password);
  }

  updatePassword(userId: string, newPassword: string): void {
    this.data.userPasswords[userId] = hashPassword(newPassword);
    this.saveData();
  }

  private checkAndExpirePosts(): void {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let changed = false;

    this.data.products.forEach(p => {
      const created = new Date(p.createdAt).getTime();
      const isExpired = p.expiresAt 
        ? (now > new Date(p.expiresAt).getTime()) 
        : ((now - created) > SEVEN_DAYS_MS);

      if (isExpired && p.status === 'published') {
        p.status = 'expired';
        changed = true;
      }
    });

    if (changed) {
      this.saveData();
    }
  }

  getProductsBySeller(sellerId: string): Product[] {
    this.checkAndExpirePosts();
    return this.data.products.filter(p => p.sellerId === sellerId);
  }

  // Products
  getProducts(filters?: {
    category?: string;
    search?: string;
    state?: string;
    city?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    verifiedSellerOnly?: boolean;
    sort?: string;
    sellerId?: string;
    status?: string;
  }): Product[] {
    this.checkAndExpirePosts();
    let list = [...this.data.products];

    if (filters?.status) {
      list = list.filter(p => p.status === filters.status);
    } else {
      // By default return only published, non-expired products for public feeds
      list = list.filter(p => p.status === 'published');
    }

    if (filters?.sellerId) {
      list = list.filter(p => p.sellerId === filters.sellerId);
    }

    if (filters?.category) {
      const catLower = filters.category.toLowerCase();
      list = list.filter(p => 
        p.category.toLowerCase().includes(catLower) || 
        (p.subcategory && p.subcategory.toLowerCase().includes(catLower))
      );
    }

    if (filters?.state && filters.state !== 'All Nigeria') {
      list = list.filter(p => p.state.toLowerCase() === filters.state!.toLowerCase());
    }

    if (filters?.city) {
      list = list.filter(p => p.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters?.condition) {
      list = list.filter(p => p.condition === filters.condition);
    }

    if (filters?.verifiedSellerOnly) {
      list = list.filter(p => p.isVerifiedSeller);
    }

    if (filters?.minPrice !== undefined) {
      list = list.filter(p => (p.discountPrice || p.price) >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      list = list.filter(p => (p.discountPrice || p.price) <= filters.maxPrice!);
    }

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        p.sellerName.toLowerCase().includes(query) ||
        (p.sellerStoreName && p.sellerStoreName.toLowerCase().includes(query)) ||
        p.state.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (filters?.sort === 'price_asc') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (filters?.sort === 'price_desc') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (filters?.sort === 'popular') {
      list.sort((a, b) => (b.viewsCount + b.enquiriesCount * 3) - (a.viewsCount + a.enquiriesCount * 3));
    } else {
      // Default: newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }

  getProductById(id: string): Product | undefined {
    this.checkAndExpirePosts();
    return this.data.products.find(p => p.id === id);
  }

  createProduct(product: Product): Product {
    const created = new Date(product.createdAt || Date.now());
    if (!product.expiresAt) {
      product.expiresAt = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    this.data.products.unshift(product);
    this.saveData();
    return product;
  }

  relistProduct(id: string): Product | undefined {
    const prod = this.data.products.find(p => p.id === id);
    if (prod) {
      const now = new Date();
      prod.createdAt = now.toISOString();
      prod.updatedAt = now.toISOString();
      prod.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      prod.status = 'published';
      this.saveData();
    }
    return prod;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { 
      ...this.data.products[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveData();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  incrementProductView(id: string): void {
    const p = this.data.products.find(prod => prod.id === id);
    if (p) {
      p.viewsCount = (p.viewsCount || 0) + 1;
      this.saveData();
    }
  }

  incrementProductEnquiry(id: string): void {
    const p = this.data.products.find(prod => prod.id === id);
    if (p) {
      p.enquiriesCount = (p.enquiriesCount || 0) + 1;
      this.saveData();
    }
  }

  // Categories
  getCategories(): Category[] {
    return this.data.categories;
  }

  updateCategories(cats: Category[]): void {
    this.data.categories = cats;
    this.saveData();
  }

  // Conversations & Messages
  getConversationsForUser(userId: string): Conversation[] {
    return this.data.conversations
      .filter(c => (c.buyerId === userId || c.sellerId === userId))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  getConversationById(convId: string): Conversation | undefined {
    return this.data.conversations.find(c => c.id === convId);
  }

  findConversation(productId: string, buyerId: string, sellerId: string): Conversation | undefined {
    return this.data.conversations.find(
      c => c.productId === productId && c.buyerId === buyerId && c.sellerId === sellerId
    );
  }

  createConversation(conv: Conversation): Conversation {
    this.data.conversations.unshift(conv);
    this.saveData();
    return conv;
  }

  // 7-Day Auto-Purge for all chat messages
  public purgeExpiredChatMessages(): void {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let changed = false;

    // Purge public messages older than 7 days
    if (this.data.publicMessages && this.data.publicMessages.length > 0) {
      const prevCount = this.data.publicMessages.length;
      this.data.publicMessages = this.data.publicMessages.filter(m => {
        const created = new Date(m.createdAt).getTime();
        return (now - created) <= SEVEN_DAYS_MS;
      });
      if (this.data.publicMessages.length !== prevCount) {
        changed = true;
      }
    }

    // Purge direct/private conversation messages older than 7 days
    if (this.data.messages && this.data.messages.length > 0) {
      const prevCount = this.data.messages.length;
      this.data.messages = this.data.messages.filter(m => {
        const created = new Date(m.createdAt).getTime();
        return (now - created) <= SEVEN_DAYS_MS;
      });
      if (this.data.messages.length !== prevCount) {
        changed = true;
      }
    }

    if (changed) {
      this.saveData();
    }
  }

  // Public Community Live Chat
  getPublicMessages(): PublicChatMessage[] {
    this.purgeExpiredChatMessages();
    return this.data.publicMessages || [];
  }

  createPublicMessage(msgData: Omit<PublicChatMessage, 'id' | 'createdAt' | 'expiresAt'>): PublicChatMessage {
    this.purgeExpiredChatMessages();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newMsg: PublicChatMessage = {
      ...msgData,
      id: 'pubmsg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    if (!this.data.publicMessages) {
      this.data.publicMessages = [];
    }
    this.data.publicMessages.push(newMsg);
    this.saveData();
    return newMsg;
  }

  // Friend Requests & Friendships
  getFriendRequests(userId: string): { received: FriendRequest[]; sent: FriendRequest[] } {
    if (!this.data.friendRequests) this.data.friendRequests = [];
    const received = this.data.friendRequests.filter(r => r.receiverId === userId);
    const sent = this.data.friendRequests.filter(r => r.senderId === userId);
    return { received, sent };
  }

  sendFriendRequest(sender: User, receiverId: string): FriendRequest {
    if (sender.id === receiverId) {
      throw new Error('You cannot send a friend request to yourself.');
    }
    const receiver = this.getUserById(receiverId);
    if (!receiver) {
      throw new Error('User not found.');
    }
    if (!this.data.friends) this.data.friends = [];
    if (!this.data.friendRequests) this.data.friendRequests = [];

    const alreadyFriends = this.data.friends.some(f => 
      (f.user1Id === sender.id && f.user2Id === receiverId) ||
      (f.user1Id === receiverId && f.user2Id === sender.id)
    );
    if (alreadyFriends) {
      throw new Error('You are already friends with ' + receiver.name + '.');
    }

    const existingPending = this.data.friendRequests.find(r => 
      r.status === 'pending' &&
      ((r.senderId === sender.id && r.receiverId === receiverId) ||
       (r.senderId === receiverId && r.receiverId === sender.id))
    );
    if (existingPending) {
      if (existingPending.senderId === receiverId) {
        existingPending.status = 'accepted';
        existingPending.updatedAt = new Date().toISOString();
        this.data.friends.push({
          id: 'frnd-' + Date.now(),
          user1Id: sender.id,
          user2Id: receiverId,
          createdAt: new Date().toISOString()
        });
        this.saveData();
        return existingPending;
      }
      throw new Error('A friend request is already pending between you.');
    }

    const newRequest: FriendRequest = {
      id: 'freq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatarUrl,
      senderRole: sender.role,
      senderCity: sender.city,
      senderState: sender.state,
      receiverId: receiver.id,
      receiverName: receiver.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.friendRequests.unshift(newRequest);
    this.saveData();
    return newRequest;
  }

  respondFriendRequest(requestId: string, userId: string, action: 'accept' | 'decline'): FriendRequest {
    if (!this.data.friendRequests) this.data.friendRequests = [];
    if (!this.data.friends) this.data.friends = [];

    const req = this.data.friendRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Friend request not found.');
    if (req.receiverId !== userId) throw new Error('Unauthorized to respond to this friend request.');

    req.status = action === 'accept' ? 'accepted' : 'declined';
    req.updatedAt = new Date().toISOString();

    if (action === 'accept') {
      const exists = this.data.friends.some(f => 
        (f.user1Id === req.senderId && f.user2Id === req.receiverId) ||
        (f.user1Id === req.receiverId && f.user2Id === req.senderId)
      );
      if (!exists) {
        this.data.friends.push({
          id: 'frnd-' + Date.now(),
          user1Id: req.senderId,
          user2Id: req.receiverId,
          createdAt: new Date().toISOString()
        });
      }
    }
    this.saveData();
    return req;
  }

  getFriends(userId: string): User[] {
    if (!this.data.friends) this.data.friends = [];
    const friendIds = this.data.friends
      .filter(f => f.user1Id === userId || f.user2Id === userId)
      .map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    return this.data.users
      .filter(u => friendIds.includes(u.id))
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.isPhonePublic ? u.phone : undefined,
        whatsappNumber: u.isWhatsappPublic ? u.whatsappNumber : undefined,
        isPhonePublic: u.isPhonePublic,
        isWhatsappPublic: u.isWhatsappPublic,
        role: u.role,
        isVerifiedSeller: u.isVerifiedSeller,
        storeName: u.storeName,
        storeBio: u.storeBio,
        avatarUrl: u.avatarUrl,
        state: u.state,
        city: u.city,
        createdAt: u.createdAt
      }));
  }

  getFriendshipStatus(user1Id: string, user2Id: string): 'friends' | 'pending_sent' | 'pending_received' | 'none' {
    if (!this.data.friends) this.data.friends = [];
    if (!this.data.friendRequests) this.data.friendRequests = [];

    const isFriend = this.data.friends.some(f =>
      (f.user1Id === user1Id && f.user2Id === user2Id) ||
      (f.user1Id === user2Id && f.user2Id === user1Id)
    );
    if (isFriend) return 'friends';

    const sentReq = this.data.friendRequests.find(r =>
      r.status === 'pending' && r.senderId === user1Id && r.receiverId === user2Id
    );
    if (sentReq) return 'pending_sent';

    const receivedReq = this.data.friendRequests.find(r =>
      r.status === 'pending' && r.senderId === user2Id && r.receiverId === user1Id
    );
    if (receivedReq) return 'pending_received';

    return 'none';
  }

  removeFriend(userId: string, friendId: string): boolean {
    if (!this.data.friends) this.data.friends = [];
    const initialLen = this.data.friends.length;
    this.data.friends = this.data.friends.filter(f =>
      !( (f.user1Id === userId && f.user2Id === friendId) ||
         (f.user1Id === friendId && f.user2Id === userId) )
    );
    if (this.data.friends.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  searchUsers(query: string, currentUserId: string): Partial<User>[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return this.data.users
      .filter(u => u.id !== currentUserId && !u.isBlocked)
      .filter(u =>
        u.name.toLowerCase().includes(q) ||
        (u.storeName && u.storeName.toLowerCase().includes(q)) ||
        u.state.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
      )
      .slice(0, 15)
      .map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        isVerifiedSeller: u.isVerifiedSeller,
        storeName: u.storeName,
        avatarUrl: u.avatarUrl,
        state: u.state,
        city: u.city
      }));
  }

  getOrCreateDirectConversation(user1Id: string, user2Id: string): Conversation {
    let conv = this.data.conversations.find(c => 
      c.productId === 'direct-chat' &&
      ((c.buyerId === user1Id && c.sellerId === user2Id) ||
       (c.buyerId === user2Id && c.sellerId === user1Id))
    );
    if (!conv) {
      const u1 = this.getUserById(user1Id);
      const u2 = this.getUserById(user2Id);
      conv = {
        id: 'conv-direct-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: 'direct-chat',
        productTitle: `Direct Chat: ${u1?.name || 'User'} & ${u2?.name || 'User'}`,
        productPrice: 0,
        productImage: u2?.avatarUrl || '',
        buyerId: user1Id,
        buyerName: u1?.name || 'User',
        sellerId: user2Id,
        sellerName: u2?.name || 'User',
        lastMessageText: '',
        lastMessageAt: new Date().toISOString(),
        unreadCountForBuyer: 0,
        unreadCountForSeller: 0,
        isBlocked: false,
        createdAt: new Date().toISOString()
      };
      this.data.conversations.unshift(conv);
      this.saveData();
    }
    return conv;
  }

  getMessages(conversationId: string): Message[] {
    this.purgeExpiredChatMessages();
    return this.data.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  createMessage(msg: Message): Message {
    this.purgeExpiredChatMessages();
    if (!msg.expiresAt) {
      const now = new Date(msg.createdAt || Date.now());
      msg.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    this.data.messages.push(msg);
    // update conversation last message
    const conv = this.data.conversations.find(c => c.id === msg.conversationId);
    if (conv) {
      conv.lastMessageText = msg.text;
      conv.lastMessageAt = msg.createdAt;
      if (msg.senderId === conv.buyerId) {
        conv.unreadCountForSeller = (conv.unreadCountForSeller || 0) + 1;
      } else {
        conv.unreadCountForBuyer = (conv.unreadCountForBuyer || 0) + 1;
      }
    }
    this.saveData();
    return msg;
  }

  markMessagesAsRead(conversationId: string, currentUserId: string): void {
    const conv = this.data.conversations.find(c => c.id === conversationId);
    if (conv) {
      if (conv.buyerId === currentUserId) {
        conv.unreadCountForBuyer = 0;
      } else if (conv.sellerId === currentUserId) {
        conv.unreadCountForSeller = 0;
      }
    }
    this.data.messages.forEach(m => {
      if (m.conversationId === conversationId && m.senderId !== currentUserId) {
        m.read = true;
      }
    });
    this.saveData();
  }

  // Orders
  getOrders(userId?: string, asSeller?: boolean): Order[] {
    if (!userId) return this.data.orders;
    if (asSeller) {
      return this.data.orders.filter(ord => 
        ord.items.some(item => item.sellerId === userId)
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return this.data.orders
      .filter(ord => ord.buyerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.saveData();
    return order;
  }

  updateOrderStatus(orderId: string, status: Order['orderStatus']): Order | undefined {
    const ord = this.data.orders.find(o => o.id === orderId);
    if (ord) {
      ord.orderStatus = status;
      ord.updatedAt = new Date().toISOString();
      this.saveData();
    }
    return ord;
  }

  // Notifications
  getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  markNotificationRead(id: string, userId: string): void {
    const n = this.data.notifications.find(not => not.id === id && not.userId === userId);
    if (n) {
      n.read = true;
      this.saveData();
    }
  }

  markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach(not => {
      if (not.userId === userId) not.read = true;
    });
    this.saveData();
  }

  // Reviews
  getReviewsForProduct(productId: string): Review[] {
    return this.data.reviews
      .filter(r => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createReview(review: Review): Review {
    this.data.reviews.unshift(review);
    this.saveData();
    return review;
  }

  // Reports
  createReport(report: AbuseReport): AbuseReport {
    this.data.reports.unshift(report);
    this.saveData();
    return report;
  }

  getReports(): AbuseReport[] {
    return this.data.reports;
  }

  updateReportStatus(id: string, status: AbuseReport['status']): AbuseReport | undefined {
    const r = this.data.reports.find(rep => rep.id === id);
    if (r) {
      r.status = status;
      this.saveData();
    }
    return r;
  }
}

export const db = new Database();
