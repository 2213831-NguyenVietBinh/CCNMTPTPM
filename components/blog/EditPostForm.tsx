"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updatePostAction } from "@/app/actions";
import { useFormState } from "react-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  FileText,
  Eye,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Post } from "@/types";

interface EditPostFormProps {
  post: Post;
  initialTags: string;
}

export default function EditPostForm({ post, initialTags }: EditPostFormProps) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [content, setContent] = useState(post.content || "");
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [status, setStatus] = useState(post.status);
  const [tags, setTags] = useState(initialTags);

  // Storage states
  const [uploading, setUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(post.thumbnail_url || "");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Markdown preview state
  const [previewMode, setPreviewMode] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // useFormState bound with postId
  const updatePostWithId = updatePostAction.bind(null, post.id);
  const [state, formAction] = useFormState(updatePostWithId, {
    success: false,
    error: null,
  });

  // Handle image upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Hình ảnh quá lớn. Kích thước tối đa là 2MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Tệp không hợp lệ. Vui lòng chọn một hình ảnh.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Không tìm thấy thông tin đăng nhập.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("post-thumbnails")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-thumbnails").getPublicUrl(filePath);

      setThumbnailUrl(publicUrl);
    } catch (err: any) {
      console.error("Storage upload error:", err);
      setUploadError(err?.message || "Không thể tải hình ảnh lên.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto w-full animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại Bảng quản trị</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Chỉnh sửa bài viết</h1>
        <p className="text-sm text-muted-foreground">
          Sửa đổi chi tiết bản nháp, điều chỉnh tóm tắt SEO, tải lên ảnh thu nhỏ và quản lý xuất bản
        </p>
      </div>

      {/* Server Action errors */}
      {state?.error && (
        <div className="flex items-center space-x-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Write form */}
      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Editor */}
        <div className="lg:col-span-2 space-y-6 glass p-6 rounded-2xl border border-border/40 bg-card/25 shadow-xl">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2"
            >
              Tiêu đề bài viết <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hướng dẫn chăm sóc Mèo con đúng cách"
              className="block w-full py-3 px-4 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-base font-semibold transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2"
            >
              Đường dẫn thân thiện (Slug) <span className="text-destructive">*</span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="huong-dan-cham-soc-meo-con"
              className="block w-full py-2.5 px-4 rounded-xl bg-background/50 border border-border text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Được dùng làm đường dẫn tĩnh: https://yoursite.com/<strong>{slug || "slug-placeholder"}</strong>
            </p>
          </div>

          {/* Excerpt Summary */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2"
            >
              Tóm tắt ngắn (Excerpt)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Viết mô tả ngắn hoặc tóm tắt nội dung bài viết để hiển thị trên thẻ bài viết..."
              className="block w-full py-2.5 px-4 rounded-xl bg-background/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          {/* Content (Editor with Preview Mode Toggle) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Nội dung chính <span className="text-muted-foreground">(Hỗ trợ định dạng Markdown)</span>
              </label>
              <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border/40">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1 transition-all ${
                    !previewMode ? "bg-card text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Soạn thảo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1 transition-all ${
                    previewMode ? "bg-card text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Xem trước</span>
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="w-full min-h-[300px] max-h-[500px] overflow-y-auto p-4 rounded-xl bg-background/30 border border-border/60 prose prose-sm">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic text-sm text-center py-10">
                    Chưa có nội dung xem trước. Hãy bắt đầu nhập văn bản trong ô soạn thảo.
                  </p>
                )}
              </div>
            ) : (
              <textarea
                id="content"
                name="content"
                rows={12}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Viết nội dung chia sẻ của bạn ở đây bằng định dạng markdown..."
                className="block w-full py-3 px-4 rounded-xl bg-background/50 border border-border text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all min-h-[300px]"
              />
            )}
          </div>
        </div>

        {/* Right Side: Sidebar Meta details */}
        <div className="space-y-6">
          {/* Status & Save panel */}
          <div className="glass p-6 rounded-2xl border border-border/40 bg-card/25 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">
              Thiết lập xuất bản
            </h3>

            {/* Status Selector */}
            <div>
              <label
                htmlFor="status"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2"
              >
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="block w-full py-2.5 px-3.5 rounded-xl bg-background border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="draft">Bản nháp (Riêng tư)</option>
                <option value="published">Xuất bản (Công khai)</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-lg shadow-primary/20"
            >
              Lưu bài viết
            </button>
          </div>

          {/* Thumbnail image upload panel */}
          <div className="glass p-6 rounded-2xl border border-border/40 bg-card/25 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">
              Ảnh thu nhỏ bài viết
            </h3>

            {/* Hidden Input to store upload URL */}
            <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

            {uploadError && (
              <div className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {thumbnailUrl ? (
              <div className="space-y-3">
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-muted border border-border/40 relative">
                  <img
                    src={thumbnailUrl}
                    alt="Ảnh thu nhỏ bài viết"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center space-x-1 text-xs text-green-500 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ảnh thu nhỏ đã sẵn sàng!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setThumbnailUrl("")}
                  className="text-xs text-destructive hover:underline font-semibold"
                >
                  Xóa ảnh
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-2xl py-6 px-4 text-center space-y-3 bg-background/20 relative">
                {uploading ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Đang tải ảnh lên...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">Tải lên ảnh thu nhỏ</p>
                      <p className="text-[10px] text-muted-foreground">Định dạng PNG, JPG, JPEG tối đa 2MB</p>
                    </div>
                    <label className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-muted text-foreground/80 hover:text-foreground text-xs font-semibold cursor-pointer border border-border hover:bg-muted-foreground/10 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn tệp</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tags management panel */}
          <div className="glass p-6 rounded-2xl border border-border/40 bg-card/25 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">
              Phân loại bài viết
            </h3>

            <div>
              <label
                htmlFor="tags"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-2"
              >
                Từ khóa / Thẻ (Phân tách bằng dấu phẩy)
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ví dụ: thu-cung, meo-con, cham-soc"
                className="block w-full py-2.5 px-4 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <p className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed">
                Nhập các từ khóa phân tách bằng dấu phẩy. Các thẻ sẽ tự động được đồng bộ và liên kết trong cơ sở dữ liệu.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
