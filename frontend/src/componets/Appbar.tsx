import { Link, useNavigate } from "react-router-dom";
import { getStoredUser, isLoggedIn, logout } from "../api";
import { Avatar } from "./BlogCard";

export const Appbar = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const loggedIn = isLoggedIn();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to={loggedIn ? "/blogs" : "/"} className="text-lg font-bold">
          Writeflow
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {loggedIn ? (
            <>
              <Link to="/blogs" className="hidden font-medium text-stone-700 hover:text-stone-950 sm:inline">
                Feed
              </Link>
              <Link to="/my-posts" className="hidden font-medium text-stone-700 hover:text-stone-950 sm:inline">
                My Posts
              </Link>
              <Link
                to="/publish"
                className="rounded-full bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-800"
              >
                New
              </Link>
              <Link to="/profile" aria-label="Profile">
                <Avatar size="big" authorName={user?.name || "User"} />
              </Link>
              <button onClick={handleLogout} className="font-medium text-stone-500 hover:text-stone-950">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="font-medium text-stone-700 hover:text-stone-950">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
