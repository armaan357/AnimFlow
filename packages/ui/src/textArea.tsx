import { forwardRef } from "react";

interface TextAreaProps {
	className?: string;
	placeholder?: string;
}

export const TextAreaComp = forwardRef<HTMLTextAreaElement, TextAreaProps>(
	({ className, placeholder }, ref) => {
		return (
			<textarea
				className={`w-full border-none rounded-md p-2 resize-none max-h-[max(35svh, 5rem)] focus:ring-0 focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none leading-snug scroll-auto flex-1 text-white placeholder:text-gray-500 text-sm sm:text-base scroll-bar min-h-15 bg-transparent ${className || ""}`}
				placeholder={placeholder || "Enter a prompt for your video..."}
				maxLength={50000}
				id="promptField"
				ref={ref}
			></textarea>
		);
	},
);

TextAreaComp.displayName = "TextAreaComp";
