"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface ViewIncrementerProps {
  postId: string;
}

export default function ViewIncrementer({ postId }: ViewIncrementerProps) {
  const hasIncremented = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (hasIncremented.current) return;
    hasIncremented.current = true;

    const increment = async () => {
      try {
        // Call the database RPC function securely
        await supabase.rpc("increment_views", { post_id: postId });
      } catch (err) {
        console.error("Failed to increment view count:", err);
      }
    };

    // Delay slightly to ensure a genuine read
    const timer = setTimeout(increment, 2000);
    return () => clearTimeout(timer);
  }, [postId, supabase]);

  return null;
}
