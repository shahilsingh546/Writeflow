import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from 'hono/jwt'
import {signinInput, signupInput} from "@singhisme456/medium-common"

export const userRouter = new Hono<{
    Bindings :{
        DATABASE_URL: string;
  SECRET_KEY: string;
    }
}>();


userRouter.post('/signup', async(c)=>{
  const prisma = new PrismaClient({
    accelerateUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const {success} = await signupInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
        msg: "inputs not correct"
    })
  }
  else{
  try{
  const user = await prisma.user.create({
    data:{
      email:body.email,
      password : body.password,
      name: body.name
    }
  });

  const token = await sign({id:user.id}, c.env.SECRET_KEY, "HS256")
  console.log(user);
  return c.json({jwt: token})
}
  catch(e){
  return c.json({
    msg:e,
    error: "error while signing up"
  })
  }
}
})
userRouter.post('/signin', async(c)=>{
  const prisma = new PrismaClient({
    accelerateUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const {success} = await signinInput.safeParse(body)
  if(!success){
    c.status(411);
    return c.json({msg:"Invalid input format"})
  }
  else{
  const user = await prisma.user.findUnique({
    where :{
      email: body.email,
      password: body.password
    }
  })

  if(!user){ 
    c.status(403);
    return c.json({
      error : "user not found"
    })
  }
  const jwt = await sign({id:user.id}, c.env.SECRET_KEY, "HS256")
  return c.json({jwt})
}
})
