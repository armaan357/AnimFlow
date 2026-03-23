import { NavBar } from "./navBar";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import axios from "axios";
import { redirect } from "next/navigation";
import { LoginButtonAndModal } from "./loginModal";
import { SignUpButtonAndModal } from "./signUpModal";

export const Header = () => {
	return (
		<header className="h-15 w-full sticky top-0 z-100 backdrop-blur-sm px-3 sm:px-8 md:px-12 bg-[#0c0c0c] justify-between flex items-center">
			<div className="flex items-center">
				<Link href={"/"} className="cursor-pointer">
					<div className="w-fit cursor-pointer">
						<span className="font-semibold text-xl text-[#e3e3e3]">
							Anim<span className="text-[#488AED]/75">Flow</span>
						</span>
					</div>
				</Link>
			</div>
			<NavBar />
			<div>
				<div className="flex gap-2.5 py-4">
					<LoginButtonAndModal />
					<SignUpButtonAndModal />
				</div>
			</div>
		</header>
	);
};

export const ChatPageHeader = () => {
	const logout = async () => {
		try {
			const resp = await axios.get(`/api/backend/user/logout`, {
				withCredentials: true,
			});
		} catch (e: any) {
			console.log("error: ", e);
			return;
		}
		redirect("/signin");
	};

	return (
		<header className="h-15 w-full sticky top-0 z-100 backdrop-blur-sm lg:backdrop-blur-none px-3 bg-[#0c0c0c] sm:px-8 md:px-12 justify-between flex items-center">
			<div className="z-100 flex items-center gap-4">
				<Link href={"/"} className="cursor-pointer">
					<div className="w-fit cursor-pointer">
						<span className="font-semibold text-xl text-[#e3e3e3] tracking-wide">
							Anim<span className="text-[#488AED]/75">Flow</span>
						</span>
					</div>
				</Link>
			</div>
			<div>
				<div className="flex gap-4 py-4">
					<Button
						variant="secondary"
						size="md"
						children={"Log Out"}
						onClick={() => logout()}
					/>
				</div>
			</div>
		</header>
	);
};

export const PublicChatPageHeader = () => {
	return (
		<header className="h-15 w-full sticky top-0 z-100 backdrop-blur-sm lg:backdrop-blur-none px-3 bg-[#0c0c0c] sm:px-8 md:px-12 justify-between flex items-center">
			<div className="z-100 flex items-center gap-4">
				<Link href={"/"} className="cursor-pointer">
					<div className="w-fit cursor-pointer">
						<span className="font-semibold text-xl text-[#e3e3e3] tracking-wide">
							Anim<span className="text-[#488AED]/75">Flow</span>
						</span>
					</div>
				</Link>
			</div>
			<div></div>
		</header>
	);
};