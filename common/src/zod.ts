import z from "zod";

export const signupInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name : z.string().min(2).max(80).optional(),
    bio: z.string().max(180).optional()
})

export type SignupInput = z.infer<typeof signupInput>

export const signinInput = z.object({
    email: z.string().email(),
    password:z.string().min(6)
});

export type SigninInput = z.infer<typeof signinInput>


export const createBlogInput  = z.object({
    title: z.string().min(3).max(140),
    subtitle: z.string().max(220).optional(),
    content:z.string().min(20),
    published: z.boolean().default(false)
});

export type CreateBlogInput = z.infer<typeof createBlogInput>


export const updateBlogInput = z.object({
    id:z.string(),
    title:z.string().min(3).max(140),
    subtitle: z.string().max(220).optional(),
    content:z.string().min(20),
    published: z.boolean().optional()
})

export type UpdateBlogInput = z.infer<typeof updateBlogInput>

export const updateProfileInput = z.object({
    name: z.string().min(2).max(80),
    bio: z.string().max(180).optional()
})

export type UpdateProfileInput = z.infer<typeof updateProfileInput>
