import * as dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response, Router } from "express";
import verifyUser from "../middleware/middleware.js";
import passport from "passport";
import bcrypt from "bcrypt";
import {
	requiredParams,
	requiredPollBody,
	signInSchema,
	signUpSchema,
} from "../zodTypes/index.js";
import { Prisma, prisma } from "@repo/db";
import jwt from "jsonwebtoken";

const userRouter: Router = express.Router();
const feURL = process.env.FE_URL;

userRouter.get("/email-exists", async (req: Request, res: Response) => {
	const email = req.query.email;

	if (!email) {
		res.status(400).json({ message: "No email found in the query" });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { email: email! as string },
		});
		if (user) {
			res.json({ exists: true });
			return;
		}
		res.status(200).json({ exists: false });
	} catch (e: any) {
		res.status(500).json({ error: e.toString() });
	}
});

userRouter.post(
	"/signup",
	async (req: Request, res: Response, next: NextFunction) => {
		const parsed = signUpSchema.safeParse(req.body);

		if (!parsed.success) {
			console.log("Parse error: \n\n", req.body);
			res.json({ error: parsed.error });
			return;
		}

		const { email, password, userName } = parsed.data;

		try {
			const hashed = await bcrypt.hash(password, 10);
			// const resp = await prisma.user.create({ data: { userName, password: hashed } });
			const resp = await prisma.user.create({
				data: { email, password: hashed, userName },
			});
			console.log("signup successful, DBresp = ", resp);
			// req.login(resp, (err) => {
			// 	if (err) {
			// 		return res
			// 			.status(500)
			// 			.json({ message: "Auto-login failed." });
			// 	}

			// 	return res.status(201).json({
			// 		message: "Registration successful.",
			// 		user: {
			// 			id: resp.id,
			// 			email: resp.email,
			// 			username: resp.userName,
			// 		},
			// 	});
			// });
			passport.authenticate(
				"local",
				(
					err: any,
					user: {
						id: number;
						email: string;
						password: string;
						userName: string;
					},
					info: any,
				) => {
					if (err) {
						return next(err);
					}
					// if (!resp) return res.status(400).json(info);

					req.logIn(resp, (err) => {
						if (err) return next(err);
						const { id, email, userName } = resp;
						return res.json({
							message: "Registration Successful",
							user: { id, email, userName },
						});
					});
				},
			)(req, res, next);
			// res.status(201).json({ message: "Signed Up Successfully" });
		} catch (e: any) {
			if (e.code && e.code === "P2002") {
				console.log("user already exists");
				res.status(400).json({ error: "User already exists" });
				return;
			}
			res.status(500).json({ error: e });
			console.log("\n\nerror = ", e);
		}
	},
);

userRouter.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile", "email"] }),
);

