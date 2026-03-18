import { redirect } from "next/navigation";
import PublicAnimationPage from "../../../components/publicAnimationPage";

export default async function AnimationPage() {
	try {
		return <PublicAnimationPage />;
	} catch (e: any) {
		redirect("/");
		//change this to redirect the client to 404 error page
	}
}
