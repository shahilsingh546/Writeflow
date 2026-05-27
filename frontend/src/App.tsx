import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import {Signup} from "./pages/Signup";
import {Signin} from "./pages/Signin";
import {Blog} from "./pages/Blog";
import { Blogs } from "./pages/Blogs";
import { Publish } from "./pages/Publish";
import { Home } from "./pages/Home";
import { MyPosts } from "./pages/MyPosts";
import { Profile } from "./pages/Profile";
import { Author } from "./pages/Author";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token || token === "null") {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

function App(){
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/signup" element={<Signup />}/>
      <Route path="/signin" element={<Signin />} />
      <Route path="/blogs" element={<ProtectedRoute><Blogs/></ProtectedRoute>} />
      <Route path="/blog/:id" element={<ProtectedRoute><Blog/></ProtectedRoute>} />
      <Route path="/publish" element={<ProtectedRoute><Publish/></ProtectedRoute>} />
      <Route path="/publish/:id" element={<ProtectedRoute><Publish/></ProtectedRoute>} />
      <Route path="/my-posts" element={<ProtectedRoute><MyPosts/></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
      <Route path="/author/:id" element={<ProtectedRoute><Author/></ProtectedRoute>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;
