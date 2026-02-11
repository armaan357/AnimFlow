"use client";

import { ReactNode } from "react";

interface NavBarProps {
	children?: ReactNode;
}

export const NavBar = ({ children }: NavBarProps) => {
	return (
		<div className="md:flex gap-8 hidden">
			<NavLinks hrefString={"#features"} children={"Features"} />
			<NavLinks hrefString={"#gallery"} children={"Gallery"} />
		</div>
	);
};

interface NavLinkProps {
	children: ReactNode;
	hrefString: string;
}

const NavLinks = ({ children, hrefString }: NavLinkProps) => {
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
