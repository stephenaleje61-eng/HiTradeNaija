import { 
  User, Product, Category, Conversation, Message, Order, Notification, Review, AbuseReport, NigerianLocation,
  PublicChatMessage, FriendRequest 
} from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tradenaija_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || data.message || `Request failed (${response.status})`, response.status);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<{ user: User; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  login: (body: { email: string; password: string }) => request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  getMe: () => request<{ user: User }>('/auth/me'),
  updateProfile: (body: Partial<User>) => request<{ user: User }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  forgotPassword: (email: string) => request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  resetPassword: (body: { email: string; newPassword: string }) => request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  getSellers: () => request<User[]>('/auth/sellers'),
  getSellerProfile: (sellerId: string) => request<{ seller: any; products: Product[] }>(`/auth/seller/${sellerId}`),

  // Locations
  getLocations: () => request<NigerianLocation[]>('/locations'),

  // Products
  getProducts: (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    return request<{ products: Product[]; total: number; page: number; totalPages: number }>(`/products?${query.toString()}`);
  },
  getProductById: (id: string) => request<Product>(`/products/${id}`),
  createProduct: (body: any) => request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  updateProduct: (id: string, body: any) => request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  updateProductStatus: (id: string, status: string) => request<Product>(`/products/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  relistProduct: (id: string) => request<Product>(`/products/${id}/relist`, {
    method: 'POST'
  }),
  deleteProduct: (id: string) => request<{ message: string }>(`/products/${id}`, {
    method: 'DELETE'
  }),
  getMyListings: () => request<Product[]>('/seller/my-listings'),

  // Categories
  getCategories: () => request<(Category & { count: number })[]>('/categories'),

  // Conversations & Chat
  getConversations: () => request<Conversation[]>('/conversations'),
  startConversation: (productId: string, initialMessage?: string) => request<{ conversation: Conversation; message: Message }>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ productId, initialMessage })
  }),
  getMessages: (conversationId: string) => request<{ conversation: Conversation; messages: Message[] }>(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, text: string) => request<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text })
  }),
  reportConversation: (conversationId: string, body: { reason: string; details?: string; blockUser?: boolean }) => 
    request<{ message: string }>(`/conversations/${conversationId}/report`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  // Orders
  createOrder: (body: any) => request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  getOrders: (asSeller?: boolean) => request<Order[]>(`/orders${asSeller ? '?asSeller=true' : ''}`),
  getOrderById: (id: string) => request<Order>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Notifications
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, {
    method: 'PATCH'
  }),
  markAllNotificationsRead: () => request<{ success: boolean }>('/notifications/read-all', {
    method: 'POST'
  }),

  // Reviews
  getReviews: (productId: string) => request<Review[]>(`/reviews?productId=${productId}`),
  createReview: (body: { productId: string; rating: number; comment: string }) => request<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(body)
  }),

  // Reports
  submitReport: (body: any) => request<{ message: string }>('/reports', {
    method: 'POST',
    body: JSON.stringify(body)
  }),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: () => request<any[]>('/admin/users'),
  updateAdminUser: (id: string, body: any) => request<User>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  }),
  getAdminReports: () => request<AbuseReport[]>('/admin/reports'),
  updateAdminReport: (id: string, status: string) => request<AbuseReport>(`/admin/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  moderateProduct: (id: string, body: any) => request<Product>(`/admin/products/${id}/moderate`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  }),

  // Live Community Public Chat
  getPublicMessages: () => request<{ messages: PublicChatMessage[]; onlineCount: number }>('/chat/public'),
  sendPublicMessage: (text: string, replyTo?: { id: string; senderName: string; text: string }) => request<PublicChatMessage>('/chat/public', {
    method: 'POST',
    body: JSON.stringify({ text, replyTo })
  }),

  // Real-Time Online Presence & Heartbeat
  getOnlineStats: () => request<{ count: number; users: any[] }>('/chat/online'),
  sendHeartbeat: () => request<{ onlineCount: number; users: any[] }>('/chat/heartbeat', {
    method: 'POST'
  }),

  // Friend Requests & Friendships
  getFriendsData: () => request<{ friends: User[]; requests: { received: FriendRequest[]; sent: FriendRequest[] } }>('/friends'),
  getFriendshipStatus: (targetId: string) => request<{ status: 'friends' | 'pending_sent' | 'pending_received' | 'none' }>(`/friends/status/${targetId}`),
  sendFriendRequest: (receiverId: string) => request<FriendRequest>('/friends/request', {
    method: 'POST',
    body: JSON.stringify({ receiverId })
  }),
  respondFriendRequest: (requestId: string, action: 'accept' | 'decline') => request<{ success: boolean; request: FriendRequest }>('/friends/respond', {
    method: 'POST',
    body: JSON.stringify({ requestId, action })
  }),
  startFriendChat: (friendId: string) => request<{ conversation: Conversation }>('/friends/start-chat', {
    method: 'POST',
    body: JSON.stringify({ friendId })
  }),
  removeFriend: (friendId: string) => request<{ success: boolean }>(`/friends/${friendId}`, {
    method: 'DELETE'
  }),
  searchUsers: (query: string) => request<Partial<User>[]>(`/users/search?q=${encodeURIComponent(query)}`)
};
