// // ============================================================================
// // TYPES
// // ============================================================================

// import { GoogleGenAI } from "@google/genai";

// interface ValidationResult {
// 	isValid: boolean;
// 	errors: string[];
// 	warnings: string[];
// 	fixedCode?: string;
// 	autoFixed: boolean;
// }

// interface RenderError {
// 	type:
// 		| "NameError"
// 		| "TypeError"
// 		| "AttributeError"
// 		| "ImportError"
// 		| "SyntaxError"
// 		| "Unknown";
// 	message: string;
// 	line?: number;
// 	variable?: string;
// }

// const ai = new GoogleGenAI({});

// // ============================================================================
// // MAIN AUTO-FIX FUNCTION
// // ============================================================================

// class ManimCodeFixer {
// 	private fixCount = 0;
// 	private fixLog: string[] = [];

// 	/**
// 	 * Main entry point: validates and auto-fixes Manim code
// 	 */
// 	fix(code: string): ValidationResult {
// 		this.fixCount = 0;
// 		this.fixLog = [];

// 		let fixedCode = code;
// 		const errors: string[] = [];
// 		const warnings: string[] = [];

// 		// Run all fixes in sequence
// 		fixedCode = this.fixImports(fixedCode);
// 		fixedCode = this.fixColors(fixedCode);
// 		fixedCode = this.fixRateFunctions(fixedCode);
// 		fixedCode = this.fixAnimationParameters(fixedCode);
// 		fixedCode = this.fixCameraOperations(fixedCode);
// 		fixedCode = this.fixPositioning(fixedCode);
// 		fixedCode = this.fixFontSizes(fixedCode);
// 		fixedCode = this.fixClassName(fixedCode);

// 		// Validate after fixes
// 		const validationErrors = this.validate(fixedCode);
// 		errors.push(...validationErrors);

// 		// Check for warnings (non-breaking issues)
// 		const validationWarnings = this.checkWarnings(fixedCode);
// 		warnings.push(...validationWarnings);

// 		return {
// 			isValid: errors.length === 0,
// 			errors,
// 			warnings,
// 			fixedCode: this.fixCount > 0 ? fixedCode : undefined,
// 			autoFixed: this.fixCount > 0,
// 		};
// 	}

// 	// ==========================================================================
// 	// FIX FUNCTIONS
// 	// ==========================================================================

// 	/**
// 	 * Fix 1: Ensure proper imports
// 	 */
// 	private fixImports(code: string): string {
// 		// Check if manim import exists
// 		if (!code.includes("from manim import")) {
// 			this.log("Adding missing manim import");
// 			code = "from manim import *\n\n" + code;
// 			this.fixCount++;
// 		}

// 		return code;
// 	}

// 	/**
// 	 * Fix 2: Replace invalid color names with valid ones
// 	 */
// 	private fixColors(code: string): string {
// 		const colorReplacements: Record<string, string> = {
// 			// Common mistakes
// 			GREEN_SCREEN: "GREEN",
// 			LIGHT_BLUE: "BLUE_C",
// 			DARK_BLUE: "BLUE_D",
// 			LIGHT_GREEN: "GREEN_C",
// 			DARK_GREEN: "GREEN_D",
// 			LIGHT_RED: "RED_C",
// 			DARK_RED: "RED_D",
// 			BRIGHT_YELLOW: "YELLOW_A",
// 			BRIGHT_GREEN: "GREEN_A",
// 			BRIGHT_RED: "RED_A",
// 			BRIGHT_BLUE: "BLUE_A",
// 			NEON_PINK: "PINK",
// 			NEON_GREEN: "GREEN_A",
// 			NEON_BLUE: "BLUE_A",
// 			LIGHT_GRAY: "GREY_A", // Note: LIGHT_GRAY might be valid, but being safe
// 			DARK_GRAY: "GREY_D",
// 			NAVY_BLUE: "BLUE_E",
// 			SKY_BLUE: "BLUE_B",
// 			FOREST_GREEN: "GREEN_E",
// 			LIME_GREEN: "GREEN_A",
// 			CRIMSON: "RED_D",
// 			SILVER: "GREY_B",
// 			CYAN: "BLUE_C",
// 			MAGENTA: "PURPLE",
// 			LIME: "GREEN_A",
// 			NAVY: "BLUE_E",
// 			OLIVE: "YELLOW_D",
// 			TEAL_BLUE: "TEAL_C",
// 			BROWN: "MAROON_D",
// 		};

