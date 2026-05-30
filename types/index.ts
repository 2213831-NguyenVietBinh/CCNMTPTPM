export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  role: "author" | "admin";
}

export type PostStatus = "draft" | "published";

export interface Tag {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  thumbnail_url: string | null;
  status: PostStatus;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  tags?: Tag[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}
