import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Search, Calendar, User, Eye, ArrowRight, Tag as TagIcon } from "lucide-react";
import Image from "next/image";

interface PageProps {
  searchParams: {
    q?: string;
    tag?: string;
  };
}

export default async function BlogHomepage({ searchParams }: PageProps) {
  const query = searchParams.q || "";
  const tagFilter = searchParams.tag || "";

  let posts: any[] = [];
  let tags: string[] = [];
  let errorMsg: string | null = null;

  try {
    const supabase = createClient();

    // 1. Fetch published posts
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(*),
        post_tags(
          tag:tags(*)
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    posts = data || [];

    // 2. Extract unique tags for sidebar filter
    const allTags = posts.flatMap((p) =>
      p.post_tags?.map((pt: any) => pt.tag?.name).filter(Boolean)
    );
    tags = Array.from(new Set(allTags));

    // 3. Filter posts based on search query and tag
    if (query) {
      const lowerQuery = query.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.excerpt?.toLowerCase().includes(lowerQuery) ||
          p.content?.toLowerCase().includes(lowerQuery)
      );
    }

    if (tagFilter) {
      posts = posts.filter((p) =>
        p.post_tags?.some((pt: any) => pt.tag?.name === tagFilter)
      );
    }
  } catch (err: any) {
    console.error("Error fetching homepage posts:", err);
    errorMsg = "Không thể kết nối cơ sở dữ liệu bài viết lúc này. Vui lòng kiểm tra cấu hình Supabase của bạn.";
  }

  return (
    <div className="space-y-10 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto py-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Khám Phá Thế Giới <span className="text-gradient">&amp; Đời Sống Thú Cưng</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
          Chào mừng đến với trang chia sẻ kiến thức, kinh nghiệm và những câu chuyện thú vị về chăm sóc thú cưng.
        </p>

        {/* Search Bar */}
        <form action="/" method="GET" className="max-w-md mx-auto pt-4 relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Tìm kiếm bài viết..."
              className="block w-full pl-11 pr-24 py-3.5 rounded-2xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm shadow-md"
            />
            {tagFilter && <input type="hidden" name="tag" value={tagFilter} />}
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all shadow-sm"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </section>

      {/* Filter Chips */}
      {tags.length > 0 && (
        <section className="flex flex-wrap items-center justify-center gap-2 py-2">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !tagFilter
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/60 hover:bg-muted text-foreground/80"
            }`}
          >
            Tất cả Thẻ
          </Link>
          {tags.map((t) => (
            <Link
              key={t}
              href={query ? `/?q=${encodeURIComponent(query)}&tag=${encodeURIComponent(t)}` : `/?tag=${encodeURIComponent(t)}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1 ${
                tagFilter === t
                  ? "bg-primary text-primary-foreground border-primary animate-pulse"
                  : "bg-card border-border/60 hover:bg-muted text-foreground/80"
              }`}
            >
              <TagIcon className="w-3 h-3" />
              <span>{t}</span>
            </Link>
          ))}
        </section>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-center max-w-lg mx-auto font-medium">
          {errorMsg}
        </div>
      )}

      {/* Posts Section */}
      {!errorMsg && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length > 0 ? (
            posts.map((post) => {
              const formattedDate = new Date(post.created_at).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <article
                  key={post.id}
                  className="group flex flex-col glass rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full relative"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/9] w-full relative overflow-hidden bg-muted border-b border-border/20">
                    {post.thumbnail_url ? (
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-indigo-900/40 flex items-center justify-center font-bold text-primary/30 uppercase tracking-widest text-lg">
                        Không có ảnh
                      </div>
                    )}

                    {/* Tag Badge overlay */}
                    {post.post_tags && post.post_tags[0] && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                        {post.post_tags[0].tag?.name}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Meta */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground font-medium mb-3.5">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{post.view_count || 0} lượt xem</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      <Link href={`/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-sm text-foreground/70 line-clamp-3 mb-6 flex-grow">
                      {post.excerpt || "Không có tóm tắt bài viết."}
                    </p>

                    {/* Footer */}
                    <div className="border-t border-border/40 pt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[10px] text-primary uppercase">
                          {post.author?.full_name?.substring(0, 2) || "AD"}
                        </div>
                        <span className="text-xs font-semibold text-foreground/80 truncate max-w-[120px]">
                          {post.author?.full_name || "Tác giả ẩn danh"}
                        </span>
                      </div>

                      <Link
                        href={`/${post.slug}`}
                        className="flex items-center space-x-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <span>Đọc bài viết</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center space-y-4 glass rounded-2xl max-w-lg mx-auto w-full px-6">
              <span className="text-3xl">📭</span>
              <h3 className="text-lg font-bold">Không tìm thấy bài viết nào</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Không có bài viết đã xuất bản nào khớp với tìm kiếm của bạn. Hãy thử đổi từ khóa hoặc xóa bộ lọc.
              </p>
              <Link
                href="/"
                className="inline-block px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all shadow-sm"
              >
                Xóa tất cả bộ lọc
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
