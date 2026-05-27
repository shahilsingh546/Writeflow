import { useState } from "react";
import { Appbar } from "../componets/Appbar";
import { BlogCard } from "../componets/BlogCard";
import { BlogSkeleton } from "../componets/BlogSkeleton";
import { useBlogs } from "../hooks";

export const Blogs = () => {
  const [search, setSearch] = useState("");
  const { loading, error, blogs, pagination, loadMore } = useBlogs({ q: search });

  return (
    <div className="min-h-screen bg-white">
      <Appbar />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-950">All posts</h1>
            <p className="mt-2 text-sm text-stone-500">Search writing from the Writeflow community.</p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900 sm:w-72"
            placeholder="Search title or content"
          />
        </div>

        {error ? <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        {loading && blogs.length === 0 ? (
          <div className="mt-4">
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
          </div>
        ) : null}

        {!loading && blogs.length === 0 ? (
          <div className="mt-12 rounded-lg border border-dashed border-stone-300 p-8 text-center">
            <h2 className="text-lg font-bold">No posts found</h2>
            <p className="mt-2 text-sm text-stone-500">Try another search term or publish the first story.</p>
          </div>
        ) : null}

        <div>
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              authorId={blog.author.id}
              authorName={blog.author.name || "Anonymous"}
              title={blog.title}
              subtitle={blog.subtitle}
              content={blog.content}
              published={blog.published}
              publishedDate={new Date(blog.updatedAt).toLocaleDateString()}
            />
          ))}
        </div>

        {pagination?.hasMore ? (
          <div className="flex justify-center py-8">
            <button
              onClick={loadMore}
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
