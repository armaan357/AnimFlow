import axios from "axios";
import { Header } from "../components/header";
import { HeroSection } from "../components/heroSection";
import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";

export default async function Home() {
	let returnCode;
	try {
		const cookie = await cookies();
		const authenticatedUser = await axios.get(`/api/backend/user/auth-me`, {
			headers: { Cookie: cookie.toString() },
			withCredentials: true,
		});
		returnCode = authenticatedUser.data.code;
		if (returnCode == 1) {
			return (
				<div className="min-h-screen">
					<Header />
					<HeroSection />
				</div>
			);
		}
	} catch (e: any) {
		return (
			<div className="min-h-screen">
				<Header />
				<HeroSection />
			</div>
		);
	}
	if (returnCode == 0) {
		permanentRedirect("chat/new");
	} else {
		return (
			<div className="min-h-screen">
				<Header />
				<HeroSection />
			</div>
		);
	}
}
