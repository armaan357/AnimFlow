import { redirect } from "next/navigation";
import PublicAnimationPage from "../../../components/publicAnimationPage";

export default async function AnimationPage({
	params,
}: {
	params: { animationId: string };
}) {
	try {
		const { animationId } = await params;
		return <PublicAnimationPage currentAnimationId={animationId} />;
	} catch (e: any) {
		redirect("/");
		//change this to redirect the client to 404 error page
	}
}
