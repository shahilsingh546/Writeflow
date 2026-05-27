function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function markdownToHtml(markdown: string) {
  const lines = escapeHtml(markdown).split("\n");

  return lines
    .map((line) => {
      if (line.startsWith("### ")) {
        return `<h3 class="mt-6 text-xl font-bold">${line.slice(4)}</h3>`;
      }

      if (line.startsWith("## ")) {
        return `<h2 class="mt-7 text-2xl font-bold">${line.slice(3)}</h2>`;
      }

      if (line.startsWith("# ")) {
        return `<h1 class="mt-8 text-3xl font-bold">${line.slice(2)}</h1>`;
      }

      const withMarks = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, '<code class="rounded bg-stone-100 px-1 py-0.5">$1</code>');

      return withMarks.trim()
        ? `<p class="mt-4 leading-8 text-stone-700">${withMarks}</p>`
        : "<br />";
    })
    .join("");
}

export function getReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
