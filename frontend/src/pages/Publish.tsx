import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Appbar } from "../componets/Appbar";
import { api, getApiError } from "../api";
import { getReadingTime, markdownToHtml } from "../utils/markdown";

export const Publish = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    api
      .get(`/blog/${id}`)
      .then((res) => {
        setTitle(res.data.blog.title);
        setSubtitle(res.data.blog.subtitle || "");
        setContent(res.data.blog.content);
        setPublished(res.data.blog.published);
      })
      .catch(() => setError("Unable to load this post for editing"));
  }, [id]);

  async function savePost(nextPublished: boolean) {
    setError("");

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    if (content.trim().length < 20) {
      setError("Content must be at least 20 characters");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        id,
        title,
        subtitle,
        content,
        published: nextPublished,
      };
      const response = id ? await api.put("/blog", payload) : await api.post("/blog", payload);
      
      // Update the published state after successful save
      setPublished(nextPublished);
      
      navigate(`/blog/${id || response.data.postID}`);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Appbar />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{id ? "Edit post" : "New post"}</h1>
            <p className="mt-2 text-sm text-stone-500">{getReadingTime(content)} min read</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setPreview((current) => !current)}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50"
            >
              {preview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={() => savePost(false)}
              disabled={loading}
              className="rounded-full border border-stone-900 px-4 py-2 text-sm font-semibold hover:bg-stone-50 disabled:opacity-60"
            >
              Save draft
            </button>
            <button
              onClick={() => savePost(!published)}
              disabled={loading}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
            >
              {published ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        {error ? <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        <div className="mt-8">
          {preview ? (
            <article className="rounded-lg border border-stone-200 p-6">
              <div className="mb-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {published ? "Published" : "Draft"}
                </span>
              </div>
              <h2 className="text-4xl font-black">{title || "Untitled post"}</h2>
              {subtitle ? <p className="mt-3 text-lg text-stone-500">{subtitle}</p> : null}
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(content || "Start writing...") }} />
            </article>
          ) : (
            <div className="grid gap-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-3 text-lg font-semibold outline-none focus:border-stone-900"
                placeholder="Title"
              />
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
                placeholder="Subtitle"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-stone-300 p-3 text-sm leading-7 outline-none focus:border-stone-900"
                placeholder="Write with Markdown. Try ## headings, **bold**, *italic*, and `code`."
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
