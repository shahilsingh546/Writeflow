import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, getApiError, type BlogPost, type Pagination, type User } from "../api";
import { Appbar } from "../componets/Appbar";
import { BlogCard } from "../componets/BlogCard";

export const Author = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);
    api
      .get(`/blog/author/${id}`, {
        params: {
          page,
          limit: 8,
        },
      })
      .then((res) => {
        setAuthor(res.data.author);
        setPosts((current) => (page === 1 ? res.data.posts : [...current, ...res.data.posts]));
        setPagination(res.data.pagination);
      })
      .catch((e) => setError(getApiError(e)))
      .finally(() => setLoading(false));
  }, [id, page]);

  return (
    <div className="min-h-screen bg-white">
      <Appbar />
      <main className="mx-auto max-w-4xl px-5 py-8">
        {error ? <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        {author ? (
          <div className="border-b border-stone-200 pb-8">
            <h1 className="text-3xl font-bold">{author.name || "Anonymous"}</h1>
            <p className="mt-2 max-w-xl text-sm text-stone-500">{author.bio || "No bio yet."}</p>
          </div>
        ) : null}

        {!loading && posts.length === 0 ? (
          <div className="mt-12 rounded-lg border border-dashed border-stone-300 p-8 text-center">
            <h2 className="text-lg font-bold">No published posts</h2>
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
