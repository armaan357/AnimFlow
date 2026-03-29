import * as dotenv from "dotenv";
dotenv.config();
import { prisma } from "@repo/db";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";

const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL: `${googleCallbackURL}`,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const email = profile.emails?.[0]?.value;

				if (!email) {
					return done(new Error("No email from Google"));
				}

				let user = await prisma.user.findUnique({
					where: { email },
				});

				if (user && !user.googleId) {
					user = await prisma.user.update({
						where: { email },
						data: { googleId: profile.id },
					});
				}

				if (!user) {
					user = await prisma.user.create({
						data: {
							email,
							googleId: profile.id,
							userName: profile.displayName,
							providerURL: "google",
						},
					});
				}

				return done(null, user);
			} catch (error) {
				return done(error as Error);
			}
		},
	),
);

passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			callbackURL: process.env.GITHUB_CALLBACK_URL!,
		},
		async function (
			accessToken: string,
			refreshToken: string,
			profile: any,
			done: (err: any, user?: any) => void,
		) {
			try {
				let email =
					profile.emails && profile.emails.length > 0
						? profile.emails[0].value
						: null;

				// fallback
				if (!email) {
					email = `${profile.id}@github.local`;
				}

				let user = await prisma.user.findUnique({
					where: { email },
				});

				if (user && !user.githubId) {
					user = await prisma.user.update({
						where: { email },
						data: { githubId: profile.id },
					});
				}

				if (!user) {
					user = await prisma.user.create({
						data: {
							email,
							githubId: profile.id,
							userName: profile.displayName || profile.username,
							providerURL: "github",
						},
					});
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);

passport.serializeUser((user: any, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
	try {
		const user = await prisma.user.findFirst({ where: { id: id } });
		done(null, user);
	} catch (e: any) {
		done(e);
	}
});

export default passport;
