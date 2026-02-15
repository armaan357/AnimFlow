import * as dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import express, { NextFunction, Request, Response, Router } from "express";
import verifyUser from "../middleware/middleware.ts";
import axios from "axios";
import { Prisma, prisma } from "@repo/db";
import {
	animationGenerateSchema,
	animationVersionUpdateSchema,
} from "../zodTypes/index.ts";

const generateRouter: Router = express.Router();

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

const ANIMATION_DEFAULTS = {
	backgroundColor: "a modern, dark charcoal grey (#1e1e1e)",
	defaultDuration: "1.5 seconds",
	easingFunction: "a smooth ease-in-out curve",
	camera: "static and centered",
};

// const prompt = 'A red circle with white stroke appears on the left and an arrow starts from the circle and goes to a blue square with black stroke on the right';
generateRouter.post("/new", verifyUser, async (req: Request, res: Response) => {
	const parsed = animationGenerateSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({ error: parsed.error });
		return;
	}

	const { userPrompt, videoResolution } = parsed.data;
	const user = req.user as { id: string; email: string; userName: string };
	// if(!userId) {
	//     res.status(401).json({ message: 'Please login and try again' });
	// }

	try {
		const enhancedPrompt = `
		You are an expert Manim animator. Generate a complete, runnable Python script.
		**Your final response MUST be a valid JSON object.** Do not include any text or explanations outside of the JSON structure. Do not even include the word json and no extra backticks.

		The JSON object must have the following keys:
			- "title": A short, descriptive title for the animation based on the user's request.
			- "code": A string containing the full, runnable Python Manim script.

		**Animation Rules & Style Guide:**
			- The scene's background color must be ${ANIMATION_DEFAULTS.backgroundColor}.
			- Unless specified in the user request, individual animations should take approximately ${ANIMATION_DEFAULTS.defaultDuration}.
			- All movements must use ${ANIMATION_DEFAULTS.easingFunction}.
			- The camera should remain ${ANIMATION_DEFAULTS.camera} unless the user asks for zooms or pans.
			- Make sure that all the content of the animation is visible on the screen and none of the content is clipped due to shape's size or scale.
			- The final Manim scene class must be named 'GeneratedScene'.

		**CRITICAL - Imports and Dependencies:**
			- ALWAYS start with: from manim import *
			- If using numpy, add: import numpy as np
			- If using math, add: import math

		**CRITICAL - Rate Functions (Easing):**
		ONLY use these built-in rate functions:
			* rate_functions.linear
			* rate_functions.smooth
			* rate_functions.rush_into
			* rate_functions.rush_from
			* rate_functions.slow_into
			* rate_functions.double_smooth
			* rate_functions.there_and_back
			* rate_functions.there_and_back_with_pause
			* rate_functions.running_start
			* rate_functions.wiggle
			* OR leave rate_func parameter out entirely (uses default)
		
		
		**CRITICAL - Colors:**
		ONLY use these exact color constants:
		Basic: WHITE, BLACK, GRAY, GREY, RED, GREEN, BLUE, YELLOW, ORANGE, PURPLE, PINK
		Variants: RED_A through RED_E, BLUE_A through BLUE_E, GREEN_A through GREEN_E
		Extended: GOLD_A through GOLD_E, TEAL_A through TEAL_E, MAROON_A through MAROON_E
		Gray shades: LIGHT_GRAY, DARK_GRAY, DARKER_GRAY, LIGHTER_GRAY (and GREY variants)

		NEVER use: GREEN_SCREEN, LIGHT_BLUE, DARK_GREEN, NEON_*, BRIGHT_*, or any invented names.

		**CRITICAL - Camera Operations:**
		DO NOT use camera operations unless explicitly requested by the user.
		NEVER use:
			* self.camera.frame (this doesn't exist in standard Manim)
			* self.camera.frame.save_state()
			* self.camera.frame.move_to()
			* self.camera.frame.scale()
			
		**CRITICAL:**
			* Always call position methods: .get_center(), .get_top(), etc.
		
		If the user specifically asks for camera zoom or pan:
			* For MovingCameraScene: Use self.camera.frame.animate.move_to() or .scale()
			* For normal Scene: Avoid camera operations entirely
			* The scene class must inherit from MovingCameraScene, not Scene

		DEFAULT: Use Scene class and avoid ALL camera operations unless explicitly requested.

		**CRITICAL - Scene Class:**
		- Default: class GeneratedScene(Scene):
		- ONLY if user asks for camera zoom/pan: class GeneratedScene(MovingCameraScene):
		- NEVER access self.camera.frame in a regular Scene class

		**CRITICAL - Animation Parameters:**
		For self.play() and animations, ONLY use these valid parameters:
			* run_time: Duration in seconds (e.g., run_time=2)
			* rate_func: Use only rate_functions listed above (e.g., rate_func=rate_functions.smooth)
			* lag_ratio: For AnimationGroup (e.g., lag_ratio=0.1)
			
		NEVER use these INVALID parameters:
			* stagger (doesn't exist - use lag_ratio with AnimationGroup instead)
			* duration (use run_time instead)
			* delay (use self.wait() instead)
			* easing (use rate_func instead)
			
		**For staggered animations, use AnimationGroup:**
			from manim import AnimationGroup
			self.play(AnimationGroup(*[FadeIn(obj) for obj in objects], lag_ratio=0.1))

		**CRITICAL - FadeIn/FadeOut specific parameters:**
			Valid: shift (direction like UP, DOWN, LEFT, RIGHT), scale (number like 0.5, 2)
			Example: FadeIn(obj, shift=UP) or FadeIn(obj, scale=0.5)
			NEVER use: stagger, target_position, or other invented parameters

		**CRITICAL - Common Mobject Parameters:**
			- font_size: Use numbers like 24, 36, 48, 72 (NOT "large", "small")
			- stroke_width: Use numbers like 2, 4, 6
			- buff: Use numbers like 0.5, 1.0, 2.0
			- All numeric parameters must be actual numbers, not strings

		**CRITICAL - Positioning:**
			- Valid directions: UP, DOWN, LEFT, RIGHT, UL, UR, DL, DR, ORIGIN
			- Valid edges: .get_top(), .get_bottom(), .get_left(), .get_right(), .get_center()
			- Use .next_to(), .shift(), .move_to(), .align_to() for positioning
			- For screen edges: Use config.frame_height and config.frame_width
			Example: text.to_edge(UP) or text.shift(UP * 2)
			- NEVER invent positioning methods

		**CRITICAL - Animation Functions:**
		Common valid animations: FadeIn, FadeOut, Create, Write, Transform, ReplacementTransform, 
		GrowFromCenter, ShrinkToCenter, Indicate, Flash, Circumscribe, ShowPassingFlash, 
		Rotate, MoveAlongPath

		**Code Checklist (verify before generating):**
		1. ✓ All imports are at the top
		2. ✓ Every color is from the allowed list above
		3. ✓ Every rate_func is from the allowed list above
		4. ✓ NO camera operations (unless user explicitly asks for zoom/pan)
		5. ✓ Using Scene class (not MovingCameraScene) unless camera operations needed
		6. ✓ All positioning uses valid Manim methods
		7. ✓ All parameters are correct types (numbers not strings for sizes)
		8. ✓ No invented function or constant names
		9. ✓ ONLY valid animation parameters (run_time, rate_func, lag_ratio)
		10. ✓ NO invalid parameters (stagger, duration, delay, easing)
		11. ✓ Scene class is named 'GeneratedScene'

		---
	
		**User's Animation Request:**
		"${userPrompt}"

		---

		**JSON Response:**
		`;

		console.log("\nAi timer start\n");
		console.time("fetchCodeFromAi");
		const codeResp = await fetchCodeFromAI(enhancedPrompt);
		console.timeEnd("fetchCodeFromAi");

		if (!codeResp) {
			res.status(500).json({ error: "Please try again" });
			return;
		}

		const parsed: { title: string; code: string } = JSON.parse(codeResp);
		const title = parsed.title;
		const code = parsed.code;
		console.log("\nDBTimer start\n");
		console.time("DBTimer");

		const dbResp = await prisma.animation.create({
			data: {
				title: `${title}`,
				firstPrompt: userPrompt,
				userId: user.id!,
			},
		});

		console.timeEnd("DBTimer");
		console.log(dbResp);

		console.log("\nPython Timer Start:\n");
		console.time("pythonGateway");

		const gatewayResp = await axios.post("http://localhost:8000/job", {
			id: dbResp.id,
			prompt: userPrompt,
			code: code,
			fps: 15,
			resolution: videoResolution,
		});
		console.log("\nResponse from python gateway: ", gatewayResp.data, "\n");
		console.timeEnd("pythonGateway");
		const respData = gatewayResp.data;
		if (respData.status !== "Task Submitted") {
			res.json({ result: "Please try again later" });
			return;
		}

		createNewAnimationVersion(
			userPrompt,
			code,
			gatewayResp.data.taskId as string,
			dbResp.id,
			1,
		);
		res.json({
			result: "Task Submitted",
			animationId: dbResp.id,
			title: dbResp.title,
			taskId: gatewayResp.data.id,
		});
	} catch (e: any) {
		res.json({ error: e });
		console.log("\n\n--------error caught-------\n\n");
		console.log(e);
		return;
	}
});

