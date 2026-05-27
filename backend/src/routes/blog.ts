import { Hono } from "hono";
import type { Context } from "hono";
import { verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { z } from "zod";

type Bindings = {
  DATABASE_URL: string;
  SECRET_KEY: string;
};

type Variables = {
  userID: string;
};

const postInput = z.object({
  title: z.string().min(3).max(140),
  subtitle: z.string().max(220).optional(),
  content: z.string().min(20),
  published: z.boolean().default(false),
});

const updatePostInput = postInput.extend({
  id: z.string(),
});

export const blogRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function getPrisma(databaseUrl: string) {
  return new PrismaClient({
    accelerateUrl: databaseUrl,
  }).$extends(withAccelerate());
}

function jsonError(c: Context, status: number, message: string) {
  c.status(status as 400);
  return c.json({ success: false, error: message });
}

function getPagination(c: Context) {
  const page = Math.max(Number(c.req.query("page") || "1"), 1);
  const limit = Math.min(Math.max(Number(c.req.query("limit") || "8"), 1), 20);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

// Middleware to optionally verify token (for public routes that show published content)
async function optionalAuth(c: Context, next: Function) {
  const header = c.req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

  if (token && token !== "null") {
    try {
      const payload = await verify(token, c.env.SECRET_KEY, "HS256");

      if (payload.id && typeof payload.id === "string") {
        c.set("userID", payload.id);
      }
    } catch {
      // Token is invalid, but we allow the request to continue for public content
    }
  }

  await next();
}

// Middleware to require authentication
async function requireAuth(c: Context, next: Function) {
  const header = c.req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

  if (!token || token === "null") {
    return jsonError(c, 401, "Please sign in to continue");
  }

  try {
    const payload = await verify(token, c.env.SECRET_KEY, "HS256");

    if (!payload.id || typeof payload.id !== "string") {
      return jsonError(c, 401, "Invalid session");
    }

    c.set("userID", payload.id);
    await next();
  } catch {
    return jsonError(c, 401, "Session expired. Please sign in again");
  }
}

// CREATE POST - requires auth
blogRouter.post("/", requireAuth, async (c) => {
  const body = await c.req.json();
  const parsed = postInput.safeParse(body);

  if (!parsed.success) {
    return jsonError(c, 400, parsed.error.issues[0]?.message || "Invalid post details");
  }

  const prisma = getPrisma(c.env.DATABASE_URL);
  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || "",
      content: parsed.data.content,
      published: parsed.data.published,
      authorID: c.get("userID"),
    },
    select: {
      id: true,
    },
  });

  c.status(201);
  return c.json({ success: true, postID: post.id });
});

// UPDATE POST - requires auth
blogRouter.put("/", requireAuth, async (c) => {
  const body = await c.req.json();
  const parsed = updatePostInput.safeParse(body);

  if (!parsed.success) {
    return jsonError(c, 400, parsed.error.issues[0]?.message || "Invalid post details");
  }

  const prisma = getPrisma(c.env.DATABASE_URL);
  const existingPost = await prisma.post.findUnique({
    where: {
      id: parsed.data.id,
    },
    select: {
      authorID: true,
    },
  });

  if (!existingPost) {
    return jsonError(c, 404, "Post not found");
  }

  if (existingPost.authorID !== c.get("userID")) {
    return jsonError(c, 403, "You can only update your own posts");
  }

  const post = await prisma.post.update({
    where: {
      id: parsed.data.id,
    },
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || "",
      content: parsed.data.content,
      published: parsed.data.published,
    },
    select: {
      id: true,
    },
  });

  return c.json({ success: true, id: post.id });
});

// Specific routes must come before /:id to avoid being caught by the wildcard
// GET /bulk - Get all blogs (public route, only shows published posts)
blogRouter.get("/bulk", optionalAuth, async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const { page, limit, skip } = getPagination(c);
  const query = c.req.query("q")?.trim();
  const authorId = c.req.query("authorId");

  const where = {
    published: true,
    ...(authorId ? { authorID: authorId } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { subtitle: { contains: query, mode: "insensitive" as const } },
            { content: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        authorID: true,
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return c.json({
    success: true,
    posts,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + posts.length < total,
    },
  });
});

// GET /mine - Get user's posts - requires auth
blogRouter.get("/mine", requireAuth, async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const { page, limit, skip } = getPagination(c);
  const status = c.req.query("status");
  const query = c.req.query("q")?.trim();
  const published = status === "published" ? true : status === "draft" ? false : undefined;

  const where = {
    authorID: c.get("userID"),
    ...(published === undefined ? {} : { published }),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { subtitle: { contains: query, mode: "insensitive" as const } },
            { content: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        authorID: true,
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return c.json({
    success: true,
    posts,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + posts.length < total,
    },
  });
});

// GET /author/:id - Get author's published posts (public route)
blogRouter.get("/author/:id", optionalAuth, async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const { page, limit, skip } = getPagination(c);
  const authorId = c.req.param("id");

  const [author, posts, total] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: authorId,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    }),
    prisma.post.findMany({
      where: {
        authorID: authorId,
        published: true,
      },
      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        content: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        authorID: true,
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
          },
        },
      },
    }),
    prisma.post.count({
      where: {
        authorID: authorId,
        published: true,
      },
    }),
  ]);

  if (!author) {
    return jsonError(c, 404, "Author not found");
  }

  return c.json({
    success: true,
    author,
    posts,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + posts.length < total,
    },
  });
});

// DELETE must come before GET /:id
blogRouter.delete("/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const prisma = getPrisma(c.env.DATABASE_URL);
  const existingPost = await prisma.post.findUnique({
    where: {
      id,
    },
    select: {
      authorID: true,
    },
  });

  if (!existingPost) {
    return jsonError(c, 404, "Post not found");
  }

  if (existingPost.authorID !== c.get("userID")) {
    return jsonError(c, 403, "You can only delete your own posts");
  }

  await prisma.post.delete({
    where: {
      id,
    },
  });

  return c.json({ success: true });
});

// GET /:id - Get single blog (public route with optional auth)
blogRouter.get("/:id", optionalAuth, async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const id = c.req.param("id");
  let userID: string | undefined;
  
  try {
    userID = c.get("userID");
  } catch {
    userID = undefined;
  }

  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      subtitle: true,
      content: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      authorID: true,
      author: {
        select: {
          id: true,
          name: true,
          bio: true,
        },
      },
    },
  });

  if (!post) {
    return jsonError(c, 404, "Post not found");
  }

  // Only block if post is not published AND user is not the author
  if (!post.published) {
    if (!userID || post.authorID !== userID) {
      return jsonError(c, 403, "This draft is private");
    }
  }

  return c.json({ success: true, blog: post });
});
