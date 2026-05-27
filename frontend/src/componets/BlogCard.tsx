import { Link } from "react-router-dom";
import { getReadingTime } from "../utils/markdown";

interface BlogCardProps {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  subtitle?: string | null;
  content: string;
  publishedDate: string;
  published: boolean;
  showActions?: boolean;
  onDelete?: () => void;
}

export const BlogCard = ({
  authorName,
  authorId,
  title,
  subtitle,
  content,
  publishedDate,
  id,
  published,
  showActions = false,
  onDelete,
}: BlogCardProps) => {
  return (
    <article className="border-b border-stone-200 p-5">
      <Link to={`/blog/${id}`}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Avatar authorName={authorName} size="small" />
          <span className="font-medium text-stone-700">{authorName}</span>
          <Circle />
          <span>{publishedDate}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {published ? "Published" : "Draft"}
          </span>
        </div>

        <h2 className="pt-3 text-2xl font-bold text-stone-950">{title}</h2>
        {subtitle ? <p className="pt-2 text-sm font-medium text-stone-600">{subtitle}</p> : null}
        <p className="pt-3 text-stone-600">{content.slice(0, 140)}{content.length > 140 ? "..." : ""}</p>
        <div className="pt-4 text-sm text-stone-400">{getReadingTime(content)} min read</div>
      </Link>

      {showActions ? (
        <div className="mt-4 flex gap-3">
          <Link to={`/publish/${id}`} className="text-sm font-semibold text-stone-700 hover:underline">
            Edit
          </Link>
          <button onClick={onDelete} className="text-sm font-semibold text-red-600 hover:underline">
            Delete
          </button>
          <Link to={`/author/${authorId}`} className="text-sm font-semibold text-stone-500 hover:underline">
            Author page
          </Link>
        </div>
      ) : null}
    </article>
  );
};

export function Circle() {
  return <div className="h-1 w-1 rounded-full bg-stone-400" />;
}

export function Avatar({ authorName, size = "small" }: { authorName: string; size: "small" | "big" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-stone-900 ${
        size === "small" ? "h-6 w-6" : "h-10 w-10"
      }`}
    >
      <span className={`${size === "small" ? "text-xs" : "text-sm"} font-semibold text-white`}>
        {(authorName || "U")[0].toUpperCase()}
      </span>
    </div>
  );
}
