import { createClient } from "@/lib/supabase/server";
import DashboardTable from "@/components/blog/DashboardTable";
import { Post } from "@/types";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Bảng quản trị",
  description: "Quản lý bài viết blog thú cưng, soạn thảo bản nháp và theo dõi lượt xem.",
};

export default async function DashboardPage() {
  const supabase = createClient();

  // Get active session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch author posts
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dashboard posts:", error);
  }

  const typedPosts: Post[] = (posts as Post[]) || [];

  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      <DashboardTable initialPosts={typedPosts} />
    </div>
  );
}