// 		let fixedCode = code;

// 		Object.entries(colorReplacements).forEach(([invalid, valid]) => {
// 			// Use word boundary to avoid partial matches
// 			const regex = new RegExp(`\\b${invalid}\\b`, "g");
// 			if (regex.test(fixedCode)) {
// 				this.log(`Replacing color: ${invalid} → ${valid}`);
// 				fixedCode = fixedCode.replace(regex, valid);
// 				this.fixCount++;
// 			}
// 		});

// 		return fixedCode;
// 	}

// 	/**
// 	 * Fix 3: Replace invalid rate functions
// 	 */
// 	private fixRateFunctions(code: string): string {
// 		const rateFuncReplacements: Record<string, string> = {
// 			ease_in_out: "rate_functions.smooth",
// 			ease_in_out_sine: "rate_functions.smooth",
// 			ease_in_sine: "rate_functions.rush_into",
// 			ease_out_sine: "rate_functions.rush_from",
// 			easeInOut: "rate_functions.smooth",
// 			easeIn: "rate_functions.rush_into",
// 			easeOut: "rate_functions.rush_from",
// 			ease_in: "rate_functions.rush_into",
// 			ease_out: "rate_functions.rush_from",
// 			linear_ease: "rate_functions.linear",
// 			smooth_ease: "rate_functions.smooth",
// 		};

// 		let fixedCode = code;

// 		Object.entries(rateFuncReplacements).forEach(([invalid, valid]) => {
// 			const regex = new RegExp(`\\b${invalid}\\b`, "g");
// 			if (regex.test(fixedCode)) {
// 				this.log(`Replacing rate function: ${invalid} → ${valid}`);
// 				fixedCode = fixedCode.replace(regex, valid);
// 				this.fixCount++;
// 			}
// 		});

// 		return fixedCode;
// 	}

// 	/**
// 	 * Fix 4: Fix invalid animation parameters
// 	 */
// 	private fixAnimationParameters(code: string): string {
// 		let fixedCode = code;

// 		// Fix: duration → run_time
// 		if (fixedCode.includes("duration=")) {
// 			this.log("Replacing duration= with run_time=");
// 			fixedCode = fixedCode.replace(/duration=/g, "run_time=");
// 			this.fixCount++;
// 		}

// 		// Fix: easing → rate_func
// 		if (fixedCode.includes("easing=")) {
// 			this.log("Replacing easing= with rate_func=");
// 			fixedCode = fixedCode.replace(/easing=/g, "rate_func=");
// 			this.fixCount++;
// 		}

// 		// Fix: stagger parameter (more complex)
// 		// Pattern: FadeIn(..., stagger=0.1)
// 		// Replace with: AnimationGroup with lag_ratio
// 		const staggerPattern =
// 			/(FadeIn|FadeOut|Create|Write|GrowFromCenter)\(([^)]+),\s*stagger=([0-9.]+)\)/g;
// 		if (staggerPattern.test(fixedCode)) {
// 			this.log(
// 				"Removing stagger parameter (use AnimationGroup with lag_ratio instead)",
// 			);
// 			fixedCode = fixedCode.replace(staggerPattern, "$1($2)");
// 			this.fixCount++;
// 		}

