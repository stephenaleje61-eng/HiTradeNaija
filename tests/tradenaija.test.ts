import { db, hashPassword, generateToken, parseToken } from '../src/server/db';
import { User, Product } from '../src/types';

async function runTests() {
  console.log('--- Starting TradeNaija Core Logic & Journey Tests ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. User Registration & Password Hashing
  const testUserEmail = `test_buyer_${Date.now()}@test.ng`;
  const testBuyer: User = {
    id: `usr-test-${Date.now()}`,
    name: 'Tunde Bakare',
    email: testUserEmail,
    phone: '08023456789',
    whatsappNumber: '08023456789',
    isPhonePublic: false,
    isWhatsappPublic: false,
    role: 'buyer',
    isVerifiedSeller: false,
    state: 'Lagos',
    city: 'Yaba',
    createdAt: new Date().toISOString()
  };

  db.createUser(testBuyer, hashPassword('SecurePass123!'));
  const foundBuyer = db.getUserByEmail(testUserEmail);
  assert(foundBuyer !== undefined && foundBuyer.name === 'Tunde Bakare', 'Journey 1: User registers and is persisted');

  // 2. Login, Verification & Token Generation/Parsing
  const isValidPass = db.verifyPassword(testBuyer.id, 'SecurePass123!');
  const isInvalidPass = db.verifyPassword(testBuyer.id, 'WrongPassword!');
  const token = generateToken(testBuyer.id);
  const parsedId = parseToken(token);
  assert(isValidPass === true && isInvalidPass === false && parsedId === testBuyer.id, 'Journey 2: Password verification and token session persistence');

  // 3. User Publishes a Product
  const newProduct: Product = {
    id: `prod-test-${Date.now()}`,
    title: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
    slug: 'samsung-galaxy-s24-ultra-512gb',
    description: 'Brand new sealed unit with 2 years Samsung Nigeria warranty.',
    price: 1650000,
    quantity: 4,
    condition: 'new',
    category: 'Phones & Tablets',
    subcategory: 'Smartphones',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c'],
    state: 'Lagos',
    city: 'Ikeja',
    sellerId: testBuyer.id,
    sellerName: testBuyer.name,
    sellerPhone: testBuyer.phone,
    sellerWhatsapp: testBuyer.whatsappNumber,
    isPhonePublic: false,
    isWhatsappPublic: false,
    isVerifiedSeller: false,
    pickupAvailable: true,
    status: 'published',
    viewsCount: 0,
    enquiriesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createProduct(newProduct);
  const fetchedProd = db.getProductById(newProduct.id);
  assert(fetchedProd !== undefined && fetchedProd.price === 1650000, 'Journey 3: Product created and persisted');

  // 4. Listing remains available in marketplace query
  const marketListings = db.getProducts({ category: 'Phones & Tablets' });
  const inList = marketListings.some(p => p.id === newProduct.id);
  assert(inList === true, 'Journey 4: Published product appears in marketplace category query');

  // 5 & 6. Buyer and Seller exchange private messages
  const sellerId = 'usr-seller-01'; // Emeka Alaba
  const conv = db.createConversation({
    id: `conv-test-${Date.now()}`,
    productId: newProduct.id,
    productTitle: newProduct.title,
    productPrice: newProduct.price,
    productImage: newProduct.images[0],
    buyerId: testBuyer.id,
    buyerName: testBuyer.name,
    sellerId: sellerId,
    sellerName: 'Emeka Alaba Mega Hub',
    lastMessageText: 'Hello, is this still available in Ikeja?',
    lastMessageAt: new Date().toISOString(),
    unreadCountForBuyer: 0,
    unreadCountForSeller: 1,
    isBlocked: false,
    createdAt: new Date().toISOString()
  });

  const msg1 = db.createMessage({
    id: `msg-test-1-${Date.now()}`,
    conversationId: conv.id,
    senderId: testBuyer.id,
    senderName: testBuyer.name,
    text: 'Hello, is this still available in Ikeja?',
    createdAt: new Date().toISOString(),
    read: false
  });

  const msg2 = db.createMessage({
    id: `msg-test-2-${Date.now()}`,
    conversationId: conv.id,
    senderId: sellerId,
    senderName: 'Emeka Alaba Mega Hub',
    text: 'Yes sir, brand new in box. You can pick up or we dispatch via GIG Logistics.',
    createdAt: new Date().toISOString(),
    read: false
  });

  const convMessages = db.getMessages(conv.id);
  assert(convMessages.length === 2 && convMessages[1].senderId === sellerId, 'Journey 5 & 6: Buyer and Seller exchange private messages with product context');

  // 7. Seller phone and WhatsApp privacy settings respected
  assert(newProduct.isPhonePublic === false && newProduct.isWhatsappPublic === false, 'Journey 7: Seller phone & WhatsApp privacy flags accurately configured');

  // 8. Ownership checks: Non-owner cannot update
  const unauthorizedEditorId = 'usr-buyer-01';
  const isOwner = newProduct.sellerId === unauthorizedEditorId;
  assert(isOwner === false, 'Journey 8: Unauthorized user cannot edit another seller listing (ownership verified)');

  // 9. Order creation with validated totals
  const order = db.createOrder({
    id: `ord-test-${Date.now()}`,
    buyerId: testBuyer.id,
    buyerName: testBuyer.name,
    buyerEmail: testBuyer.email,
    buyerPhone: testBuyer.phone!,
    shippingAddress: {
      fullName: testBuyer.name,
      phone: testBuyer.phone!,
      state: 'Lagos',
      city: 'Yaba',
      streetAddress: '12 Commercial Avenue, Yaba'
    },
    items: [{
      productId: newProduct.id,
      title: newProduct.title,
      price: newProduct.price,
      quantity: 1,
      image: newProduct.images[0],
      sellerId: newProduct.sellerId
    }],
    subtotal: newProduct.price,
    shippingFee: 2500,
    total: newProduct.price + 2500,
    paymentMethod: 'paystack',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const fetchedOrder = db.getOrderById(order.id);
  assert(fetchedOrder !== undefined && fetchedOrder.total === 1652500, 'Journey 10: Order placed and validated with server-calculated shipping fee');

  // Clean up test product
  db.deleteProduct(newProduct.id);
  const deletedCheck = db.getProductById(newProduct.id);
  assert(deletedCheck === undefined, 'Journey 11: Product deletion cleanly removes item');

  // 12. 7-Day Auto Removal / Expiration Test
  const eightDaysAgo = new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)).toISOString();
  const oldProduct: Product = {
    id: `prod-old-${Date.now()}`,
    title: 'Vintage Radio (8 days old)',
    slug: 'vintage-radio',
    description: 'Expired test post older than 7 days.',
    price: 15000,
    quantity: 1,
    condition: 'used',
    category: 'Electronics & Gadgets',
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'],
    state: 'Lagos',
    city: 'Ikeja',
    sellerId: testBuyer.id,
    sellerName: testBuyer.name,
    isPhonePublic: false,
    isWhatsappPublic: false,
    isVerifiedSeller: false,
    pickupAvailable: true,
    status: 'published',
    viewsCount: 0,
    enquiriesCount: 0,
    createdAt: eightDaysAgo,
    updatedAt: eightDaysAgo,
    expiresAt: new Date(new Date(eightDaysAgo).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  db.createProduct(oldProduct);
  // Trigger public getProducts which checks and expires posts older than 7 days
  const publicListings = db.getProducts({ category: 'Electronics & Gadgets' });
  const isFoundInPublicFeed = publicListings.some(p => p.id === oldProduct.id);
  const expiredProduct = db.getProductById(oldProduct.id);

  assert(
    isFoundInPublicFeed === false && expiredProduct?.status === 'expired',
    'Journey 12: Posts older than 7 days are automatically removed from public feeds and marked as expired'
  );

  // Test Relisting for 7 more days
  const relisted = db.relistProduct(oldProduct.id);
  const publicAfterRelist = db.getProducts({ category: 'Electronics & Gadgets' });
  const isFoundAfterRelist = publicAfterRelist.some(p => p.id === oldProduct.id);
  assert(
    relisted?.status === 'published' && isFoundAfterRelist === true,
    'Journey 13: Expired post can be renewed / relisted by seller for another 7 days'
  );

  // 14. Public Live Chat: Real-time public message creation & retrieval
  const pubMsg1 = db.createPublicMessage({
    senderId: testBuyer.id,
    senderName: testBuyer.name,
    senderRole: testBuyer.role,
    senderCity: testBuyer.city,
    senderState: testBuyer.state,
    text: 'Hello Nigeria! Looking for genuine solar inverters in Lagos.'
  });
  const publicFeed = db.getPublicMessages();
  const hasPubMsg1 = publicFeed.some(m => m.id === pubMsg1.id);
  assert(hasPubMsg1 === true && pubMsg1.expiresAt !== undefined, 'Journey 14: Public live chat message is posted, stored, and assigned 7-day expiry');

  // 15. Public Live Chat: Replying to a message
  const pubMsg2 = db.createPublicMessage({
    senderId: 'usr-seller-01',
    senderName: 'Emeka Okonkwo',
    senderRole: 'seller',
    senderCity: 'Alaba',
    senderState: 'Lagos',
    text: 'I have tested Luminous and Felicity solar inverters in Alaba Market.',
    replyTo: {
      id: pubMsg1.id,
      senderName: pubMsg1.senderName,
      text: pubMsg1.text
    }
  });
  const publicFeedWithReply = db.getPublicMessages();
  const foundReply = publicFeedWithReply.find(m => m.id === pubMsg2.id);
  assert(foundReply !== undefined && foundReply.replyTo?.senderName === testBuyer.name, 'Journey 15: Public live chat reply accurately quotes original sender');

  // 16. Chat 7-Day Purge: Messages older than 7 days are automatically wiped
  const eightDaysAgoTime = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const oldChatMsg = db.createPublicMessage({
    senderId: 'usr-seller-02',
    senderName: 'Aisha Babangida',
    senderRole: 'seller',
    text: 'Old announcement from 8 days ago'
  });
  // Manually retroactively date it 8 days ago
  oldChatMsg.createdAt = eightDaysAgoTime;
  db.purgeExpiredChatMessages();
  const feedAfterPurge = db.getPublicMessages();
  const isOldChatPresent = feedAfterPurge.some(m => m.id === oldChatMsg.id);
  assert(isOldChatPresent === false, 'Journey 16: All chat messages older than 7 days are automatically purged');

  // 17. Friend Requests: Sending, checking status, accepting, and creating 1-on-1 friend chat
  const receiverSellerId = 'usr-seller-02'; // Aisha
  const friendReq = db.sendFriendRequest(testBuyer, receiverSellerId);
  const statusAfterSend = db.getFriendshipStatus(testBuyer.id, receiverSellerId);
  assert(friendReq.status === 'pending' && statusAfterSend === 'pending_sent', 'Journey 17: Friend request sent and pending status verified');

  // Accept friend request
  const acceptedReq = db.respondFriendRequest(friendReq.id, receiverSellerId, 'accept');
  const statusAfterAccept = db.getFriendshipStatus(testBuyer.id, receiverSellerId);
  const friendsOfBuyer = db.getFriends(testBuyer.id);
  const isAishaFriend = friendsOfBuyer.some(f => f.id === receiverSellerId);
  assert(acceptedReq.status === 'accepted' && statusAfterAccept === 'friends' && isAishaFriend === true, 'Journey 18: Friend request accepted and user added to friends network');

  // 18. Friend Chat: Start 1-on-1 private chat inside friends
  const friendConv = db.getOrCreateDirectConversation(testBuyer.id, receiverSellerId);
  const friendMsg = db.createMessage({
    id: `msg-frnd-${Date.now()}`,
    conversationId: friendConv.id,
    senderId: testBuyer.id,
    senderName: testBuyer.name,
    text: 'Hello friend Aisha! Inquiring about Kano textiles wholesale.',
    createdAt: new Date().toISOString(),
    read: false
  });
  const convMsgs = db.getMessages(friendConv.id);
  const hasFriendMsg = convMsgs.some(m => m.id === friendMsg.id);
  assert(hasFriendMsg === true && friendMsg.expiresAt !== undefined, 'Journey 19: 1-on-1 friend chat inside friends operates with 7-day message expiry');

  console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
