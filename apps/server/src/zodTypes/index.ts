import z from "zod";

const signUpSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" })
		.max(26, { message: "Password must be at most 26 characters long" })
		.regex(/[0-9]/, {
			message: "Password must contain at least one number",
		})
		.regex(/[a-z]/, {
			message: "Password must contain at least one lowercase letter",
		})
		.regex(/[A-Z]/, {
			message: "Password must contain at least one uppercase letter",
		})
		.regex(/[!@#$%^&*()_+[\]{};':"\\|,.<>/?~-]/, {
			message: "Password must contain at least one special character",
		}),
	userName: z.string().min(1).max(20),
});

const signInSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" })
		.max(26, { message: "Password must be at most 26 characters long" })
		.regex(/[0-9]/, {
			message: "Password must contain at least one number",
		})
		.regex(/[a-z]/, {
			message: "Password must contain at least one lowercase letter",
		})
		.regex(/[A-Z]/, {
			message: "Password must contain at least one uppercase letter",
		})
		.regex(/[!@#$%^&*()_+[\]{};':"\\|,.<>/?~-]/, {
			message: "Password must contain at least one special character",
		}),
});

const animationGenerateSchema = z.object({
	userPrompt: z.string(),
	videoResolution: z.literal(["l", "m", "h"]),
});

const animationVersionUpdateSchema = z.object({
	id: z.uuidv4(),
	animationId: z.cuid(),
	status: z.literal(["COMPLETED", "FAILED"]),
	videoURL: z.url().optional(),
	reason: z.string().optional(),
	error: z.string().optional(),
});

const requiredParams = z.object({
	animationId: z.cuid(),
});

const requiredPollBody = z.object({
	taskId: z.uuidv4(),
});

export {
	signUpSchema,
	signInSchema,
	animationGenerateSchema,
	animationVersionUpdateSchema,
	requiredParams,
	requiredPollBody,
};
