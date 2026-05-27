import { useEffect, useState } from "react";
import { api, getApiError, getStoredUser } from "../api";
import { Appbar } from "../componets/Appbar";

export const Profile = () => {
  const storedUser = getStoredUser();
  const [name, setName] = useState(storedUser?.name || "");
  const [bio, setBio] = useState(storedUser?.bio || "");
  const [email, setEmail] = useState(storedUser?.email || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/user/me")
      .then((res) => {
        setName(res.data.user.name || "");
        setBio(res.data.user.bio || "");
        setEmail(res.data.user.email || "");
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch((e) => setError(getApiError(e)));
  }, []);

  async function saveProfile() {
    setError("");
    setMessage("");

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    try {
      const response = await api.put("/user/me", { name, bio });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setMessage("Profile updated");
    } catch (e) {
      setError(getApiError(e));
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Appbar />
      <main className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-stone-500">Keep your author identity polished.</p>

        <div className="mt-8 grid gap-4">
          <label className="text-sm font-semibold">
            Email
            <input
              value={email}
              disabled
              className="mt-2 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500"
            />
          </label>
          <label className="text-sm font-semibold">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
            />
          </label>
          <label className="text-sm font-semibold">
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={180}
              className="mt-2 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
              placeholder="Short author bio"
            />
          </label>
        </div>

        {error ? <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        {message ? <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}

        <button onClick={saveProfile} className="mt-8 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white">
          Save profile
        </button>
      </main>
    </div>
  );
};
