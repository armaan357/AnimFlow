import * as dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import cors from "cors";
import passport from "./passport/passportConfig.js";
import generateRouter from "./routes/generate.js";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";

const app: Express = express();
const feURL = process.env.FE_URL;

const allowedOrigins = [feURL];

app.use(cookieParser());

app.set("trust proxy", 1);

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

app.use(passport.initialize());

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