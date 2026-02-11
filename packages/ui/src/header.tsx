import { AnimFlowLogo } from "../assets/AnimFlowLogo";
import { GetStartedButtonAndModal } from "./getStartedModal";
import { LoginButtonAndModal } from "./loginModal";
import { NavBar } from "./navBar";

export const Header = () => {
	return (
		<header className="h-15 w-full sticky top-0 z-100 backdrop-blur-sm px-3 sm:px-8 md:px-12 bg-[#0c0c0c] justify-between flex items-center">
			<div className="flex items-center">
				<AnimFlowLogo />
			</div>
			<NavBar />
			<div className="flex gap-2.5 py-4">
				<LoginButtonAndModal />
				<GetStartedButtonAndModal />
			</div>
		</header>
	);
};