function createNewAnimationVersion(
	userPrompt: string,
	code: string,
	taskId: string,
	animationId: string,
	versionNo: number,
) {
	return prisma.$transaction(
		async (tx) => {
			const newAnimationVersion = await tx.animationVersion.create({
				data: {
					prompt: userPrompt,
					code: code,
					versionNo,
					taskId: taskId,
					animationId: animationId,
				},
			});

			await tx.animation.update({
				where: { id: animationId },
				data: { currentVersionId: newAnimationVersion.id },
			});
		},
		{
			isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
		},
	);
}

generateRouter.post(
	"/:animationId",
	verifyUser,
	async (req: Request, res: Response) => {
		const animationId = req.params.animationId;

		if (!animationId || typeof animationId !== "string") {
			res.status(400).json({
				error: "Animation id not found or invalid format",
			});
			return;
		}
		const parsed = animationGenerateSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({ error: parsed.error });
			return;
		}

		const { userPrompt, videoResolution } = parsed.data;

		try {
			const animationIdExists = await prisma.animation.findUnique({
				where: { id: animationId },
			});
			if (!animationIdExists || !animationIdExists.currentVersionId) {
				res.status(400).json({ message: "Animation does not exist" });
				return;
			}
			const previousAnimationVersion =
				await prisma.animationVersion.findFirst({
					where: { id: animationIdExists.currentVersionId },
				});
			if (!previousAnimationVersion) {
				res.json({ error: "Unknown error occured" });
				return;
			}
			const enhancedPrompt = `
				You are an expert Manim animator. Generate a complete, runnable Python script.

				**Your final response MUST be a valid JSON object.** Do not include any text or explanations outside of the JSON structure. Do not even include the word json and no extra backticks.

				The JSON object must have the following keys:
				- "title": A short, descriptive title for the animation based on the user's request.
				- "code": A string containing the full, runnable Python Manim script.

				**Animation Rules & Style Guide:**
				- The scene's background color must be ${ANIMATION_DEFAULTS.backgroundColor}.
				- Unless specified in the user request, individual animations should take approximately ${ANIMATION_DEFAULTS.defaultDuration}.
				- All movements must use ${ANIMATION_DEFAULTS.easingFunction}.
				- The camera should remain ${ANIMATION_DEFAULTS.camera} unless the user asks for zooms or pans.
				- Make sure that all the content of the animation is visible on the screen and none of the content is clipped due to shape's size or scale.
				- The final Manim scene class must be named 'GeneratedScene'.

				**CRITICAL - Imports and Dependencies:**
				- ALWAYS start with: from manim import *
				- If using numpy, add: import numpy as np
				- If using math, add: import math

				**CRITICAL - Rate Functions (Easing):**
				ONLY use these built-in rate functions:
				* rate_functions.linear
				* rate_functions.smooth
				* rate_functions.rush_into
				* rate_functions.rush_from
				* rate_functions.slow_into
				* rate_functions.double_smooth
				* rate_functions.there_and_back
				* rate_functions.there_and_back_with_pause
				* rate_functions.running_start
				* rate_functions.wiggle
				* OR leave rate_func parameter out entirely (uses default)

				**CRITICAL - Colors:**
				ONLY use these exact color constants:
				Basic: WHITE, BLACK, GRAY, GREY, RED, GREEN, BLUE, YELLOW, ORANGE, PURPLE, PINK
				Variants: RED_A through RED_E, BLUE_A through BLUE_E, GREEN_A through GREEN_E
				Extended: GOLD_A through GOLD_E, TEAL_A through TEAL_E, MAROON_A through MAROON_E
				Gray shades: LIGHT_GRAY, DARK_GRAY, DARKER_GRAY, LIGHTER_GRAY (and GREY variants)

				NEVER use: GREEN_SCREEN, LIGHT_BLUE, DARK_GREEN, NEON_*, BRIGHT_*, or any invented names.

				**CRITICAL - Camera Operations:**
				DO NOT use camera operations unless explicitly requested by the user.
				NEVER use:
				* self.camera.frame (this doesn't exist in standard Manim)
				* self.camera.frame.save_state()
				* self.camera.frame.move_to()
				* self.camera.frame.scale()

				If the user specifically asks for camera zoom or pan:
				* For MovingCameraScene: Use self.camera.frame.animate.move_to() or .scale()
				* For normal Scene: Avoid camera operations entirely
				* The scene class must inherit from MovingCameraScene, not Scene

				DEFAULT: Use Scene class and avoid ALL camera operations unless explicitly requested.

				**CRITICAL - Scene Class:**
				- Default: class GeneratedScene(Scene):
				- ONLY if user asks for camera zoom/pan: class GeneratedScene(MovingCameraScene):
				- NEVER access self.camera.frame in a regular Scene class

				**CRITICAL - Animation Parameters:**
				For self.play() and animations, ONLY use these valid parameters:
				* run_time: Duration in seconds (e.g., run_time=2)
				* rate_func: Use only rate_functions listed above (e.g., rate_func=rate_functions.smooth)
				* lag_ratio: For AnimationGroup (e.g., lag_ratio=0.1)

				NEVER use these INVALID parameters:
				* stagger (doesn't exist - use lag_ratio with AnimationGroup instead)
				* duration (use run_time instead)
				* delay (use self.wait() instead)
				* easing (use rate_func instead)

				**For staggered animations, use AnimationGroup:**
				from manim import AnimationGroup
				self.play(AnimationGroup(*[FadeIn(obj) for obj in objects], lag_ratio=0.1))

				**CRITICAL - FadeIn/FadeOut specific parameters:**
				Valid: shift (direction like UP, DOWN, LEFT, RIGHT), scale (number like 0.5, 2)
				Example: FadeIn(obj, shift=UP) or FadeIn(obj, scale=0.5)
				NEVER use: stagger, target_position, or other invented parameters

				**CRITICAL - Common Mobject Parameters:**
				- font_size: Use numbers like 24, 36, 48, 72 (NOT "large", "small")
				- stroke_width: Use numbers like 2, 4, 6
				- buff: Use numbers like 0.5, 1.0, 2.0
				- All numeric parameters must be actual numbers, not strings

				**CRITICAL - Positioning:**
				- Valid directions: UP, DOWN, LEFT, RIGHT, UL, UR, DL, DR, ORIGIN
				- Valid edges: .get_top(), .get_bottom(), .get_left(), .get_right(), .get_center()
				- Use .next_to(), .shift(), .move_to(), .align_to() for positioning
				- For screen edges: Use config.frame_height and config.frame_width
				Example: text.to_edge(UP) or text.shift(UP * 2)
				- NEVER invent positioning methods

				**CRITICAL - Animation Functions:**
				Common valid animations: FadeIn, FadeOut, Create, Write, Transform, ReplacementTransform, 
				GrowFromCenter, ShrinkToCenter, Indicate, Flash, Circumscribe, ShowPassingFlash, 
				Rotate, MoveAlongPath

				**Code Checklist (verify before generating):**
				1. ✓ All imports are at the top
				2. ✓ Every color is from the allowed list above
				3. ✓ Every rate_func is from the allowed list above
				4. ✓ NO camera operations (unless user explicitly asks for zoom/pan)
				5. ✓ Using Scene class (not MovingCameraScene) unless camera operations needed
				6. ✓ All positioning uses valid Manim methods
				7. ✓ All parameters are correct types (numbers not strings for sizes)
				8. ✓ No invented function or constant names
				9. ✓ ONLY valid animation parameters (run_time, rate_func, lag_ratio)
				10. ✓ NO invalid parameters (stagger, duration, delay, easing)
				11. ✓ Scene class is named 'GeneratedScene'

				---

				**Previous prompt of the user:**
				"${previousAnimationVersion.prompt}"

				**The code you generated for the previous prompt:**
				"${previousAnimationVersion.code}"

				**User's New/Revised Animation Request:**
				"${userPrompt}"

				*****DO NOT USE RANDOM NON EXISTENT TYPES OR VALUES OR FUNCTIONS THAT DO NOT EXIST IN THE MANIM LIBRARY*****
				---

				**JSON Response:**
			`;
			const AIResp = await fetchCodeFromAI(enhancedPrompt);
			if (!AIResp) {
				res.status(500).json({ error: "Please try again" });
				return;
			}

			const parsed: { code: string } = JSON.parse(AIResp);
			const code = parsed.code;
			const gatewayResp = await axios.post("http://localhost:8000/job", {
				id: animationId,
				prompt: userPrompt,
				code: code,
				fps: 15,
				resolution: videoResolution,
			});

			if (gatewayResp.data.status !== "Task Submitted") {
				res.json({ result: "Please try again later" });
				return;
			}

			createNewAnimationVersion(
				userPrompt,
				code,
				gatewayResp.data.taskId,
				animationId,
				previousAnimationVersion.versionNo + 1,
			);

			res.json({
				message: "Task submitted successfully!",
				taskId: gatewayResp.data.id,
			});
		} catch (e: any) {
			res.json({ error: e });
		}
	},
);

