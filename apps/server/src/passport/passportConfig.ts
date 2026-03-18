import { prisma } from "@repo/db";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import bcrypt from "bcrypt";

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL:
				"http://localhost:3001/api/v1/user/auth/google/callback",
			// passReqToCallback: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			// Perform any additional verification or user lookup here
			// and return the user object
			try {
				// Check if user already exists
				console.log("\n\nstart of google strat\n\n");
				console.log(`\n\nprofile: ${profile}`);
				let user = await prisma.user.findFirst({
					where: {
						googleId: profile.id,
						email: profile.emails[0].value,
					},
				});
				console.log("\n\ndb queried for user info\n\n");
				// If user doesn't exist, create a new one
				if (!user) {
					console.log("\n\nuser not found!\n\n");
					user = await prisma.user.create({
						data: {
							email: profile.emails[0].value,
							googleId: profile.id,
							userName: profile.displayName,
						},
					});
				}

				// Return the user (existing or newly created)
				return done(null, user);
			} catch (error) {
				console.log("Google authentication error:", error);
				return done(error);
			}
			// return cb(null, profile);
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
