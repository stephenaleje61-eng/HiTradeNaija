import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  db, hashPassword, generateToken, parseToken 
} from './src/server/db';
import { 
  User, Product, Order, Conversation, Message, Notification, Review, AbuseReport 
} from './src/types';
import { NIGERIAN_STATES_AND_CITIES } from './src/data/nigeria-data';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 25MB limit to allow product image base64 uploads cleanly
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Extend Express Request type to include auth user
export interface AuthRequest extends Request {
  user?: User;
}

// Authentication middleware
function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  const userId = parseToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
  }

  req.user = user;
  next();
}

// Optional Auth middleware (populates req.user if token present)
function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const userId = parseToken(token);
    if (userId) {
      const user = db.getUserById(userId);
      if (user && !user.isBlocked) {
        req.user = user;
      }
    }
  }
  next();
}

// Helper to sanitize product for public view respecting seller privacy
function sanitizeProductForViewer(product: Product, viewerId?: string): Product {
  const isOwner = viewerId === product.sellerId;
  return {
    ...product,
    sellerPhone: (isOwner || product.isPhonePublic) ? product.sellerPhone : undefined,
    sellerWhatsapp: (isOwner || product.isWhatsappPublic) ? product.sellerWhatsapp : undefined
  };
}

// ======================== API ROUTES ========================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'TradeNaija Nigeria' });
});

// Nigerian Locations
app.get('/api/locations', (req, res) => {
  res.json(NIGERIAN_STATES_AND_CITIES);
});