async function fetchCodeFromAI(enhancedPrompt: string) {
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: enhancedPrompt,
	});
	if (!response.text) {
		return;
	}
	const str = response.text.split("json")[1]?.split("```")[0];
	if (!str) return;

	// const parsed: { title: string; code: string } = JSON.parse(str);
	// const title = parsed.title;
	// console.log("\n\n\n\TITLE:\n\n\n\n", title);

	// const code = parsed.code;
	// console.log("\n\n\n\nCODE:\n\n\n\n", code);

	return str;
}

const verifyInternalService = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const internalServiceSecret = process.env.INTERNAL_SERVICE_SECRET!;
	const pythonSecret = req.headers.service_secret;

	if (
		!pythonSecret ||
		typeof pythonSecret !== "string" ||
		internalServiceSecret !== pythonSecret
	) {
		res.status(401).json({ error: "Invalid Secret" });
		return;
	}
	next();
};

generateRouter.post(
	"/internal/update-version",
	verifyInternalService,
	async (req: Request, res: Response) => {
		const parsed = animationVersionUpdateSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({ error: parsed.error });
			return;
		}
		try {
			if (parsed.data.status === "COMPLETED") {
				const { id, animationId, status, videoURL } = parsed.data;
				await prisma.animationVersion.update({
					where: { taskId: id },
					data: { status: status, videoURL: videoURL! },
				});
			} else {
				const { id, animationId, status, error, reason } = parsed.data;
				await prisma.animationVersion.update({
					where: { taskId: id },
					data: {
						status: "ERROR",
						errorMessage: error,
						errorReason: reason,
					},
				});
			}
			res.json({ message: "Version details updated" });
		} catch (e: any) {
			res.json({ error: e });
			console.log(JSON.stringify(e));
			return;
		}
	},
);

// console.log(resp.split('json')[1]);
// console.log(JSON.parse(resp));

// fetchCode();

// fetchCodeFromAI(`
// You are an expert Manim animator. Generate a complete, runnable Python script.

// **Your final response MUST be a valid JSON object.** Do not include any text or explanations outside of the JSON structure.

// The JSON object must have the following keys:
// - "title": A short, descriptive title for the animation based on the user's request.
// - "code": A string containing the full, runnable Python Manim script.

// **Animation Rules & Style Guide:**
// - The scene's background color must be ${ANIMATION_DEFAULTS.backgroundColor}.
// - Unless specified in the user request, individual animations should take approximately ${ANIMATION_DEFAULTS.defaultDuration}.
// - All movements must use ${ANIMATION_DEFAULTS.easingFunction}.
// - The camera should remain ${ANIMATION_DEFAULTS.camera} unless the user asks for zooms or pans.
// - Render the animation in ${ANIMATION_DEFAULTS.quality}.
// - The final Manim scene class must be named 'GeneratedScene'.

// ---

// **User's Animation Request:**
// "${prompt}"

// ---

// **JSON Response:**
// `);

export default generateRouter;
