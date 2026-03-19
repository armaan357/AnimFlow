import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import passport from "./passport/passportConfig";
import session from "express-session";
import generateRouter from "./routes/generate";
import userRouter from "./routes/user";

const app = express();
const USER_SECRET = process.env.USER_SECRET;
console.log("user secret = ", USER_SECRET);
console.log("\n\n\ngoogle client id = ", process.env.GOOGLE_CLIENT_ID);
console.log(
	"\n\n\ngoogle client secret secret = ",
	process.env.GOOGLE_CLIENT_SECRET,
);
console.log("\n\n\n");
const feURL = process.env.FE_URL;

const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:3000",
	"http://localhost:8000",
	feURL,
];
app.use(
	cors({
		origin: (origin, callback) => {
			console.log("\n\nOrigin = ", origin);
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				console.log("\n\nCORS Error occured!\n\n");
				let message =
					"The CORS policy for this application doesn't allow access from origin " +
					origin;
				return callback(new Error(message), false);
			}
			return callback(null, true);
		},
		credentials: true,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
	session({
		secret: USER_SECRET || "kasbjvoaoslkgff57145g",
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 },
	}),
);

// used to initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/user", userRouter);

app.use("/api/v1/generate", generateRouter);

app.listen(3001);
