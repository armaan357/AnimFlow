import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import NewChatAnimationPage from "../../../components/newChatPage";
import { isMobile } from "../../../hooks/useMobile";

export default async function AnimationPage() {
	try {
		const agent = (await headers()).get("user-agent") || "";
		const checkDevice = isMobile(agent);
		const c = await cookies();
		const userName = c.get("userName")?.value;
		return (
			<NewChatAnimationPage
				userName={userName!}
				checkMobileDevice={checkDevice}
			/>
		);
	} catch (e: any) {
		redirect("/signin");
	}
}