// 		// Fix: delay parameter (remove it, suggest self.wait())
// 		const delayPattern =
// 			/(FadeIn|FadeOut|Create|Write|Transform)\(([^)]*),\s*delay=[0-9.]+([^)]*)\)/g;
// 		if (delayPattern.test(fixedCode)) {
// 			this.log("Removing delay parameter (use self.wait() instead)");
// 			fixedCode = fixedCode.replace(delayPattern, "$1($2$3)");
// 			this.fixCount++;
// 		}

// 		return fixedCode;
// 	}

// 	/**
// 	 * Fix 5: Fix camera operations
// 	 */
// 	private fixCameraOperations(code: string): string {
// 		let fixedCode = code;

// 		// Check if this is a regular Scene (not MovingCameraScene)
// 		const isRegularScene = /class\s+\w+\(Scene\):/.test(fixedCode);
// 		const hasCameraFrame = fixedCode.includes("self.camera.frame");

// 		if (isRegularScene && hasCameraFrame) {
// 			this.log("Removing camera.frame operations from regular Scene");

// 			// Remove lines with self.camera.frame
// 			const lines = fixedCode.split("\n");
// 			const filteredLines = lines.filter((line) => {
// 				const shouldRemove = line.includes("self.camera.frame");
// 				if (shouldRemove) {
// 					this.log(`  Removed line: ${line.trim()}`);
// 				}
// 				return !shouldRemove;
// 			});

// 			fixedCode = filteredLines.join("\n");
// 			this.fixCount++;
// 		}

// 		return fixedCode;
// 	}

// 	/**
// 	 * Fix 6: Fix positioning methods
// 	 */
// 	private fixPositioning(code: string): string {
// 		let fixedCode = code;

// 		// Fix common positioning mistakes
// 		const positioningFixes: Record<string, string> = {
// 			".set_position(": ".move_to(",
// 			".set_pos(": ".move_to(",
// 			".position(": ".move_to(",
// 			".align_to_edge(": ".to_edge(",
// 			".center(": ".move_to(ORIGIN",
// 		};

// 		Object.entries(positioningFixes).forEach(([invalid, valid]) => {
// 			if (fixedCode.includes(invalid)) {
// 				this.log(`Replacing positioning: ${invalid} → ${valid}`);
// 				fixedCode = fixedCode.replace(
// 					new RegExp(
// 						invalid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
// 						"g",
// 					),
// 					valid,
// 				);
// 				this.fixCount++;
// 			}
// 		});

// 		return fixedCode;
// 	}

// 	/**
// 	 * Fix 7: Fix font sizes (ensure they're numbers, not strings)
// 	 */
// 	private fixFontSizes(code: string): string {
// 		let fixedCode = code;

// 		// Pattern: font_size="large" or font_size='small'
// 		const fontSizePattern = /font_size\s*=\s*["'](\w+)["']/g;
// 		const matches = [...fixedCode.matchAll(fontSizePattern)];

// 		if (matches.length > 0) {
// 			this.log("Converting string font sizes to numbers");

// 			const sizeMap: Record<string, number> = {
// 				tiny: 18,
// 				small: 24,
// 				medium: 36,
// 				large: 48,
// 				huge: 72,
// 				giant: 96,
// 			};

// 			matches.forEach((match) => {
// 				const stringSize = match[1].toLowerCase();
// 				const numericSize = sizeMap[stringSize] || 36;
// 				fixedCode = fixedCode.replace(
// 					match[0],
// 					`font_size=${numericSize}`,
// 				);
// 			});

// 			this.fixCount++;
// 		}

// 		return fixedCode;
// 	}

// 	/**
// 	 * Fix 8: Ensure class name is GeneratedScene
// 	 */
// 	private fixClassName(code: string): string {
// 		let fixedCode = code;

// 		// Pattern: class SomethingElse(Scene):
// 		const classPattern = /class\s+(\w+)\((Scene|MovingCameraScene)\):/;
// 		const match = fixedCode.match(classPattern);

