"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface ActionState {
  success: boolean;
  error: string | null;
}

// 1. Create a Post Action
export async function createPostAction(prevState: any, formData: FormData): Promise<ActionState> {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const status = formData.get("status") as string;
  const thumbnail_url = formData.get("thumbnail_url") as string;
  const tagsString = formData.get("tags") as string; // Comma separated tags e.g. "Nextjs, Supabase"

  if (!title || !slug) {
    return { success: false, error: "Tiêu đề và đường dẫn (slug) là bắt buộc." };
  }

  const supabase = createClient();

  // Get active session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn phải đăng nhập để thực hiện hành động này." };
  }

  try {
    // 1. Insert the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title,
        slug: slug.toLowerCase().trim(),
        content,
        excerpt: excerpt || title.substring(0, 150),
        thumbnail_url: thumbnail_url || null,
        status: status || "draft",
      })
      .select()
      .single();

    if (postError) {
      if (postError.code === "23505") {
        return { success: false, error: "Một bài viết với đường dẫn (slug) này đã tồn tại." };
      }
      throw postError;
    }

    // 2. Handle Tags if provided
    if (tagsString && post) {
      const tagNames = tagsString
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      for (const name of tagNames) {
        // Upsert tag
        const { data: tag, error: tagError } = await supabase
          .from("tags")
          .upsert({ name }, { onConflict: "name" })
          .select()
          .single();

        if (tagError) throw tagError;

        if (tag) {
          // Map tag to post
          await supabase.from("post_tags").insert({
            post_id: post.id,
            tag_id: tag.id,
          });
        }
      }
    }
  } catch (err: any) {
    console.error("Error creating post:", err);
    return { success: false, error: err?.message || "Đã xảy ra lỗi ngoài ý muốn." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// 2. Update a Post Action
export async function updatePostAction(
  postId: string,
  prevState: any,
  formData: FormData
): Promise<ActionState> {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const status = formData.get("status") as string;
  const thumbnail_url = formData.get("thumbnail_url") as string;
  const tagsString = formData.get("tags") as string;

  if (!title || !slug) {
    return { success: false, error: "Tiêu đề và đường dẫn (slug) là bắt buộc." };
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn phải đăng nhập để thực hiện hành động này." };
  }

  try {
    // Verify ownership
    const { data: existingPost } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single();

    if (!existingPost || existingPost.author_id !== user.id) {
      return { success: false, error: "Không được phép: Bạn không sở hữu bài viết này." };
    }

    // 1. Update the post
    const { error: postError } = await supabase
      .from("posts")
      .update({
        title,
        slug: slug.toLowerCase().trim(),
        content,
        excerpt: excerpt || title.substring(0, 150),
        thumbnail_url: thumbnail_url || null,
        status: status || "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (postError) {
      if (postError.code === "23505") {
        return { success: false, error: "Một bài viết với đường dẫn (slug) này đã tồn tại." };
      }
      throw postError;
    }

    // 2. Clean old tags
    await supabase.from("post_tags").delete().eq("post_id", postId);

    // 3. Re-insert Tags if provided
    if (tagsString) {
      const tagNames = tagsString
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      for (const name of tagNames) {
        const { data: tag, error: tagError } = await supabase
          .from("tags")
          .upsert({ name }, { onConflict: "name" })
          .select()
          .single();

        if (tagError) throw tagError;

        if (tag) {
          await supabase.from("post_tags").insert({
            post_id: postId,
            tag_id: tag.id,
          });
        }
      }
    }
  } catch (err: any) {
    console.error("Error updating post:", err);
    return { success: false, error: err?.message || "Đã xảy ra lỗi ngoài ý muốn." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/${slug}`);
  redirect("/dashboard");
}

// 3. Delete a Post Action
export async function deletePostAction(postId: string): Promise<ActionState> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn phải đăng nhập." };
  }

  try {
    // Delete will enforce RLS (only owners can delete post)
    const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", user.id);

    if (error) throw error;
  } catch (err: any) {
    console.error("Error deleting post:", err);
    return { success: false, error: err?.message || "Không thể xóa bài viết." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true, error: null };
}

// 4. Toggle User Role Action (Admin Only)
export async function toggleUserRoleAction(targetUserId: string): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn phải đăng nhập." };
  }

  try {
    // Verify current user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Không được phép: Bạn không phải Admin." };
    }

    // Prevent self-demotion
    if (user.id === targetUserId) {
      return { success: false, error: "Không thể tự thay đổi vai trò của chính mình." };
    }

    // Fetch target user's current role
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", targetUserId)
      .single();

    if (!targetProfile) {
      return { success: false, error: "Không tìm thấy người dùng này." };
    }

    const nextRole = targetProfile.role === "admin" ? "author" : "admin";

    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", targetUserId);

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true, error: null };
  } catch (err: any) {
    console.error("Error toggling user role:", err);
    return { success: false, error: err?.message || "Không thể đổi vai trò thành viên." };
  }
}

// 5. Admin Delete Post Action (Admin Only)
export async function adminDeletePostAction(postId: string): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn phải đăng nhập." };
  }

  try {
    // Verify current user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Không được phép: Bạn không phải Admin." };
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (err: any) {
    console.error("Error admin deleting post:", err);
    return { success: false, error: err?.message || "Không thể xóa bài viết." };
  }
}

// 6. Admin Delete Comment Action (Admin Only)
export async function adminDeleteCommentAction(commentId: string): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn phải đăng nhập." };
  }

  try {
    // Verify current user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Không được phép: Bạn không phải Admin." };
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true, error: null };
  } catch (err: any) {
    console.error("Error admin deleting comment:", err);
    return { success: false, error: err?.message || "Không thể xóa bình luận." };
  }
}

// 7. Login Action (Server Side)
export async function loginAction(prevState: any, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Vui lòng nhập đầy đủ email và mật khẩu." };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || "Đã xảy ra lỗi hệ thống." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// 8. Register Action (Server Side)
export async function registerAction(prevState: any, formData: FormData): Promise<ActionState> {
  const username = formData.get("username") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!username || !email || !password) {
    return { success: false, error: "Vui lòng điền đầy đủ các trường bắt buộc." };
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase().trim(),
          full_name: fullName.trim() || username,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user && !data.session) {
      return { 
        success: true, 
        error: "Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản." 
      };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || "Đã xảy ra lỗi hệ thống." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

