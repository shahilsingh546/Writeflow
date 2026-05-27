import { Link } from "react-router-dom";

const principles = [
  {
    label: "01",
    title: "Private first",
    copy: "Readers and writers enter through an account, keeping the feed away from casual drive-bys.",
  },
  {
    label: "02",
    title: "Draft to publish",
    copy: "Move from a blank page to a finished post without switching tools or losing momentum.",
  },
  {
    label: "03",
    title: "Quiet reading",
    copy: "Once inside, the feed keeps attention on the writing instead of noisy recommendations.",
  },
];

export const Home = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-stone-950">
      <header className="border-b border-stone-200 bg-[#fbfaf7]/95">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="text-xl font-bold tracking-normal">
            Writeflow
          </Link>

          <div className="flex items-center gap-3 text-sm font-medium">
            <Link to="/signin" className="hidden hover:text-stone-600 sm:inline">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-stone-950 px-4 py-2 text-white transition hover:bg-stone-800"
            >
              Create account
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section>
          <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-4xl flex-col justify-center px-5 py-16 sm:px-8">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-black leading-tight tracking-normal sm:text-6xl">
                Writeflow
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700">
                A minimal writing app where your feed and editor stay private until you sign in.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Create your account
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center rounded-full border border-stone-950 px-6 py-3 text-sm font-semibold transition hover:bg-white"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-8 text-sm font-medium text-stone-500">
                Login required to read posts or publish your own.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 py-10 sm:px-8 md:grid-cols-3">
            {principles.map((item) => (
              <article key={item.title} className="rounded-lg border border-stone-200 p-5">
                <div className="text-xs font-black text-emerald-700">{item.label}</div>
                <h2 className="mt-3 text-lg font-bold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
