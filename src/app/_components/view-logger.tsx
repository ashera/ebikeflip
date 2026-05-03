"use client";

import { useEffect, useRef } from "react";
import { logBlogPostView } from "@/lib/actions/blog";

/**
 * Fires once per mount to record a blog post view. Render only on live
 * (non-admin-preview) post pages — the server action filters admins out
 * but skipping the call entirely on previews avoids any noise.
 */
export function ViewLogger({ postId }: { postId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void logBlogPostView(postId);
  }, [postId]);
  return null;
}
