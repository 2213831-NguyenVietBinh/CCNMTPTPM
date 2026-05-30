import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { Calendar, User, Eye, ArrowLeft, Tag } from "lucide-react";
import ViewIncrementer from "@/components/blog/ViewIncrementer";
import CommentSection from "@/components/blog/CommentSection";

interface PostPageProps {
  params: {
    slug: string;
  };
}

// 1. Generate dynamic SEO Metadata
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", params.slug)
    .single();

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || `Đọc bài viết này trên Thú Cưng Blog`,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const supabase = createClient();

  // 2. Fetch complete post details
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*),
      post_tags(
        tag:tags(*)
      )
    `)
    .eq("slug", params.slug)
    .single();

  if (error || !post) {
    notFound();
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="py-8 space-y-10 animate-fade-in w-full">
      {/* 3. Safe View Count Incrementor Hook */}
      <ViewIncrementer postId={post.id} />

      {/* Back button */}
      <div className="max-w-3xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại danh sách bài viết</span>
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-3xl mx-auto text-center space-y-6 w-full">
        {post.post_tags && post.post_tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {post.post_tags.map((pt: any) => (
              <span
                key={pt.tag?.id}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
              >
                <Tag className="w-3 h-3" />
                <span>{pt.tag?.name}</span>
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>

        {/* Post Metadata banner */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground border-y border-border/40 py-4 font-medium">
          <span className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[9px] text-primary uppercase">
              {post.author?.full_name?.substring(0, 2) || "AD"}
            </div>
            <span className="text-foreground/90 font-semibold">
              {post.author?.full_name || "Tác giả ẩn danh"}
            </span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Eye className="w-4 h-4" />
            <span>{post.view_count || 0} lượt xem</span>
          </span>
        </div>
      </header>

      {/* Thumbnail Banner */}
      {post.thumbnail_url && (
        <div className="max-w-4xl mx-auto w-full aspect-[21/9] relative overflow-hidden rounded-2xl border border-border/40 shadow-xl bg-card">
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main post text content */}
      <div className="max-w-3xl mx-auto w-full prose py-4 border-b border-border/40">
        <ReactMarkdown>{post.content || ""}</ReactMarkdown>
      </div>

      {/* Real-time comments section */}
      <CommentSection postId={post.id} postAuthorId={post.author_id} />
    </article>
  );
}