// ---------------- AUTH ROUTES ----------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, phone, state, city, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const newUser: User = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      whatsappNumber: phone?.trim() || '',
      isPhonePublic: false,
      isWhatsappPublic: false,
      role: (role === 'seller' ? 'seller' : 'buyer'),
      isVerifiedSeller: false,
      state: state || 'Lagos',
      city: city || 'Ikeja',
      createdAt: new Date().toISOString()
    };

    const created = db.createUser(newUser, hashPassword(password));
    const token = generateToken(created.id);

    // Initial welcome notification
    db.createNotification({
      id: 'notif-' + Date.now(),
      userId: created.id,
      title: 'Welcome to TradeNaija!',
      message: 'Your account is ready. Discover authentic products, contact sellers, or start posting your goods.',
      type: 'promo',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ user: created, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account is suspended. Please contact TradeNaija support.' });
    }

    const isMatch = db.verifyPassword(user.id, password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = generateToken(user.id);
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  const user = db.getUserByEmail(email);
  if (!user) {
    // For security, don't leak user existence
    return res.json({ message: 'If an account matches that email, password reset instructions have been dispatched.' });
  }
  res.json({ 
    message: 'Password reset code generated. Use our quick password reset form to set a new password.',
    resetToken: generateToken(user.id)
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }
  db.updatePassword(user.id, newPassword);
  res.json({ message: 'Password updated successfully. You can now log in.' });
});

app.put('/api/auth/profile', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { 
      name, phone, whatsappNumber, isPhonePublic, isWhatsappPublic, 
      storeName, storeBio, storeBanner, avatarUrl, state, city, address, role 
    } = req.body;

    const updates: Partial<User> = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber.trim();
    if (isPhonePublic !== undefined) updates.isPhonePublic = Boolean(isPhonePublic);
    if (isWhatsappPublic !== undefined) updates.isWhatsappPublic = Boolean(isWhatsappPublic);
    if (storeName !== undefined) updates.storeName = storeName.trim();
    if (storeBio !== undefined) updates.storeBio = storeBio.trim();
    if (storeBanner !== undefined) updates.storeBanner = storeBanner;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (state !== undefined) updates.state = state;
    if (city !== undefined) updates.city = city;
    if (address !== undefined) updates.address = address;
    if (role && (role === 'seller' || role === 'buyer') && user.role !== 'admin') {
      updates.role = role;
    }

    const updated = db.updateUser(user.id, updates);
    res.json({ user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Profile update failed.' });
  }
});

app.get('/api/auth/sellers', (req, res) => {
  const sellers = db.getUsers().filter(u => u.role === 'seller' || u.isVerifiedSeller);
  // Sanitize seller contacts based on privacy
  const sanitized = sellers.map(s => ({
    id: s.id,
    name: s.name,
    storeName: s.storeName || s.name + ' Store',
    storeBio: s.storeBio,
    avatarUrl: s.avatarUrl,
    storeBanner: s.storeBanner,
    state: s.state,
    city: s.city,
    isVerifiedSeller: s.isVerifiedSeller,
    phone: s.isPhonePublic ? s.phone : undefined,
    whatsappNumber: s.isWhatsappPublic ? s.whatsappNumber : undefined,
    createdAt: s.createdAt
  }));
  res.json(sanitized);
});

app.get('/api/auth/seller/:id', (req, res) => {
  const seller = db.getUserById(req.params.id);
  if (!seller) {
    return res.status(404).json({ error: 'Seller not found.' });
  }
  const products = db.getProducts({ sellerId: seller.id, status: 'published' });
  const sanitizedSeller = {
    id: seller.id,
    name: seller.name,
    storeName: seller.storeName || seller.name + ' Store',
    storeBio: seller.storeBio,
    avatarUrl: seller.avatarUrl,
    storeBanner: seller.storeBanner,
    state: seller.state,
    city: seller.city,
    isVerifiedSeller: seller.isVerifiedSeller,
    phone: seller.isPhonePublic ? seller.phone : undefined,
    whatsappNumber: seller.isWhatsappPublic ? seller.whatsappNumber : undefined,
    isPhonePublic: seller.isPhonePublic,
    isWhatsappPublic: seller.isWhatsappPublic,
    createdAt: seller.createdAt,
    listingsCount: products.length
  };
  res.json({ seller: sanitizedSeller, products });
});

// ---------------- PRODUCT ROUTES ----------------
app.get('/api/products', optionalAuthMiddleware, (req: AuthRequest, res) => {
  try {
    const { 
      category, search, state, city, condition, 
      minPrice, maxPrice, verifiedSellerOnly, sort, sellerId, status, page = 1, limit = 40 
    } = req.query;

    const filters: any = {};
    if (category) filters.category = String(category);
    if (search) filters.search = String(search);
    if (state) filters.state = String(state);
    if (city) filters.city = String(city);
    if (condition) filters.condition = String(condition);
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (verifiedSellerOnly === 'true') filters.verifiedSellerOnly = true;
    if (sort) filters.sort = String(sort);
    if (sellerId) filters.sellerId = String(sellerId);
    if (status) filters.status = String(status);

    const allProducts = db.getProducts(filters);
    const viewerId = req.user?.id;
    const sanitized = allProducts.map(p => sanitizeProductForViewer(p, viewerId));

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = sanitized.slice(startIndex, startIndex + limitNum);

    res.json({
      products: paginated,
      total: allProducts.length,
      page: pageNum,
      totalPages: Math.ceil(allProducts.length / limitNum)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load products.' });
  }
});

app.get('/api/products/:id', optionalAuthMiddleware, (req: AuthRequest, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  // Increment view counter
  db.incrementProductView(product.id);

  const viewerId = req.user?.id;
  res.json(sanitizeProductForViewer(product, viewerId));
});

// Create product (Post your goods)
app.post('/api/products', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const {
      title, description, price, discountPrice, quantity, condition,
      category, subcategory, brand, images, state, city,
      deliveryMethod, deliveryFee, pickupAvailable, warranty, returnPolicy,
      isPhonePublic, isWhatsappPublic, phone, whatsappNumber
    } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Title, description, category, and price are required.' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Please enter a valid price in Naira.' });
    }

    const imgList: string[] = Array.isArray(images) && images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'];

    const newProduct: Product = {
      id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: title.trim(),
      slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: description.trim(),
      price: numPrice,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      quantity: quantity ? Math.max(1, Number(quantity)) : 1,
      condition: condition === 'used' ? 'used' : 'new',
      category: category.trim(),
      subcategory: subcategory?.trim(),
      brand: brand?.trim(),
      images: imgList,
      state: state || user.state || 'Lagos',
      city: city || user.city || 'Ikeja',
      sellerId: user.id,
      sellerName: user.name,
      sellerStoreName: user.storeName || user.name,
      sellerPhone: phone || user.phone,
      sellerWhatsapp: whatsappNumber || user.whatsappNumber || user.phone,
      isPhonePublic: isPhonePublic !== undefined ? Boolean(isPhonePublic) : user.isPhonePublic,
      isWhatsappPublic: isWhatsappPublic !== undefined ? Boolean(isWhatsappPublic) : user.isWhatsappPublic,
      isVerifiedSeller: user.isVerifiedSeller,
      deliveryMethod: deliveryMethod || 'Waybill / Delivery or Store Pickup',
      deliveryFee: deliveryFee ? Number(deliveryFee) : 0,
      pickupAvailable: Boolean(pickupAvailable),
      warranty: warranty?.trim(),
      returnPolicy: returnPolicy?.trim(),
      status: 'published', // Published by default for fast community trading
      viewsCount: 0,
      enquiriesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    // If user wasn't marked as seller yet, upgrade their role to seller
    if (user.role === 'buyer') {
      db.updateUser(user.id, { role: 'seller' });
    }

    const created = db.createProduct(newProduct);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to post product.' });
  }
});

