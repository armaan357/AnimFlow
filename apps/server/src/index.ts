import * as dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import cors from "cors";
import passport from "./passport/passportConfig.js";
import session from "express-session";
import generateRouter from "./routes/generate.js";
import userRouter from "./routes/user.js";

const app: Express = express();
const USER_SECRET = process.env.USER_SECRET;
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
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
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
		secret: USER_SECRET!,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV == "production",
			sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
			maxAge: 1000 * 60 * 60 * 24 * 7,
		},
	}),
);

// used to initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

app.get("/", async (req, res) => {
	res.json({ message: "Working Fine!" });
});

app.use("/api/v1/user", userRouter);

app.use("/api/v1/generate", generateRouter);

export default app;

// if (process.env.NODE_ENV !== "production") {
// 	const PORT = process.env.PORT || 3001;
// 	app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
// }