// 		if (match && match[1] !== "GeneratedScene") {
// 			this.log(`Renaming class ${match[1]} to GeneratedScene`);
// 			fixedCode = fixedCode.replace(
// 				classPattern,
// 				`class GeneratedScene($2):`,
// 			);
// 			this.fixCount++;
// 		}

// 		return fixedCode;
// 	}

// 	// ==========================================================================
// 	// VALIDATION FUNCTIONS
// 	// ==========================================================================

// 	/**
// 	 * Validate code after fixes (catch remaining errors)
// 	 */
// 	private validate(code: string): string[] {
// 		const errors: string[] = [];

// 		// Check 1: Must have manim import
// 		if (!code.includes("from manim import")) {
// 			errors.push("Missing required import: from manim import *");
// 		}

// 		// Check 2: Must have GeneratedScene class
// 		if (!code.includes("class GeneratedScene")) {
// 			errors.push("Missing required class: GeneratedScene");
// 		}

// 		// Check 3: Must have construct method
// 		if (!code.includes("def construct(self)")) {
// 			errors.push("Missing required method: construct(self)");
// 		}

// 		// Check 4: Check for remaining invalid colors (that we might have missed)
// 		const suspiciousColors = [
// 			"LIGHT_",
// 			"DARK_",
// 			"BRIGHT_",
// 			"NEON_",
// 			"DEEP_",
// 			"PALE_",
// 			"VIVID_",
// 		];

// 		suspiciousColors.forEach((prefix) => {
// 			// Look for pattern: prefix + color name (but not in our valid list)
// 			const pattern = new RegExp(`${prefix}[A-Z_]+`, "g");
// 			const matches = code.match(pattern);
// 			if (matches) {
// 				matches.forEach((match) => {
// 					// Check if it's NOT a valid color
// 					const validColors = [
// 						"LIGHT_GRAY",
// 						"LIGHT_GREY",
// 						"DARK_GRAY",
// 						"DARK_GREY",
// 						"LIGHTER_GRAY",
// 						"LIGHTER_GREY",
// 						"DARKER_GRAY",
// 						"DARKER_GREY",
// 					];
// 					if (!validColors.includes(match)) {
// 						errors.push(`Potentially invalid color: ${match}`);
// 					}
// 				});
// 			}
// 		});

// 		// Check 5: Check for invalid rate function patterns
// 		const invalidRateFuncPatterns = ["ease_", "easeIn", "easeOut"];
// 		invalidRateFuncPatterns.forEach((pattern) => {
// 			if (code.includes(pattern) && !code.includes("rate_functions.")) {
// 				errors.push(
// 					`Potentially invalid rate function containing: ${pattern}`,
// 				);
// 			}
// 		});

// 		return errors;
// 	}

// 	/**
// 	 * Check for non-breaking warnings
// 	 */
// 	private checkWarnings(code: string): string[] {
// 		const warnings: string[] = [];

// 		// Warning 1: Using deprecated methods
// 		if (code.includes(".set_width(") || code.includes(".get_width(")) {
// 			warnings.push(
// 				"Code uses .set_width() or .get_width() which may be deprecated",
// 			);
// 		}

// 		// Warning 2: Camera operations without MovingCameraScene
// 		if (
// 			code.includes("self.camera") &&
// 			!code.includes("MovingCameraScene")
// 		) {
// 			warnings.push(
// 				"Camera operations detected but not using MovingCameraScene",
// 			);
// 		}

// 		// Warning 3: Very long run_time
// 		const longRunTime = /run_time\s*=\s*([0-9]+)/g;
// 		const matches = [...code.matchAll(longRunTime)];
// 		matches.forEach((match) => {
// 			const time = parseInt(match[1]);
// 			if (time > 10) {
// 				warnings.push(
// 					`Very long animation duration detected: ${time} seconds`,
// 				);
// 			}
// 		});

