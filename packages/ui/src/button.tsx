"use client";

import { ReactNode } from "react";

interface ButtonProps {
	children: ReactNode;
	variant: "primary" | "secondary" | "danger" | "icon";
	size: "sm" | "md" | "lg" | "full" | "icon";
	onClick?: () => void;
	disabled?: boolean;
}

type VairantType = {
	primary: string;
	secondary: string;
	danger: string;
	icon: string;
};

type ButtonSizeType = {
	sm: string;
	md: string;
	lg: string;
	full: string;
	icon: string;
};

const buttonVariants: VairantType = {
	primary:
		"bg-[#ededed] hover:bg-[#a0a0a0] text-black border border-[#ededed] hover:border-[#a0a0a0] flex justify-center items-center disabled:cursor-not-allowed disabled:bg-[#a0a0a0]",
	secondary:
		"bg-[#181818] hover:bg-[#fefefe0d] border border-[#ffffff25] text-white flex justify-center items-center disabled:cursor-not-allowed disabled:bg-[#fefefe0d]",
	danger: "bg-transparent text-red-500 hover:bg-red-300 border-0 flex justify-center items-center disabled:cursor-not-allowed",
	icon: "bg-transparent border-0 text-[#ffffff90] flex justify-center items-center disabled:cursor-not-allowed hover:bg-[#2c2c2c]",
};

const buttonSize: ButtonSizeType = {
	sm: "text-sm px-2 py-1 rounded-sm",
	md: "text-sm font-normal px-4 py-2 rounded-md",
	lg: "px-6 py-3 rounded-lg",
	full: "w-full px-6 py-2 rounded-xl",
	icon: "p-2 rounded-full",
};

export const Button = ({
	children,
	variant,
	size,
	onClick,
	disabled,
	className,
}: ButtonProps & { className?: string }) => {
	return (
		<button
			className={`${buttonVariants[variant]} ${buttonSize[size]} cursor-pointer focus-visible:outline-none select-none ease-in-out duration-150 transition-colors ${className || ""}`}
			onClick={
				onClick
					? () => onClick()
					: () => {
							console.log("");
						}
			}
			disabled={disabled ? disabled : undefined}
		>
			{children}
		</button>
	);
};
