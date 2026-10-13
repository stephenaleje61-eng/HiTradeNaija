import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Send, ShieldAlert, Flag, Ban, 
  ArrowLeft, Store, ShieldCheck, CheckCheck, Clock,
  Users, UserPlus, UserCheck, RefreshCw, Radio, 
  Search, Smile, X, Check, MessageCircle, AlertCircle
} from 'lucide-react';
import { Conversation, Message, PublicChatMessage, FriendRequest, User } from '../types';
import { formatNaira } from '../data/nigeria-data';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

interface MessagesPageProps {
  navigate: (route: string) => void;
  initialConversationId?: string;
  initialTab?: 'public' | 'direct' | 'friends';
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  navigate,
  initialConversationId,
  initialTab
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  // Tab State
  const [activeTab, setActiveTab] = useState<'public' | 'direct' | 'friends'>(() => {
    if (initialConversationId) return 'direct';
    if (initialTab) return initialTab;
    return 'public';
  });

  // Public Live Chat States
  const [publicMessages, setPublicMessages] = useState<PublicChatMessage[]>([]);
  const [publicInput, setPublicInput] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; senderName: string; text: string } | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [sendingPublic, setSendingPublic] = useState(false);
  const publicMessagesEndRef = useRef<HTMLDivElement>(null);

  // Direct Conversations States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [directMessages, setDirectMessages] = useState<Message[]>([]);
  const [directInput, setDirectInput] = useState('');
  const [loadingDirect, setLoadingDirect] = useState(false);
  const [sendingDirect, setSendingDirect] = useState(false);
  const directMessagesEndRef = useRef<HTMLDivElement>(null);

  // Friends States
  const [friends, setFriends] = useState<User[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<User>[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [friendshipStatuses, setFriendshipStatuses] = useState<Record<string, string>>({});
  const [processingFriendId, setProcessingFriendId] = useState<string | null>(null);

  // Common UI
  const [reportModalData, setReportModalData] = useState<{
    targetType: 'message' | 'user';
    targetId: string;
    targetName: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState('Suspicious behavior / Scam attempt');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Require Auth
  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please sign in to access TradeNaija Live Chat and messaging.', 'info');
      navigate('/auth?redirect=/messages');
    }
  }, [isAuthenticated, navigate, showToast]);

  // ---------------- PUBLIC LIVE CHAT LOGIC ----------------
  const loadPublicMessages = useCallback(async () => {
    try {
      const res = await api.getPublicMessages();
      setPublicMessages(res.messages || []);
      if (res.onlineCount) {
        setOnlineCount(res.onlineCount);
      }
    } catch (err) {
      console.error('Failed to load public messages:', err);
    }
  }, []);

  // Real-Time SSE Stream Setup
  useEffect(() => {
    if (!isAuthenticated) return;

    loadPublicMessages();

    // Establish Server-Sent Events (SSE) connection
    const token = localStorage.getItem('tradenaija_token') || '';
    const sseUrl = `/api/chat/events?token=${encodeURIComponent(token)}`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.onlineCount) setOnlineCount(payload.onlineCount);
          if (payload.onlineUsers) setOnlineUsers(payload.onlineUsers);
        } catch {
          // ignore parsing error
        }
      });

      eventSource.addEventListener('public_message', (e: MessageEvent) => {
        try {
          const newMsg: PublicChatMessage = JSON.parse(e.data);
          setPublicMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        } catch {
          // ignore parsing error
        }
      });

      eventSource.addEventListener('online_count', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.count) setOnlineCount(payload.count);
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener('direct_message', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (activeConversation && payload.conversationId === activeConversation.id) {
            setDirectMessages(prev => {
              if (prev.some(m => m.id === payload.message.id)) return prev;
              return [...prev, payload.message];
            });
          }
          // Refresh conversation list to show unread badges
          loadConversations();
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener('friend_request', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.receiverId === user?.id) {
            showToast(`New friend request from ${payload.request.senderName}!`, 'info');
            loadFriendsData();
          }
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener('friend_accepted', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.user1Id === user?.id || payload.user2Id === user?.id) {
            showToast('Friend connection established!', 'success');
            loadFriendsData();
          }
        } catch {
          // ignore
        }
      });

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch (err) {
      console.warn('SSE not initialized, relying on fast polling:', err);
    }

    // Reliable fast polling fallback (every 2.5s) to guarantee zero message drop
    const pollInterval = setInterval(() => {
      loadPublicMessages();
      api.sendHeartbeat().then(res => {
        if (res.onlineCount) setOnlineCount(res.onlineCount);
        if (res.users) setOnlineUsers(res.users);
      }).catch(() => {});
    }, 2500);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }, [isAuthenticated, user?.id, activeConversation?.id, loadPublicMessages]);

  // Scroll to bottom on new public messages
  useEffect(() => {
    if (activeTab === 'public') {
      publicMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [publicMessages, activeTab]);

  // Send Public Live Message
  const handleSendPublicMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicInput.trim() || sendingPublic) return;

    const textToSend = publicInput.trim();
    const currentReply = replyTarget;

    setPublicInput('');
    setReplyTarget(null);
    setSendingPublic(true);

    try {
      const created = await api.sendPublicMessage(textToSend, currentReply || undefined);
      // Optimistic update
      setPublicMessages(prev => {
        if (prev.some(m => m.id === created.id)) return prev;
        return [...prev, created];
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to send live chat message.', 'error');
      // Restore input on failure
      setPublicInput(textToSend);
      setReplyTarget(currentReply);
    } finally {
      setSendingPublic(false);
    }
  };

  // ---------------- DIRECT MESSAGING LOGIC ----------------
  const loadConversations = useCallback(async (autoSelectId?: string) => {
    if (!isAuthenticated) return;
    try {
      const list = await api.getConversations();
      setConversations(list);

      const targetId = autoSelectId || initialConversationId;
      if (targetId) {
        const found = list.find(c => c.id === targetId);
        if (found) {
          setActiveConversation(found);
        } else if (list.length > 0 && !activeConversation) {
          setActiveConversation(list[0]);
        }
      } else if (list.length > 0 && !activeConversation) {
        setActiveConversation(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [isAuthenticated, initialConversationId, activeConversation]);

  useEffect(() => {
    loadConversations();
  }, [isAuthenticated, loadConversations]);

  const loadActiveMessages = useCallback(async () => {
    if (!activeConversation) return;
    try {
      const res = await api.getMessages(activeConversation.id);
      setDirectMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load direct messages:', err);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (activeConversation) {
      loadActiveMessages();
      const directPoll = setInterval(loadActiveMessages, 2500);
      return () => clearInterval(directPoll);
    }
  }, [activeConversation?.id, loadActiveMessages]);

  useEffect(() => {
    if (activeTab === 'direct') {
      directMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [directMessages, activeTab]);

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInput.trim() || !activeConversation || sendingDirect) return;

    const textToSend = directInput.trim();
    setDirectInput('');
    setSendingDirect(true);

    try {
      const newMsg = await api.sendMessage(activeConversation.id, textToSend);
      setDirectMessages(prev => [...prev, newMsg]);
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConversation.id
            ? { ...c, lastMessageText: textToSend, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to send direct message.', 'error');
      setDirectInput(textToSend);
    } finally {
      setSendingDirect(false);
    }
  };

  // ---------------- FRIENDS LOGIC ----------------
  const loadFriendsData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getFriendsData();
      setFriends(data.friends || []);
      setReceivedRequests(data.requests?.received || []);
      setSentRequests(data.requests?.sent || []);
    } catch (err) {
      console.error('Failed to load friends data:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFriendsData();
    }
  }, [isAuthenticated, loadFriendsData]);

  // Send Friend Request
  const handleSendFriendRequest = async (targetUserId: string, targetUserName: string) => {
    if (!isAuthenticated || targetUserId === user?.id) return;
    try {
      setProcessingFriendId(targetUserId);
      await api.sendFriendRequest(targetUserId);
      showToast(`Friend request sent to ${targetUserName}!`, 'success');
      setFriendshipStatuses(prev => ({ ...prev, [targetUserId]: 'pending_sent' }));
      loadFriendsData();
    } catch (err: any) {
      showToast(err.message || 'Failed to send friend request.', 'error');
    } finally {
      setProcessingFriendId(null);
    }
  };

  // Respond to Friend Request (Accept or Decline)
  const handleRespondFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setProcessingFriendId(requestId);
      await api.respondFriendRequest(requestId, action);
      if (action === 'accept') {
        showToast('Friend request accepted! You can now chat directly.', 'success');
      } else {
        showToast('Friend request declined.', 'info');
      }
      loadFriendsData();
    } catch (err: any) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setProcessingFriendId(null);
    }
  };

  // Start 1-on-1 Chat with Friend
  const handleStartFriendChat = async (friendId: string) => {
    try {
      setLoadingDirect(true);
      const res = await api.startFriendChat(friendId);
      if (res.conversation) {
        await loadConversations(res.conversation.id);
        setActiveConversation(res.conversation);
        setActiveTab('direct');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to open friend chat.', 'error');
    } finally {
      setLoadingDirect(false);
    }
  };

  // Search Registered Users
  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSearchQuery.trim()) return;
    try {
      setSearchingUsers(true);
      const results = await api.searchUsers(userSearchQuery.trim());
      setSearchResults(results);
    } catch (err: any) {
      showToast(err.message || 'Failed to search users.', 'error');
    } finally {
      setSearchingUsers(false);
    }
  };

  // Submit Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalData) return;
    try {
      setSubmittingReport(true);
      await api.submitReport({
        targetType: reportModalData.targetType,
        targetId: reportModalData.targetId,
        targetTitleOrName: reportModalData.targetName,
        reason: reportReason,
        details: reportDetails
      });
      showToast('Thank you. Report dispatched to TradeNaija safety operations.', 'success');
      setReportModalData(null);
      setReportDetails('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Formatting helpers
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getDaysLeft = (createdAt: string) => {
    try {
      const created = new Date(createdAt).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const msLeft = sevenDays - (Date.now() - created);
      const days = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
      return Math.max(1, days);
    } catch {
      return 7;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-110px)] min-h-[620px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Top Header & Navigation Bar */}
        <div className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇳🇬</span>
                <h1 className="text-base sm:text-lg font-black text-slate-900">
                  TradeNaija Chat & Community
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Room
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Connect with verified Nigerian buyers, sellers, and friends • Auto-removes every 7 days
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                activeTab === 'public'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Public Live Chat</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'public' ? 'bg-orange-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {onlineCount} online
              </span>
            </button>

            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                activeTab === 'friends'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Friends</span>
              {receivedRequests.length > 0 && (
                <span className="text-[10px] bg-red-500 text-white font-black px-1.5 py-0.2 rounded-full animate-bounce">
                  {receivedRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('direct')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                activeTab === 'direct'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Chats</span>
              {conversations.some(c => (c.buyerId === user?.id ? c.unreadCountForBuyer : c.unreadCountForSeller) > 0) && (
                <span className="w-2 h-2 rounded-full bg-orange-500" />
              )}
            </button>
          </div>
        </div>

        {/* ================= TAB 1: PUBLIC LIVE CHAT ================= */}
        {activeTab === 'public' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
            {/* Live Chat Sub-header */}
            <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-800">Naija Community Public Feed</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Real-time updates without refreshing</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOnlineModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition text-[11px]"
                >
                  <Users className="w-3 h-3 text-emerald-600" />
                  <span>{onlineCount} Users Online</span>
                </button>
                <button
                  onClick={loadPublicMessages}
                  className="p-1 text-slate-400 hover:text-slate-600 transition"
                  title="Refresh feed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 7-Day Purge Warning Banner */}
            <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-900 shrink-0">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Notice: All public and private chat messages automatically expire and clear every 7 days.</span>
              </span>
              <span className="font-bold text-amber-700 hidden sm:inline">Active Policy: 7-Day Clean</span>
            </div>

            {/* Public Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {publicMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                    <Radio className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="font-black text-slate-800 text-base">Welcome to TradeNaija Live Chat!</h3>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    No public messages yet in the last 7 days. Be the first Nigerian buyer or merchant to introduce yourself, broadcast your offers, or ask questions!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-3 font-semibold">
                    All registered users see your message instantly across Nigeria.
                  </p>
                </div>
              ) : (
                publicMessages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  const isFriend = friends.some(f => f.id === msg.senderId);
                  const isPending = friendshipStatuses[msg.senderId] === 'pending_sent';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col group ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender Meta Header */}
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500 px-1">
                        <span className="font-bold text-slate-900">
                          {isMine ? 'You' : msg.senderName}
                        </span>
                        {msg.senderRole === 'admin' && (
                          <span className="bg-purple-100 text-purple-800 font-black text-[9px] px-1.5 py-0.2 rounded-sm uppercase">
                            Admin
                          </span>
                        )}
                        {msg.senderRole === 'seller' && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-1.5 py-0.2 rounded-sm flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Seller
                          </span>
                        )}
                        {msg.senderCity && (
                          <span className="text-slate-400 text-[10px]">
                            • {msg.senderCity}, {msg.senderState || 'Nigeria'}
                          </span>
                        )}
                        <span className="text-slate-400 text-[10px]">• {formatTime(msg.createdAt)}</span>
                        <span className="text-amber-600/80 text-[10px] font-medium" title="7-day auto-purge countdown">
                          ({getDaysLeft(msg.createdAt)}d left)
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs text-xs sm:text-sm break-words ${
                          isMine
                            ? 'bg-orange-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        }`}
                      >
                        {/* Reply Banner Quote if applicable */}
                        {msg.replyTo && (
                          <div
                            className={`mb-2 p-2 rounded-xl text-xs border-l-3 ${
                              isMine
                                ? 'bg-orange-700/60 border-white text-white/90'
                                : 'bg-slate-100 border-orange-500 text-slate-600'
                            }`}
                          >
                            <span className="font-black text-[11px] block">
                              Replying to {msg.replyTo.senderName}:
                            </span>
                            <span className="italic line-clamp-2 text-[11px]">
                              "{msg.replyTo.text}"
                            </span>
                          </div>
                        )}

                        {/* Main Message Text */}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Action Bar (Reply, Add Friend, Private Chat, Report) */}
                      <div className="flex items-center gap-3 mt-1 px-1 text-[11px] text-slate-400 opacity-90 transition">
                        <button
                          onClick={() => setReplyTarget({ id: msg.id, senderName: msg.senderName, text: msg.text })}
                          className="hover:text-orange-600 font-semibold flex items-center gap-1 transition"
                        >
                          <span>Reply</span>
                        </button>

                        {!isMine && (
                          <>
                            <span>•</span>
                            {isFriend ? (
                              <button
                                onClick={() => handleStartFriendChat(msg.senderId)}
                                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Friend Chat</span>
                              </button>
                            ) : isPending ? (
                              <span className="text-slate-400 italic">Request Pending</span>
                            ) : (
                              <button
                                onClick={() => handleSendFriendRequest(msg.senderId, msg.senderName)}
                                disabled={processingFriendId === msg.senderId}
                                className="hover:text-emerald-600 font-bold flex items-center gap-1 transition"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>Add Friend</span>
                              </button>
                            )}

                            <span>•</span>
                            <button
                              onClick={() => setReportModalData({
                                targetType: 'message',
                                targetId: msg.id,
                                targetName: `Message by ${msg.senderName}`
                              })}
                              className="hover:text-red-600 font-medium transition"
                              title="Report message to safety team"
                            >
                              Report
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={publicMessagesEndRef} />
            </div>

            {/* Reply Target Preview Banner */}
            {replyTarget && (
              <div className="bg-orange-50 border-t border-orange-200 px-4 py-2 flex items-center justify-between text-xs text-orange-950 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-black text-orange-700">Replying to @{replyTarget.senderName}:</span>
                  <span className="italic truncate text-slate-600 max-w-sm">"{replyTarget.text}"</span>
                </div>
                <button
                  onClick={() => setReplyTarget(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Public Live Chat Input Footer */}
            <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0">
              {/* Quick Nigerian Emojis */}
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 text-base">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick:</span>
                {['🇳🇬', '👍', '🔥', '🤝', '💰', '📦', '🙏', '✨', '💯'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setPublicInput(prev => prev + emoji)}
                    className="hover:scale-125 transition px-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendPublicMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={publicInput}
                  onChange={(e) => setPublicInput(e.target.value)}
                  placeholder={
                    replyTarget
                      ? `Replying to @${replyTarget.senderName}...`
                      : "Type a live message to everyone in Nigeria... (Press Enter)"
                  }
                  maxLength={1000}
                  className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 focus:border-orange-500 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!publicInput.trim() || sendingPublic}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-black px-4 sm:px-6 py-3 rounded-2xl transition flex items-center gap-2 text-xs sm:text-sm shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
                <span>🟢 Messages broadcast in real-time across Nigeria</span>
                <span>{publicInput.length}/1000 • 7-day retention</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: FRIENDS & CONNECTIONS ================= */}
        {activeTab === 'friends' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
            {/* Left Column: My Friends List */}
            <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>My Friends & Connections ({friends.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Directly chat with your trusted trading network. All chats cleared after 7 days.
                  </p>
                </div>
                <button
                  onClick={loadFriendsData}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  title="Refresh Friends"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {friends.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-auto">
                  <UserPlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No friends added yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Connect with fellow traders by searching below or sending friend requests directly in the Public Live Chat!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-3.5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-orange-300 transition flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black text-sm shrink-0">
                          {friend.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {friend.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {friend.storeName || friend.role.toUpperCase()} • {friend.city || 'Nigeria'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartFriendChat(friend.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Requests & User Discovery */}
            <div className="w-full md:w-96 flex flex-col min-h-0 p-4 sm:p-6 overflow-y-auto bg-slate-50/50">
              {/* Incoming Requests */}
              <div className="mb-6">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-3 flex items-center justify-between">
                  <span>Incoming Friend Requests</span>
                  <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                    {receivedRequests.length}
                  </span>
                </h3>

                {receivedRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No incoming requests</p>
                ) : (
                  <div className="space-y-2.5">
                    {receivedRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                            {req.senderName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{req.senderName}</span>
                            <span className="text-[10px] text-slate-400">{req.senderCity || 'Nigeria'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespondFriendRequest(req.id, 'accept')}
                            disabled={processingFriendId === req.id}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-xl transition flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRespondFriendRequest(req.id, 'decline')}
                            disabled={processingFriendId === req.id}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 rounded-xl transition flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Find & Search Registered Users */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-2">
                  Discover Traders & Users
                </h3>
                <form onSubmit={handleUserSearch} className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search name, store, city..."
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-orange-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={searchingUsers || !userSearchQuery.trim()}
                    className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((u) => {
                      const isFriend = friends.some(f => f.id === u.id);
                      return (
                        <div
                          key={u.id}
                          className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">{u.storeName || u.role} • {u.city}</span>
                          </div>
                          {isFriend ? (
                            <span className="text-[11px] text-emerald-600 font-bold">Friends</span>
                          ) : (
                            <button
                              onClick={() => handleSendFriendRequest(u.id!, u.name!)}
                              disabled={processingFriendId === u.id}
                              className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-2.5 py-1 rounded-lg transition"
                            >
                              Add Friend
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: DIRECT BUYER/SELLER & FRIEND CHATS ================= */}
        {activeTab === 'direct' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
            {/* Conversations Sidebar List */}
            <div className="w-full md:w-80 flex flex-col min-h-0 bg-slate-50/50">
              <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Active Conversations ({conversations.length})
                </span>
                <span className="text-[10px] text-slate-400">7-Day Expiry</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">No direct messages yet</p>
                    <p className="mt-1">Inquire on any marketplace listing or chat with your friends.</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = activeConversation?.id === conv.id;
                    const otherName = conv.buyerId === user?.id ? conv.sellerName : conv.buyerName;
                    const unread = conv.buyerId === user?.id ? conv.unreadCountForBuyer : conv.unreadCountForSeller;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className={`p-3.5 cursor-pointer transition flex items-center gap-3 ${
                          isSelected ? 'bg-orange-50/80 border-l-4 border-orange-600' : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200 relative">
                          {conv.productImage ? (
                            <img src={conv.productImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                              {otherName.charAt(0)}
                            </div>
                          )}
                          {unread > 0 && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-black text-slate-900 truncate">{otherName}</h4>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-orange-700 font-bold truncate">
                            {conv.productTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {conv.lastMessageText || 'Chat started'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Direct Conversation Main View */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
              {activeConversation ? (
                <>
                  {/* Chat Top Banner with Product Context */}
                  <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {activeConversation.productId !== 'direct-chat' && (
                        <img
                          src={activeConversation.productImage}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                            {activeConversation.buyerId === user?.id ? activeConversation.sellerName : activeConversation.buyerName}
                          </h3>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded-md font-bold">
                            Direct Room
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {activeConversation.productTitle} {activeConversation.productPrice > 0 && `• ${formatNaira(activeConversation.productPrice)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setReportModalData({
                          targetType: 'message',
                          targetId: activeConversation.id,
                          targetName: `Chat with ${activeConversation.buyerId === user?.id ? activeConversation.sellerName : activeConversation.buyerName}`
                        })}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                        title="Report Conversation"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Safety Alert in Direct Chats */}
                  <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-1.5 text-[11px] text-emerald-800 flex items-center justify-between shrink-0">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>TradeNaija Safety: Inspect goods before payment. Chats are auto-removed after 7 days.</span>
                    </span>
                  </div>

                  {/* Direct Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                    {directMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                        <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="font-bold text-slate-700">Start the conversation</p>
                        <p>Ask about availability, delivery options, or inspection terms.</p>
                      </div>
                    ) : (
                      directMessages.map((msg) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                              <span>{isMine ? 'You' : msg.senderName}</span>
                              <span>•</span>
                              <span>{formatTime(msg.createdAt)}</span>
                            </div>

                            <div
                              className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs break-words ${
                                isMine
                                  ? 'bg-orange-600 text-white rounded-tr-xs'
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={directMessagesEndRef} />
                  </div>

                  {/* Direct Message Input */}
                  <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
                    <form onSubmit={handleSendDirectMessage} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={directInput}
                        onChange={(e) => setDirectInput(e.target.value)}
                        placeholder="Type your message here..."
                        maxLength={1000}
                        className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl bg-slate-100 focus:bg-white border border-slate-200 focus:border-orange-500 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!directInput.trim() || sendingDirect}
                        className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition flex items-center gap-2"
                      >
                        <span>Send</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 text-xs">
                  <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">Select a Conversation</p>
                  <p className="mt-1">Choose a conversation from the left to view messages and trade safely.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Online Users Modal */}
      {showOnlineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-black text-slate-900 text-sm">Active Online Members ({onlineCount})</h3>
              </div>
              <button
                onClick={() => setShowOnlineModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Real-time online presence tracked across Nigeria. Registered members appear with their trade status.
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {onlineUsers.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  {onlineCount} member(s) actively browsing TradeNaija
                </p>
              ) : (
                onlineUsers.map((u) => (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.city ? `${u.city}, ${u.state}` : 'Nigeria'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Online
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowOnlineModal(false)}
              className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Safety Report Modal */}
      {reportModalData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl animate-in fade-in">
            <h3 className="font-black text-slate-900 text-base mb-1 flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-5 h-5" />
              <span>Report to TradeNaija Safety</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Reporting: <strong className="text-slate-800">{reportModalData.targetName}</strong>
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                >
                  <option value="Suspicious behavior / Scam attempt">Suspicious behavior / Scam attempt</option>
                  <option value="Harassment or inappropriate message">Harassment or inappropriate message</option>
                  <option value="Fake goods or deceptive product details">Fake goods or deceptive product details</option>
                  <option value="Requesting payment outside platform without inspection">Requesting payment outside platform without inspection</option>
                  <option value="Spam / Advertisements">Spam / Advertisements</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional details (optional)</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide context so our Nigerian trust desk can take swift action..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalData(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