// Update product
app.put('/api/products/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Check ownership unless admin
    if (product.sellerId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. You can only edit your own listings.' });
    }

    const {
      title, description, price, discountPrice, quantity, condition,
      category, subcategory, brand, images, state, city,
      deliveryMethod, deliveryFee, pickupAvailable, warranty, returnPolicy,
      isPhonePublic, isWhatsappPublic, status
    } = req.body;

    const updates: Partial<Product> = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price);
    if (discountPrice !== undefined) updates.discountPrice = discountPrice ? Number(discountPrice) : undefined;
    if (quantity !== undefined) updates.quantity = Number(quantity);
    if (condition) updates.condition = condition;
    if (category) updates.category = category;
    if (subcategory !== undefined) updates.subcategory = subcategory;
    if (brand !== undefined) updates.brand = brand;
    if (images && Array.isArray(images)) updates.images = images;
    if (state) updates.state = state;
    if (city) updates.city = city;
    if (deliveryMethod !== undefined) updates.deliveryMethod = deliveryMethod;
    if (deliveryFee !== undefined) updates.deliveryFee = Number(deliveryFee);
    if (pickupAvailable !== undefined) updates.pickupAvailable = Boolean(pickupAvailable);
    if (warranty !== undefined) updates.warranty = warranty;
    if (returnPolicy !== undefined) updates.returnPolicy = returnPolicy;
    if (isPhonePublic !== undefined) updates.isPhonePublic = Boolean(isPhonePublic);
    if (isWhatsappPublic !== undefined) updates.isWhatsappPublic = Boolean(isWhatsappPublic);
    if (status) updates.status = status;

    const updated = db.updateProduct(product.id, updates);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product.' });
  }
});

// Relist / Renew listing for another 7 days
app.post('/api/products/:id/relist', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (product.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const renewed = db.relistProduct(product.id);
  res.json(renewed);
});

// Update status (Mark sold, paused, published)
app.patch('/api/products/:id/status', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (product.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const updated = db.updateProduct(product.id, { status });
  res.json(updated);
});

// Delete product
app.delete('/api/products/:id', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (product.sellerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  db.deleteProduct(product.id);
  res.json({ message: 'Listing deleted successfully.' });
});

// Seller's own listings
app.get('/api/seller/my-listings', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const ownListings = db.getProductsBySeller(user.id);
  res.json(ownListings);
});

// ---------------- CATEGORY ROUTES ----------------
app.get('/api/categories', (req, res) => {
  const categories = db.getCategories();
  const allProducts = db.getProducts({ status: 'published' });
  const counts: Record<string, number> = {};
  allProducts.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  const categoriesWithCount = categories.map(c => ({
    ...c,
    count: counts[c.name] || 0
  }));
  res.json(categoriesWithCount);
});

// ---------------- REAL-TIME CHAT & SSE INFRASTRUCTURE ----------------
interface OnlineSession {
  userId: string;
  name: string;
  role: string;
  city?: string;
  state?: string;
  avatarUrl?: string;
  lastSeen: number;
}

const onlineUsersMap = new Map<string, OnlineSession>();
type SSEClient = {
  id: string;
  res: Response;
  userId?: string;
};
const sseClients = new Set<SSEClient>();

function cleanupInactiveUsers() {
  const cutoff = Date.now() - 50000; // 50s timeout
  for (const [id, session] of onlineUsersMap.entries()) {
    if (session.lastSeen < cutoff) {
      onlineUsersMap.delete(id);
    }
  }
}

function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function trackUserPresence(user: User) {
  onlineUsersMap.set(user.id, {
    userId: user.id,
    name: user.name,
    role: user.role,
    city: user.city,
    state: user.state,
    avatarUrl: user.avatarUrl,
    lastSeen: Date.now()
  });
}

