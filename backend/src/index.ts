import { Hono } from "hono";
import { cors } from "hono/cors";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";


type Bindings = {
  DATABASE_URL: string;
  SECRET_KEY: string;
};
type Variables = {
  userID : string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

app.use("/*", cors());

app.use("/*", async (c, next) => {
  const ip = c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for") || "local";
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 120;
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    await next();
    return;
  }

  if (current.count >= maxRequests) {
    c.status(429);
    return c.json({ success: false, error: "Too many requests. Please try again soon" });
  }

  current.count += 1;
  await next();
});

app.onError((err, c) => {
  console.error(err);
  c.status(500);
  return c.json({ success: false, error: "Something went wrong" });
});

app.notFound((c) => {
  c.status(404);
  return c.json({ success: false, error: "Route not found" });
});

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
