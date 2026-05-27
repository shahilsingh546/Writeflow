import { Link } from "react-router-dom";
import type { Blog } from "../hooks";
import { getReadingTime, markdownToHtml } from "../utils/markdown";
import { Appbar } from "./Appbar";
import { Avatar } from "./BlogCard";

export const FullBlog = ({ blog }: { blog: Blog }) => {
  const authorName = blog.author.name || "Anonymous";

  return (
    <div className="min-h-screen bg-white">
      <Appbar />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1fr_280px]">
        <article>
          <div className="mb-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                blog.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {blog.published ? "Published" : "Draft"}
            </span>
          </div>
          <h1 className="text-4xl font-black leading-tight text-stone-950 sm:text-5xl">{blog.title}</h1>
          {blog.subtitle ? <p className="mt-4 text-xl leading-8 text-stone-500">{blog.subtitle}</p> : null}
          <div className="mt-4 text-sm text-stone-500">
            Updated {new Date(blog.updatedAt).toLocaleDateString()} · {getReadingTime(blog.content)} min read
          </div>
          <div className="mt-8" dangerouslySetInnerHTML={{ __html: markdownToHtml(blog.content) }} />
        </article>

        <aside className="h-fit rounded-lg border border-stone-200 p-5">
          <div className="text-sm font-semibold text-stone-500">Author</div>
          <div className="mt-4 flex gap-3">
            <Avatar size="big" authorName={authorName} />
            <div>
              <Link to={`/author/${blog.author.id}`} className="text-lg font-bold hover:underline">
                {authorName}
              </Link>
              <p className="mt-2 text-sm leading-6 text-stone-500">{blog.author.bio || "Writing on Writeflow."}</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
