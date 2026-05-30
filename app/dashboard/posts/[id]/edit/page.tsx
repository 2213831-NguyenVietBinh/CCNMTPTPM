import { createClient } from "@/lib/supabase/server";
import EditPostForm from "@/components/blog/EditPostForm";
import { notFound, redirect } from "next/navigation";
import { Post } from "@/types";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Edit Post",
  description: "Update your article content, slugs, categorization, or thumbnail settings.",
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const supabase = createClient();

  // Get active session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch the post
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !post) {
    notFound();
  }

  // 2. Security validation: verify ownership
  if (post.author_id !== user.id) {
    redirect("/dashboard");
  }

  // 3. Fetch tags for this post
  const { data: postTags } = await supabase
    .from("post_tags")
    .select("tag:tags(name)")
    .eq("post_id", post.id);

  const tagsString = postTags
    ? postTags
        .map((pt: any) => pt.tag?.name)
        .filter(Boolean)
        .join(", ")
    : "";

  const typedPost: Post = post as Post;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <EditPostForm post={typedPost} initialTags={tagsString} />
    </div>
  );
}
