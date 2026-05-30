import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/blog/AdminDashboard";
import Link from "next/link";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Eye, 
  ArrowLeft,
  Settings
} from "lucide-react";

export const revalidate = 0; // Disable cache for admin dashboard

export default async function AdminPage() {
  const supabase = createClient();
  
  // Get current user to pass their ID (preventing self demotion)
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || "";

  // Fetch all profiles
  const { data: users = [] } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all posts with author profile info
  const { data: posts = [] } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .order("created_at", { ascending: false });

  // Fetch all comments with commenter profile and associated post details
  const { data: comments = [] } = await supabase
    .from("comments")
    .select("*, author:profiles(*), post:posts(title, slug)")
    .order("created_at", { ascending: false });

  // Calculate statistics
  const totalUsers = users?.length || 0;
  const totalPosts = posts?.length || 0;
  const totalComments = comments?.length || 0;
  const totalViews = posts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl space-y-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-primary flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Bảng điều khiển
              </Link>
              <span>/</span>
              <span className="text-primary font-medium">Quản trị</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 mt-2">
              Quản trị Hệ thống
            </h2>
            <p className="text-muted-foreground text-sm">
              Thống kê & quản lý tài nguyên của website.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold hover:bg-muted border px-4 py-2 rounded-xl bg-card transition-all flex items-center gap-1.5"
          >
            Xem trang chủ
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300">
            <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Thành viên</p>
              <h3 className="text-2xl font-extrabold mt-1">{totalUsers}</h3>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Bài viết</p>
              <h3 className="text-2xl font-extrabold mt-1">{totalPosts}</h3>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300">
            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500 border border-pink-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Bình luận</p>
              <h3 className="text-2xl font-extrabold mt-1">{totalComments}</h3>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500 border border-green-500/20">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Tổng lượt xem</p>
              <h3 className="text-2xl font-extrabold mt-1">{totalViews}</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Component */}
        <AdminDashboard
          initialPosts={posts as any}
          initialUsers={users as any}
          initialComments={comments as any}
          currentUserId={currentUserId}
        />

      </div>
    </div>
  );
}