// Auto-purge expired 7-day chat messages and inactive users every 5 minutes
setInterval(() => {
  try {
    db.purgeExpiredChatMessages();
    cleanupInactiveUsers();
  } catch (err) {
    console.error('Periodic background purge error:', err);
  }
}, 5 * 60 * 1000);

// SSE Real-Time Stream Endpoint
app.get('/api/chat/events', (req, res) => {
  // Check auth from query token or Authorization header
  const token = (req.query.token as string) || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);
  let authedUser: User | undefined;
  if (token) {
    const userId = parseToken(token);
    if (userId) {
      authedUser = db.getUserById(userId);
      if (authedUser) {
        trackUserPresence(authedUser);
      }
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = 'sse-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const client: SSEClient = { id: clientId, res, userId: authedUser?.id };
  sseClients.add(client);

  // Send initial state
  cleanupInactiveUsers();
  const initPayload = {
    type: 'init',
    onlineCount: Math.max(1, onlineUsersMap.size),
    onlineUsers: Array.from(onlineUsersMap.values()),
    timestamp: new Date().toISOString()
  };
  res.write(`event: init\ndata: ${JSON.stringify(initPayload)}\n\n`);

  // Keep-alive ping interval
  const pingInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(pingInterval);
      sseClients.delete(client);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients.delete(client);
  });
});

// Heartbeat & Online Presence
app.post('/api/chat/heartbeat', optionalAuthMiddleware, (req: AuthRequest, res) => {
  if (req.user) {
    trackUserPresence(req.user);
  }
  cleanupInactiveUsers();
  const onlineCount = Math.max(1, onlineUsersMap.size);
  const users = Array.from(onlineUsersMap.values());
  res.json({ onlineCount, users });
});

app.get('/api/chat/online', (req, res) => {
  cleanupInactiveUsers();
  res.json({
    count: Math.max(1, onlineUsersMap.size),
    users: Array.from(onlineUsersMap.values())
  });
});

// Public Community Live Chat Messages
app.get('/api/chat/public', (req, res) => {
  db.purgeExpiredChatMessages();
  const messages = db.getPublicMessages();
  cleanupInactiveUsers();
  res.json({
    messages,
    onlineCount: Math.max(1, onlineUsersMap.size)
  });
});

app.post('/api/chat/public', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    trackUserPresence(user);

    const { text, replyTo } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (text.trim().length > 1500) {
      return res.status(400).json({ error: 'Message cannot exceed 1500 characters.' });
    }

    const newMsg = db.createPublicMessage({
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      senderCity: user.city,
      senderState: user.state,
      senderAvatar: user.avatarUrl,
      text: text.trim(),
      replyTo: replyTo && replyTo.id ? {
        id: replyTo.id,
        senderName: replyTo.senderName,
        text: String(replyTo.text).substring(0, 140)
      } : undefined
    });

    // Real-time broadcast to all connected users
    broadcastSSE('public_message', newMsg);
    broadcastSSE('online_count', { count: Math.max(1, onlineUsersMap.size) });

    res.status(201).json(newMsg);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to post live chat message.' });
  }
});

// Friend Requests & Friendship
app.get('/api/friends', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  trackUserPresence(user);
  const friends = db.getFriends(user.id);
  const requests = db.getFriendRequests(user.id);
  res.json({ friends, requests });
});

app.get('/api/friends/status/:targetId', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const status = db.getFriendshipStatus(user.id, req.params.targetId);
  res.json({ status });
});

app.post('/api/friends/request', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { receiverId } = req.body;
    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver user ID is required.' });
    }

    const freq = db.sendFriendRequest(user, receiverId);

    // Notify receiver
    db.createNotification({
      id: 'notif-' + Date.now(),
      userId: receiverId,
      title: `Friend Request from ${user.name}`,
      message: `${user.name} sent you a connection request on TradeNaija.`,
      type: 'message',
      link: '/messages?tab=friends',
      read: false,
      createdAt: new Date().toISOString()
    });

    // Broadcast SSE to recipient
    broadcastSSE('friend_request', {
      receiverId,
      request: freq
    });

    res.status(201).json(freq);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send friend request.' });
  }
});

