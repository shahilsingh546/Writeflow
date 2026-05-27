import { useEffect, useState } from "react";
import { api, type BlogPost, type Pagination } from "../api";

export type Blog = BlogPost;

export const useBlog = ({ id }: { id: string | undefined }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/blog/${id}`)
      .then((res) => {
        setBlog(res.data.blog);
        setError("");
      })
      .catch(() => setError("Unable to load this post"))
      .finally(() => setLoading(false));
  }, [id]);

  return {
    loading,
    error,
    blog,
  };
};

export const useBlogs = ({ q = "", status = "published" }: { q?: string; status?: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    setBlogs([]);
  }, [q, status]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/blog/bulk", {
        params: {
          q,
          status,
          page,
          limit: 8,
        },
      })
      .then((res) => {
        setBlogs((current) => (page === 1 ? res.data.posts : [...current, ...res.data.posts]));
        setPagination(res.data.pagination);
        setError("");
      })
      .catch(() => setError("Unable to load posts"))
      .finally(() => setLoading(false));
  }, [page, q, status]);

  return {
    loading,
    error,
    blogs,
    pagination,
    loadMore: () => setPage((current) => current + 1),
  };
};