// 		return warnings;
// 	}

// 	// ==========================================================================
// 	// HELPER FUNCTIONS
// 	// ==========================================================================

// 	private log(message: string): void {
// 		this.fixLog.push(message);
// 		console.log(`[AutoFix] ${message}`);
// 	}

// 	getFixLog(): string[] {
// 		return this.fixLog;
// 	}

// 	getFixCount(): number {
// 		return this.fixCount;
// 	}
// }

// // ============================================================================
// // ERROR-BASED CODE FIXING (for runtime errors)
// // ============================================================================

// class RuntimeErrorFixer {
// 	/**
// 	 * Parse error from Manim traceback
// 	 */
// 	parseError(errorLog: string): RenderError {
// 		// NameError
// 		const nameErrorMatch = errorLog.match(
// 			/NameError: name '([^']+)' is not defined/,
// 		);
// 		if (nameErrorMatch) {
// 			return {
// 				type: "NameError",
// 				message: errorLog,
// 				variable: nameErrorMatch[1],
// 			};
// 		}

// 		// TypeError
// 		if (errorLog.includes("TypeError:")) {
// 			const unexpectedArgMatch = errorLog.match(
// 				/unexpected keyword argument '([^']+)'/,
// 			);
// 			return {
// 				type: "TypeError",
// 				message: errorLog,
// 				variable: unexpectedArgMatch?.[1],
// 			};
// 		}

// 		// AttributeError
// 		const attrErrorMatch = errorLog.match(
// 			/AttributeError: .* has no attribute '([^']+)'/,
// 		);
// 		if (attrErrorMatch) {
// 			return {
// 				type: "AttributeError",
// 				message: errorLog,
// 				variable: attrErrorMatch[1],
// 			};
// 		}

// 		// ImportError
// 		if (
// 			errorLog.includes("ImportError:") ||
// 			errorLog.includes("ModuleNotFoundError:")
// 		) {
// 			return {
// 				type: "ImportError",
// 				message: errorLog,
// 			};
// 		}

// 		// SyntaxError
// 		if (errorLog.includes("SyntaxError:")) {
// 			return {
// 				type: "SyntaxError",
// 				message: errorLog,
// 			};
// 		}

// 		return {
// 			type: "Unknown",
// 			message: errorLog,
// 		};
// 	}

// 	/**
// 	 * Attempt to fix code based on runtime error
// 	 */
// 	fixBasedOnError(code: string, error: RenderError): string {
// 		let fixedCode = code;

// 		switch (error.type) {
// 			case "NameError":
// 				fixedCode = this.fixNameError(code, error.variable!);
// 				break;

// 			case "TypeError":
// 				fixedCode = this.fixTypeError(code, error.variable);
// 				break;

// 			case "AttributeError":
// 				fixedCode = this.fixAttributeError(code, error.variable!);
// 				break;

// 			default:
// 				console.log("[RuntimeFix] Unknown error type, cannot auto-fix");
// 		}

// 		return fixedCode;
// 	}

// 	private fixNameError(code: string, variable: string): string {
// 		console.log(`[RuntimeFix] Attempting to fix NameError: ${variable}`);

// 		// If it looks like a color, replace with a valid one
// 		if (this.isColorName(variable)) {
// 			console.log(`  → Replacing invalid color ${variable} with WHITE`);
// 			return code.replace(new RegExp(`\\b${variable}\\b`, "g"), "WHITE");
// 		}

// 		// If it looks like a rate function, replace with valid one
// 		if (this.isRateFuncName(variable)) {
// 			console.log(
// 				`  → Replacing invalid rate function ${variable} with rate_functions.smooth`,
// 			);
// 			return code.replace(
// 				new RegExp(`\\b${variable}\\b`, "g"),
// 				"rate_functions.smooth",
// 			);
// 		}

// 		console.log(`  → Cannot auto-fix: ${variable}`);
// 		return code;
// 	}