app.post('/api/friends/respond', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { requestId, action } = req.body;
    if (!requestId || !action || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Valid requestId and action (accept/decline) are required.' });
    }

    const updated = db.respondFriendRequest(requestId, user.id, action);

    if (action === 'accept') {
      db.createNotification({
        id: 'notif-' + Date.now(),
        userId: updated.senderId,
        title: `Friend Request Accepted`,
        message: `${user.name} accepted your connection request on TradeNaija!`,
        type: 'message',
        link: '/messages?tab=friends',
        read: false,
        createdAt: new Date().toISOString()
      });

      broadcastSSE('friend_accepted', {
        user1Id: updated.senderId,
        user2Id: user.id
      });
    }

    res.json({ success: true, request: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to respond to friend request.' });
  }
});

app.post('/api/friends/start-chat', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ error: 'Friend ID is required.' });
    }

    const conversation = db.getOrCreateDirectConversation(user.id, friendId);
    res.json({ conversation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start friend chat.' });
  }
});

app.delete('/api/friends/:id', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const removed = db.removeFriend(user.id, req.params.id);
  res.json({ success: removed });
});

app.get('/api/users/search', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const q = (req.query.q as string) || '';
  const results = db.searchUsers(q, user.id);
  res.json(results);
});

// ---------------- CONVERSATIONS & CHAT ROUTES ----------------
app.get('/api/conversations', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const conversations = db.getConversationsForUser(user.id);
  res.json(conversations);
});

app.post('/api/conversations', authMiddleware, (req: AuthRequest, res) => {
  try {
    const buyer = req.user!;
    const { productId, initialMessage } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const product = db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (product.sellerId === buyer.id) {
      return res.status(400).json({ error: 'You cannot start a chat with yourself as the seller.' });
    }

    // Check if conversation already exists
    let conversation = db.findConversation(product.id, buyer.id, product.sellerId);

    const messageText = initialMessage?.trim() || `Hello, I saw your product "${product.title}" on TradeNaija. Is it still available?`;

    if (!conversation) {
      const convId = 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      conversation = {
        id: convId,
        productId: product.id,
        productTitle: product.title,
        productPrice: product.discountPrice || product.price,
        productImage: product.images[0] || '',
        buyerId: buyer.id,
        buyerName: buyer.name,
        sellerId: product.sellerId,
        sellerName: product.sellerStoreName || product.sellerName,
        lastMessageText: messageText,
        lastMessageAt: new Date().toISOString(),
        unreadCountForBuyer: 0,
        unreadCountForSeller: 1,
        isBlocked: false,
        createdAt: new Date().toISOString()
      };
      db.createConversation(conversation);
    }

    // Send first message
    const msg: Message = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversationId: conversation.id,
      senderId: buyer.id,
      senderName: buyer.name,
      text: messageText,
      createdAt: new Date().toISOString(),
      read: false
    };
    db.createMessage(msg);
    db.incrementProductEnquiry(product.id);

    // Notify seller
    db.createNotification({
      id: 'notif-' + Date.now(),
      userId: product.sellerId,
      title: `New Enquiry on ${product.title}`,
      message: `${buyer.name}: "${messageText.substring(0, 70)}..."`,
      type: 'message',
      link: '/messages',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ conversation, message: msg });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start conversation.' });
  }
});

app.get('/api/conversations/:id/messages', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const conv = db.getConversationById(req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }

  // Security check: Only buyer or seller can view messages
  if (conv.buyerId !== user.id && conv.sellerId !== user.id) {
    return res.status(403).json({ error: 'Access denied. You are not a participant in this conversation.' });
  }

  // Mark messages as read
  db.markMessagesAsRead(conv.id, user.id);

  const messages = db.getMessages(conv.id);
  res.json({ conversation: conv, messages });
});

