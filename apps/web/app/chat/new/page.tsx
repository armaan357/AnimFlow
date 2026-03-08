import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import NewChatAnimationPage from "../../../components/newChatPage";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function AnimationPage() {
	try {
		const c = await cookies();
		const userName = c.get("userName")?.value;
		return <NewChatAnimationPage userName={userName!} />;
	} catch (e: any) {
		redirect("/signin");
	}
}
