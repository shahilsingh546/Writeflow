import { Hono } from "hono";
import type { Context } from "hono";
import { sign, verify } from "hono/jwt";
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

const signupInput = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2).max(80),
  bio: z.string().max(180).optional(),
});

const signinInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const updateProfileInput = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(180).optional(),
});

export const userRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function getPrisma(databaseUrl: string) {
  return new PrismaClient({
    accelerateUrl: databaseUrl,
  }).$extends(withAccelerate());
}

function jsonError(c: Context, status: number, message: string) {
  c.status(status as 400);
  return c.json({ success: false, error: message });
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return `pbkdf2_sha256$100000$${toBase64(salt)}$${toBase64(new Uint8Array(hash))}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterations, salt, hash] = storedHash.split("$");

  if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !hash) {
    return false;
  }

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromBase64(salt),
      iterations: Number(iterations),
      hash: "SHA-256",
    },
    key,
    256,
  );

  return toBase64(new Uint8Array(derived)) === hash;
}

async function createToken(userId: string, secret: string) {
  const now = Math.floor(Date.now() / 1000);
  return sign({ id: userId, iat: now, exp: now + 60 * 60 * 24 * 7 }, secret, "HS256");
}

userRouter.use("/me", async (c, next) => {
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
});

userRouter.use("/me/*", async (c, next) => {
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
});

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const parsed = signupInput.safeParse(body);

  if (!parsed.success) {
    return jsonError(c, 400, parsed.error.issues[0]?.message || "Invalid signup details");
  }

  if (!c.env.SECRET_KEY) {
    return jsonError(c, 500, "Secret key is not configured");
  }

  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        password: await hashPassword(parsed.data.password),
        name: parsed.data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return c.json({
      success: true,
      jwt: await createToken(user.id, c.env.SECRET_KEY),
      user,
    });
  } catch {
    return jsonError(c, 409, "An account with this email already exists");
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  const parsed = signinInput.safeParse(body);

  if (!parsed.success) {
    return jsonError(c, 400, "Enter a valid email and password");
  }

  if (!c.env.SECRET_KEY) {
    return jsonError(c, 500, "Secret key is not configured");
  }

  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email.toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  });

  const passwordMatches =
    user &&
    ((await verifyPassword(parsed.data.password, user.password)) ||
      (!user.password.startsWith("pbkdf2_sha256$") && user.password === parsed.data.password));

  if (!user || !passwordMatches) {
    return jsonError(c, 401, "Invalid email or password");
  }

  if (!user.password.startsWith("pbkdf2_sha256$")) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await hashPassword(parsed.data.password),
      },
    });
  }

  return c.json({
    success: true,
    jwt: await createToken(user.id, c.env.SECRET_KEY),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      bio: "",
    },
  });
});

userRouter.get("/me", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await prisma.user.findUnique({
    where: {
      id: c.get("userID"),
    },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) {
    return jsonError(c, 404, "User not found");
  }

  return c.json({ success: true, user });
});

userRouter.put("/me", async (c) => {
  const body = await c.req.json();
  const parsed = updateProfileInput.safeParse(body);

  if (!parsed.success) {
    return jsonError(c, 400, parsed.error.issues[0]?.message || "Invalid profile details");
  }

  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await prisma.user.update({
    where: {
      id: c.get("userID"),
    },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      createdAt: true,
    },
  });

  return c.json({ success: true, user });
});