app.post('/api/conversations/:id/messages', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const conv = db.getConversationById(req.params.id);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (conv.buyerId !== user.id && conv.sellerId !== user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (conv.isBlocked) {
      return res.status(403).json({ error: 'This conversation has been blocked.' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const msg: Message = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversationId: conv.id,
      senderId: user.id,
      senderName: user.name,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      read: false
    };

    const saved = db.createMessage(msg);

    // Real-time broadcast to SSE clients
    broadcastSSE('direct_message', {
      conversationId: conv.id,
      message: saved
    });

    // Notify recipient
    const recipientId = user.id === conv.buyerId ? conv.sellerId : conv.buyerId;
    db.createNotification({
      id: 'notif-' + Date.now(),
      userId: recipientId,
      title: `Message from ${user.name}`,
      message: text.trim().substring(0, 80),
      type: 'message',
      link: '/messages',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send message.' });
  }
});

// Block or Report Conversation
app.post('/api/conversations/:id/report', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const conv = db.getConversationById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });

  const { reason, details, blockUser } = req.body;

  db.createReport({
    id: 'rep-' + Date.now(),
    reporterId: user.id,
    reporterName: user.name,
    targetType: 'message',
    targetId: conv.id,
    targetTitleOrName: `Chat regarding ${conv.productTitle}`,
    reason: reason || 'Suspicious behavior / Scam attempt',
    details,
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  if (blockUser) {
    conv.isBlocked = true;
  }

  res.json({ message: 'Report submitted. Our Nigerian trust and safety team will review this promptly.' });
});

// ---------------- ORDERS & CHECKOUT ----------------
app.post('/api/orders', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please add items to checkout.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.state || !shippingAddress.streetAddress) {
      return res.status(400).json({ error: 'Complete delivery address and Nigerian phone number are required.' });
    }

    // Verify each product and recalculate totals server-side
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = db.getProductById(item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product "${item.title || item.productId}" is no longer available.` });
      }
      if (prod.status !== 'published') {
        return res.status(400).json({ error: `Product "${prod.title}" is currently not available for purchase.` });
      }

      const itemPrice = prod.discountPrice || prod.price;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      calculatedSubtotal += itemPrice * quantity;

      validatedItems.push({
        productId: prod.id,
        title: prod.title,
        price: itemPrice,
        quantity,
        image: prod.images[0] || '',
        sellerId: prod.sellerId
      });
    }

    // Base shipping estimate based on Nigerian state
    let shippingFee = 3500;
    if (shippingAddress.state === 'Lagos') {
      shippingFee = 2500;
    } else if (shippingAddress.state === 'Abuja (FCT)') {
      shippingFee = 3000;
    } else if (['Rivers', 'Oyo', 'Kano', 'Anambra', 'Edo', 'Delta'].includes(shippingAddress.state)) {
      shippingFee = 3800;
    } else {
      shippingFee = 4500;
    }

    const orderId = 'ord-' + Date.now().toString().slice(-6);
    const newOrder: Order = {
      id: orderId,
      buyerId: user.id,
      buyerName: shippingAddress.fullName || user.name,
      buyerEmail: user.email,
      buyerPhone: shippingAddress.phone || user.phone || '',
      shippingAddress,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shippingFee,
      total: calculatedSubtotal + shippingFee,
      paymentMethod: paymentMethod || 'paystack',
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      orderStatus: 'confirmed',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = db.createOrder(newOrder);

    // Notify buyer
    db.createNotification({
      id: 'notif-' + Date.now(),
      userId: user.id,
      title: `Order #${orderId} Confirmed`,
      message: `Your order for ₦${newOrder.total.toLocaleString()} has been placed and sent to the merchant.`,
      type: 'order',
      link: '/orders',
      read: false,
      createdAt: new Date().toISOString()
    });

    // Notify sellers
    const notifiedSellers = new Set<string>();
    validatedItems.forEach(item => {
      if (!notifiedSellers.has(item.sellerId)) {
        notifiedSellers.add(item.sellerId);
        db.createNotification({
          id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          userId: item.sellerId,
          title: `New Customer Order #${orderId}`,
          message: `You have received a new order for ${item.title} from ${user.name}.`,
          type: 'order',
          link: '/seller',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to place order.' });
  }
});

app.get('/api/orders', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const asSeller = req.query.asSeller === 'true';
  const orders = db.getOrders(user.id, asSeller);
  res.json(orders);
});

app.get('/api/orders/:id', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const isBuyer = order.buyerId === user.id;
  const isSeller = order.items.some(i => i.sellerId === user.id);
  const isAdmin = user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    return res.status(403).json({ error: 'Unauthorized to view this order.' });
  }

  res.json(order);
});

app.patch('/api/orders/:id/status', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const isSeller = order.items.some(i => i.sellerId === user.id);
  const isAdmin = user.role === 'admin';
  if (!isSeller && !isAdmin) {
    return res.status(403).json({ error: 'Unauthorized to update order status.' });
  }

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Order status required.' });

  const updated = db.updateOrderStatus(order.id, status);

  // Notify buyer of status update
  db.createNotification({
    id: 'notif-' + Date.now(),
    userId: order.buyerId,
    title: `Order #${order.id} Updated: ${status.toUpperCase()}`,
    message: `Your order status is now ${status}. Track your delivery in your account.`,
    type: 'order',
    link: '/orders',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json(updated);
});

// ---------------- NOTIFICATIONS ----------------
app.get('/api/notifications', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const notifications = db.getNotifications(user.id);
  res.json(notifications);
});

