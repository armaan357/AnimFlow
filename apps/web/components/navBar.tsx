"use client";

import { ReactNode } from "react";
import { NavLink } from "@repo/ui/navLink";
import { ExternalLink } from "lucide-react";

interface NavBarProps {
	children?: ReactNode;
}

export const NavBar = ({ children }: NavBarProps) => {
	return (
		<div className="md:flex gap-8 hidden">
			<NavLink
				hrefString={"#features"}
				children={"Features"}
				target="_self"
			/>
			<NavLink
				hrefString={"#gallery"}
				children={"Gallery"}
				target="_self"
			/>
			<NavLink
				hrefString={"https://github.com/armaan357/AnimFlow"}
				children={
					<>
						GitHub <ExternalLink size={16} />
					</>
				}
				target="_blank"
			/>
		</div>
	);
};
