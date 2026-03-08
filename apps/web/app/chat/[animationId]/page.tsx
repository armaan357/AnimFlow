import axios from "axios";
import ChatAnimationPage from "../../../components/chatpage";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function AnimationPage({
	params,
}: {
	params: { animationId: string };
}) {
	try {
		const c = await cookies();
		const { animationId } = await params;
		const userName = c.get("userName")?.value;
		return (
			<ChatAnimationPage
				userName={userName!}
				currentAnimationId={animationId}
			/>
		);
	} catch (e: any) {
		redirect("/signin");
	}
}