app.patch('/api/notifications/:id/read', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  db.markNotificationRead(req.params.id, user.id);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  db.markAllNotificationsRead(user.id);
  res.json({ success: true });
});

// ---------------- REVIEWS ----------------
app.get('/api/reviews', (req, res) => {
  const productId = req.query.productId as string;
  if (!productId) return res.status(400).json({ error: 'Product ID required.' });
  res.json(db.getReviewsForProduct(productId));
});

app.post('/api/reviews', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user!;
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'Product ID, rating (1-5), and review text are required.' });
  }

  const newReview: Review = {
    id: 'rev-' + Date.now(),
    productId,
    userId: user.id,
    userName: user.name,
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: comment.trim(),
    verifiedPurchase: true,
    createdAt: new Date().toISOString()
  };

  const created = db.createReview(newReview);
  res.status(201).json(created);
});

// ---------------- REPORT LISTING / USER ----------------
app.post('/api/reports', optionalAuthMiddleware, (req: AuthRequest, res) => {
  const { targetType, targetId, targetTitleOrName, reason, details } = req.body;
  const reporterId = req.user?.id || 'anonymous';
  const reporterName = req.user?.name || 'Anonymous User';

  const report: AbuseReport = {
    id: 'rep-' + Date.now(),
    reporterId,
    reporterName,
    targetType: targetType || 'product',
    targetId,
    targetTitleOrName: targetTitleOrName || 'Reported item',
    reason: reason || 'Suspicious listing',
    details,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.createReport(report);
  res.status(201).json({ message: 'Thank you. The report has been received by our Nigerian safety operations desk.' });
});

// ---------------- ADMIN DASHBOARD ROUTES ----------------
function adminOnlyMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  });
}

app.get('/api/admin/stats', adminOnlyMiddleware, (req, res) => {
  const users = db.getUsers();
  const products = db.getProducts({ status: undefined });
  const orders = db.getOrders();
  const reports = db.getReports();

  const totalSalesNaira = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const verifiedSellersCount = users.filter(u => u.isVerifiedSeller).length;

  res.json({
    totalUsers: users.length,
    totalSellers: users.filter(u => u.role === 'seller').length,
    verifiedSellers: verifiedSellersCount,
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'published').length,
    totalOrders: orders.length,
    totalSalesNaira,
    pendingReports
  });
});

app.get('/api/admin/users', adminOnlyMiddleware, (req, res) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isVerifiedSeller: u.isVerifiedSeller,
    state: u.state,
    city: u.city,
    isBlocked: u.isBlocked || false,
    createdAt: u.createdAt
  }));
  res.json(users);
});

app.patch('/api/admin/users/:id', adminOnlyMiddleware, (req, res) => {
  const { role, isVerifiedSeller, isBlocked } = req.body;
  const updates: Partial<User> = {};
  if (role) updates.role = role;
  if (isVerifiedSeller !== undefined) updates.isVerifiedSeller = Boolean(isVerifiedSeller);
  if (isBlocked !== undefined) updates.isBlocked = Boolean(isBlocked);

  const updated = db.updateUser(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  res.json(updated);
});

app.get('/api/admin/reports', adminOnlyMiddleware, (req, res) => {
  res.json(db.getReports());
});

app.patch('/api/admin/reports/:id', adminOnlyMiddleware, (req, res) => {
  const { status } = req.body;
  const updated = db.updateReportStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Report not found.' });
  res.json(updated);
});

app.patch('/api/admin/products/:id/moderate', adminOnlyMiddleware, (req, res) => {
  const { status, isFeatured, isFlashDeal } = req.body;
  const updates: Partial<Product> = {};
  if (status) updates.status = status;
  if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
  if (isFlashDeal !== undefined) updates.isFlashDeal = Boolean(isFlashDeal);

  const updated = db.updateProduct(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Product not found.' });
  res.json(updated);
});

// ---------------- VITE & STATIC HANDLING ----------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[TradeNaija] Server listening on port ${PORT} (dev: ${isDev})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start TradeNaija server:', err);
  process.exit(1);
});
