// middleware.ts
import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function middleware(req: NextRequest) {
	try {
		const authMeUrl = new URL("/api/backend/user/auth-me", req.url);
		const response = await fetch(authMeUrl, {
			method: "GET",
			headers: {
				cookie: req.headers.get("cookie") ?? "",
			},
			cache: "no-store",
		});

		if (response.status === 401 || !response.ok) {
			return NextResponse.redirect(new URL("/signin", req.url));
		}

		const data = await response.json();
		const out = NextResponse.next();
		if (data.userName) {
			out.cookies.set("userName", data.userName, {
				path: "/",
				sameSite: "lax",
			});
		}
		return out;
	} catch (e: any) {
		return NextResponse.redirect(new URL("/signin", req.url));
	}
}

export const config = {
	matcher: ["/chat/:path*"],
};
