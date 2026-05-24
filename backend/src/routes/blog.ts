import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from 'hono/jwt'
import {createBlogInput, CreateBlogInput, updateBlogInput} from "@singhisme456/medium-common";
import { success } from 'zod';

export const blogRouter = new Hono<{
    Bindings :{
        DATABASE_URL: string;
  SECRET_KEY: string;
    }, 
    Variables :{
        "userID" :string
    }
}>();

blogRouter.use('/*', async(c,next)=>{
  const header = c.req.header("Authorization") || "";
  const token = header.split(" ")[1]
  const res = await verify(token,c.env.SECRET_KEY,"HS256");
  if(res.id){
    if(typeof res.id === "string"){
      c.set("userID", res.id)
      console.log("valid user")
    await next();
    }
  }
  else{
    c.status(403)
    return c.json({
      error : "unathroised user"
    })
  }
})

blogRouter.post('/', async(c)=>{
    const prisma = new PrismaClient({
    accelerateUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const {success} = await createBlogInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({msg:"Invalid input formats for blog creation"})
  }
  else{
  const authorId = c.get("userID")
  try{
    const res = await prisma.post.create({
        data: {
            title: body.title,
            content : body.content,
            published:body.published,
            authorID: authorId
        }
    });
    if(res.id){
        return c.json({
            msg : "successfully created post",
            postID: res.id
        })
    }
  }
  catch(e){
    return c.json({
        msg: e,
        error: "something wrong"
    })
  }
  }
});

blogRouter.put('/', async(c)=>{
  const body = await c.req.json();
  const prisma = new PrismaClient({
    accelerateUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());
  const {success} = await updateBlogInput.safeParse(body);

  if(!success){
    c.status(411);
    return c.json({
        msg:"Invalid inputs for blog updation"
    })
  }
  const blog = await prisma.post.update({
    where:{
        id: body.id
    },
    data: {
        title:body.title,
        content:body.content
    }
  })
  return c.json({
    id: blog.id
  })
});

blogRouter.get('/bulk', async(c)=>{
    const prisma = new PrismaClient({
        accelerateUrl:c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany();
    return c.json({
        posts
    })
})
blogRouter.get('/:id', async(c)=>{
  const prisma = new PrismaClient({
    accelerateUrl:c.env.DATABASE_URL
  }).$extends(withAccelerate());
  
  const id = c.req.param("id");
  console.log("inside get id",id)
  try{
    const blog = await prisma.post.findUnique({
        where: {
            id:id
        },
    })
    return c.json({
        blog
    })
  }
  catch(e){
    c.status(411);
    return c.json({
        msg: "Error while fetching blog post"
    })
  }
})

