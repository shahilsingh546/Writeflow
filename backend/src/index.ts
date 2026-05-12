import { Hono } from 'hono'
import { PrismaClient } from "./generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/api/v1/signup', (c)=>{
  const prisma = new PrismaClient({
    accelerateUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  return c.text("sign up route")
})
app.post('/api/v1/signin', (c)=>{
  return c.text("sign in route")
})
app.post('/api/v1/blog', (c)=>{
  return c.text("blog post  route")
})
app.put('/api/v1/blog', (c)=>{
  return c.text("blog put  route")
})
app.get('/api/v1/blog/:id', (c)=>{
  return c.text("blog get route")
})

export default app
