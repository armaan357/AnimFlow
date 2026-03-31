"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
	useState,
	useEffect,
	useCallback,
	useRef,
	JSX,
	RefObject,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ValidationRule {
	id: string;
	label: string;
	test: (value: string) => boolean;
}

interface ValidationState {
	[key: string]: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VALIDATION_RULES: ValidationRule[] = [
	{
		id: "minLength",
		label: "At least 8 characters",
		test: (v) => v.length >= 8,
	},
	{
		id: "lowercase",
		label: "One lowercase letter (a–z)",
		test: (v) => /[a-z]/.test(v),
	},
	{
		id: "uppercase",
		label: "One uppercase letter (A–Z)",
		test: (v) => /[A-Z]/.test(v),
	},
	{
		id: "number",
		label: "One number (0–9)",
		test: (v) => /[0-9]/.test(v),
	},
	{
		id: "special",
		label: "One special character (!@#$…)",
		test: (v) => /[^a-zA-Z0-9]/.test(v),
	},
];

const DEBOUNCE_MS = 300;

// ─── Hook: useDebounce ────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}

// ─── Hook: usePasswordValidation ──────────────────────────────────────────────

function usePasswordValidation(debouncedValue: string): {
	validationState: ValidationState;
	failingRules: ValidationRule[];
	allPassed: boolean;
} {
	const validationState: ValidationState = {};

	for (const rule of VALIDATION_RULES) {
		validationState[rule.id] = rule.test(debouncedValue);
	}

	const failingRules = VALIDATION_RULES.filter(
		(rule) => !validationState[rule.id],
	);

	return {
		validationState,
		failingRules,
		allPassed: failingRules.length === 0 && debouncedValue.length > 0,
	};
}

// ─── Sub-component: ValidationList ───────────────────────────────────────────

interface ValidationListProps {
	failingRules: ValidationRule[];
	allPassed: boolean;
}

function ValidationList({
	failingRules,
	allPassed,
}: ValidationListProps): JSX.Element | null {
	if (allPassed) return null;

	return (
		<ul
			className="mt-2.5 flex flex-col gap-1.5 list-none p-0 m-0"
			role="list"
			aria-label="Password requirements"
		>
			{failingRules.map((rule) => (
				<li
					key={rule.id}
					className="flex items-center gap-2 text-xs text-white/40 tracking-wide"
				>
					<span
						className="w-1 h-1 rounded-full bg-white/30 shrink-0"
						aria-hidden="true"
					/>
					<span>{rule.label}</span>
				</li>
			))}
		</ul>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PasswordInputProps {
	id?: string;
	name?: string;
	placeholder?: string;
	autoComplete?: string;
	onChange?: (value: string, isValid: boolean) => void;
}

export default function PasswordInput({
	id = "password",
	name = "password",
	placeholder = "Enter your password",
	autoComplete = "new-password",
	onChange,
}: PasswordInputProps): JSX.Element {
	const [rawValue, setRawValue] = useState<string>("");
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const debouncedValue = useDebounce(rawValue, DEBOUNCE_MS);
	const { failingRules, allPassed } = usePasswordValidation(debouncedValue);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setRawValue(e.target.value);
		},
		[],
	);

	const toggleVisibility = useCallback(() => {
		setShowPassword((prev) => !prev);
		inputRef.current?.focus();
	}, []);

	// Notify parent when debounced validation changes
	useEffect(() => {
		onChange?.(debouncedValue, allPassed);
	}, [debouncedValue, allPassed, onChange]);

	const wrapperBase =
		"relative rounded-xl border transition-all duration-200 ease-in-out overflow-hidden";

	return (
		<div className="w-full">
			<div
				className={`${wrapperBase} border-[#d8d6cf]/15 focus-within:border-[#f5f5f5]/25 bg-white/3`}
			>
				<input
					ref={inputRef}
					id={id}
					name={name}
					type={showPassword ? "text" : "password"}
					value={rawValue}
					placeholder={placeholder}
					autoComplete={autoComplete}
					aria-describedby={`${id}-requirements`}
					aria-invalid={rawValue.length > 0 && !allPassed}
					className="w-full bg-transparent outline-none border-none py-3.5 pl-4 pr-12 text-[15px] tracking-wide text-white/90 placeholder:text-[#F1F0F761] placeholder:tracking-normal"
					onChange={handleChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
				/>

				<button
					type="button"
					className="absolute right-0 inset-y-0 w-12 flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors duration-150 rounded-r-xl focus-visible:outline-none focus-visible:ring-2  focus-visible:ring-inset"
					onClick={toggleVisibility}
					aria-label={
						showPassword ? "Hide password" : "Show password"
					}
					tabIndex={0}
				>
					{showPassword ? (
						// <EyeIcon visible={showPassword} />
						<EyeOffIcon />
					) : (
						<EyeIcon />
					)}
				</button>
			</div>

			<div id={`${id}-requirements`} aria-live="polite">
				<ValidationList
					failingRules={failingRules}
					allPassed={allPassed}
				/>
			</div>
		</div>
	);
}
