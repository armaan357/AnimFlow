// middleware.ts
import axios from "axios";
import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { cookies } from "next/headers";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function middleware(req: NextRequest) {
	// const sessionCookie = req.cookies.get("connect.sid")?.value;

	// if (!sessionCookie) {
	// 	return NextResponse.redirect(new URL("/signin", req.url));
	// }
	try {
		const c = await cookies();
		const response = await axios.get(`${backendUrl}user/auth-me`, {
			headers: { Cookie: c.toString() },
			withCredentials: true,
		});

		if (response.status === 401) {
			return NextResponse.redirect(new URL("/signin", req.url));
		}

		const responseObject = NextResponse.next();
		responseObject.cookies.set("userName", response.data.userName);
		return responseObject;
	} catch (e: any) {
		return NextResponse.redirect(new URL("/signin", req.url));
	}
}

// Use the matcher config to specify which paths the middleware should run on
export const config = {
	matcher: [
		"/chat/:path*",
		// "/signin", // Also run middleware on login to redirect authenticated users away
	],
};
