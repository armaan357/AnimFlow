import { Children, ReactNode } from "react";

interface NavLinkProps {
	hrefString: string;
	children: ReactNode;
	target: "_blank" | "_self" | "_top" | "_parent";
}

export const NavLink = ({ children, hrefString, target }: NavLinkProps) => {
	return (
		<div>
			<a
				href={hrefString}
				className="text-[#ffffff80] hover:text-white text-sm ease-in-out duration-150 transition-all cursor-pointer flex gap-1 items-center justify-center"
				target={target}
			>
				{children}
			</a>
		</div>
	);
};