import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getApiError, type BlogPost, type Pagination } from "../api";
import { Appbar } from "../componets/Appbar";
import { BlogCard } from "../componets/BlogCard";

export const MyPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPosts([]);
    setPage(1);
  }, [status, search]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/blog/mine", {
        params: {
          status,
          q: search,
          page,
          limit: 8,
        },
      })
      .then((res) => {
        setPosts((current) => (page === 1 ? res.data.posts : [...current, ...res.data.posts]));
        setPagination(res.data.pagination);
        setError("");
      })
      .catch((e) => setError(getApiError(e)))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  async function deletePost(id: string) {
    const confirmed = window.confirm("Delete this post?");

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/blog/${id}`);
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (e) {
      setError(getApiError(e));
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Appbar />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Posts</h1>
            <p className="mt-2 text-sm text-stone-500">Manage drafts, published posts, edits, and deletes.</p>
          </div>
          <Link to="/publish" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
            New post
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
            placeholder="Search your posts"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {error ? <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        {!loading && posts.length === 0 ? (
          <div className="mt-12 rounded-lg border border-dashed border-stone-300 p-8 text-center">
            <h2 className="text-lg font-bold">No posts yet</h2>
            <p className="mt-2 text-sm text-stone-500">Create a draft and publish when it is ready.</p>
          </div>
        ) : null}

        <div>
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              id={post.id}
              authorId={post.author.id}
              authorName={post.author.name || "Anonymous"}
              title={post.title}
              subtitle={post.subtitle}
              content={post.content}
              published={post.published}
              publishedDate={new Date(post.updatedAt).toLocaleDateString()}
              showActions
              onDelete={() => deletePost(post.id)}
            />
          ))}
        </div>

        {pagination?.hasMore ? (
          <div className="flex justify-center py-8">
            <button
              onClick={() => setPage((current) => current + 1)}
              disabled={loading}
              className="rounded-full border border-stone-900 px-5 py-2 text-sm font-semibold hover:bg-stone-50 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
};
