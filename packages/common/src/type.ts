import z from 'zod';

export const signUpSchema = z.object({
    userName: z.email(),
    password: z.string().min(6).max(32)
                .refine(p => /[0-9a-zA-Z]/.test(p))
                .refine(p => /[!@#$%^&*]/.test(p)),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
});

export const signInSchema = z.object({
    userName: z.email(),
    password: z.string().min(6).max(32)
                .refine(p => /[0-9a-zA-Z]/.test(p))
                .refine(p => /[!@#$%^&*]/.test(p))
});

export type signUpType = z.infer<typeof signUpSchema>;