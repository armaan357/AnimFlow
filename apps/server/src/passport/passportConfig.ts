import * as dotenv from "dotenv";
dotenv.config();
import { prisma } from "@repo/db";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";
import bcrypt from "bcrypt";

const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL: `${googleCallbackURL}`,
			// passReqToCallback: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			// Perform any additional verification or user lookup here
			// and return the user object
			try {
				// Check if user already exists
				let user = await prisma.user.findFirst({
					where: {
						googleId: profile.id,
						email: profile.emails[0].value,
					},
				});

				// If user doesn't exist, create a new one
				if (!user) {
					user = await prisma.user.create({
						data: {
							email: profile.emails[0].value,
							googleId: profile.id,
							userName: profile.displayName,
							providerURL: "google",
						},
					});
				} else if (!user.googleId) {
					user = await prisma.user.update({
						where: {
							email: profile.emails[0].value,
						},
						data: {
							googleId: profile.id,
						},
					});
				}

				// Return the user (existing or newly created)
				return done(null, user);
			} catch (error) {
				return done(error);
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
				// Check if user already exists
				const email =
					profile.emails && profile.emails.length > 0
						? profile.emails[0]?.value
						: "emailNotExists@email.com";
				let user = await prisma.user.findFirst({
					where: {
						email: email,
						githubId: profile.id,
					},
				});

				// If user doesn't exist, create a new one
				if (!user) {
					user = await prisma.user.create({
						data: {
							email: email!,
							googleId: profile.id,
							userName: profile.displayName,
							providerURL: "github",
						},
					});
				} else if (!user.githubId) {
					user = await prisma.user.update({
						where: {
							email: email!,
						},
						data: {
							githubId: profile.id,
						},
					});
				}

				// Return the user (existing or newly created)
				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);

passport.use(
	new LocalStrategy(
		{ usernameField: "email" },
		async (userName, password, done) => {
			try {
				const user = await prisma.user.findFirst({
					where: { email: userName },
				});

				if (!user || !user.password) {
					return done(null, false, {
						message: "User not found. Please register.",
					});
				}
				const comp = await bcrypt.compare(password, user.password);
				if (!comp) {
					return done(null, false, { message: "Incorrect Password" });
				}
				return done(null, user);
			} catch (e: any) {
				return done(e);
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
