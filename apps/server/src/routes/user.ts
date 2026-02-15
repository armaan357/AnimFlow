import express, { NextFunction, Request, Response, Router } from "express";
import verifyUser from "../middleware/middleware.ts";
import passport from "passport";
import bcrypt from "bcrypt";
import {
	requiredParams,
	requiredPollBody,
	signUpSchema,
} from "../zodTypes/index.ts";
import { prisma } from "@repo/db";
import z from "zod";

const userRouter: Router = express.Router();

userRouter.get("/email-exists", async (req: Request, res: Response) => {
	const email = req.query.email;

	if (!email) {
		res.status(400).json({ message: "No email found in the query" });
	}

	try {
		await prisma.user.findUnique({
			where: { email: email! as string },
		});
		res.status(200).json({ exists: false });
	} catch (e: any) {
		res.status(500).json({ error: e.toString() });
	}
});

userRouter.post("/signup", async (req: Request, res: Response) => {
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
		res.status(201).json({ message: "Signed Up Successfully" });
		console.log("signup successful, DBresp = ", resp);
	} catch (e: any) {
		if (e.code && e.code === "P2002") {
			console.log("user already exists");
			res.status(400).json({ error: "User already exists" });
			return;
		}
		res.status(500).json({ error: e });
		console.log("\n\nerror = ", e);
	}
});

userRouter.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile"] }),
);

userRouter.get(
	"/auth/google/callback",
	passport.authenticate("google", { failureRedirect: "/login" }),
	(req, res) => {
		// Successful authentication, redirect home.
		res.redirect("/");
	},
);

userRouter.post(
	"/signin",
	async (req: Request, res: Response, next: NextFunction) => {
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
				if (!user) return res.status(400).json(info);

				req.logIn(user, (err) => {
					if (err) return next(err);
					const { id, email, userName } = user;
					return res.json({ user: { id, email, userName } });
				});
			},
		)(req, res, next);
	},
);

userRouter.get("/logout", (req: Request, res: Response) => {
	req.logout(() => {
		res.json({ msg: "Logged out" });
	});
});

userRouter.get("/chats", verifyUser, async (req: Request, res: Response) => {
	const user = req.user as { id: string; email: string; userName: string };

	try {
		const dbResp = await prisma.animation.findMany({
			where: { userId: user.id },
			orderBy: { updatedAt: "desc" },
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
			const latestAnimation = await prisma.animationVersion.findUnique({
				where: { id: animationMetadata?.currentVersionId! },
			});
			const animationHistory = await prisma.animationVersion.findMany({
				take: 11,
				skip: 1,
				where: { animationId: animationId },
				orderBy: { createdAt: "desc" },
			});

			if (animationHistory.length == 11) {
				res.json({
					animation: animationMetadata,
					currentVersion: latestAnimation,
					versions: animationHistory.slice(0, 10),
					hasMore: true,
				});
				return;
			}
			res.json({
				animation: animationMetadata,
				currentVersion: latestAnimation,
				versions: animationHistory,
				hasMore: false,
			});
		} catch (e: any) {
			res.json({ error: e });
		}
	},
);

userRouter.get(
	"/chats/page/:animationId",
	verifyUser,
	async (req: Request, res: Response) => {
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
			res.json({ versions: animationHistory, hasMore: false });
		} catch (e: any) {
			res.json({ error: e });
		}
	},
);

userRouter.get(
	"/chats/poll/:animationId",
	verifyUser,
	async (req: Request, res: Response) => {
		const parsedParams = requiredParams.safeParse(req.params);
		const parsedBody = requiredPollBody.safeParse(req.body);
		if (!parsedParams.success) {
			res.status(400).json({ error: parsedParams.error });
			return;
		}
		if (!parsedBody.success) {
			res.status(400).json({ error: parsedBody.error });
			return;
		}
		const { animationId } = parsedParams.data;
		const { taskId } = parsedBody.data;
		try {
			const animationDetails = await prisma.animationVersion.findUnique({
				where: { taskId: taskId },
			});
			if (!animationDetails) {
				res.status(400).json({ error: "Animation version not found" });
				return;
			}
			if (animationDetails.status == "COMPLETED") {
				res.json({
					message: "Render completed successfully",
					animationDetails,
				});
			} else if (animationDetails.status == "ERROR") {
				res.json({
					error: "Render process failed",
					reason: animationDetails.errorMessage,
				});
			} else {
				res.json({ message: "Still processing" });
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
			res.status(401).json({ error: "Not authenticated" });
			return;
		}
		const user = req.user as {
			id: string;
			email: string;
			userName: string;
		};
		res.json({
			message: "Authorized User!",
			email: user.email,
			userName: user.userName,
		});
	},
);

export default userRouter;