userRouter.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${feURL}/signup`,
		successRedirect: `${feURL}/chat/new`,
	}),
);

userRouter.get(
	"/auth/google/callback",
	passport.authenticate("google", { session: false }),
	(req, res) => {
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: "7d",
		});

		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			path: "/",
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		res.redirect(`${feURL}/chat/new`);
	},
);

userRouter.get(
	"/auth/github",
	passport.authenticate("github", { scope: ["user:email"] }),
);

userRouter.get(
	"/auth/github/callback",
	passport.authenticate("github", {
		failureRedirect: `${feURL}/signup`,
		successRedirect: `${feURL}/chat/new`,
	}),
	// function (req, res) {
	// 	res.redirect(`${feURL}/chat/new`);
	// },
);

userRouter.post(
	"/signin",
	async (req: Request, res: Response, next: NextFunction) => {
		const requiredSignInBody = signInSchema.safeParse(req.body);
		if (!requiredSignInBody.success) {
			res.status(400).json({ error: "Incomplete data" });
			return;
		}
		const { email, password } = requiredSignInBody.data;
		try {
			const user = await prisma.user.findUnique({ where: { email } });
			if (!user) {
				res.status(401).json({
					error: "User not found. Please Signup",
				});
				return;
			}
			const hashPassword = user.password;
			if (!hashPassword) {
				res.status(400).json({
					error: "Account does not exist. Try logging in with google or github",
				});
				return;
			}
			const comparePwd = await bcrypt.compare(password, hashPassword!);
			if (!comparePwd) {
				res.status(401).json({ error: "Incorrect Password" });
				return;
			}
			const token = jwt.sign(
				{ id: user.id, email: user.email, userName: user.userName },
				process.env.USER_SECRET!,
				{ expiresIn: "7d" },
			);
			res.cookie("token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite:
					process.env.NODE_ENV === "production" ? "none" : "lax",
				path: "/", // important
				maxAge: 1000 * 60 * 60 * 24 * 7,
			});
			res.json({ message: "Signed In" });
			return;
		} catch {
			res.status(500);
		}
	},
);

userRouter.get("/logout", (req: Request, res: Response, next: NextFunction) => {
	res.clearCookie("token", { path: "/" });
	res.json({ message: "Logged out" });
});

userRouter.get("/chats", verifyUser, async (req: Request, res: Response) => {
	if (!req.user) {
		return;
	}
	const user = req.user as { id: string; email: string; userName: string };

	try {
		const dbResp = await prisma.animation.findMany({
			where: { userId: user.id },
			orderBy: { updatedAt: "desc" },
			select: { id: true, title: true },
		});
		res.status(200).json({ message: "User's animations", dbResp });
	} catch (e: any) {
		res.json({ error: e });
	}
});

userRouter.get(
	"/chats/:animationId",
	verifyUser,
	async (req: Request, res: Response) => {
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};
		const parsed = requiredParams.safeParse(req.params);
		if (!parsed.success) {
			res.status(400).json({ error: "Invalid params" });
			return;
		}
		const { animationId } = parsed.data;

		try {
			const animationMetadata = await prisma.animation.findUnique({
				where: { id: animationId },
			});
			if (!animationMetadata || !animationMetadata.currentVersionId) {
				res.status(400).json({ error: "Invalid Parameters" });
				return;
			}
			if (animationMetadata.userId !== user.id) {
				res.status(402).json({
					message: "You cannot access this animation",
				});
				return;
			}
			const currentVersion = await prisma.animationVersion.findUnique({
				where: { id: animationMetadata?.currentVersionId },
			});
			const animationHistory = await prisma.animationVersion.findMany({
				where: { animationId: animationId },
				orderBy: { createdAt: "asc" },
			});

			res.json({
				animation: animationMetadata,
				currentVersion,
				versions: animationHistory,
			});
		} catch (e: any) {
			res.json({ error: e });
		}
	},
);

const deleteAnimationWithVersions = (animationId: string) => {
	return prisma.$transaction(
		async (tx: Prisma.TransactionClient) => {
			await tx.animationVersion.deleteMany({
				where: { animationId: animationId },
			});
			await tx.animation.delete({ where: { id: animationId } });
		},
		{
			isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
		},
	);
};

userRouter.delete(
	"/chats/:animationId",
	verifyUser,
	async (req: Request, res: Response) => {
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};
		const parsedParams = requiredParams.safeParse(req.params);
		if (!parsedParams.success) {
			res.status(400).json({ error: "Invalid parameter" });
			return;
		}
		const { animationId } = parsedParams.data;
		try {
			const belongsToUser = await prisma.animation.findUnique({
				where: { id: animationId },
			});
			if (!belongsToUser || belongsToUser.userId !== user.id) {
				res.status(400).json({
					error: "You cannot access this animation",
				});
				return;
			}
			const deleteAnimation = deleteAnimationWithVersions(animationId);
			if (!deleteAnimation) {
				res.json({ error: "Please try again later" });
				return;
			}
			res.json({ message: "Animation deleted successfully" });
		} catch (e: any) {
			res.status(500).json({ error: e });
		}
	},
);

userRouter.get(
	"/chats/page/:animationId",
	verifyUser,
	async (req: Request, res: Response) => {
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};
		const parsed = requiredParams.safeParse(req.params);
		if (!parsed.success) {
			res.status(400).json({ message: "Invalid parameters" });
			return;
		}
		const { animationId } = parsed.data;
		const cursorId = req.query.cursor;
		if (!cursorId || typeof cursorId !== "string") {
			res.status(400).json({
				error: "CursorId not found or invalid format",
			});
			return;
		}
		try {
			const animationInfo = await prisma.animation.findUnique({
				where: { id: animationId },
			});
			if (!animationInfo || !animationInfo.currentVersionId) {
				res.status(400).json({ error: "Invalid Parameters" });
				return;
			}
			if (animationInfo.userId !== user.id) {
				res.status(400).json({
					error: "You cannot access this animation",
				});
				return;
			}
			const currentVersion = await prisma.animationVersion.findFirst({
				where: { id: animationInfo.currentVersionId },
			});
			const animationHistory = await prisma.animationVersion.findMany({
				take: 11,
				skip: 1,
				cursor: { id: cursorId },
				where: { animationId: animationId },
				orderBy: { createdAt: "desc" },
			});
			if (animationHistory.length === 11) {
				res.json({
					versions: animationHistory.slice(0, 10),
					hasMore: true,
				});
				return;
			}
			res.json({
				currentVersion,
				versions: animationHistory,
				hasMore: false,
			});
		} catch (e: any) {
			res.json({ error: e });
		}
	},
);

userRouter.patch(
	"/chats/public-visibility/:animationId",
	verifyUser,
	async (req: Request, res: Response) => {
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};
		const parsedParams = requiredParams.safeParse(req.params);
		if (!parsedParams.success) {
			res.status(400).json({ error: "Invalid parameters" });
			return;
		}
		const { animationId } = parsedParams.data;
		try {
			const animation = await prisma.animation.findUnique({
				where: { id: animationId },
			});
			if (!animation) {
				res.status(400).json({ error: "Animation not found" });
				return;
			}
			if (animation.userId !== user.id) {
				res.status(400).json({
					error: "You are not authorized to change the public visibility of this animation",
				});
				return;
			}
			await prisma.animation.update({
				where: { id: animationId },
				data: { isPublic: true },
			});
		} catch (e: any) {
			res.json({ error: e });
		}
	},
);

userRouter.get(
	"/chats/public/:animationId",
	async (req: Request, res: Response) => {
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};
		const parsedParams = requiredParams.safeParse(req.params);
		if (!parsedParams.success) {
			res.status(400).json({ error: "Invalid parameters" });
			return;
		}
		const { animationId } = parsedParams.data;
		try {
			const animation = await prisma.animation.findUnique({
				where: { id: animationId },
			});
			if (!animation || animation.isPublic == false) {
				res.status(400).json({
					error: "Either animation does not exist or is not public",
				});
				return;
			}
			const currentVersion = await prisma.animationVersion.findUnique({
				where: { id: animation.currentVersionId! },
			});
			const animationHistory = await prisma.animationVersion.findMany({
				where: { animationId: animationId },
				orderBy: { createdAt: "asc" },
			});

			res.json({
				animation: animation,
				currentVersion,
				versions: animationHistory,
			});
		} catch (e: any) {
			res.json({ error: e });
		}
	},
);

userRouter.post(
	"/chats/poll",
	verifyUser,
	async (req: Request, res: Response) => {
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};
		const parsedBody = requiredPollBody.safeParse(req.body);
		if (!parsedBody.success) {
			res.status(400).json({ error: parsedBody.error });
			return;
		}
		const { taskId } = parsedBody.data;
		try {
			const animationDetails = await prisma.animationVersion.findUnique({
				where: { taskId: taskId },
				select: {
					id: true,
					animationId: true,
					taskId: true,
					prompt: true,
					videoURL: true,
					status: true,
					errorMessage: true,
					errorReason: true,
					renderTimeMs: true,
					fileSizeBytes: true,
					durationSeconds: true,
				},
			});
			if (!animationDetails) {
				res.status(400).json({ error: "Animation version not found" });
				return;
			}
			const belongsToUser = await prisma.animation.findUnique({
				where: { id: animationDetails.animationId },
			});
			if (!belongsToUser || belongsToUser.userId !== user.id) {
				res.status(400).json({
					error: "You cannot access this animation",
				});
				return;
			}
			if (animationDetails.status == "COMPLETED") {
				res.json({
					code: 0,
					message: "Render completed successfully",
					animationDetails,
				});
			} else if (animationDetails.status == "ERROR") {
				res.json({
					code: 1,
					error: "Render process failed",
					animationDetails,
				});
			} else {
				res.json({ code: 2, message: "Still processing" });
			}
		} catch (e: any) {
			res.status(500).json({ error: e });
		}
	},
);

userRouter.get(
	"/auth-me",
	verifyUser,
	async (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			res.status(401).json({ code: 1, error: "Not authenticated" });
			return;
		}
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};
		res.status(200).json({
			code: 0,
			message: "Authorized User!",
			email: user.email,
			userName: user.userName,
		});
	},
);

export default userRouter;
