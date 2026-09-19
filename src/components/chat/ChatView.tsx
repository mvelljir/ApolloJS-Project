import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  CheckCheck,
  ArrowLeft,
  Building2,
  Flag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/db';
import { Conversation, Message } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface ChatViewProps {
  initialRecipientId?: string;
  initialRecipientName?: string;
  initialJobTitle?: string;
  onOpenReport: (targetId: string, title: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialRecipientId,
  initialRecipientName,
  initialJobTitle,
  onOpenReport,
}) => {
  const { user, role } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileViewConversation, setMobileViewConversation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Real-time conversations list listener
  useEffect(() => {
    if (!user) return;
    setLoadingConversations(true);

    let unsubscribeConv: (() => void) | null = null;

    const setupChat = async () => {
      try {
        if (initialRecipientId && initialRecipientId !== user.uid) {
          const recipientUser = {
            uid: initialRecipientId,
            displayName: initialRecipientName || (role === 'jobSeeker' ? 'Hiring Team' : 'Candidate'),
            role: (role === 'jobSeeker' ? 'employer' : 'jobSeeker') as any,
          };

          const conv = await DatabaseService.createOrGetConversation(
            user,
            recipientUser,
            initialJobTitle
              ? {
                  jobId: 'job_ref',
                  jobTitle: initialJobTitle,
                  companyName: initialRecipientName || 'Employer',
                }
              : undefined
          );

          setActiveConversation(conv);
          setMobileViewConversation(true);
        }

        unsubscribeConv = DatabaseService.subscribeToConversations(user.uid, (convs) => {
          setConversations(convs);
          setLoadingConversations(false);
          // Default select first conversation if none selected
          if (!activeConversation && convs.length > 0 && !initialRecipientId) {
            setActiveConversation(convs[0]);
          }
        });
      } catch (err) {
        console.error('Failed to setup real-time chat conversations:', err);
        setLoadingConversations(false);
      }
    };

    setupChat();

    return () => {
      if (unsubscribeConv) unsubscribeConv();
    };
  }, [user, initialRecipientId]);

  // Real-time messages listener with cleanup
  useEffect(() => {
    if (!activeConversation || !user) return;
    setLoadingMessages(true);

    const unsubscribe = DatabaseService.subscribeToMessages(activeConversation.id, (msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 50);
      DatabaseService.markConversationRead(activeConversation.id, user.uid);
    });

    return () => {
      unsubscribe();
    };
  }, [activeConversation?.id, user?.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachmentUrl.trim()) || !activeConversation || !user) return;

    setSending(true);
    try {
      await DatabaseService.sendMessage(
        activeConversation.id,
        user,
        inputText.trim(),
        attachmentUrl.trim() || undefined
      );

      setInputText('');
      setAttachmentUrl('');
      setShowAttachmentInput(false);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const getPartnerInfo = (conv: Conversation) => {
    const partnerId = conv.participants.find((p) => p !== user?.uid) || '';
    const details = conv.participantDetails[partnerId];
    return {
      id: partnerId,
      name: details?.name || 'Recruitment Contact',
      role: details?.role,
      headline: details?.headline,
      photoURL: details?.photoURL,
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[78vh] min-h-[500px] flex">
        {/* Left Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
            mobileViewConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-base font-bold text-slate-900">Direct Messages</h2>
            <p className="text-xs text-slate-500">Secure end-to-end recruitment communications</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-200/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active conversations yet. Start a discussion from a job posting or applicant pipeline.
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = getPartnerInfo(conv);
                const isSelected = activeConversation?.id === conv.id;
                const isUnread =
                  user &&
                  conv.unreadCount &&
                  conv.unreadCount[user.uid] > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      setMobileViewConversation(true);
                    }}
                    className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                      isSelected ? 'bg-indigo-50/70 border-r-2 border-indigo-600' : 'hover:bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
                      {partner.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold truncate ${isUnread ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {partner.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {conv.jobContext && (
                        <p className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">
                          {conv.jobContext.jobTitle}
                        </p>
                      )}
                      <p className={`text-xs truncate mt-0.5 ${isUnread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                        {conv.lastMessageText}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Message Thread View */}
        <div
          className={`flex-1 flex flex-col bg-white ${
            !mobileViewConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileViewConversation(false)}
                    className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                    {getPartnerInfo(activeConversation).name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{getPartnerInfo(activeConversation).name}</h3>
                    <p className="text-xs text-slate-500">
                      {activeConversation.jobContext?.jobTitle || 'Employment Inquiries'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      onOpenReport(activeConversation.id, `Conversation with ${getPartnerInfo(activeConversation).name}`)
                    }
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Report Suspicious Behavior"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                {loadingMessages ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    This is the start of your verified conversation. Keep all interview interactions professional and safe.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          {msg.attachmentUrl && (
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 flex items-center gap-1.5 p-2 rounded-lg text-xs font-semibold underline ${
                                isMe ? 'bg-indigo-700/60 text-white' : 'bg-slate-100 text-indigo-700'
                              }`}
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>Shared Attachment / Portfolio Link</span>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? 'text-indigo-600' : 'text-slate-300'}`} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
                {showAttachmentInput && (
                  <div className="mb-2 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="Paste PDF link, portfolio URL, or Google Drive dossier..."
                      className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAttachmentInput(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Attach link"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !attachmentUrl.trim())}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={Building2}
                title="Select a conversation"
                description="Choose an existing message thread from the left or message a recruiter from a job posting."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
