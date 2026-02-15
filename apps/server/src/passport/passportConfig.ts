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
			callbackURL: "http://localhost:3000/auth/google/callback",
		},
		(accessToken, refreshToken, profile, cb) => {
			// Perform any additional verification or user lookup here
			// and return the user object
			return cb(null, profile);
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

				if (!user) {
					return done(null, false, { message: "Incorrect Email" });
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
