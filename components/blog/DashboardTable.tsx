"use client";

import { useState } from "react";
import Link from "next/link";
import { deletePostAction } from "@/app/actions";
import { Post } from "@/types";
import { Edit3, Eye, Trash2, Search, Plus, Calendar, BarChart2 } from "lucide-react";

interface DashboardTableProps {
  initialPosts: Post[];
}

export default function DashboardTable({ initialPosts }: DashboardTableProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.")) return;

    setDeletingId(postId);
    try {
      const result = await deletePostAction(postId);
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert(result.error || "Xóa bài viết thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi ngoài ý muốn trong quá trình xóa.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || post.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bảng quản trị của bạn</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý, soạn thảo và theo dõi các bài viết cá nhân của bạn
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center space-x-1.5 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 text-sm shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Viết bài mới</span>
        </Link>
      </div>

      {/* Control panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all"
          />
        </div>

        {/* Status filters */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/40 shrink-0 self-start md:self-auto">
          {(["all", "published", "draft"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === status
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "all" ? "Tất cả" : status === "published" ? "Đã xuất bản" : "Bản nháp"}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="glass rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-card/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6">Chi tiết bài viết</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-center">Thống kê</th>
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
                        deletingId === post.id ? "opacity-40 pointer-events-none" : ""
                      }`}
                    >
                      {/* Post & Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted border border-border/30 shrink-0 relative">
                            {post.thumbnail_url ? (
                              <img
                                src={post.thumbnail_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-violet-950 to-indigo-950 flex items-center justify-center font-bold text-[8px] text-primary/30 uppercase">
                                Không ảnh
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-foreground truncate max-w-[280px] sm:max-w-[400px]">
                              {post.title}
                            </h4>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-0.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Đã tạo ngày {formattedDate}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            post.status === "published"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}
                        >
                          {post.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center space-x-1 text-xs text-muted-foreground font-semibold">
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>{post.view_count || 0} lượt xem</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/${post.slug}`}
                            className="p-2 text-foreground/80 hover:text-primary hover:bg-muted rounded-xl transition-all"
                            title="Xem bài viết"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </Link>
                          <Link
                            href={`/dashboard/posts/${post.id}/edit`}
                            className="p-2 text-foreground/80 hover:text-blue-500 hover:bg-muted rounded-xl transition-all"
                            title="Sửa bài viết"
                          >
                            <Edit3 className="w-4.5 h-4.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-foreground/80 hover:text-destructive hover:bg-muted rounded-xl transition-all"
                            title="Xóa bài viết"
                            disabled={deletingId !== null}
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">
                    Không tìm thấy bài viết nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
