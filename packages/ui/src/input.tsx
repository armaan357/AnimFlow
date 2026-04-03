import { EyeIcon, EyeOffIcon } from "lucide-react";
import { InputHTMLAttributes, forwardRef, Ref, RefObject } from "react";

interface InputBoxProps extends InputHTMLAttributes<HTMLInputElement> {}

type InputSizeTypes = {
	sm: string;
	md: string;
	lg: string;
	full: string;
};

const inputSize: InputSizeTypes = {
	sm: " px-1 py-0.5 ",
	md: " px-1.5 py-1 ",
	lg: " px-2 py-1 ",
	full: " px-3 py-1 w-full ",
};

// Use forwardRef to accept and pass the ref
const Input = forwardRef<HTMLInputElement, InputBoxProps>(
	(props, ref: Ref<HTMLInputElement>) => {
		// You can apply consistent styling here
		const baseClasses = `bg-transparent px-1.5 py-0.5 border border-white/20 rounded-md h-9 placeholder:text-[#ffffff60]  focus-visible:outline-none text-base md:text-sm  disabled:cursor-not-allowed disabled:border-[#40403f] disabled:opacity-50 hover:border-[#d8d6cf]/20 transition-colors duration-150 ease-in-out `;

		return (
			<input
				// Pass the ref to the actual DOM element
				ref={ref}
				className={baseClasses}
				// {...props} // Spread other standard input props like type, value, onChange
				id={props.id}
				placeholder={props.placeholder}
				type={props.type}
				autoCapitalize="off"
				autoCorrect="off"
				autoComplete={props.autoComplete}
			/>
		);
	},
);

// Add a display name for better debugging in React DevTools

interface InputProps {
	id: string;
	type: string;
	placeholder: string;
	// size: 'sm' | 'md' | 'lg' | 'full';
	autoComplete?: string;
	ref?: RefObject<HTMLInputElement | null>;
}

const InputBox = ({ id, type, placeholder, autoComplete, ref }: InputProps) => {
	return (
		<input
			id={id}
			className={`bg-white/3 border tracking-wide border-[#d8d6cf]/12 rounded-xl placeholder:text-[#F1F0F761]  focus-visible:outline-none text-[15px] px-3.5 py-3 w-full disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out focus-within:border-[#f5f5f5]/25 `}
			placeholder={placeholder}
			type={type}
			autoCapitalize="off"
			autoCorrect="off"
			autoComplete={autoComplete}
			ref={ref}
		/>
	);
};

interface PasswordInputProps {
	id: string;
	placeholder: string;
	// size: 'sm' | 'md' | 'lg' | 'full';
	autoComplete?: string;
	ref?: RefObject<HTMLInputElement | null>;
	isPasswordVisible: boolean;
	setPasswordVisible: () => void;
}

export const PasswordInputBox = ({
	id,
	placeholder,
	autoComplete,
	ref,
	isPasswordVisible,
	setPasswordVisible,
}: PasswordInputProps) => {
	return (
		<div className="w-full relative rounded-xl border border-[#d8d6cf]/15 transition-all duration-200 ease-in-out focus-within:border-[#f5f5f5]/25 bg-white/3 overflow-hidden">
			<input
				id={id}
				className={`bg-transparent w-full border-none rounded-xl placeholder:text-[#F1F0F761] placeholder:tracking-normal focus-visible:outline-none text-[15px] py-3.5 pl-4 pr-12 tracking-wide text-white/90 outline-none disabled:cursor-not-allowed disabled:border-[#40403f] disabled:opacity-50 `}
				placeholder={placeholder}
				type={isPasswordVisible ? "text" : "password"}
				autoCapitalize="off"
				autoCorrect="off"
				autoComplete={autoComplete}
				ref={ref}
			/>
			<button
				type="button"
				className="absolute right-0 inset-y-0 w-12 flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors duration-150 rounded-r-xl focus-visible:outline-none focus-visible:ring-2  focus-visible:ring-inset"
				onClick={setPasswordVisible}
				aria-label={
					isPasswordVisible ? "Hide password" : "Show password"
				}
				tabIndex={0}
			>
				{isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
			</button>
			{/* <span
				className="absolute right-0 px-1.5 py-1 hover:bg-[#222222] transition-colors h-full object-contain flex justify-center items-center mr-0.5 text-[#f1f0f761] hover:text-[#f5f5f5]"
				onClick={setPasswordVisible}
			>
				{isPasswordVisible ? <EyeClosedIcon /> : <EyeIcon />}
			</span> */}
		</div>
	);
};

export default InputBox;