// 	private fixTypeError(code: string, param?: string): string {
// 		if (!param) return code;

// 		console.log(
// 			`[RuntimeFix] Attempting to fix TypeError with param: ${param}`,
// 		);

// 		// Known parameter fixes
// 		const paramFixes: Record<string, string> = {
// 			stagger: "", // Remove it
// 			duration: "run_time",
// 			delay: "", // Remove it
// 			easing: "rate_func",
// 		};

// 		if (paramFixes[param] !== undefined) {
// 			const replacement = paramFixes[param];
// 			if (replacement === "") {
// 				// Remove the parameter
// 				console.log(`  → Removing invalid parameter: ${param}`);
// 				const regex = new RegExp(`,?\\s*${param}\\s*=[^,)]+`, "g");
// 				return code.replace(regex, "");
// 			} else {
// 				// Replace the parameter
// 				console.log(`  → Replacing ${param} with ${replacement}`);
// 				return code.replace(
// 					new RegExp(`\\b${param}\\b`, "g"),
// 					replacement,
// 				);
// 			}
// 		}

// 		return code;
// 	}

// 	private fixAttributeError(code: string, attribute: string): string {
// 		console.log(
// 			`[RuntimeFix] Attempting to fix AttributeError: ${attribute}`,
// 		);

// 		// If it's frame-related and not MovingCameraScene, remove it
// 		if (
// 			attribute === "frame" &&
// 			code.includes("class GeneratedScene(Scene)")
// 		) {
// 			console.log(`  → Removing camera.frame operations`);
// 			return code
// 				.split("\n")
// 				.filter((line) => !line.includes("self.camera.frame"))
// 				.join("\n");
// 		}

// 		return code;
// 	}

// 	private isColorName(name: string): boolean {
// 		const colorKeywords = [
// 			"color",
// 			"red",
// 			"blue",
// 			"green",
// 			"yellow",
// 			"orange",
// 			"purple",
// 			"pink",
// 			"gray",
// 			"grey",
// 			"white",
// 			"black",
// 			"light",
// 			"dark",
// 			"bright",
// 			"neon",
// 			"screen",
// 		];
// 		return colorKeywords.some((keyword) =>
// 			name.toLowerCase().includes(keyword),
// 		);
// 	}

// 	private isRateFuncName(name: string): boolean {
// 		const keywords = [
// 			"ease",
// 			"smooth",
// 			"linear",
// 			"sine",
// 			"quad",
// 			"in",
// 			"out",
// 		];
// 		return keywords.some((keyword) => name.toLowerCase().includes(keyword));
// 	}
// }

// // ============================================================================
// // MAIN GENERATION FUNCTION WITH AUTO-FIX
// // ============================================================================

// async function generateAnimationWithAutoFix(
// 	userPrompt: string,
// 	maxAttempts: number = 3,
// ): Promise<{ code: string; title: string; attempts: number; fixes: string[] }> {
// 	const codeFixer = new ManimCodeFixer();
// 	const runtimeFixer = new RuntimeErrorFixer();
// 	const allFixes: string[] = [];

// 	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
// 		console.log(`\n=== Attempt ${attempt}/${maxAttempts} ===`);

// 		// Step 1: Generate code from LLM
// 		const generated = await generateCodeFromLLM(userPrompt);
// 		let { code, title } = generated;

// 		console.log("Generated code length:", code.length);

// 		// Step 2: Apply static auto-fixes
// 		console.log("\n--- Running static auto-fixes ---");
// 		const fixResult = codeFixer.fix(code);

// 		if (fixResult.autoFixed) {
// 			console.log(`✓ Applied ${codeFixer.getFixCount()} automatic fixes`);
// 			allFixes.push(...codeFixer.getFixLog());
// 			code = fixResult.fixedCode!;
// 		} else {
// 			console.log("✓ No fixes needed");
// 		}

