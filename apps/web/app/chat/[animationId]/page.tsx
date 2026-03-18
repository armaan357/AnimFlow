import ChatAnimationPage from "../../../components/chatpage";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { isMobile } from "../../../hooks/useMobile";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function AnimationPage() {
	try {
		const agent = (await headers()).get("user-agent") || "";
		const checkDevice = isMobile(agent);
		const c = await cookies();
		// const { animationId } = params;
		const userName = c.get("userName")?.value;
		return (
			<ChatAnimationPage
				userName={userName!}
				checkMobileDevice={checkDevice}
			/>
		);
	} catch (e: any) {
		redirect("/signin");
	}
}
