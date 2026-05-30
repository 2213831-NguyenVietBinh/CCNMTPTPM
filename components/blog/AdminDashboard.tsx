"use client";

import { useState } from "react";
import Link from "next/link";
import {
  toggleUserRoleAction,
  adminDeletePostAction,
  adminDeleteCommentAction,
} from "@/app/actions";
import { Profile, Post, Comment } from "@/types";
import {
  Users,
  FileText,
  MessageSquare,
  Trash2,
  Search,
  Calendar,
  BarChart2,
  Eye,
  Shield,
  Loader2,
} from "lucide-react";

interface AdminDashboardProps {
  initialPosts: Post[];
  initialUsers: Profile[];
  initialComments: (Comment & { post?: { title: string; slug: string } | null })[];
  currentUserId: string;
}

export default function AdminDashboard({
  initialPosts,
  initialUsers,
  initialComments,
  currentUserId,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "users" | "comments">("posts");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [comments, setComments] = useState<(Comment & { post?: { title: string; slug: string } | null })[]>(
    initialComments
  );
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleToggleRole = async (targetUserId: string) => {
    if (targetUserId === currentUserId) {
      alert("Bạn không thể tự hạ quyền của chính mình.");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn thay đổi quyền của thành viên này không?")) return;

    setActionLoadingId(targetUserId);
    try {
      const result = await toggleUserRoleAction(targetUserId);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId
              ? { ...u, role: u.role === "admin" ? "author" : "admin" }
              : u
          )
        );
      } else {
        alert(result.error || "Cập nhật quyền thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi ngoài ý muốn.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này dưới tư cách Admin? Hành động này không thể phục hồi.")) return;

    setActionLoadingId(postId);
    try {
      const result = await adminDeletePostAction(postId);
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert(result.error || "Xóa bài viết thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi ngoài ý muốn.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;

    setActionLoadingId(commentId);
    try {
      const result = await adminDeleteCommentAction(commentId);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        alert(result.error || "Xóa bình luận thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi ngoài ý muốn.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter lists based on search query
  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredComments = comments.filter((c) =>
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    c.author?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Hệ thống Quản trị Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý toàn diện bài viết, phân quyền thành viên và kiểm duyệt các bình luận trên hệ thống.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-border/40 pb-4">
        <div className="flex bg-muted/65 p-1 rounded-xl border border-border/40 shrink-0 self-start">
          <button
            onClick={() => {
              setActiveTab("posts");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
              activeTab === "posts"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Bài viết ({posts.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
              activeTab === "users"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Thành viên ({users.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("comments");
              setSearch("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
              activeTab === "comments"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Bình luận ({comments.length})</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative flex-1 max-w-xs sm:self-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={
              activeTab === "posts"
                ? "Tìm theo tiêu đề..."
                : activeTab === "users"
                ? "Tìm tên thành viên..."
                : "Tìm theo nội dung..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-xs transition-all"
          />
        </div>
      </div>

      {/* TAB CONTENT: POSTS */}
      {activeTab === "posts" && (
        <div className="glass rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-card/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-4 px-6">Bài viết</th>
                  <th className="py-4 px-6">Tác giả</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-center">Lượt xem</th>
                  <th className="py-4 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-sm">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => {
                    const formattedDate = new Date(post.created_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <tr
                        key={post.id}
                        className={`hover:bg-muted/10 transition-colors ${
                          actionLoadingId === post.id ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div>
                            <h4 className="font-bold text-foreground line-clamp-1 max-w-[280px]">
                              {post.title}
                            </h4>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>Tạo ngày {formattedDate}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          {post.author?.full_name || "Tác giả ẩn danh"}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              post.status === "published"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}
                          >
                            {post.status === "published" ? "Đã đăng" : "Bản nháp"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-medium">
                          {post.view_count || 0}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              href={`/${post.slug}`}
                              className="p-2 text-foreground/80 hover:text-primary hover:bg-muted rounded-xl transition-all"
                              title="Xem bài viết"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={actionLoadingId !== null}
                              className="p-2 text-foreground/80 hover:text-destructive hover:bg-muted rounded-xl transition-all"
                              title="Xóa bài viết"
                            >
                              {actionLoadingId === post.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">
                      Không tìm thấy bài viết nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USERS */}
      {activeTab === "users" && (
        <div className="glass rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-card/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-4 px-6">Thành viên</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Ngày tham gia</th>
                  <th className="py-4 px-6 text-center">Quyền hạn</th>
                  <th className="py-4 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const formattedDate = new Date(user.created_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    const isSelf = user.id === currentUserId;

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-muted/10 transition-colors ${
                          actionLoadingId === user.id ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        <td className="py-4 px-6 font-bold">{user.full_name || "Ẩn danh"}</td>
                        <td className="py-4 px-6 font-mono text-xs">@{user.username}</td>
                        <td className="py-4 px-6 text-muted-foreground">{formattedDate}</td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              user.role === "admin"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            <span>{user.role === "admin" ? "Admin" : "Tác giả"}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {!isSelf ? (
                            <button
                              onClick={() => handleToggleRole(user.id)}
                              disabled={actionLoadingId !== null}
                              className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted font-semibold text-xs transition-all shadow-sm"
                            >
                              {actionLoadingId === user.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                `Đổi thành ${user.role === "admin" ? "Tác giả" : "Admin"}`
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Tài khoản của bạn</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">
                      Không tìm thấy thành viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMMENTS */}
      {activeTab === "comments" && (
        <div className="glass rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-card/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-4 px-6">Bình luận</th>
                  <th className="py-4 px-6">Bài viết gốc</th>
                  <th className="py-4 px-6">Tác giả</th>
                  <th className="py-4 px-6 text-center">Ngày tạo</th>
                  <th className="py-4 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-sm">
                {filteredComments.length > 0 ? (
                  filteredComments.map((comment) => {
                    const formattedDate = new Date(comment.created_at).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <tr
                        key={comment.id}
                        className={`hover:bg-muted/10 transition-colors ${
                          actionLoadingId === comment.id ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        <td className="py-4 px-6 max-w-[280px]">
                          <p className="line-clamp-2 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          {comment.post ? (
                            <Link href={`/${comment.post.slug}`} className="hover:text-primary transition-colors line-clamp-1 max-w-[200px]">
                              {comment.post.title}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground italic">Bài viết đã bị xóa</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {comment.author?.full_name || "Ẩn danh"}
                        </td>
                        <td className="py-4 px-6 text-center text-muted-foreground">
                          {formattedDate}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={actionLoadingId !== null}
                            className="p-2 text-foreground/80 hover:text-destructive hover:bg-muted rounded-xl transition-all"
                            title="Xóa bình luận"
                          >
                            {actionLoadingId === comment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">
                      Không tìm thấy bình luận nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