// 		// Step 3: Check validation errors
// 		if (!fixResult.isValid) {
// 			console.log("✗ Validation errors found:", fixResult.errors);
// 			if (attempt === maxAttempts) {
// 				throw new Error(
// 					`Validation failed: ${fixResult.errors.join(", ")}`,
// 				);
// 			}
// 			continue; // Try again
// 		}

// 		// Step 4: Try to render
// 		console.log("\n--- Attempting render ---");
// 		const renderResult = await tryRenderManim(code);

// 		if (renderResult.success) {
// 			console.log("✓ Render successful!");
// 			return {
// 				code,
// 				title,
// 				attempts: attempt,
// 				fixes: allFixes,
// 			};
// 		}

// 		// Step 5: Parse render error and try to fix
// 		console.log("✗ Render failed, analyzing error...");
// 		const error = runtimeFixer.parseError(renderResult.error);
// 		console.log(`Error type: ${error.type}`);

// 		if (attempt < maxAttempts) {
// 			console.log("--- Attempting runtime fix ---");
// 			code = runtimeFixer.fixBasedOnError(code, error);
// 			allFixes.push(
// 				`Runtime fix for ${error.type}: ${error.variable || "unknown"}`,
// 			);

// 			// Try render again with the fixed code
// 			const retryResult = await tryRenderManim(code);
// 			if (retryResult.success) {
// 				console.log("✓ Render successful after runtime fix!");
// 				return {
// 					code,
// 					title,
// 					attempts: attempt,
// 					fixes: allFixes,
// 				};
// 			}
// 		}
// 	}

// 	throw new Error(
// 		`Failed to generate valid animation after ${maxAttempts} attempts`,
// 	);
// }

// // ============================================================================
// // HELPER FUNCTIONS (you'll need to implement these)
// // ============================================================================

// async function fetchCodeFromAI(enhancedPrompt: string) {
// 	const response = await ai.models.generateContent({
// 		model: "gemini-2.5-flash",
// 		contents: enhancedPrompt,
// 	});
// 	console.log(response.text);
// 	if (!response.text) {
// 		return;
// 	}
// 	const str = response.text.split("json")[1]?.split("```")[0];
// 	if (!str) return;

// 	// const parsed: { title: string; code: string } = JSON.parse(str);
// 	// const title = parsed.title;
// 	// console.log("\n\n\n\TITLE:\n\n\n\n", title);

// 	// const code = parsed.code;
// 	// console.log("\n\n\n\nCODE:\n\n\n\n", code);

// 	return str;
// }

// async function generateCodeFromLLM(
// 	prompt: string,
// ): Promise<{ code: string; title: string }> {
// 	// Your existing Gemini API call
// 	// Use the SIMPLIFIED prompt we discussed

// 	const response = await ai.models.generateContent({
// 		model: "gemini-2.5-flash",
// 		contents: prompt,
// 	});
// 	console.log(response.text);
// 	if (!response.text) {
// 		throw new Error("No response from the AI");
// 	}
// 	const str = response.text.split("json")[1]?.split("```")[0];
// 	if (!str) throw new Error("No string in the response from AI");

// 	const parsed: { title: string; code: string } = JSON.parse(str);
// 	// const title = parsed.title;
// 	// console.log("\n\n\n\TITLE:\n\n\n\n", title);

// 	// const code = parsed.code;
// 	// console.log("\n\n\n\nCODE:\n\n\n\n", code);

// 	return parsed;
// }

// async function tryRenderManim(
// 	code: string,
// ): Promise<{ success: boolean; error: string }> {
// 	// Your existing render logic
// 	throw new Error("Implement this with your Docker/Manim render");
// }

// // ============================================================================
// // EXPORT
// // ============================================================================

// export {
// 	ManimCodeFixer,
// 	RuntimeErrorFixer,
// 	generateAnimationWithAutoFix,
// 	ValidationResult,
// 	RenderError,
// };
