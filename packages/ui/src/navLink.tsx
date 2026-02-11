import { Children, ReactNode } from "react";

interface NavLinkProps {
    hrefString: string;
    children: ReactNode;
}

export const NavLink = ({ children, hrefString }: NavLinkProps) => {
	return (
		<div>
			<a
				href={hrefString}
				className="text-[#ffffff80] hover:text-white text-sm ease-in-out duration-150 transition-all cursor-pointer"
			>
				{children}
			</a>
		</div>
	);
};