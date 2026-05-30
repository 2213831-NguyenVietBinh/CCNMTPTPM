"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Comment, Profile } from "@/types";
import { Send, Trash2, MessageSquare, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
}

export default function CommentSection({ postId, postAuthorId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 1. Check user status
    const checkUser = async () => {
      const {
        data: { user: activeUser },
      } = await supabase.auth.getUser();
      setUser(activeUser);
    };
    checkUser();

    // 2. Fetch initial comments
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*, author:profiles(*)")
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setComments((data as Comment[]) || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();

    // 3. Realtime Subscription
    const channel = supabase
      .channel(`post-comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch author profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", payload.new.author_id)
              .single();

            const newComment: Comment = {
              id: payload.new.id,
              post_id: payload.new.post_id,
              author_id: payload.new.author_id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              author: (profile as Profile) || undefined,
            };

            setComments((prev) => {
              // Prevent duplicates
              if (prev.some((c) => c.id === newComment.id)) return prev;
              return [...prev, newComment];
            });
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCommentText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: user.id,
        content: newCommentText.trim(),
      });

      if (error) throw error;
      setNewCommentText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;

    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCommentText(e.target.value);
    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t border-border/40 pt-10 mt-12 space-y-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">
          Bình luận ({comments.length})
        </h2>
      </div>

      {/* Input box */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex space-x-3 items-start animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary uppercase shrink-0">
            {user.email?.substring(0, 2) || "AD"}
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={newCommentText}
              onChange={handleInput}
              placeholder="Viết bình luận..."
              className="w-full resize-none min-h-[44px] py-2.5 px-4 rounded-xl bg-card border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                className="flex items-center space-x-1.5 py-1.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 disabled:opacity-50 transition-all shadow-md"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Gửi</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl glass text-center space-y-3 max-w-md mx-auto animate-fade-in">
          <p className="text-sm text-muted-foreground font-medium">
            Tham gia cuộc trò chuyện! Vui lòng đăng nhập để viết bình luận.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all shadow-md"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập để bình luận</span>
          </Link>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-6 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => {
              const formattedDate = new Date(comment.created_at).toLocaleString("vi-VN", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });

              const isOwner = user && (user.id === comment.author_id || user.id === postAuthorId);

              return (
                <div
                  key={comment.id}
                  className="flex space-x-3 items-start p-4 rounded-2xl bg-card/40 border border-border/20 hover:border-border/40 transition-all duration-200 group animate-fade-in"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs uppercase text-foreground/80 shrink-0">
                    {comment.author?.full_name?.substring(0, 2) || "AD"}
                  </div>

                  {/* Body */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-foreground">
                          {comment.author?.full_name || "Ẩn danh"}
                        </span>
                        {comment.author_id === postAuthorId && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Tác giả
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {formattedDate}
                        </span>
                      </div>

                      {isOwner && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                          title="Xóa bình luận"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên bắt đầu cuộc thảo luận!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
