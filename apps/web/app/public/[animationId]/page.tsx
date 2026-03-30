import { redirect } from "next/navigation";
import PublicAnimationPage from "../../../components/publicAnimationPage";
import { isMobile } from "../../../hooks/useMobile";
import { headers } from "next/headers";

export default async function AnimationPage() {
	const agent = (await headers()).get("user-agent") || "";
	const checkDevice = isMobile(agent);
	try {
		return <PublicAnimationPage checkMobileDevice={checkDevice} />;
	} catch (e: any) {
		redirect("/");
		//change this to redirect the client to 404 error page
	}
}
